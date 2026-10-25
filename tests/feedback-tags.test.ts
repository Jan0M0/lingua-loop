import { beforeEach, describe, expect, it } from 'vitest'
import 'fake-indexeddb/auto'
import { applyConfirmedFeedback } from '../src/storage/feedback-tags'
import { addEvent, getAllDrafts, getAllEvents, saveDraft } from '../src/storage/db'
import type { LearningEvent, WritingDraft } from '../src/types/app'

function ev(id: string, contentId: string, ts: number, extra: Partial<LearningEvent> = {}): LearningEvent {
  return {
    id, ts, language: 'en', skill: 'writing', exerciseType: 'writing-task', contentId,
    score: 0.6, secondsSpent: 900, hintsUsed: 0, errorTags: [], contentVersion: 1, ...extra,
  }
}

function draft(id: string, exerciseId: string): WritingDraft {
  return {
    id, exerciseId, language: 'en', text: 'Draft body …', createdAt: 1000, updatedAt: 1000,
    history: [], externalFeedback: 'Tense errors and spelling mistakes. Next time check articles.',
  }
}

const EX = 'en-writ-test-001'
const EX_NO_EVENT = 'en-writ-test-002'

describe('applyConfirmedFeedback · 外部反馈确认写入', () => {
  beforeEach(async () => {
    await addEvent(ev('evt-old', EX, 1000))
    await addEvent(ev('evt-new', EX, 5000, { note: '旧备注：结尾没收住' }))
    await saveDraft(draft('draft-1', EX))
    await saveDraft(draft('draft-2', EX_NO_EVENT))
  })

  it('标签写入最近一次事件，历史事件不变', async () => {
    const out = await applyConfirmedFeedback(EX, ['tense', 'article'], ['Next time check articles.'], 9000)
    expect(out.event?.id).toBe('evt-new')
    expect(out.event?.errorTags).toEqual(['tense', 'article'])

    const events = await getAllEvents()
    expect(events.find((e) => e.id === 'evt-old')!.errorTags).toEqual([])
    expect(events.find((e) => e.id === 'evt-new')!.errorTags).toEqual(['tense', 'article'])
  })

  it('保留用户原有备注，并把行动项追加进去', async () => {
    const out = await applyConfirmedFeedback(EX, ['tense'], ['下一步：每段检查一次时态'], 9000)
    expect(out.event?.note).toContain('旧备注：结尾没收住')
    expect(out.event?.note).toContain('外部反馈行动项')
    expect(out.event?.note).toContain('下一步：每段检查一次时态')
  })

  it('草稿记录已确认标签与行动项', async () => {
    await applyConfirmedFeedback(EX, ['tense', 'spelling'], ['Next time check articles.'], 9000)
    const d = (await getAllDrafts()).find((x) => x.exerciseId === EX)!
    expect(d.confirmedTags).toEqual(['tense', 'spelling'])
    expect(d.actionItems).toEqual(['Next time check articles.'])
    expect(d.updatedAt).toBe(9000)
  })

  it('重复确认不产生重复标签/行动项', async () => {
    await applyConfirmedFeedback(EX, ['tense'], ['A'], 9000)
    const out = await applyConfirmedFeedback(EX, ['tense', 'spelling'], ['A'], 9100)
    expect(out.event?.errorTags).toEqual(['tense', 'spelling'])
    const d = (await getAllDrafts()).find((x) => x.exerciseId === EX)!
    expect(d.actionItems).toEqual(['A'])
    expect(d.confirmedTags).toEqual(['tense', 'spelling'])
  })

  it('词表外的标签被过滤，不污染统计', async () => {
    const out = await applyConfirmedFeedback(EX, ['tense', 'not-a-real-tag'], [], 9000)
    expect(out.tags).toEqual(['tense'])
    expect(out.event?.errorTags).toEqual(['tense'])
  })

  it('空输入不写任何数据', async () => {
    const out = await applyConfirmedFeedback(EX, [], [], 9000)
    expect(out.event).toBeNull()
    expect(out.draft).toBeNull()
    expect(out.note).toContain('未写入')
    const events = await getAllEvents()
    expect(events.find((e) => e.id === 'evt-new')!.note).toBe('旧备注：结尾没收住')
  })

  it('没有对应事件时只写草稿，并如实说明', async () => {
    const out = await applyConfirmedFeedback(EX_NO_EVENT, ['spelling'], [], 9000)
    expect(out.event).toBeNull()
    expect(out.draft?.exerciseId).toBe(EX_NO_EVENT)
    expect(out.note).toContain('草稿')
    const d = (await getAllDrafts()).find((x) => x.exerciseId === EX_NO_EVENT)!
    expect(d.confirmedTags).toEqual(['spelling'])
  })
})
