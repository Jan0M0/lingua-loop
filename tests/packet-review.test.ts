// 批改包：标签必须来自统一词表、必须引用原文证据；apply 写入最近一次写作/口语记录（fake-indexeddb）。
import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { reviewPacket, type ReviewCtx } from '../src/engine/packets/review'
import { addEvent, getAllEvents } from '../src/storage/db'
import type { LearningEvent } from '../src/types/app'

const ctx: ReviewCtx = {
  language: 'en', skill: 'writing', exerciseId: 'en-w-001', taskTitle: 'Task 2',
  taskPrompt: 'Discuss both views.', sourceText: 'People has different views about this topic.',
}

const good = JSON.stringify({
  lingualoop: 'packet', schemaVersion: 1, kind: 'review', promptVersion: 1,
  payload: {
    candidates: [
      { tag: 'agreement', evidence: 'People has different' },
      { tag: 'tense', evidence: 'has different views' },
    ],
    actions: ['主谓一致：复数主语配 have', '时态保持一致'],
    summaryZh: '观点明确，语法一致性需要加强。',
  },
})

describe('批改包 parse', () => {
  it('合法结果通过，标签与行动项完整', () => {
    const r = reviewPacket.parse(good, ctx)
    expect(r.error).toBeUndefined()
    expect(r.value!.candidates.map((c) => c.tag)).toEqual(['agreement', 'tense'])
    expect(r.value!.actions).toHaveLength(2)
  })

  it('词表外的标签被忽略并告警', () => {
    const raw = JSON.stringify({ candidates: [{ tag: 'made-up-tag', evidence: 'People has' }, { tag: 'spelling', evidence: 'topic' }], actions: [] })
    const r = reviewPacket.parse(raw, ctx)
    expect(r.value!.candidates.map((c) => c.tag)).toEqual(['spelling'])
    expect(r.warnings.join(' ')).toContain('made-up-tag')
  })

  it('evidence 逐字校验：改写/编造的引用被拒收', () => {
    const raw = JSON.stringify({
      candidates: [
        { tag: 'agreement', evidence: 'People have different views' }, // 原文是 has，不是 have
        { tag: 'spelling', evidence: '句子根本不存在于原文中' },
        { tag: 'tense', evidence: 'about this topic' }, // 真实子串
      ],
      actions: [],
    })
    const r = reviewPacket.parse(raw, ctx)
    expect(r.value!.candidates.map((c) => c.tag)).toEqual(['tense'])
    expect(r.warnings.join(' ')).toContain('未在原文中找到')
  })

  it('没有引用原文证据的候选被拒', () => {
    const raw = JSON.stringify({ candidates: [{ tag: 'spelling', evidence: '' }, { tag: 'tense' }], actions: [] })
    const r = reviewPacket.parse(raw, ctx)
    expect(r.value).toBeUndefined()
    expect(r.warnings.join(' ')).toContain('evidence')
  })

  it('没有 candidates 数组时报错', () => {
    const r = reviewPacket.parse('{"actions": []}', ctx)
    expect(r.error).toContain('candidates')
  })

  it('prompt 包含原文、标签表与"不许给分"红线', () => {
    const p = reviewPacket.buildPrompt(ctx)
    expect(p).toContain('People has different views')
    expect(p).toContain('agreement')
    expect(p).toContain('不许给分数')
  })
})

describe('批改包 apply（真实 IndexedDB 行为）', () => {
  it('标签并入最近一次事件，行动项追加备注', async () => {
    const ev: LearningEvent = {
      id: 'ev-1', ts: Date.now(), language: 'en', skill: 'writing', exerciseType: 'writing-task',
      contentId: 'en-w-001', secondsSpent: 600, hintsUsed: 0, errorTags: ['spelling'], contentVersion: 1,
    }
    await addEvent(ev)
    const parsed = reviewPacket.parse(good, ctx)
    const note = await reviewPacket.apply(parsed.value!, ctx)
    const all = await getAllEvents()
    expect(all[0].errorTags).toContain('agreement')
    expect(all[0].errorTags).toContain('spelling') // 并集，不覆盖
    expect(all[0].note).toContain('主谓一致')
    expect(note).toContain('写作')
  })
})
