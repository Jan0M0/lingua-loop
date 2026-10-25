// 内容生成包：内容不够时，从用户自己的 agent 拿到合规新题并入库。
// 这是把"内容用尽会明确提示"升级为"用尽→一键补题"的能力（最高杠杆）。
// 首批只做三种题型：词卡 / 单选阅读 / 单选听力（覆盖日常量 80%）。
// 护栏：全部原创（禁复制真题/商业题库）；逐条过 validateRawContent；source 固定 user-imported；
// license 标记 agent-generated，内容库单独可筛——分得清"我审过的"和"agent 出的"。
import { localDateKey } from '../dates'
import { validateRawContent } from '../../content/validate'
import { putCustomContent } from '../../storage/db'
import type { Difficulty, ErrorTag, Exercise, Language } from '../../types/content'
import { envelopeExample, unwrapEnvelope } from './parse'
import type { PacketDef } from './types'

export const CONTENT_PROMPT_VERSION = 1

export type ContentType = 'vocab-card' | 'reading-mc' | 'listening'

export interface ContentCtx {
  language: Language
  type: ContentType
  difficulty: Difficulty
  /** 一次 1–10 条 */
  count: number
  topic?: string
  /** 针对薄弱点出题（题目的 errorTags 往这些标签上靠） */
  focusTags?: ErrorTag[]
  /** 已存在的同类 id，防撞号 */
  avoidIds: string[]
}

export interface ContentResult {
  items: Exercise[]
  rejected: { id: string; reason: string }[]
}

const MAX_COUNT = 10

const DIFFICULTY_ANCHORS: Record<Language, string> = {
  en: '难度锚点：1=入门 2≈Band 5–6 3≈Band 6–7 4≈Band 7–8 5≈Band 8+',
  es: '难度锚点：1≈A1 2≈A2 3≈B1 4≈B2 5≈C1',
}

function idPrefix(ctx: ContentCtx): string {
  const lang = ctx.language === 'en' ? 'en' : 'es'
  return ctx.type === 'vocab-card' ? `${lang}-voc-` : ctx.type === 'reading-mc' ? `${lang}-read-` : `${lang}-ls-`
}

function typeExample(ctx: ContentCtx): string {
  const today = localDateKey()
  const p = idPrefix(ctx)
  if (ctx.type === 'vocab-card') {
    return JSON.stringify(
      {
        id: `${p}301`, language: ctx.language, skill: 'vocab', type: 'vocab-card',
        topic: 'daily-life', difficulty: ctx.difficulty, estimatedMinutes: 1,
        tags: ['daily-life'], createdAt: today, contentVersion: 1, source: 'user-imported',
        term: '示例词条', pos: 'n.', glossZh: '中文释义', definition: 'A short natural definition in the target language.',
        collocations: ['collocation one', 'collocation two'],
        examples: [{ sentence: 'Example sentence in target language.', zh: '中文翻译' }, { sentence: 'Another example.', zh: '另一句中文' }],
        commonError: '易混点（可选，中文）',
      },
      null, 2,
    )
  }
  if (ctx.type === 'reading-mc') {
    return JSON.stringify(
      {
        id: `${p}101`, language: ctx.language, skill: 'reading', type: 'reading-mc',
        title: 'Title in target language', titleZh: '中文标题',
        topic: 'society', difficulty: ctx.difficulty, estimatedMinutes: 6,
        tags: ['society'], createdAt: today, contentVersion: 1, source: 'user-imported',
        passage: '……至少 60 词的完整短文，段落间空行……',
        questions: [
          {
            id: `${p}101-q1`, stem: 'Question stem?', options: ['A', 'B', 'C', 'D'], answerIndex: 2,
            explanation: '正确答案是 C，因为原文第 2 段说"……"（引用原文证据）；A 错在……；B 错在……',
            errorTags: ['detail'], questionType: 'detail',
          },
        ],
      },
      null, 2,
    )
  }
  return JSON.stringify(
    {
      id: `${p}101`, language: ctx.language, skill: 'listening', type: 'listening',
      title: 'Title in target language', titleZh: '中文标题',
      topic: 'travel', difficulty: ctx.difficulty, estimatedMinutes: 5,
      tags: ['travel'], createdAt: today, contentVersion: 1, source: 'user-imported',
      setting: '场景中文说明（谁在哪里说什么）',
      script: [
        { speaker: 'A', line: '……' }, { speaker: 'B', line: '……' },
        { speaker: 'A', line: '……' }, { speaker: 'B', line: '……' },
      ],
      transcriptMode: 'after',
      questions: [
        {
          id: `${p}101-q1`, stem: 'Question stem?', options: ['A', 'B', 'C'], answerIndex: 0,
          explanation: '正确答案是 A，因为脚本里 A 说了"……"（引用原句）；B 错在……',
          errorTags: ['listening-detail'], questionType: 'listening-detail',
        },
      ],
    },
    null, 2,
  )
}

function buildPrompt(ctx: ContentCtx): string {
  const lang = ctx.language === 'en' ? '英语' : '西班牙语'
  const typeZh = ctx.type === 'vocab-card' ? '词汇卡' : ctx.type === 'reading-mc' ? '单选阅读' : '单选听力'
  const prefix = idPrefix(ctx)
  const lines: string[] = []
  lines.push(`请为语言学习应用原创出题：${lang} · ${typeZh} · 难度 ${ctx.difficulty}/5 · 共 ${Math.min(ctx.count, MAX_COUNT)} 条。`)
  lines.push('')
  lines.push('【硬性要求（每条都会被程序校验，不合规会被拒收）】')
  lines.push(`1. 原创内容：不得复制或改写任何真实考试题目、商业题库、教材原文。人物/数据/情节自拟。`)
  lines.push(`2. id 命名：前缀必须是 ${prefix}，后接 3 位数字（如 ${prefix}401），且不得与下方"已存在 id"重复。`)
  lines.push('3. 每道题的 id 必须是 `${所属内容id}-q1`、`-q2`……按顺序 1 开始编号。')
  lines.push('4. options 3–5 个且互不重复；answerIndex 是正确选项的下标（从 0 开始）。')
  lines.push('5. explanation 至少 20 字：必须引用原文/脚本里的原句作为证据，并说明干扰项为什么错。不许只写"因为 A 对"。')
  lines.push('6. 题目的 errorTags 从标签表选 1–2 个；tags 是 1–5 个 kebab-case 主题标签；topic 是一个 kebab-case 词。')
  lines.push(`7. ${DIFFICULTY_ANCHORS[ctx.language]}。按目标难度 ${ctx.difficulty} 出题，词汇量和句式复杂度要匹配。`)
  if (ctx.type === 'vocab-card') lines.push('8. 词卡：collocations 2–4 个、examples 2–3 条（目标语句子 + 中文翻译）；选值得学的高频词，别选生僻词。')
  if (ctx.type === 'reading-mc') lines.push('8. 阅读：passage 至少 60 词（目标语），题目 3–6 道，覆盖主旨/细节/推断等不同 questionType。')
  if (ctx.type === 'listening') lines.push('8. 听力：script 至少 4 行对话（speaker + line），语言要口语自然（脚本会被系统语音朗读），题目至少 2 道；transcriptMode 固定 "after"。')
  if (ctx.focusTags?.length) {
    lines.push(`9. 【薄弱点定向】这位学习者最近的错误集中在：${ctx.focusTags.join('、')}。题目/选项设计尽量往这些点上考。`)
  }
  if (ctx.topic) lines.push(`10. 主题限定：${ctx.topic}（topic 字段用它对应的 kebab-case）。`)
  lines.push('')
  lines.push(`【${typeZh}的完整字段示例（照这个形状生成，全部必填字段都在）】`)
  lines.push(typeExample(ctx))
  lines.push('')
  if (ctx.avoidIds.length) {
    // 不贴全量 id 清单（上百条会稀释指令）：按前缀给"已存在最大编号 + 起始号"，更不易撞号
    const maxNum = new Map<string, number>()
    for (const id of ctx.avoidIds) {
      const m = /^(.*?)(\d+)$/.exec(id)
      if (!m) continue
      maxNum.set(m[1], Math.max(maxNum.get(m[1]) ?? 0, Number(m[2])))
    }
    const parts = [...maxNum.entries()].map(([p, n]) => `${p}已有编号到 ${n}，新内容编号从 ${n + 1} 开始`)
    lines.push(`【id 编号（防撞号）】${parts.join('；')}。不复用旧号，也不出同题干换皮的题。`)
    lines.push('')
  }
  lines.push('标签表（题目的 errorTags 只能从中选）：spelling register fluency coherence vocabulary structure main-idea detail inference writer-attitude paraphrase synonym tense agreement word-form article preposition pronoun connector punctuation relative-clause conditional collocation word-choice meaning ser-estar gender-number conjugation subjunctive accent pronunciation self-correction range')
  lines.push('')
  lines.push('只输出 JSON（可包在 markdown 代码块里），信封格式：')
  lines.push(envelopeExample('content', '{ "items": [ { …一条完整内容… }, … ] }'))
  return lines.join('\n')
}

function parse(raw: string, ctx: ContentCtx) {
  const res = unwrapEnvelope<unknown>(raw, 'content')
  if ('error' in res) return { warnings: [], error: res.error }
  const warnings = [...res.warnings]
  const payload = res.payload as { items?: unknown }
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : null
  if (!items) return { warnings, error: '返回的 JSON 里没有 items 数组。' }
  if (items.length > MAX_COUNT) warnings.push(`超过 ${MAX_COUNT} 条，只取前 ${MAX_COUNT} 条。`)

  const { ok, issues } = validateRawContent(items.slice(0, MAX_COUNT))
  const rejected: { id: string; reason: string }[] = []
  const byId = new Map<string, string[]>()
  for (const i of issues) {
    if (i.level !== 'error') continue
    const list = byId.get(i.id) ?? []
    list.push(`${i.field ? i.field + ': ' : ''}${i.message}`)
    byId.set(i.id, list)
  }
  for (const [id, reasons] of byId) rejected.push({ id, reason: reasons.join('；') })

  // 批内 id 去重 + avoidIds 去重
  const avoid = new Set(ctx.avoidIds)
  const seen = new Set<string>()
  const final: Exercise[] = []
  let deduped = 0
  for (const item of ok) {
    if (seen.has(item.id) || avoid.has(item.id)) { deduped += 1; continue }
    seen.add(item.id)
    final.push(item)
  }
  if (final.length === 0) {
    if (ok.length > 0) {
      return { warnings, error: `全部 ${ok.length} 条都与已存在的 id 重复（avoidIds），没有新内容可导入。` }
    }
    return {
      warnings,
      error: `全部 ${items.length} 条都没通过校验。拒收原因（前 5 条）：${rejected.slice(0, 5).map((r) => `${r.id} — ${r.reason}`).join(' ｜ ')}`,
    }
  }
  if (rejected.length) warnings.push(`${rejected.length} 条未通过校验被拒收（预览里有明细）。`)
  if (deduped > 0) warnings.push(`${deduped} 条与已存在 id 重复，已去重。`)
  return { value: { items: final, rejected }, warnings }
}

function preview(value: ContentResult, ctx: ContentCtx): string {
  const typeZh = ctx.type === 'vocab-card' ? '词卡' : ctx.type === 'reading-mc' ? '阅读' : '听力'
  const lines = [`将通过校验的 ${value.items.length} 条${typeZh}写入内容库（source=user-imported，标记「AI 生成」，可在内容库筛选）：`]
  for (const it of value.items.slice(0, 10)) {
    const title = 'title' in it ? (it as { title: string }).title : (it as { term: string }).term
    const qn = 'questions' in it && Array.isArray((it as { questions?: unknown[] }).questions) ? ` · ${((it as { questions: unknown[] }).questions).length} 题` : ''
    lines.push(`· ${it.id}「${title}」难度${it.difficulty}${qn}`)
  }
  if (value.rejected.length) {
    lines.push('')
    lines.push(`拒收 ${value.rejected.length} 条（不写入）：`)
    for (const r of value.rejected.slice(0, 5)) lines.push(`· ${r.id} — ${r.reason}`)
  }
  lines.push('')
  lines.push('已存在的 id 会自动跳过，不覆盖。')
  return lines.join('\n')
}

async function apply(value: ContentResult): Promise<string> {
  const today = localDateKey()
  const stamped = value.items.map((it) => ({
    ...it,
    source: 'user-imported' as const,
    license: `agent-generated · promptVersion ${CONTENT_PROMPT_VERSION} · ${today} 经你审核导入`,
  }))
  const res = await putCustomContent(stamped, 'skip')
  const rejectedNote = value.rejected.length ? `；另有 ${value.rejected.length} 条未通过校验被拒收` : ''
  return `入库 ${res.written} 条，跳过已存在 ${res.skipped} 条${rejectedNote}。新内容会进入排题池，可在内容库筛「AI 生成」查看。`
}

export const contentPacket: PacketDef<ContentCtx, ContentResult> = {
  kind: 'content',
  label: 'AI 出题（补内容库）',
  promptVersion: CONTENT_PROMPT_VERSION,
  buildPrompt,
  parse,
  preview,
  apply,
  egressFields: (ctx) => [
    `content.spec(${ctx.language}/${ctx.type}/d${ctx.difficulty})`,
    ...(ctx.focusTags?.length ? ['errorTags.weakness'] : []),
    ...(ctx.avoidIds.length ? ['content.idList'] : []),
  ],
}
