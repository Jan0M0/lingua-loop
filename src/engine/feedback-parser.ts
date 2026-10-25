// 外部反馈解析（纯规则、确定性、可测试）：把老师/其他工具写的批改文字拆成「候选错误标签 + 行动项」。
// 这里不做任何语义猜测之外的推断：只按关键词命中，命中证据原文回显，最终由用户勾选确认后才写入数据。
import { ERROR_TAGS, type ErrorTag } from '../types/content'

export interface TagRule {
  tag: ErrorTag
  /** 中文/英文/西语关键词；拉丁关键词按整词匹配，中文按子串匹配 */
  keywords: string[]
}

/**
 * 规则表：关键词 → ERROR_TAGS 词表内的标签。
 * 只允许映射到词表里已有的标签，保证写入的数据与内容校验、统计口径一致。
 */
export const TAG_RULES: TagRule[] = [
  { tag: 'spelling', keywords: ['拼写', '拼错', 'spelling', 'misspelled', 'ortografía', 'falta de ortografía'] },
  { tag: 'register', keywords: ['语域', '语气不统一', '正式', '非正式', 'register', 'formal', 'informal', 'registro'] },
  { tag: 'fluency', keywords: ['流利', '卡顿', 'fluency', 'fluidez'] },
  { tag: 'coherence', keywords: ['连贯', '衔接', '逻辑不清', '逻辑跳跃', 'coherence', 'cohesion', 'coherencia', 'cohesión'] },
  { tag: 'vocabulary', keywords: ['词汇单一', '词汇量', '用词重复', '词汇资源', 'vocabulary', 'lexical resource', 'vocabulario', 'léxico'] },
  { tag: 'structure', keywords: ['结构', '段落安排', '论证', 'structure', 'paragraphing', 'estructura', 'argumentación'] },
  { tag: 'main-idea', keywords: ['主旨', '中心思想', 'main idea', 'main point', 'idea principal'] },
  { tag: 'detail', keywords: ['细节', 'detail', 'detalle'] },
  { tag: 'inference', keywords: ['推断', '推理', 'inference', 'inferencia'] },
  { tag: 'writer-attitude', keywords: ['作者态度', '态度', 'attitude', 'actitud'] },
  { tag: 'paraphrase', keywords: ['同义改写', '改写', 'paraphrase', 'parafraseo'] },
  { tag: 'paragraph-matching', keywords: ['段落匹配', 'matching', 'emparejamiento'] },
  { tag: 'synonym', keywords: ['近义词', '同义词', 'synonym', 'sinónimo'] },
  { tag: 'tense', keywords: ['时态', '时态混用', 'tense', 'tiempo verbal', 'tiempos verbales'] },
  { tag: 'agreement', keywords: ['主谓一致', 'subject-verb agreement', 'agreement', 'concordancia sujeto-verbo'] },
  { tag: 'word-form', keywords: ['词形', '词性', 'word form', 'forma de la palabra'] },
  { tag: 'article', keywords: ['冠词', 'article', 'artículo', 'artículos'] },
  { tag: 'preposition', keywords: ['介词', 'preposition', 'preposición'] },
  { tag: 'pronoun', keywords: ['代词', 'pronoun', 'pronombre'] },
  { tag: 'connector', keywords: ['连接词', '过渡词', 'connector', 'linker', 'linking word', 'conector'] },
  { tag: 'punctuation', keywords: ['标点', 'punctuation', 'puntuación'] },
  { tag: 'relative-clause', keywords: ['定语从句', 'relative clause', 'oración de relativo'] },
  { tag: 'conditional', keywords: ['条件句', 'conditional', 'condicional'] },
  { tag: 'collocation', keywords: ['搭配', 'collocation', 'colocación'] },
  { tag: 'word-choice', keywords: ['用词不当', '选词', 'word choice', 'elección de palabras'] },
  { tag: 'meaning', keywords: ['词义', '意思不对', 'meaning', 'significado'] },
  { tag: 'ser-estar', keywords: ['ser y estar', 'ser/estar', 'ser o estar', 'ser 和 estar'] },
  { tag: 'gender-number', keywords: ['性数一致', '阴阳性', 'género', 'gender agreement', 'concordancia de género'] },
  { tag: 'conjugation', keywords: ['变位', '动词变形', 'conjugation', 'conjugación'] },
  { tag: 'subjunctive', keywords: ['虚拟式', '虚拟语气', 'subjunctive', 'subjuntivo'] },
  { tag: 'accent', keywords: ['重音符号', '重音', 'accent', 'tilde', 'acento'] },
  { tag: 'pronunciation', keywords: ['发音', 'pronunciation', 'pronunciación'] },
  { tag: 'self-correction', keywords: ['自我纠正', '犹豫', '重复开头', 'self-correction', 'hesitation', 'autocorrección'] },
  { tag: 'range', keywords: ['句式单一', '句型单调', '语法范围', 'range', 'variedad gramatical'] },
]

/** 行动项标记：出现这些词/句式的句子会被当作「下一步该做什么」提取出来 */
const ACTION_MARKER =
  /(建议|应该|下次|试着|注意|避免|别忘了|推荐|最好|务必|可以多|需要多|should|try to|next time|avoid|need to|consider|focus on|recommend|make sure|practice|work on|deberías|intenta|conviene|evita|recomiendo|práctica)/i

export interface FeedbackCandidate {
  tag: ErrorTag
  /** 命中次数（同一关键词多次出现会累加） */
  hits: number
  /** 命中的原句，最多 2 条，用于让用户判断是否真的要采纳 */
  evidence: string[]
}

export interface FeedbackParseResult {
  candidates: FeedbackCandidate[]
  actions: string[]
  sentenceCount: number
  /** 文本为空或没有任何命中 */
  empty: boolean
}

const MAX_CANDIDATES = 8
const MAX_ACTIONS = 5
const MAX_EVIDENCE_PER_TAG = 2
const EVIDENCE_MAX_CHARS = 120

function normalize(s: string): string {
  return s.normalize('NFKC').toLowerCase()
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 中文按子串计数；拉丁文字按整词计数（避免 "range" 命中 "arrange" 之类） */
function countOccurrences(haystack: string, keyword: string): number {
  const kw = normalize(keyword)
  if (!kw) return 0
  if (/[\u4e00-\u9fff]/.test(kw)) {
    let count = 0
    let from = 0
    for (;;) {
      const i = haystack.indexOf(kw, from)
      if (i === -1) break
      count += 1
      from = i + kw.length
    }
    return count
  }
  // 允许常见英文/西语词尾（articles / tenses / tildes / paraphrasing…），避免规则过脆
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(kw)}(?:s|es|ed|ing)?(?![\\p{L}\\p{N}])`, 'giu')
  return (haystack.match(re) ?? []).length
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[。！？!?.;；\n])/)
    .map((s) => s.replace(/^[\s\-•*·]+/, '').trim())
    .filter((s) => s.length > 0)
}

function clip(s: string, max: number): string {
  const flat = s.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

export function isErrorTag(x: string): x is ErrorTag {
  return (ERROR_TAGS as readonly string[]).includes(x)
}

/** 合并标签：保留原顺序，去重，过滤掉词表外的脏数据 */
export function mergeTags(existing: readonly string[], added: readonly string[]): ErrorTag[] {
  const out: ErrorTag[] = []
  for (const t of [...existing, ...added]) {
    if (!isErrorTag(t)) continue
    if (!out.includes(t)) out.push(t)
  }
  return out
}

/**
 * 解析外部反馈文本。
 * 纯函数，无副作用、无网络；同一输入永远得到同一输出（便于测试与「外部反馈不自动覆盖数据」的约束）。
 */
export function parseFeedback(text: string, _language?: 'en' | 'es'): FeedbackParseResult {
  const raw = (text ?? '').trim()
  const sentences = splitSentences(raw)
  if (sentences.length === 0) {
    return { candidates: [], actions: [], sentenceCount: 0, empty: true }
  }

  const candidateMap = new Map<ErrorTag, FeedbackCandidate>()
  for (const rule of TAG_RULES) {
    for (const sentence of sentences) {
      const hay = normalize(sentence)
      let hits = 0
      for (const kw of rule.keywords) hits += countOccurrences(hay, kw)
      if (hits === 0) continue
      const prev = candidateMap.get(rule.tag)
      if (prev) {
        prev.hits += hits
        if (prev.evidence.length < MAX_EVIDENCE_PER_TAG && !prev.evidence.includes(clip(sentence, EVIDENCE_MAX_CHARS))) {
          prev.evidence.push(clip(sentence, EVIDENCE_MAX_CHARS))
        }
      } else {
        candidateMap.set(rule.tag, { tag: rule.tag, hits, evidence: [clip(sentence, EVIDENCE_MAX_CHARS)] })
      }
    }
  }

  const candidates = [...candidateMap.values()]
    .sort((a, b) => b.hits - a.hits || ERROR_TAGS.indexOf(a.tag) - ERROR_TAGS.indexOf(b.tag))
    .slice(0, MAX_CANDIDATES)

  const actions: string[] = []
  for (const sentence of sentences) {
    if (actions.length >= MAX_ACTIONS) break
    const flat = sentence.replace(/^[\s\-•*·]+/, '').trim()
    if (flat.length < 4) continue
    if (!ACTION_MARKER.test(flat)) continue
    const item = clip(flat, 160)
    if (!actions.includes(item)) actions.push(item)
  }

  return {
    candidates,
    actions,
    sentenceCount: sentences.length,
    empty: candidates.length === 0 && actions.length === 0,
  }
}
