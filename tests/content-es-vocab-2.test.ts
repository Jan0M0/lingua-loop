// 内容校验测试：西语词卡第二册（es-voc-061 ~ es-voc-120）
import { describe, expect, it } from 'vitest'
import { items as vocab2 } from '../src/data/content/es/vocab-2'
import { validateAll } from '../src/content/validate'

describe('content es-vocab-2', () => {
  it('无校验错误', () => {
    const issues = validateAll([...vocab2])
    const errors = issues.filter((i) => i.level === 'error')
    if (errors.length) console.error(errors.map((e) => `${e.id} ${e.field ?? ''} ${e.message}`).join('\n'))
    expect(errors).toEqual([])
  })

  it('共 60 张词卡，id 区间 es-voc-061 ~ es-voc-120 且不重复', () => {
    expect(vocab2).toHaveLength(60)
    const ids = vocab2.map((v) => v.id)
    expect(new Set(ids).size).toBe(60)
    expect(ids).toContain('es-voc-061')
    expect(ids).toContain('es-voc-120')
    const nums = ids.map((id) => Number(id.slice('es-voc-'.length)))
    for (let n = 61; n <= 120; n++) expect(nums).toContain(n)
  })

  it('难度分布：A2（difficulty 2）45 张，B1（difficulty 3）15 张', () => {
    const a2 = vocab2.filter((v) => v.difficulty === 2 && v.cefr === 'A2')
    const b1 = vocab2.filter((v) => v.difficulty === 3 && v.cefr === 'B1')
    expect(a2).toHaveLength(45)
    expect(b1).toHaveLength(15)
  })
})
