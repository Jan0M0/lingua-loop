// 内容校验测试：en-reading / en-cloze（阅读 12 篇 + 语法语境填空 6 组）
import { describe, expect, it } from 'vitest'
import { items as reading1 } from '../src/data/content/en/reading-1'
import { items as reading2 } from '../src/data/content/en/reading-2'
import { items as cloze1 } from '../src/data/content/en/cloze-1'
import { validateAll } from '../src/content/validate'
import type { ClozeExercise, Exercise, ReadingExercise } from '../src/types/content'

const all: Exercise[] = [...reading1, ...reading2, ...cloze1]
const readings = [...reading1, ...reading2] as ReadingExercise[]
const clozes = cloze1 as ClozeExercise[]

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

describe('content en-reading / en-cloze', () => {
  it('数量符合计划（6 + 6 阅读，6 组 cloze）', () => {
    expect(reading1).toHaveLength(6)
    expect(reading2).toHaveLength(6)
    expect(cloze1).toHaveLength(6)
    expect(readings.map((r) => r.id)).toEqual([
      'en-read-001',
      'en-read-002',
      'en-read-003',
      'en-read-004',
      'en-read-005',
      'en-read-006',
      'en-read-007',
      'en-read-008',
      'en-read-009',
      'en-read-010',
      'en-read-011',
      'en-read-012',
    ])
  })

  it('无校验错误', () => {
    const issues = validateAll(all)
    const errors = issues.filter((i) => i.level === 'error')
    if (errors.length) console.error(errors.map((e) => `${e.id} ${e.field ?? ''} ${e.message}`).join('\n'))
    expect(errors).toEqual([])
  })

  it('阅读：难度阶梯 / 词数 150–320 / 每篇 4 题且题型 ≥3 种 / 无 all of the above', () => {
    const expectedDiff = [2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5]
    readings.forEach((ex, i) => {
      expect(ex.difficulty, `${ex.id} difficulty`).toBe(expectedDiff[i])
      expect(ex.estimatedMinutes).toBe(7)
      const w = wordCount(ex.passage)
      expect(w, `${ex.id} words=${w}`).toBeGreaterThanOrEqual(150)
      expect(w, `${ex.id} words=${w}`).toBeLessThanOrEqual(320)
      expect(ex.questions).toHaveLength(4)
      const types = new Set(ex.questions.map((q) => q.questionType))
      expect(types.size, `${ex.id} questionTypes=${[...types].join(',')}`).toBeGreaterThanOrEqual(3)
      for (const q of ex.questions) {
        expect(q.options.some((o) => /all of the above/i.test(o)), `${q.id} all-of-the-above`).toBe(false)
      }
    })
    const topics = new Set(readings.map((r) => r.topic))
    expect(topics).toEqual(
      new Set([
        'education',
        'technology',
        'environment',
        'work',
        'urban',
        'health',
        'culture',
        'science',
        'media',
        'society',
        'travel',
        'finance',
      ]),
    )
  })

  it('cloze：skill=grammar、词数 60–110、5 空位对应 5 题', () => {
    for (const ex of clozes) {
      expect(ex.skill, `${ex.id} skill`).toBe('grammar')
      expect(ex.type).toBe('cloze')
      expect(ex.estimatedMinutes).toBe(4)
      const w = wordCount(ex.passage)
      expect(w, `${ex.id} words=${w}`).toBeGreaterThanOrEqual(60)
      expect(w, `${ex.id} words=${w}`).toBeLessThanOrEqual(110)
      expect(ex.passage.match(/_{2,}/g)?.length ?? 0, `${ex.id} blanks`).toBe(5)
      expect(ex.questions).toHaveLength(5)
      for (const q of ex.questions) {
        expect(q.options.some((o) => /all of the above/i.test(o)), `${q.id} all-of-the-above`).toBe(false)
      }
    }
    expect(clozes.map((c) => c.difficulty)).toEqual([2, 2, 3, 3, 3, 4])
  })
})
