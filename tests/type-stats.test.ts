import { describe, expect, it } from 'vitest'
import { questionTypeStats, typeStatsHighlights } from '../src/engine/type-stats'
import type { LearningEvent } from '../src/types/app'

function ev(id: string, over: Partial<LearningEvent> = {}): LearningEvent {
  return {
    id, ts: 1000, language: 'en', skill: 'reading', exerciseType: 'reading-mc', contentId: 'en-read-001',
    correct: false, secondsSpent: 300, hintsUsed: 0, errorTags: [], contentVersion: 1,
    detail: { questionResults: [] }, ...over,
  }
}

const q = (qid: string, type: string | undefined, correct: boolean, seconds = 0) => ({ qid, questionType: type, correct, chosen: 0, seconds })

describe('questionTypeStats · 分题型正确率与速度', () => {
  it('按题型聚合作答数、正确率与平均用时', () => {
    const events = [
      ev('e1', {
        detail: {
          questionResults: [q('a1', 'inference', false, 40), q('a2', 'inference', true, 20), q('a3', 'detail', true, 10)],
        },
      }),
      ev('e2', { detail: { questionResults: [q('b1', 'inference', false, 60), q('b2', 'detail', false, 0)] } }),
    ]
    const stats = questionTypeStats(events, { language: 'en' })
    const inf = stats.find((s) => s.type === 'inference')!
    const det = stats.find((s) => s.type === 'detail')!

    expect(inf.attempts).toBe(3)
    expect(inf.correct).toBe(1)
    expect(inf.accuracy).toBeCloseTo(1 / 3)
    expect(inf.avgSeconds).toBe(40) // (40+20+60)/3
    expect(det.attempts).toBe(2)
    expect(det.avgSeconds).toBe(10) // 只有一条有效计时
    expect(inf.label).toBe('推断')
  })

  it('只统计目标语言与阅读/听力，不受写作/口语事件影响', () => {
    const events = [
      ev('e1', { detail: { questionResults: [q('a1', 'inference', true)] } }),
      ev('e2', { language: 'es', detail: { questionResults: [q('b1', 'inference', false)] } }),
      ev('e3', { skill: 'writing', detail: { questionResults: [q('c1', 'inference', false)] } }),
    ]
    const stats = questionTypeStats(events, { language: 'en' })
    expect(stats).toHaveLength(1)
    expect(stats[0].attempts).toBe(1)
    expect(stats[0].correct).toBe(1)
  })

  it('跳过没有题型标记的记录，不伪造分类', () => {
    const stats = questionTypeStats([ev('e1', { detail: { questionResults: [q('a1', undefined, true)] } })], { language: 'en' })
    expect(stats).toEqual([])
  })

  it('没有逐题计时的记录 avgSeconds 为 null', () => {
    const stats = questionTypeStats([ev('e1', { detail: { questionResults: [q('a1', 'detail', true, 0)] } })], { language: 'en' })
    expect(stats[0].avgSeconds).toBeNull()
  })

  it('按作答量降序排列', () => {
    const stats = questionTypeStats([
      ev('e1', { detail: { questionResults: [q('a1', 'detail', true), q('a2', 'detail', true), q('a3', 'inference', false)] } }),
    ], { language: 'en' })
    expect(stats.map((s) => s.type)).toEqual(['detail', 'inference'])
  })

  it('空数据返回空数组', () => {
    expect(questionTypeStats([], { language: 'en' })).toEqual([])
    expect(questionTypeStats([ev('e1')], { language: 'en' })).toEqual([])
  })
})

describe('typeStatsHighlights · 一句话结论', () => {
  const base = { type: 'x', label: 'X', attempts: 10, correct: 5, accuracy: 0.5, avgSeconds: 30 }

  it('样本不足（<5 题）不给结论', () => {
    expect(typeStatsHighlights([{ ...base, attempts: 3 }], 5)).toEqual([])
  })

  it('指出正确率最低与最耗时的题型', () => {
    const out = typeStatsHighlights([
      { ...base, type: 'inference', label: '推断', accuracy: 0.4, avgSeconds: 60 },
      { ...base, type: 'detail', label: '细节', accuracy: 0.9, avgSeconds: 20 },
    ], 5)
    expect(out.join(' ')).toContain('正确率最低：推断')
    expect(out.join(' ')).toContain('最耗时：推断')
  })

  it('正确率都健康时不制造负面结论', () => {
    const out = typeStatsHighlights([{ ...base, accuracy: 0.95 }], 5)
    expect(out.some((x) => x.includes('正确率最低'))).toBe(false)
  })
})
