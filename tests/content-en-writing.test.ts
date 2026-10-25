// 内容校验测试：en-writing 组（Academic T1 / General T1 / Task 2）
import { describe, expect, it } from 'vitest'
import { items as t1a } from '../src/data/content/en/writing-t1a'
import { items as t1g } from '../src/data/content/en/writing-t1g'
import { items as t2 } from '../src/data/content/en/writing-t2'
import { validateAll } from '../src/content/validate'

const all = [...t1a, ...t1g, ...t2]

describe('content en-writing', () => {
  it('数量符合计划（8 + 4 + 12）', () => {
    expect(t1a).toHaveLength(8)
    expect(t1g).toHaveLength(4)
    expect(t2).toHaveLength(12)
  })

  it('无校验错误', () => {
    const issues = validateAll(all)
    const errors = issues.filter((i) => i.level === 'error')
    if (errors.length) console.error(errors.map((e) => `${e.id} ${e.field ?? ''} ${e.message}`).join('\n'))
    expect(errors).toEqual([])
  })
})
