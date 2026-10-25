import { describe, expect, it } from 'vitest'
import { buildDailyPlan, currentWeekPlan } from '../src/engine/scheduler'
import type { CardState, LearningEvent, Settings, SkillState } from '../src/types/app'
import { DEFAULT_SETTINGS } from '../src/types/app'
import { newCardState } from '../src/engine/srs'
import type { DiagnosticExercise, Exercise, ReadingExercise, VocabCard } from '../src/types/content'

const DATE = '2026-10-25'
const NOW = new Date(`${DATE}T08:00:00`).getTime()
const MONDAY = '2026-10-26'
const MONDAY_NOW = new Date(`${MONDAY}T08:00:00`).getTime()

function settings(over: Partial<Settings> = {}): Settings {
  return {
    ...DEFAULT_SETTINGS,
    onboarded: true,
    startedAt: DATE,
    examDate: '2027-04-25',
    seedSalt: 'test',
    ...over,
  }
}

function vocab(id: string, language: 'en' | 'es' = 'en', difficulty: 1 | 2 | 3 | 4 | 5 = 3): VocabCard {
  return {
    id, language, skill: 'vocab', type: 'vocab-card', topic: 'general', difficulty,
    estimatedMinutes: 1, tags: ['general'], createdAt: '2026-10-25', contentVersion: 1, source: 'original',
    term: `term ${id}`, pos: 'n.', glossZh: `释义 ${id}`, definition: 'a definition',
    collocations: ['make progress', 'set a goal'], examples: [{ sentence: 'Example sentence.', zh: '例句' }],
  }
}

function reading(id: string, difficulty: 1 | 2 | 3 | 4 | 5 = 3): ReadingExercise {
  return {
    id, language: 'en', skill: 'reading', type: 'reading-mc', topic: 'education', difficulty,
    estimatedMinutes: 7, tags: ['education'], createdAt: '2026-10-25', contentVersion: 1, source: 'original',
    title: 'T', titleZh: '题目',
    passage: 'word '.repeat(80),
    questions: [
      { id: `${id}-q1`, stem: 'Q1?', options: ['a', 'b', 'c', 'd'], answerIndex: 0, explanation: '原文第一行说明 a 正确；b/c/d 与原文不符。', errorTags: ['detail'], questionType: 'detail' },
    ],
  }
}

function diagnostic(id: string, language: 'en' | 'es'): DiagnosticExercise {
  const q = (n: number, skill: 'reading' | 'grammar') => ({
    id: `${id}-q${n}`, stem: `题 ${n}`, options: ['a', 'b', 'c', 'd'], answerIndex: n % 4,
    explanation: '示例解析：依据示例规则，a 为最佳答案，其余选项与规则不符。',
    errorTags: ['detail' as const], questionType: 'detail' as const, skill,
  })
  return {
    id, language, skill: 'vocab', type: 'diagnostic', topic: 'general', difficulty: 3,
    estimatedMinutes: 8, tags: ['general'], createdAt: '2026-10-25', contentVersion: 1, source: 'original',
    questions: [q(1, 'reading'), q(2, 'reading'), q(3, 'grammar'), q(4, 'grammar'), q(5, 'reading'), q(6, 'grammar'), q(7, 'reading'), q(8, 'grammar')],
  }
}

function pool(): Exercise[] {
  return [
    ...Array.from({ length: 20 }, (_, i) => vocab(`en-voc-${String(i + 1).padStart(3, '0')}`)),
    ...Array.from({ length: 20 }, (_, i) => vocab(`es-voc-${String(i + 1).padStart(3, '0')}`, 'es', 1)),
    reading('en-read-001', 2),
    reading('en-read-002', 4),
    diagnostic('en-diag-001', 'en'),
    diagnostic('es-diag-001', 'es'),
  ]
}

describe('每日调度器', () => {
  it('第 1 天安排英语与西语诊断（未完成时）', () => {
    const p = buildDailyPlan({ settings: settings(), dateKey: DATE, now: NOW, cardStates: [], allExercises: pool(), events: [], skillStates: [], adjustments: [] })
    const diags = p.tasks.filter((t) => t.kind === 'diagnostic')
    expect(diags.map((t) => t.language).sort()).toEqual(['en', 'es'])
    expect(diags[0].reasons[0]).toContain('诊断')
  })

  it('到期词卡复习永远置顶且带理由', () => {
    const cards: CardState[] = [
      { ...newCardState('en-voc-001', NOW - 10 * 86400000), dueAt: NOW - 3 * 86400000, lapses: 2 },
      { ...newCardState('en-voc-002', NOW - 10 * 86400000), dueAt: NOW - 1000 },
    ]
    const p = buildDailyPlan({ settings: settings({ startedAt: '2026-09-01' }), dateKey: DATE, now: NOW, cardStates: cards, allExercises: pool(), events: [], skillStates: [], adjustments: [] })
    const srs = p.tasks.find((t) => t.kind === 'srs-review')
    expect(srs).toBeDefined()
    expect(srs!.contentIds).toContain('en-voc-001')
    expect(srs!.reasons.join(' ')).toMatch(/到期/)
    expect(p.tasks.indexOf(srs!)).toBe(0)
  })

  it('保底日（minimum）只安排 ≤10 分钟的轻量任务', () => {
    const s = settings({ dayModeOverride: 'minimum', startedAt: '2026-09-01' })
    const p = buildDailyPlan({ settings: s, dateKey: DATE, now: NOW, cardStates: [], allExercises: pool(), events: [], skillStates: [], adjustments: [] })
    const total = p.tasks.reduce((a, t) => a + t.estMinutes, 0)
    expect(p.mode).toBe('minimum')
    expect(total).toBeLessThanOrEqual(14) // srs 上限 + 1 小任务
  })

  it('确定性：同一输入生成两次结果完全一致', () => {
    const input = {
      settings: settings({ startedAt: '2026-09-01' }),
      dateKey: DATE, now: NOW, cardStates: [], allExercises: pool(), events: [] as LearningEvent[],
      skillStates: [] as SkillState[], adjustments: [],
    }
    const a = buildDailyPlan(input)
    const b = buildDailyPlan(input)
    expect(JSON.stringify(a.tasks.map((t) => t.id))).toBe(JSON.stringify(b.tasks.map((t) => t.id)))
  })

  it('难度瞄准：掌握度低选易材料，掌握度高选难材料', () => {
    // 用 30 天前的事件（超出 7 天冷却，避免与难度选择逻辑互相干扰）
    const OLD = MONDAY_NOW - 30 * 86400000
    const events: LearningEvent[] = Array.from({ length: 12 }, (_, i) => ({
      id: `e${i}`, ts: OLD + i * 3600000, language: 'en', skill: 'reading', exerciseType: 'reading-mc',
      contentId: 'en-read-001', correct: true, secondsSpent: 100, hintsUsed: 0, errorTags: [], contentVersion: 1,
    }))
    const eventsBad: LearningEvent[] = Array.from({ length: 12 }, (_, i) => ({
      id: `b${i}`, ts: OLD + i * 3600000, language: 'en', skill: 'reading', exerciseType: 'reading-mc',
      contentId: 'en-read-001', correct: false, secondsSpent: 100, hintsUsed: 0, errorTags: [], contentVersion: 1,
    }))
    const mk = (evs: LearningEvent[]) => buildDailyPlan({
      settings: settings({ startedAt: '2026-09-25' }), dateKey: MONDAY, now: MONDAY_NOW, cardStates: [],
      allExercises: pool(), events: evs, skillStates: [], adjustments: [],
    })
    // 第 31+ 天、周一模式（含阅读槽），比较选择的阅读内容难度
    const good = mk(events).tasks.find((t) => t.skill === 'reading' && t.kind === 'exercise')
    const bad = mk(eventsBad).tasks.find((t) => t.skill === 'reading' && t.kind === 'exercise')
    const diffOf = (id?: string) => pool().find((e) => e.id === id)?.difficulty ?? 0
    expect(diffOf(good?.contentIds?.[0])).toBeGreaterThan(diffOf(bad?.contentIds?.[0]))
  })

  it('降温冷却：7 天内用过的内容不再首选', () => {
    const events: LearningEvent[] = [
      { id: 'used', ts: NOW - 86400000, language: 'en', skill: 'reading', exerciseType: 'reading-mc', contentId: 'en-read-001', correct: true, secondsSpent: 100, hintsUsed: 0, errorTags: [], contentVersion: 1 },
    ]
    const p = buildDailyPlan({ settings: settings({ startedAt: '2026-09-30' }), dateKey: DATE, now: NOW, cardStates: [], allExercises: pool(), events, skillStates: [], adjustments: [] })
    const read = p.tasks.find((t) => t.kind === 'exercise' && t.skill === 'reading')
    expect(read?.contentIds?.[0]).not.toBe('en-read-001')
  })

  it('课程周随天数推进', () => {
    expect(currentWeekPlan('en', 1).week).toBe(1)
    expect(currentWeekPlan('en', 15).week).toBe(3)
    expect(currentWeekPlan('es', 160).week).toBe(23)
    expect(currentWeekPlan('es', 168).week).toBe(24)
  })

  it('任务都带可解释理由', () => {
    const p = buildDailyPlan({ settings: settings({ startedAt: '2026-09-30' }), dateKey: DATE, now: NOW, cardStates: [], allExercises: pool(), events: [], skillStates: [], adjustments: [] })
    for (const t of p.tasks) {
      expect(t.reasons.length).toBeGreaterThan(0)
      expect(t.reasons[0].length).toBeGreaterThan(4)
    }
  })
})
