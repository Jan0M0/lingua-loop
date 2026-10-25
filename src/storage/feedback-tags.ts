// 外部反馈 → 学习数据的写入层：用户确认的标签与行动项落到「最近一次写作事件 + 草稿」。
// 独立成模块的原因：这段逻辑需要真实 IndexedDB 行为（多 store 一致性），放在 React Context 里无法单测。
import type { LearningEvent, WritingDraft } from '../types/app'
import type { ErrorTag } from '../types/content'
import { mergeTags } from '../engine/feedback-parser'
import { getAllDrafts, getAllEvents, putEvent, saveDraft } from './db'

export interface ApplyFeedbackOutcome {
  /** 被更新的最近一次写作事件（没有则 null） */
  event: LearningEvent | null
  /** 被更新的草稿（没有则 null） */
  draft: WritingDraft | null
  tags: ErrorTag[]
  actions: string[]
  note: string
}

/**
 * 把用户勾选确认的外部反馈写入本地数据。
 * 规则：
 * - 只写「该 exerciseId 最近一次事件」，不批量改历史；
 * - 标签做并集去重，绝不覆盖已有标签；
 * - 行动项追加到事件备注，保留用户原有备注；
 * - 草稿上留下 confirmedTags / actionItems，便于回看。
 */
export async function applyConfirmedFeedback(
  exerciseId: string,
  tags: readonly string[],
  actions: readonly string[] = [],
  opts: { now?: number; recordLabel?: string } = {},
): Promise<ApplyFeedbackOutcome> {
  const now = opts.now ?? Date.now()
  const recordLabel = opts.recordLabel ?? '写作'
  const cleanTags = mergeTags([], tags)
  const cleanActions = actions.map((a) => a.trim()).filter(Boolean).slice(0, 5)
  if (cleanTags.length === 0 && cleanActions.length === 0) {
    return { event: null, draft: null, tags: [], actions: [], note: '没有勾选标签或行动项，未写入任何数据。' }
  }

  const [events, drafts] = await Promise.all([getAllEvents(), getAllDrafts()])

  let updatedDraft: WritingDraft | null = null
  const draft = drafts.find((d) => d.exerciseId === exerciseId)
  if (draft) {
    updatedDraft = {
      ...draft,
      confirmedTags: mergeTags(draft.confirmedTags ?? [], cleanTags),
      actionItems: [...new Set([...(draft.actionItems ?? []), ...cleanActions])].slice(-10),
      updatedAt: now,
    }
    await saveDraft(updatedDraft)
  }

  const target = events.filter((e) => e.contentId === exerciseId).sort((a, b) => b.ts - a.ts)[0]
  const summary = `${cleanTags.length} 个标签${cleanActions.length ? ` + ${cleanActions.length} 条行动项` : ''}`
  if (!target) {
    return {
      event: null,
      draft: updatedDraft,
      tags: cleanTags,
      actions: cleanActions,
      note: `已记在草稿上（${summary}）。这篇作文还没有学习事件，下次完成后会一并生效。`,
    }
  }

  const prevNote = target.note?.trim() ?? ''
  const actionBlock = cleanActions.length ? `外部反馈行动项：${cleanActions.join('；')}` : ''
  const merged: LearningEvent = {
    ...target,
    errorTags: mergeTags(target.errorTags, cleanTags),
    note: [prevNote, actionBlock].filter(Boolean).join('\n') || undefined,
  }
  await putEvent(merged)

  return {
    event: merged,
    draft: updatedDraft,
    tags: cleanTags,
    actions: cleanActions,
    note: `已写入${summary}到最近一次${recordLabel}记录（${new Date(target.ts).toLocaleDateString()}）。`,
  }
}
