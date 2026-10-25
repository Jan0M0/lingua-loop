import { describe, expect, it } from 'vitest'
import { recommendExplore, topicWeightAdjustments } from '../src/engine/recommend'
import type { Adjustment, LearningEvent } from '../src/types/app'
import type { Exercise, StoryExercise } from '../src/types/content'

const NOW = new Date('2026-10-25T12:00:00').getTime()

function story(id: string, topic: string, difficulty: 1 | 2 | 3 | 4 | 5 = 3, language: 'en' | 'es' = 'en'): StoryExercise {
  return {
    id, language, skill: 'reading', type: 'story', topic, difficulty,
    estimatedMinutes: 4, tags: [topic], createdAt: '2026-10-25', contentVersion: 1, source: 'original',
    mode: 'reading', title: 'T', titleZh: '标题', hookZh: '钩子',
    paragraphs: ['段落一。', '段落二。'],
    highlights: [{ expression: 'e', glossZh: 'g', fromStory: 's' }],
  }
}

describe('推荐引擎（v2 §3A）', () => {
  const pool: Exercise[] = [
    story('en-story-a', 'technology', 3),
    story('en-story-b', 'food', 3),
    story('en-story-c', 'travel', 3),
    story('es-story-x', 'food', 1, 'es'),
  ]

  it('兴趣主题优先且理由可解释', () => {
    const r = recommendExplore(
      { interests: ['food'], language: 'en', targetDifficulty: 3, allExercises: pool, events: [], adjustments: [], now: NOW },
      [], 'seed-1'
    )
    expect(r?.exercise.id).toBe('en-story-b')
    expect(r?.reasons.join(' ')).toContain('食物与烹饪')
  })

  it('排除已读内容与"换一个"列表', () => {
    const r = recommendExplore(
      { interests: ['food', 'technology'], language: 'en', targetDifficulty: 3, allExercises: pool, events: [], adjustments: [], now: NOW },
      ['en-story-b'], 'seed-1'
    )
    expect(r?.exercise.id).toBe('en-story-a')
  })

  it('不合口味的主题被降权', () => {
    const depri: Adjustment[] = [{
      id: 'adj-1', ts: NOW - 1000, kind: 'topic-deprioritize', description: 'd',
      expiresAt: NOW + 86400000, payload: { topic: 'food' },
    }]
    const r = recommendExplore(
      { interests: ['food'], language: 'en', targetDifficulty: 3, allExercises: pool, events: [], adjustments: depri, now: NOW },
      [], 'seed-1'
    )
    expect(r?.exercise.id).not.toBe('en-story-b')
  })

  it('升权主题等同兴趣权重，优先于无兴趣主题', () => {
    const boost: Adjustment[] = [{
      id: 'adj-2', ts: NOW - 1000, kind: 'topic-boost', description: 'd',
      expiresAt: NOW + 86400000, payload: { topic: 'travel' },
    }]
    const r = recommendExplore(
      { interests: [], language: 'en', targetDifficulty: 3, allExercises: pool, events: [], adjustments: boost, now: NOW },
      [], 'seed-1'
    )
    expect(r?.exercise.id).toBe('en-story-c')
    expect(r?.reasons.join(' ')).toContain('有趣')
  })

  it('近 21 天读过的内容不重复推荐', () => {
    const events: LearningEvent[] = [{
      id: 'e1', ts: NOW - 3 * 86400000, language: 'en', skill: 'reading', exerciseType: 'story',
      contentId: 'en-story-b', secondsSpent: 100, hintsUsed: 0, errorTags: [], contentVersion: 1,
    }]
    const r = recommendExplore(
      { interests: ['food'], language: 'en', targetDifficulty: 3, allExercises: pool, events, adjustments: [], now: NOW },
      [], 'seed-1'
    )
    expect(r?.exercise.id).not.toBe('en-story-b')
  })

  it('语言过滤：西语推荐不含英语内容', () => {
    const r = recommendExplore(
      { interests: ['food'], language: 'es', targetDifficulty: 1, allExercises: pool, events: [], adjustments: [], now: NOW },
      [], 'seed-1'
    )
    expect(r?.exercise.id).toBe('es-story-x')
  })

  it('主题权重随过期时间失效', () => {
    const expired: Adjustment[] = [{
      id: 'adj-3', ts: NOW - 10 * 86400000, kind: 'topic-deprioritize', description: 'd',
      expiresAt: NOW - 86400000, payload: { topic: 'food' },
    }]
    const m = topicWeightAdjustments(expired, NOW)
    expect(m.size).toBe(0)
    const r = recommendExplore(
      { interests: ['food'], language: 'en', targetDifficulty: 3, allExercises: pool, events: [], adjustments: expired, now: NOW },
      [], 'seed-1'
    )
    expect(r?.exercise.id).toBe('en-story-b')
  })

  it('内容耗尽时明确返回 undefined（不假装无限推荐）', () => {
    const r = recommendExplore(
      { interests: [], language: 'en', targetDifficulty: 3, allExercises: [story('es-story-x', 'food', 1, 'es')], events: [], adjustments: [], now: NOW },
      [], 'seed-1'
    )
    expect(r).toBeUndefined()
  })
})
