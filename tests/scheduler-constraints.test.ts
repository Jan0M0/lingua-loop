// P4：计划约束如何影响确定性调度器 —— type-cap 跨天计数、difficulty 偏移、过期自动复原。
// 写作槽在第 6 天配方（day 6），阅读槽在第 4 天（day 4）——测试日期据此选择。
import { describe, expect, it } from 'vitest'
import { buildDailyPlan, readPlanConstraints } from '../src/engine/scheduler'
import { newCardState } from '../src/engine/srs'
import type { Adjustment, CardState, DailyPlan, LearningEvent, Settings, SkillState } from '../src/types/app'
import { DEFAULT_SETTINGS } from '../src/types/app'
import type { Exercise, ListeningExercise, ReadingExercise, VocabCard, WritingExercise } from '../src/types/content'

const START = '2026-10-25'
const DAY6 = '2026-10-30' // 第 6 天：配方含写作槽
const DAY4 = '2026-10-28' // 第 4 天：配方含阅读槽
const NOW6 = new Date(`${DAY6}T08:00:00`).getTime()
const NOW4 = new Date(`${DAY4}T08:00:00`).getTime()

function settings(over: Partial<Settings> = {}): Settings {
  return { ...DEFAULT_SETTINGS, onboarded: true, startedAt: START, seedSalt: 'test', diagnosticsDone: { en: true, es: true }, ...over }
}

function vocab(id: string): VocabCard {
  return {
    id, language: id.startsWith('es') ? 'es' : 'en', skill: 'vocab', type: 'vocab-card', topic: 'general', difficulty: 3,
    estimatedMinutes: 1, tags: ['general'], createdAt: START, contentVersion: 1, source: 'original',
    term: 't', pos: 'n.', glossZh: 'g', definition: 'd', collocations: ['a b', 'c d'],
    examples: [{ sentence: 's', zh: 'z' }],
  }
}

function reading(id: string, difficulty: 1 | 2 | 3 | 4 | 5): ReadingExercise {
  return {
    id, language: 'en', skill: 'reading', type: 'reading-mc', topic: 'education', difficulty,
    estimatedMinutes: 7, tags: ['education'], createdAt: START, contentVersion: 1, source: 'original',
    title: 'T', titleZh: '题', passage: 'word '.repeat(80),
    questions: [{ id: `${id}-q1`, stem: 'Q?', options: ['a', 'b', 'c', 'd'], answerIndex: 0, explanation: '原文第一行说明 a 正确；其余与原文不符。', errorTags: ['detail'] }],
  }
}

function writing(id: string): WritingExercise {
  return {
    id, language: 'en', skill: 'writing', type: 'writing-task', topic: 'education', difficulty: 3,
    estimatedMinutes: 12, tags: ['education'], createdAt: START, contentVersion: 1, source: 'original',
    variant: 'ielts-t2', title: 'T2', prompt: 'P', promptZh: '题目', targetWords: [250, 280], suggestedMinutes: 20,
    checklist: [{ dimension: 'A', descriptors: ['a'] }, { dimension: 'B', descriptors: ['b'] }, { dimension: 'C', descriptors: ['c'] }],
  }
}

function listening(id: string, difficulty: 1 | 2 | 3 | 4 | 5): ListeningExercise {
  return {
    id, language: 'en', skill: 'listening', type: 'listening', topic: 'travel', difficulty,
    estimatedMinutes: 5, tags: ['travel'], createdAt: START, contentVersion: 1, source: 'original',
    title: 'L', titleZh: '听力', setting: '场景', transcriptMode: 'after',
    script: [
      { speaker: 'A', line: 'Hi.' }, { speaker: 'B', line: 'Hello.' },
      { speaker: 'A', line: 'Where are you going?' }, { speaker: 'B', line: 'To the station.' },
    ],
    questions: [
      { id: `${id}-q1`, stem: 'Q1?', options: ['a', 'b', 'c'], answerIndex: 0, explanation: '脚本末行说去车站，故 a 正确；b/c 与脚本不符。', errorTags: ['detail'] },
      { id: `${id}-q2`, stem: 'Q2?', options: ['a', 'b', 'c'], answerIndex: 1, explanation: '脚本第二行是问候，故 b 正确；a/c 无依据。', errorTags: ['detail'] },
    ],
  }
}

function pool(): Exercise[] {
  return [vocab('en-voc-001'), vocab('en-voc-002'), vocab('es-voc-001'), vocab('es-voc-002'),
    reading('en-read-001', 2), reading('en-read-002', 4), writing('en-w-001'), writing('en-w-002'),
    listening('en-ls-001', 3), listening('en-ls-002', 4)]
}

function capAdj(now: number, over: Partial<Adjustment> = {}): Adjustment {
  return {
    id: 'plan-c-1', ts: now - 86400000, kind: 'plan-constraint', description: 'test',
    expiresAt: now + 13 * 86400000,
    payload: { dimension: 'type-cap', target: 'writing', value: 1, days: 14, reason: 'test' },
    ...over,
  }
}

function priorWritingPlan(generatedAt: number): DailyPlan {
  return {
    date: '2026-10-29', mode: 'standard', generatedAt,
    tasks: [{ id: 'w-prev', kind: 'exercise', language: 'en', skill: 'writing', estMinutes: 12, reasons: [], status: 'done' }],
    notes: [],
  }
}

describe('readPlanConstraints', () => {
  it('只读未过期的 plan-constraint；同技能取更严格的 cap', () => {
    const expired = capAdj(NOW6, { id: 'e', ts: NOW6 - 20 * 86400000, expiresAt: NOW6 - 1000 })
    const looser = capAdj(NOW6, { id: 'l', payload: { dimension: 'type-cap', target: 'writing', value: 3, days: 14, reason: '' } })
    const c = readPlanConstraints([expired, looser, capAdj(NOW6)], NOW6)
    expect(c.typeCaps.get('writing')).toEqual({ max: 1, since: NOW6 - 86400000 })
    expect(c.difficultyShifts.size).toBe(0)
  })
})

describe('type-cap 约束下的每日计划（第 6 天：写作槽）', () => {
  const base6 = { settings: settings(), dateKey: DAY6, now: NOW6, cardStates: [] as CardState[], allExercises: pool(), events: [] as LearningEvent[], skillStates: [] as SkillState[] }

  it('无约束时会安排写作（对照组）', () => {
    const p = buildDailyPlan({ ...base6, adjustments: [] })
    expect(p.tasks.some((t) => t.kind === 'exercise' && t.skill === 'writing')).toBe(true)
  })

  it('约束期内已有 1 次写作 → 今天写作槽被压掉并留说明', () => {
    const p = buildDailyPlan({ ...base6, adjustments: [capAdj(NOW6)], recentPlans: [priorWritingPlan(NOW6 - 86400000 + 3600000)] })
    expect(p.tasks.some((t) => t.kind === 'exercise' && t.skill === 'writing')).toBe(false)
    expect(p.notes.join(' ')).toContain('计划约束生效')
  })

  it('约束开始之前的历史计划不计入（since 语义）', () => {
    const p = buildDailyPlan({ ...base6, adjustments: [capAdj(NOW6)], recentPlans: [priorWritingPlan(NOW6 - 2 * 86400000)] })
    expect(p.tasks.some((t) => t.kind === 'exercise' && t.skill === 'writing')).toBe(true)
  })

  it('约束过期后自动复原（可撤销性）', () => {
    const expired = capAdj(NOW6, { expiresAt: NOW6 - 1 })
    const p = buildDailyPlan({ ...base6, adjustments: [expired], recentPlans: [priorWritingPlan(NOW6 - 86400000 + 3600000)] })
    expect(p.tasks.some((t) => t.kind === 'exercise' && t.skill === 'writing')).toBe(true)
  })
})

describe('difficulty 偏移约束（第 4 天：阅读槽）', () => {
  it('+1 偏移写进任务理由（可解释）', () => {
    const adj: Adjustment = {
      id: 'd1', ts: NOW4 - 1000, kind: 'plan-constraint', description: '', expiresAt: NOW4 + 7 * 86400000,
      payload: { dimension: 'difficulty', target: 'reading', value: 1, days: 7, reason: 'r' },
    }
    const p = buildDailyPlan({
      settings: settings(), dateKey: DAY4, now: NOW4, cardStates: [], allExercises: pool(),
      events: [], skillStates: [], adjustments: [adj],
    })
    const readingTask = p.tasks.find((t) => t.kind === 'exercise' && t.skill === 'reading')
    expect(readingTask).toBeTruthy()
    expect(readingTask!.reasons.join(' ')).toContain('按约束上调 1 档')
  })
})

describe('单语言模式（配比 100/0）', () => {
  it('priorityEn=100：计划里没有任何西语任务，并有明确说明', () => {
    const p = buildDailyPlan({
      settings: settings({ priorityEn: 100 }), dateKey: DAY6, now: NOW6, cardStates: [],
      allExercises: pool(), events: [], skillStates: [], adjustments: [],
    })
    expect(p.tasks.some((t) => t.language === 'es')).toBe(false)
    expect(p.tasks.some((t) => t.language === 'en')).toBe(true)
    expect(p.notes.join(' ')).toContain('西语已停用')
  })

  it('到期的西语卡不进复习队列（数据保留，随时改回）', () => {
    const cards: CardState[] = [
      { ...newCardState('es-voc-001', NOW6 - 10 * 86400000), dueAt: NOW6 - 1000 },
      { ...newCardState('en-voc-001', NOW6 - 10 * 86400000), dueAt: NOW6 - 2000 },
    ]
    const p = buildDailyPlan({
      settings: settings({ priorityEn: 100 }), dateKey: DAY6, now: NOW6, cardStates: cards,
      allExercises: pool(), events: [], skillStates: [], adjustments: [],
    })
    const srs = p.tasks.filter((t) => t.kind === 'srs-review')
    expect(srs.length).toBeGreaterThan(0)
    expect(srs.every((t) => t.language === 'en')).toBe(true)
    expect(srs.some((t) => t.contentIds?.includes('es-voc-001'))).toBe(false)
  })

  it('priorityEn=0：镜像成立（只学西语）', () => {
    const p = buildDailyPlan({
      settings: settings({ priorityEn: 0 }), dateKey: DAY6, now: NOW6, cardStates: [],
      allExercises: pool(), events: [], skillStates: [], adjustments: [],
    })
    expect(p.tasks.some((t) => t.language === 'en')).toBe(false)
    expect(p.notes.join(' ')).toContain('英语已停用')
  })
})

describe('skill-share 补短板（第 6 天：写作槽可换）', () => {
  const base6 = () => ({
    settings: settings(), dateKey: DAY6, now: NOW6, cardStates: [] as CardState[],
    allExercises: pool(), events: [] as LearningEvent[], skillStates: [] as SkillState[],
  })
  const shareAdj = (): Adjustment => ({
    id: 'ss1', ts: NOW6 - 2 * 86400000, kind: 'plan-constraint', description: '',
    expiresAt: NOW6 + 14 * 86400000,
    payload: { dimension: 'skill-share', target: 'listening', value: 0.5, days: 14, reason: '听力弱' },
  })

  it('无约束（对照组）：第 6 天没有英语听力训练任务', () => {
    const p = buildDailyPlan({ ...base6(), adjustments: [] })
    expect(p.tasks.some((t) => t.kind === 'exercise' && t.skill === 'listening' && t.language === 'en')).toBe(false)
  })

  it('skill-share listening=0.5：写作槽被换成听力，说明与理由都可解释', () => {
    const p = buildDailyPlan({ ...base6(), adjustments: [shareAdj()] })
    const li = p.tasks.find((t) => t.kind === 'exercise' && t.skill === 'listening')
    expect(li).toBeTruthy()
    expect(li!.language).toBe('en')
    expect(p.notes.join(' ')).toContain('补强')
    expect(li!.reasons.join(' ')).toContain('按计划约束补强')
    expect(p.tasks.some((t) => t.kind === 'exercise' && t.skill === 'writing')).toBe(false)
  })

  it('换槽不超预算：总分钟与对照一致（只换技能不换时长）', () => {
    const control = buildDailyPlan({ ...base6(), adjustments: [] })
    const boosted = buildDailyPlan({ ...base6(), adjustments: [shareAdj()] })
    const sum = (p: typeof control) => p.tasks.reduce((a, t) => a + t.estMinutes, 0)
    expect(sum(boosted)).toBe(sum(control))
  })

  it('占比达标后不再换槽', () => {
    const prior: DailyPlan[] = [{
      date: '2026-10-29', mode: 'standard', generatedAt: NOW6 - 86400000 + 3600000,
      tasks: [
        { id: 'l1', kind: 'exercise', language: 'en', skill: 'listening', estMinutes: 5, reasons: [], status: 'done' },
        { id: 'l2', kind: 'exercise', language: 'en', skill: 'listening', estMinutes: 5, reasons: [], status: 'done' },
        { id: 'r1', kind: 'exercise', language: 'en', skill: 'reading', estMinutes: 7, reasons: [], status: 'done' },
        { id: 'w1', kind: 'exercise', language: 'en', skill: 'writing', estMinutes: 12, reasons: [], status: 'done' },
      ],
      notes: [],
    }]
    const p = buildDailyPlan({ ...base6(), adjustments: [shareAdj()], recentPlans: prior })
    expect(p.tasks.some((t) => t.kind === 'exercise' && t.skill === 'writing')).toBe(true)
    expect(p.notes.join(' ')).not.toContain('补强')
  })
})
