// 内容生成包：agent 出的题必须逐条过校验器；ID 前缀/题目编号/avoidIds 都是硬校验。
import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { contentPacket, type ContentCtx } from '../src/engine/packets/content'
import { getAllCustomContent } from '../src/storage/db'

const TODAY = '2026-10-25'

function vocabItem(id: string, over: Record<string, unknown> = {}) {
  return {
    id, language: 'en', skill: 'vocab', type: 'vocab-card', topic: 'daily-life', difficulty: 3,
    estimatedMinutes: 1, tags: ['daily-life'], createdAt: TODAY, contentVersion: 1, source: 'user-imported',
    term: 'make do', pos: 'v. phrase', glossZh: '将就', definition: 'to manage with what is available.',
    collocations: ['make do with', 'make do without'],
    examples: [{ sentence: 'We made do with leftovers.', zh: '我们用剩菜将就了一顿。' }, { sentence: 'She made do.', zh: '她将就了。' }],
    ...over,
  }
}

const ctx = (avoidIds: string[] = []): ContentCtx => ({
  language: 'en', type: 'vocab-card', difficulty: 3, count: 5, avoidIds,
})

function wrap(items: unknown[]): string {
  return JSON.stringify({ lingualoop: 'packet', schemaVersion: 1, kind: 'content', promptVersion: 1, payload: { items } })
}

describe('内容包 parse', () => {
  it('合规词卡通过校验', () => {
    const r = contentPacket.parse(wrap([vocabItem('en-voc-901')]), ctx())
    expect(r.error).toBeUndefined()
    expect(r.value!.items).toHaveLength(1)
    expect(r.value!.rejected).toHaveLength(0)
  })

  it('已知前缀与题型不符（en-read-xxx 当词卡）被拒收并给出原因', () => {
    const r = contentPacket.parse(wrap([vocabItem('en-read-901')]), ctx())
    expect(r.value).toBeUndefined()
    expect(r.error).toContain('en-read-901')
  })

  it('avoidIds 命中的条目被去重（全部命中 → 明确报错）', () => {
    const r = contentPacket.parse(wrap([vocabItem('en-voc-901')]), ctx(['en-voc-901']))
    expect(r.value).toBeUndefined()
    expect(r.error).toContain('重复')
  })

  it('批内重复 id 被校验器整体拒收', () => {
    const r = contentPacket.parse(wrap([vocabItem('en-voc-901'), vocabItem('en-voc-901')]), ctx())
    expect(r.value).toBeUndefined()
    expect(r.error).toContain('重复')
  })

  it('缺 explanation 证据的阅读题被拒', () => {
    const badReading = {
      id: 'en-read-901', language: 'en', skill: 'reading', type: 'reading-mc', topic: 'society', difficulty: 3,
      estimatedMinutes: 6, tags: ['society'], createdAt: TODAY, contentVersion: 1, source: 'user-imported',
      title: 'T', titleZh: '题', passage: 'word '.repeat(70),
      questions: [{ id: 'en-read-901-q1', stem: 'Q?', options: ['a', 'b', 'c'], answerIndex: 0, explanation: 'A 对', errorTags: ['detail'] }],
    }
    const r = contentPacket.parse(wrap([badReading]), ctx())
    expect(r.value).toBeUndefined()
    expect(r.error).toContain('explanation')
  })

  it('prompt 内嵌 ID 命名规范、难度锚点、原创红线与已存在 id', () => {
    const p = contentPacket.buildPrompt(ctx(['en-voc-001', 'en-voc-002']))
    expect(p).toContain('en-voc-')
    expect(p).toContain('Band 6–7')
    expect(p).toContain('不得复制')
    expect(p).toContain('en-voc-001')
    expect(p).toContain('证据')
  })
})

describe('内容包 apply（真实 IndexedDB 行为）', () => {
  it('写入时打上 agent-generated 标记，不覆盖已存在 id', async () => {
    const r = contentPacket.parse(wrap([vocabItem('en-voc-911')]), ctx())
    const note = await contentPacket.apply(r.value!, ctx())
    const all = await getAllCustomContent()
    expect(all).toHaveLength(1)
    expect(all[0].license).toContain('agent-generated')
    expect(all[0].source).toBe('user-imported')
    expect(note).toContain('入库 1 条')

    // 再来一次同 id → skip
    const note2 = await contentPacket.apply(r.value!, ctx())
    expect(note2).toContain('跳过已存在 1 条')
  })
})
