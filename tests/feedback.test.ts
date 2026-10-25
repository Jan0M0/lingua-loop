import { describe, expect, it } from 'vitest'
import { applyFeedback, activeDeprioritizations, applyEaseDelta, applySkillOffset } from '../src/engine/feedback'
import type { LearningEvent, TaskFeedback } from '../src/types/app'
import { newCardState } from '../src/engine/srs'
import { analyzeWriting } from '../src/engine/writing-analyzer'
import { dailyRecap, weeklyReport } from '../src/engine/recap'
import { scoreDiagnostic } from '../src/engine/diagnostics'

const NOW = new Date('2026-10-25T12:00:00').getTime()

function fb(over: Partial<TaskFeedback> = {}): TaskFeedback {
  return {
    ts: NOW, language: 'en', skill: 'reading', exerciseType: 'reading-mc', contentIds: ['en-read-001'],
    difficulty: 'right', value: 'useful', energy: 'good', ...over,
  }
}

describe('反馈规则引擎', () => {
  it('太难 → 降难度偏移 + 卡片 ease 下降 + 生成解释', () => {
    const out = applyFeedback(fb({ difficulty: 'too-hard', contentIds: ['a', 'b'] }), { events: [], adjustments: [] }, NOW)
    expect(out.skillUpdates[0].targetDifficultyOffsetDelta).toBeLessThan(0)
    expect(out.cardEaseDelta['a']).toBeLessThan(0)
    expect(out.adjustments.some((a) => a.description.includes('降低'))).toBe(true)
  })

  it('太简单 → 升难度', () => {
    const out = applyFeedback(fb({ difficulty: 'too-easy' }), { events: [], adjustments: [] }, NOW)
    expect(out.skillUpdates[0].targetDifficultyOffsetDelta).toBeGreaterThan(0)
  })

  it('连续两次没帮助 → 7 天降权并带过期时间', () => {
    const prior: LearningEvent[] = [
      { id: 'p1', ts: NOW - 86400000, language: 'en', skill: 'reading', exerciseType: 'reading-mc', contentId: 'x', secondsSpent: 60, hintsUsed: 0, errorTags: [], contentVersion: 1, selfValue: 'not-useful' },
    ]
    const out = applyFeedback(fb({ value: 'not-useful' }), { events: prior, adjustments: [] }, NOW)
    const depri = out.adjustments.find((a) => a.kind === 'type-deprioritize')
    expect(depri).toBeDefined()
    expect(depri!.expiresAt).toBeGreaterThan(NOW)
    expect(activeDeprioritizations(out.adjustments, NOW)).toHaveLength(1)
    expect(activeDeprioritizations(out.adjustments, NOW + 8 * 86400000)).toHaveLength(0)
  })

  it('疲惫 → 建议轻量', () => {
    const out = applyFeedback(fb({ energy: 'tired' }), { events: [], adjustments: [] }, NOW)
    expect(out.sameDayLightLoad).toBe(true)
    expect(out.adjustments.some((a) => a.description.includes('疲惫'))).toBe(true)
  })

  it('ease/offset 有界', () => {
    expect(applyEaseDelta({ ...newCardState('x'), ease: 1.25 }, -0.5).ease).toBe(1.3)
    expect(applyEaseDelta({ ...newCardState('x'), ease: 2.95 }, 0.5).ease).toBe(3.0)
    expect(applySkillOffset({ language: 'en', skill: 'reading', events: 0, ewmaPerf: 0.5, targetDifficultyOffset: 0.9, prior: 50 }, 0.5).targetDifficultyOffset).toBe(1)
  })
})

describe('写作分析器', () => {
  const text = 'Education matters. '.repeat(3) + '\n\n' + 'However, the government should invest more in schools because very good teachers thing very much. Moreover, students need support. Furthermore, funding helps. In addition, it is effective. Therefore, we agree. '.repeat(2)

  it('产出可解释检查项且包含边界声明', () => {
    const a = analyzeWriting(text)
    expect(a.checks.length).toBeGreaterThan(4)
    expect(a.checks.some((c) => c.id === 'boundary')).toBe(true)
    expect(a.wordCount).toBeGreaterThan(30)
  })

  it('连接词过度使用会被警告', () => {
    const heavy = 'However, a. Moreover, b. Furthermore, c. In addition, d. Therefore, e. Thus, f. Consequently, g. Nevertheless, h. '
    const a = analyzeWriting(heavy)
    expect(a.checks.find((c) => c.id === 'markers')?.status).toBe('warn')
  })

  it('its a 混淆提示', () => {
    const a = analyzeWriting('Its a good idea. People agree.')
    expect(a.checks.some((c) => c.label === '常见混淆提示')).toBe(true)
  })

  it('绝不输出 Band 预测', () => {
    const a = analyzeWriting('Some text here. '.repeat(20))
    const all = a.checks.map((c) => c.label + c.detail).join(' ')
    expect(/band\s*[0-9]/i.test(all)).toBe(false)
  })
})

describe('复盘与周报', () => {
  it('无数据的日期明说而不是编造', () => {
    const r = dailyRecap('2026-10-25', [], undefined, [])
    expect(r.summaryZh[0]).toContain('还没有')
  })

  it('周报样本不足会声明', () => {
    const w = weeklyReport('2026-10-19', [], [], { dueInWeek: 0, reviewedInWeek: 0 })
    expect(w.dataSufficient).toBe(false)
    expect(w.concerns.some((c) => c.includes('样本不足'))).toBe(true)
  })

  it('周报给出时间与复习完成率', () => {
    const events: LearningEvent[] = Array.from({ length: 20 }, (_, i) => ({
      id: `w${i}`, ts: new Date('2026-10-20T10:00:00').getTime() + i * 60000, language: 'en',
      skill: i % 2 ? 'reading' : 'listening', exerciseType: 'reading-mc', contentId: 'x',
      correct: i % 3 !== 0, secondsSpent: 300, hintsUsed: 0, errorTags: [], contentVersion: 1,
    }))
    const w = weeklyReport('2026-10-19', events, [], { dueInWeek: 10, reviewedInWeek: 9 })
    expect(w.accuracy).not.toBeNull()
    expect(w.dueCompletion).toBeCloseTo(0.9)
    expect(w.actualMinutes).toBe(100)
  })
})

describe('诊断评分', () => {
  it('空作答返回默认假设', () => {
    const r = scoreDiagnostic('es', [])
    expect(r.levelLabelZh).toContain('A1')
    expect(r.adviceZh[0]).toContain('默认')
  })

  it('按难度加权且分技能给先验', () => {
    const answers = [
      { qid: 'q1', skill: 'reading' as const, difficulty: 2, correct: true },
      { qid: 'q2', skill: 'reading' as const, difficulty: 5, correct: true },
      { qid: 'q3', skill: 'grammar' as const, difficulty: 3, correct: false },
    ]
    const r = scoreDiagnostic('en', answers)
    expect(r.skillPriors.reading).toBe(100)
    expect(r.skillPriors.grammar).toBe(0)
    expect(r.overallScore).toBeGreaterThan(50)
    expect(r.levelLabelZh).toContain('仅训练参考')
  })
})
