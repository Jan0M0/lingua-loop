// 批改包：把作文/口语转录交给用户自己的 AI 批改，结果进统一错误标签体系。
// 护栏：不给分、不给等级预测（DECISIONS §14）；标签只能从 ERROR_TAGS 里选；evidence 必须引用原文。
import { ERROR_TAGS, type ErrorTag, type Language } from '../../types/content'
import { isErrorTag, mergeTags } from '../feedback-parser'
import { applyConfirmedFeedback } from '../../storage/feedback-tags'
import { setMeta } from '../../storage/db'
import { envelopeExample, unwrapEnvelope } from './parse'
import type { PacketDef } from './types'

export const REVIEW_PROMPT_VERSION = 1

export interface ReviewCtx {
  language: Language
  skill: 'writing' | 'speaking'
  /** 要写入的学习事件对应的练习 ID */
  exerciseId: string
  taskTitle: string
  /** 任务指令（写作题干/口语话题） */
  taskPrompt?: string
  /** 学生的作文或口语转录 */
  sourceText: string
  /** 自评维度（供 agent 参考，不强制逐条回应） */
  checklist?: string[]
  /** 已确认过的标签：提示 agent 别重复报 */
  alreadyTags?: ErrorTag[]
}

export interface ReviewResult {
  candidates: { tag: ErrorTag; evidence: string }[]
  actions: string[]
  summaryZh?: string
}

const MAX_CANDIDATES = 10
const MAX_ACTIONS = 6

function buildPrompt(ctx: ReviewCtx): string {
  const lang = ctx.language === 'en' ? '英语' : '西班牙语'
  const skillZh = ctx.skill === 'writing' ? '写作' : '口语'
  const lines: string[] = []
  lines.push(`你是语言学习教练。请批改下面这篇${lang}${skillZh}练习。`)
  lines.push('')
  lines.push(`【任务】${ctx.taskTitle}`)
  if (ctx.taskPrompt) lines.push(`【题目】${ctx.taskPrompt}`)
  if (ctx.checklist?.length) lines.push(`【学生自评过的维度】${ctx.checklist.join('、')}`)
  lines.push(`【学生${ctx.skill === 'writing' ? '作文' : '口语转录'}】`)
  lines.push('"""')
  lines.push(ctx.sourceText)
  lines.push('"""')
  lines.push('')
  lines.push('要求：')
  lines.push('1. 找出语言问题（语法、用词、搭配、结构、连贯、发音转写可见的口误等），每条给出：')
  lines.push('   - tag：从下方标签表里选一个最贴切的（只能从表里选）')
  lines.push('   - evidence：引用学生原文中的原句片段，必须逐字来自原文，不许改写或编造')
  lines.push(`2. actions：最多 ${MAX_ACTIONS} 条具体可执行的改进动作（中文，一句话一条，针对发现的问题）`)
  lines.push('3. summaryZh：一两句总体评价（中文，说具体优缺点，不说空话）')
  lines.push('4. 【硬性禁止】不许给分数、等级、Band、CEFR 预测或任何"相当于 X 分"的说法。这条是产品定位红线。')
  lines.push(`5. 最多 ${MAX_CANDIDATES} 条 candidates，挑最重要的。`)
  if (ctx.alreadyTags?.length) {
    lines.push(`6. 以下标签此前已确认过，除非有新证据否则别重复报：${ctx.alreadyTags.join('、')}`)
  }
  lines.push('')
  lines.push('只输出 JSON（可包在 markdown 代码块里），信封格式：')
  lines.push(envelopeExample('review', [
    '{',
    `  "candidates": [{ "tag": "tense", "evidence": "原文片段" }],`,
    `  "actions": ["改进动作 1", "改进动作 2"],`,
    `  "summaryZh": "总评一两句"`,
    '}',
  ].join('\n')))
  lines.push('')
  lines.push(`标签表（只能从中选择）：${ERROR_TAGS.join(' ')}`)
  return lines.join('\n')
}

function parse(raw: string, ctx: ReviewCtx) {
  const res = unwrapEnvelope<unknown>(raw, 'review')
  if ('error' in res) return { warnings: [], error: res.error }
  const warnings = [...res.warnings]
  const data = res.payload as { candidates?: unknown; actions?: unknown; summaryZh?: unknown }
  if (data == null || typeof data !== 'object' || !Array.isArray(data.candidates)) {
    return { warnings, error: '返回的 JSON 里没有 candidates 数组。' }
  }
  // 逐字引用校验：evidence 必须能在原文中找到（空白差异容忍），防 agent 改写/编造引用
  const norm = (x: string) => x.replace(/\s+/g, ' ').trim()
  const sourceNorm = norm(ctx.sourceText)
  const candidates: { tag: ErrorTag; evidence: string }[] = []
  const seen = new Set<string>()
  for (const c of data.candidates) {
    if (c == null || typeof c !== 'object') { warnings.push('跳过一条非对象 candidate。'); continue }
    const { tag, evidence } = c as { tag?: unknown; evidence?: unknown }
    if (typeof tag !== 'string' || !isErrorTag(tag)) {
      warnings.push(`忽略标签「${String(tag)}」：不在统一标签表里。`)
      continue
    }
    if (typeof evidence !== 'string' || evidence.trim().length < 2) {
      warnings.push(`忽略标签 ${tag}：没有引用原文证据（evidence）。`)
      continue
    }
    if (sourceNorm.length > 0 && !sourceNorm.includes(norm(evidence))) {
      warnings.push(`拒收标签 ${tag}：evidence「${evidence.trim().slice(0, 30)}」未在原文中找到（agent 可能改写或编造了引用）。`)
      continue
    }
    if (seen.has(tag)) continue
    seen.add(tag)
    candidates.push({ tag, evidence: evidence.trim() })
    if (candidates.length >= MAX_CANDIDATES) { warnings.push(`candidates 超过 ${MAX_CANDIDATES} 条，已截断。`); break }
  }
  const actions = Array.isArray(data.actions)
    ? data.actions.filter((a): a is string => typeof a === 'string' && a.trim().length > 3).map((a) => a.trim()).slice(0, MAX_ACTIONS)
    : []
  const summaryZh = typeof data.summaryZh === 'string' ? data.summaryZh.trim() : undefined
  if (candidates.length === 0 && actions.length === 0) {
    return { warnings, error: '没有可用的批改结果（candidates 与 actions 都为空）。' }
  }
  return { value: { candidates, actions, summaryZh }, warnings }
}

function preview(value: ReviewResult, ctx: ReviewCtx): string {
  const skillZh = ctx.skill === 'writing' ? '写作' : '口语'
  const tags = value.candidates.map((c) => c.tag)
  return [
    `将写入「${ctx.taskTitle}」最近一次${skillZh}练习记录：`,
    `· 错误标签 ${tags.length} 个：${mergeTags([], tags).join('、')}`,
    `· 行动项 ${value.actions.length} 条（追加到记录备注，不覆盖已有备注）`,
    value.summaryZh ? `· 总评（仅存档展示）：${value.summaryZh}` : '',
    '标签做并集去重，不会覆盖已有标签；写入前你可以反悔。',
  ].filter(Boolean).join('\n')
}

async function apply(value: ReviewResult, ctx: ReviewCtx): Promise<string> {
  const tags = value.candidates.map((c) => c.tag)
  const outcome = await applyConfirmedFeedback(ctx.exerciseId, tags, value.actions, {
    recordLabel: ctx.skill === 'writing' ? '写作' : '口语',
  })
  await setMeta('lastReviewAt', { exerciseId: ctx.exerciseId, ts: Date.now() }).catch(() => undefined)
  return outcome.note
}

export const reviewPacket: PacketDef<ReviewCtx, ReviewResult> = {
  kind: 'review',
  label: 'AI 批改（写作/口语）',
  promptVersion: REVIEW_PROMPT_VERSION,
  buildPrompt,
  parse,
  preview,
  apply,
  egressFields: (ctx) =>
    [
      ctx.taskPrompt ? 'task.prompt' : null,
      ctx.skill === 'writing' ? 'essay.text' : 'speaking.transcript',
      'errorTags.vocabulary',
    ].filter((x): x is string => x != null),
}
