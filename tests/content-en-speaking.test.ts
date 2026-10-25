// 内容校验测试：en-speaking 组（Part 1 / Part 2 / Part 3）
import { describe, expect, it } from 'vitest'
import { items as p1 } from '../src/data/content/en/speaking-p1'
import { items as p23 } from '../src/data/content/en/speaking-p23'
import { validateAll } from '../src/content/validate'

const all = [...p1, ...p23]

describe('content en-speaking', () => {
  it('数量符合计划（10 P1 + 10 P2 + 8 P3）', () => {
    expect(p1).toHaveLength(10)
    expect(p1.filter((i) => i.variant === 'ielts-part1')).toHaveLength(10)
    expect(p23).toHaveLength(18)
    expect(p23.filter((i) => i.variant === 'ielts-part2')).toHaveLength(10)
    expect(p23.filter((i) => i.variant === 'ielts-part3')).toHaveLength(8)
  })

  it('无校验错误', () => {
    const issues = validateAll(all)
    const errors = issues.filter((i) => i.level === 'error')
    if (errors.length) console.error(errors.map((e) => `${e.id} ${e.field ?? ''} ${e.message}`).join('\n'))
    expect(errors).toEqual([])
  })
})
