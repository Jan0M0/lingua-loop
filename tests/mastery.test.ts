import { describe, expect, it } from 'vitest'
import { computeMastery, rankSkillNeeds } from '../src/engine/mastery'
import type { LearningEvent } from '../src/types/app'

const T0 = new Date('2026-10-01T09:00:00').getTime()

function ev(partial: Partial<LearningEvent>): LearningEvent {
  return {
    id: `e-${Math.random().toString(36).slice(2)}`,
    ts: T0,
    language: 'en',
    skill: 'reading',
    exerciseType: 'reading-mc',
    contentId: 'en-read-001',
    secondsSpent: 60,
    hintsUsed: 0,
    errorTags: [],
    contentVersion: 1,
    ...partial,
  }
}

describe('掌握度', () => {
  it('无数据时收缩到先验且置信度不足', () => {
    const m = computeMastery('en', 'reading', [], 60)
    expect(m.value).toBe(60)
    expect(m.confidence).toBe('insufficient')
    expect(m.sampleSize).toBe(0)
  })

  it('全对事件提升掌握度，全错下降', () => {
    const good = Array.from({ length: 20 }, (_, i) => ev({ ts: T0 + i * 60000, correct: true }))
    const bad = Array.from({ length: 20 }, (_, i) => ev({ ts: T0 + i * 60000, correct: false }))
    expect(computeMastery('en', 'reading', good, 50).value).toBeGreaterThan(80)
    expect(computeMastery('en', 'reading', bad, 50).value).toBeLessThan(20)
  })

  it('只统计同语言同技能的事件', () => {
    const mixed = [
      ev({ correct: true }),
      ev({ language: 'es', correct: false }),
      ev({ skill: 'listening', correct: false }),
    ]
    const m = computeMastery('en', 'reading', mixed, 50)
    expect(m.sampleSize).toBe(1)
  })

  it('开放任务用自评映射表现', () => {
    const selfEv = Array.from({ length: 10 }, (_, i) =>
      ev({ skill: 'speaking', exerciseType: 'speaking-task', ts: T0 + i * 1000, correct: undefined, selfDifficulty: 'too-easy' })
    )
    const m = computeMastery('en', 'speaking', selfEv, 50)
    expect(m.value).toBeGreaterThan(70)
  })

  it('瓶颈排序：低掌握度与久未训练优先', () => {
    const ranked = rankSkillNeeds([
      { language: 'en', skill: 'reading', value: 80, confidence: 'high', sampleSize: 50, ewma: 0.8 },
      { language: 'en', skill: 'writing', value: 30, confidence: 'medium', sampleSize: 20, ewma: 0.3, staleDays: 10 },
    ])
    expect(ranked[0].skill).toBe('writing')
    expect(ranked[0].reason).toContain('未练') // 10 天未练应在理由中体现（措辞为 "已 10 天未练"）
  })
})
