// 内容校验测试：西语词卡第一册（es-voc-001 ~ es-voc-060，全部 A1）
import { describe, expect, it } from 'vitest'
import { items as vocab1 } from '../src/data/content/es/vocab-1'
import { validateAll } from '../src/content/validate'

describe('content es-vocab-1', () => {
  it('无校验错误', () => {
    const issues = validateAll([...vocab1])
    const errors = issues.filter((i) => i.level === 'error')
    if (errors.length) console.error(errors.map((e) => `${e.id} ${e.field ?? ''} ${e.message}`).join('\n'))
    expect(errors).toEqual([])
  })

  it('共 60 张词卡，id 区间 es-voc-001 ~ es-voc-060 且不重复', () => {
    expect(vocab1).toHaveLength(60)
    const ids = vocab1.map((v) => v.id)
    expect(new Set(ids).size).toBe(60)
    expect(ids).toContain('es-voc-001')
    expect(ids).toContain('es-voc-060')
    const nums = ids.map((id) => Number(id.slice('es-voc-'.length)))
    for (let n = 1; n <= 60; n++) expect(nums).toContain(n)
  })

  it('全部为 A1（difficulty 1，cefr A1），公共字段符合规范', () => {
    const a1 = vocab1.filter((v) => v.difficulty === 1 && v.cefr === 'A1')
    expect(a1).toHaveLength(60)
    for (const v of vocab1) {
      expect(v.language).toBe('es')
      expect(v.skill).toBe('vocab')
      expect(v.type).toBe('vocab-card')
      expect(v.source).toBe('original')
      expect(v.contentVersion).toBe(1)
      expect(v.createdAt).toBe('2026-10-25')
      expect(v.estimatedMinutes).toBe(1)
      expect(v.tags.length).toBeGreaterThanOrEqual(1)
      expect(v.tags.length).toBeLessThanOrEqual(3)
      expect(v.collocations.length).toBeGreaterThanOrEqual(2)
      expect(v.collocations.length).toBeLessThanOrEqual(4)
      expect(v.examples.length).toBeGreaterThanOrEqual(2)
      expect(v.examples.length).toBeLessThanOrEqual(3)
    }
  })

  it('不占用 vocab-2 的 id 区间（es-voc-061+）', async () => {
    const { items: vocab2 } = await import('../src/data/content/es/vocab-2')
    const ids1 = new Set(vocab1.map((v) => v.id))
    for (const v of vocab2) expect(ids1.has(v.id)).toBe(false)
  })
})
