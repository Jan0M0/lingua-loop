// 内容校验测试：英语核心词卡（en-voc-001 ~ en-voc-075，vocab-core-1 + vocab-core-2）
import { describe, expect, it } from 'vitest'
import { items as vocab1 } from '../src/data/content/en/vocab-core-1'
import { items as vocab2 } from '../src/data/content/en/vocab-core-2'
import { validateAll } from '../src/content/validate'

describe('content en-vocab-core', () => {
  it('无校验错误', () => {
    const issues = validateAll([...vocab1, ...vocab2])
    const errors = issues.filter((i) => i.level === 'error')
    if (errors.length) console.error(errors.map((e) => `${e.id} ${e.field ?? ''} ${e.message}`).join('\n'))
    expect(errors).toEqual([])
  })

  it('词卡数量与 id 区间正确且不重复', () => {
    expect(vocab1).toHaveLength(50)
    expect(vocab2).toHaveLength(25)
    const ids = [...vocab1, ...vocab2].map((v) => v.id)
    expect(new Set(ids).size).toBe(75)
    const nums = ids.map((id) => Number(id.slice('en-voc-'.length))).sort((a, b) => a - b)
    expect(nums[0]).toBe(1)
    expect(nums[nums.length - 1]).toBe(75)
    for (let i = 1; i <= 75; i++) expect(nums).toContain(i)
  })

  it('难度分布：2×15 / 3×30 / 4×30', () => {
    const counts: Record<number, number> = {}
    for (const v of [...vocab1, ...vocab2]) counts[v.difficulty] = (counts[v.difficulty] ?? 0) + 1
    expect(counts[2] ?? 0).toBe(15)
    expect(counts[3] ?? 0).toBe(30)
    expect(counts[4] ?? 0).toBe(30)
  })
})
