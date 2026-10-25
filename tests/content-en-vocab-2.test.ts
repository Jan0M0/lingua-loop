// 内容校验测试：英语词卡主题分册（en-voc-076 ~ en-voc-150）
import { describe, expect, it } from 'vitest'
import { items as topic1 } from '../src/data/content/en/vocab-topic-1'
import { items as topic2 } from '../src/data/content/en/vocab-topic-2'
import { validateAll } from '../src/content/validate'

describe('content en-vocab-2', () => {
  it('无校验错误', () => {
    const issues = validateAll([...topic1, ...topic2])
    const errors = issues.filter((i) => i.level === 'error')
    if (errors.length) console.error(errors.map((e) => `${e.id} ${e.field ?? ''} ${e.message}`).join('\n'))
    expect(errors).toEqual([])
  })

  it('topic-1 共 50 张词卡，id 覆盖 en-voc-076 ~ en-voc-125 且不重复', () => {
    expect(topic1).toHaveLength(50)
    const ids = topic1.map((v) => v.id)
    expect(new Set(ids).size).toBe(50)
    const nums = ids.map((id) => Number(id.slice('en-voc-'.length)))
    for (let n = 76; n <= 125; n++) expect(nums).toContain(n)
  })

  it('topic-2 共 25 张词卡，id 覆盖 en-voc-126 ~ en-voc-150 且不重复', () => {
    expect(topic2).toHaveLength(25)
    const ids = topic2.map((v) => v.id)
    expect(new Set(ids).size).toBe(25)
    const nums = ids.map((id) => Number(id.slice('en-voc-'.length)))
    for (let n = 126; n <= 150; n++) expect(nums).toContain(n)
  })

  it('两文件 id 无交叉，合计 75 张', () => {
    const all = [...topic1, ...topic2]
    expect(new Set(all.map((v) => v.id)).size).toBe(75)
    expect(all).toHaveLength(75)
  })

  it('难度分布：difficulty 2 共 20 张、3 共 35 张、4 共 20 张', () => {
    const all = [...topic1, ...topic2]
    expect(all.filter((v) => v.difficulty === 2)).toHaveLength(20)
    expect(all.filter((v) => v.difficulty === 3)).toHaveLength(35)
    expect(all.filter((v) => v.difficulty === 4)).toHaveLength(20)
    // 分册：topic-1 = 13/23/14，topic-2 = 7/12/6
    expect(topic1.filter((v) => v.difficulty === 2)).toHaveLength(13)
    expect(topic1.filter((v) => v.difficulty === 3)).toHaveLength(23)
    expect(topic1.filter((v) => v.difficulty === 4)).toHaveLength(14)
    expect(topic2.filter((v) => v.difficulty === 2)).toHaveLength(7)
    expect(topic2.filter((v) => v.difficulty === 3)).toHaveLength(12)
    expect(topic2.filter((v) => v.difficulty === 4)).toHaveLength(6)
  })

  it('公共字段完整：vocab-card 类型、公共元数据、每卡 2+ 搭配与 2+ 例句', () => {
    for (const v of [...topic1, ...topic2]) {
      expect(v.type).toBe('vocab-card')
      expect(v.skill).toBe('vocab')
      expect(v.language).toBe('en')
      expect(v.createdAt).toBe('2026-10-25')
      expect(v.contentVersion).toBe(1)
      expect(v.source).toBe('original')
      expect(v.estimatedMinutes).toBe(1)
      expect(v.tags.length).toBeGreaterThanOrEqual(1)
      expect(v.tags.length).toBeLessThanOrEqual(3)
      expect(v.collocations.length).toBeGreaterThanOrEqual(2)
      expect(v.collocations.length).toBeLessThanOrEqual(4)
      expect(v.examples.length).toBeGreaterThanOrEqual(2)
      expect(v.commonError).toBeTruthy()
    }
  })
})
