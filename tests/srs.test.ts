import { describe, expect, it } from 'vitest'
import { gradeCard, newCardState, performanceToGrade, sortDue } from '../src/engine/srs'

const NOW = new Date('2026-10-25T10:00:00').getTime()

describe('SRS (SM-2 风格)', () => {
  it('新卡 good 两次后间隔 1 天 → 3 天', () => {
    let s = newCardState('en-voc-001', NOW)
    s = gradeCard(s, 2, NOW)
    expect(s.intervalDays).toBe(1)
    expect(s.reps).toBe(1)
    s = gradeCard(s, 2, NOW + 86400000)
    expect(s.intervalDays).toBe(3)
    expect(s.reps).toBe(2)
  })

  it('again 重置并计一次失误', () => {
    let s = newCardState('x', NOW)
    s = gradeCard(s, 2, NOW)
    s = gradeCard(s, 2, NOW + 86400000)
    const easedBefore = s.ease
    s = gradeCard(s, 0, NOW + 2 * 86400000)
    expect(s.reps).toBe(0)
    expect(s.lapses).toBe(1)
    expect(s.ease).toBeLessThan(easedBefore)
    expect(s.dueAt).toBe(NOW + 2 * 86400000 + 10 * 60 * 1000)
  })

  it('easy 提升 ease 且间隔更长', () => {
    let a = newCardState('a', NOW)
    let b = newCardState('b', NOW)
    for (let i = 0; i < 3; i++) {
      a = gradeCard(a, 2, NOW + i * 86400000)
      b = gradeCard(b, 3, NOW + i * 86400000)
    }
    expect(b.ease).toBeGreaterThan(a.ease)
    expect(b.intervalDays).toBeGreaterThan(a.intervalDays)
  })

  it('间隔有上限，ease 有边界', () => {
    let s = newCardState('x', NOW)
    s = { ...s, ease: 2.9, intervalDays: 300, reps: 10 }
    s = gradeCard(s, 3, NOW)
    expect(s.ease).toBeLessThanOrEqual(3.0)
    expect(s.intervalDays).toBeLessThanOrEqual(365)
  })

  it('表现→等级映射正确', () => {
    expect(performanceToGrade({ correct: false })).toBe(0)
    expect(performanceToGrade({ correct: true })).toBe(2)
    expect(performanceToGrade({ correct: true, selfDifficulty: 'too-easy' })).toBe(3)
    expect(performanceToGrade({ correct: true, selfDifficulty: 'too-hard' })).toBe(1)
    expect(performanceToGrade({ correct: true, hinted: true })).toBe(1)
  })

  it('到期排序：最久过期优先，其次失误多的', () => {
    const mk = (id: string, dueAt: number, lapses = 0) => ({ ...newCardState(id, NOW), dueAt, lapses })
    const sorted = sortDue([mk('a', NOW - 5000, 1), mk('b', NOW - 99999, 3), mk('c', NOW - 5000, 5)], NOW)
    expect(sorted.map((s) => s.id)).toEqual(['b', 'c', 'a'])
    // 未到期不出现
    const none = sortDue([mk('z', NOW + 60000)], NOW)
    expect(none).toHaveLength(0)
  })
})
