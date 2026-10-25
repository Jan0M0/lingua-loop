// 诊断包：把本地学习状态压缩成「只有数字和聚合」的 digest，交给用户自己的 agent 做诊断。
// 防幻觉核心机制：agent 的每条结论必须引用 digest 里真实存在的字段路径（evidenceRefs），
// 解析器逐条解析，解析不到的结论直接拒收——把"我觉得你听力不行"变成"listening acc 0.58、n=21"。
// 护栏：digest 不含任何作文/录音/答案原文；不给 Band/CEFR 预测（DECISIONS §14）。
import { computeMastery } from '../mastery'
import { getMeta, setMeta } from '../../storage/db'
import type { Adjustment, DailyPlan, LearningEvent, Settings, SkillState } from '../../types/app'
import type { ErrorTag, Exercise, Language, Skill } from '../../types/content'
import { isErrorTag } from '../feedback-parser'
import { envelopeExample, unwrapEnvelope } from './parse'
import type { PacketDef } from './types'

export const DIAGNOSIS_PROMPT_VERSION = 1
export const DIAGNOSIS_WINDOW_DAYS = 28
export const DIAGNOSES_KEEP = 12

const SKILLS: Skill[] = ['reading', 'listening', 'writing', 'speaking', 'vocab', 'grammar']
const LANGS: Language[] = ['en', 'es']

export interface Digest {
  window: { days: number; sessions: number; minutes: number }
  skills: Record<Language, Partial<Record<Skill, { mastery: number; n: number; acc: number | null }>>>
  errorTags: { tag: ErrorTag; lang: Language; skill: Skill; count: number; acc: number | null }[]
  adherence: { scheduled: number; completed: number; skipped: number }
  recentAdjustments: string[]
  contentExhausted: string[]
}

export interface DigestInput {
  settings: Settings
  events: LearningEvent[]
  skillStates: SkillState[]
  adjustments: Adjustment[]
  allExercises: Exercise[]
  plans: DailyPlan[]
  now: number
}

export function buildStateDigest(input: DigestInput): Digest {
  const { events, skillStates, adjustments, allExercises, plans, now } = input
  const from = now - DIAGNOSIS_WINDOW_DAYS * 86400000
  const inWindow = events.filter((e) => e.ts >= from)

  const skills: Digest['skills'] = { en: {}, es: {} }
  for (const lang of LANGS) {
    for (const skill of SKILLS) {
      const ss = skillStates.find((x) => x.language === lang && x.skill === skill)
      const mastery = computeMastery(lang, skill, events, ss?.prior ?? 50, now)
      const rel = inWindow.filter((e) => e.language === lang && e.skill === skill)
      const objective = rel.filter((e) => e.correct != null)
      skills[lang][skill] = {
        mastery: mastery.value,
        n: rel.length,
        acc: objective.length >= 3 ? objective.filter((e) => e.correct).length / objective.length : null,
      }
    }
  }

  const tagAgg = new Map<string, { tag: ErrorTag; lang: Language; skill: Skill; count: number; correct: number; n: number }>()
  for (const ev of inWindow) {
    for (const tag of ev.errorTags) {
      const key = `${tag}:${ev.language}:${ev.skill}`
      const cur = tagAgg.get(key) ?? { tag, lang: ev.language, skill: ev.skill, count: 0, correct: 0, n: 0 }
      cur.count += 1
      if (ev.correct != null) { cur.n += 1; if (ev.correct) cur.correct += 1 }
      tagAgg.set(key, cur)
    }
  }
  const errorTags = [...tagAgg.values()]
    .map(({ tag, lang, skill, count, correct, n }) => ({ tag, lang, skill, count, acc: n >= 3 ? correct / n : null }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  const plansInWindow = plans.filter((p) => {
    const ts = new Date(`${p.date}T12:00:00`).getTime()
    return ts >= from && ts <= now
  })
  const adherence = plansInWindow.reduce(
    (acc, p) => {
      for (const t of p.tasks) {
        if (t.kind === 'rest') continue
        acc.scheduled += 1
        if (t.status === 'done') acc.completed += 1
        if (t.status === 'skipped') acc.skipped += 1
      }
      return acc
    },
    { scheduled: 0, completed: 0, skipped: 0 },
  )

  const adjAgg = new Map<string, number>()
  for (const a of adjustments) {
    if (now - a.ts > 14 * 86400000) continue
    const target = (a.payload as { exerciseType?: string; skill?: string } | undefined)?.exerciseType
      ?? (a.payload as { skill?: string } | undefined)?.skill ?? ''
    const key = `${a.kind}${target ? ':' + target : ''}`
    adjAgg.set(key, (adjAgg.get(key) ?? 0) + 1)
  }
  const recentAdjustments = [...adjAgg.entries()].map(([k, n]) => `${k}${n > 1 ? ` x${n}` : ''}`)

  const usedIds = new Set(events.map((e) => e.contentId))
  const contentExhausted: string[] = []
  for (const lang of LANGS) {
    for (const skill of ['reading', 'listening', 'writing', 'speaking', 'vocab', 'grammar'] as Skill[]) {
      const byDiff = new Map<number, { total: number; unused: number }>()
      for (const ex of allExercises) {
        if (ex.language !== lang || ex.skill !== skill) continue
        const b = byDiff.get(ex.difficulty) ?? { total: 0, unused: 0 }
        b.total += 1
        if (!usedIds.has(ex.id)) b.unused += 1
        byDiff.set(ex.difficulty, b)
      }
      for (const [diff, b] of byDiff) {
        if (b.unused < 2) contentExhausted.push(`${lang}/${skill}/difficulty${diff}`)
      }
    }
  }

  return {
    window: { days: DIAGNOSIS_WINDOW_DAYS, sessions: inWindow.length, minutes: Math.round(inWindow.reduce((s, e) => s + e.secondsSpent, 0) / 60) },
    skills,
    errorTags,
    adherence,
    recentAdjustments,
    contentExhausted,
  }
}

/** 按路径解析 digest 字段（evidenceRefs 防幻觉校验的底座）：'errorTags.0.acc' → 值 */
export function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj
  for (const seg of path.split('.')) {
    if (cur == null) return undefined
    if (Array.isArray(cur)) {
      const idx = Number(seg)
      if (!Number.isInteger(idx) || idx < 0 || idx >= cur.length) return undefined
      cur = cur[idx]
    } else if (typeof cur === 'object') {
      cur = (cur as Record<string, unknown>)[seg]
    } else {
      return undefined
    }
  }
  return cur
}

export interface DiagnosisFinding {
  claim: string
  evidenceRefs: string[]
  confidence: 'high' | 'medium' | 'low'
  /** 采信/忽略由用户在进步页操作；默认采信 */
  status: 'accepted' | 'ignored'
}

export interface DiagnosisResult {
  findings: DiagnosisFinding[]
  focus: { skill: Skill; tag?: ErrorTag; weeks: number; reason: string }[]
  actions: string[]
}

export interface DiagnosisRecord extends DiagnosisResult {
  ts: number
  promptVersion: number
  digest: Digest
}

export interface DiagnosisCtx {
  digest: Digest
}

const MAX_FINDINGS = 5
const MAX_FOCUS = 3
const MAX_ACTIONS = 5

function buildPrompt(ctx: DiagnosisCtx): string {
  const lines: string[] = []
  lines.push('你是语言学习数据分析师。下面是一份学习者状态的紧凑摘要（JSON，只有数字和聚合，没有原文）。请做诊断。')
  lines.push('')
  lines.push('【状态摘要 digest】')
  lines.push('```json')
  lines.push(JSON.stringify(ctx.digest, null, 2))
  lines.push('```')
  lines.push('')
  lines.push('要求：')
  lines.push(`1. findings 最多 ${MAX_FINDINGS} 条，每条：`)
  lines.push('   - claim：一句中文结论（说人话，指向具体短板/模式）')
  lines.push('   - evidenceRefs：1–3 个 digest 里的字段路径（如 "skills.en.listening.acc"、"errorTags.0.count"），路径必须真实存在，这是硬校验')
  lines.push('   - confidence：high | medium | low（数据少就给 low，别装确定）')
  lines.push(`2. focus 最多 ${MAX_FOCUS} 条：接下来 1–2 周值得加强的方向 { skill, tag?, weeks(1-2), reason }`)
  lines.push(`3. actions 最多 ${MAX_ACTIONS} 条：具体可执行建议（中文，一句话一条，能落到"练什么、怎么练"）`)
  lines.push('4. 【硬性禁止】不许给 Band/CEFR/分数预测；不许引用 digest 里不存在的数据；数据不足时明说"样本不足"而不是猜。')
  lines.push('5. 只输出 JSON（可包在 markdown 代码块里），信封格式：')
  lines.push(envelopeExample('diagnosis', [
    '{',
    '  "findings": [{ "claim": "…", "evidenceRefs": ["skills.en.listening.acc"], "confidence": "high" }],',
    '  "focus": [{ "skill": "listening", "tag": "listening-detail", "weeks": 2, "reason": "…" }],',
    '  "actions": ["…"]',
    '}',
  ].join('\n')))
  return lines.join('\n')
}

function parse(raw: string, ctx: DiagnosisCtx) {
  const res = unwrapEnvelope<unknown>(raw, 'diagnosis')
  if ('error' in res) return { warnings: [], error: res.error }
  const warnings = [...res.warnings]
  const data = res.payload as { findings?: unknown; focus?: unknown; actions?: unknown }
  if (data == null || typeof data !== 'object' || !Array.isArray(data.findings)) {
    return { warnings, error: '返回的 JSON 里没有 findings 数组。' }
  }

  const findings: DiagnosisFinding[] = []
  for (const f of data.findings) {
    if (findings.length >= MAX_FINDINGS) { warnings.push(`findings 超过 ${MAX_FINDINGS} 条，已截断。`); break }
    if (f == null || typeof f !== 'object') continue
    const { claim, evidenceRefs, confidence } = f as { claim?: unknown; evidenceRefs?: unknown; confidence?: unknown }
    if (typeof claim !== 'string' || claim.trim().length < 4) { warnings.push('忽略一条没有结论文字的 finding。'); continue }
    const refs = Array.isArray(evidenceRefs) ? evidenceRefs.filter((r): r is string => typeof r === 'string') : []
    const valid = refs.filter((r) => getPath(ctx.digest, r) != null)
    if (refs.length === 0 || valid.length === 0) {
      warnings.push(`拒收结论「${claim.trim().slice(0, 30)}…」：evidenceRefs 在摘要里解析不到（防幻觉硬校验）。`)
      continue
    }
    if (valid.length < refs.length) warnings.push(`结论「${claim.trim().slice(0, 30)}…」有 ${refs.length - valid.length} 个无效引用被剔除。`)
    const conf = confidence === 'high' || confidence === 'medium' || confidence === 'low' ? confidence : 'low'
    findings.push({ claim: claim.trim(), evidenceRefs: valid, confidence: conf, status: 'accepted' })
  }

  const focus: DiagnosisResult['focus'] = []
  if (Array.isArray(data.focus)) {
    for (const item of data.focus) {
      if (focus.length >= MAX_FOCUS) break
      if (item == null || typeof item !== 'object') continue
      const { skill, tag, weeks, reason } = item as { skill?: unknown; tag?: unknown; weeks?: unknown; reason?: unknown }
      if (!SKILLS.includes(skill as Skill)) { warnings.push(`忽略 focus「${String(skill)}」：不是合法技能。`); continue }
      if (tag != null && !isErrorTag(String(tag))) { warnings.push(`忽略 focus 的标签「${String(tag)}」。`); continue }
      focus.push({
        skill: skill as Skill,
        ...(tag != null ? { tag: tag as ErrorTag } : {}),
        weeks: Math.max(1, Math.min(2, Number(weeks) || 1)),
        reason: typeof reason === 'string' ? reason.trim() : '',
      })
    }
  }
  const actions = Array.isArray(data.actions)
    ? data.actions.filter((a): a is string => typeof a === 'string' && a.trim().length > 4).map((a) => a.trim()).slice(0, MAX_ACTIONS)
    : []

  if (findings.length === 0) {
    return { warnings, error: '没有一条结论通过 evidenceRefs 校验（全部拒收）。请让 agent 重新引用摘要里的真实字段路径。' }
  }
  return { value: { findings, focus, actions }, warnings }
}

function preview(value: DiagnosisResult, ctx: DiagnosisCtx): string {
  const lines = ['将把这次诊断存为一条记录（最多保留最近 12 次），不会改动任何计划：', '']
  for (const f of value.findings) {
    const ev = f.evidenceRefs.map((r) => `${r}=${JSON.stringify(getPath(ctx.digest, r))}`).join('，')
    lines.push(`· [${f.confidence}] ${f.claim}`)
    lines.push(`  证据：${ev}`)
  }
  if (value.focus.length) lines.push('', `建议聚焦：${value.focus.map((f) => `${f.skill}${f.tag ? `/${f.tag}` : ''}（${f.weeks} 周）`).join('、')}`)
  if (value.actions.length) lines.push('', `行动建议：${value.actions.join('；')}`)
  lines.push('', '采信哪些结论、要不要变成计划约束，由你在「进步」页决定。')
  return lines.join('\n')
}

async function apply(value: DiagnosisResult, ctx: DiagnosisCtx): Promise<string> {
  const now = Date.now()
  const record: DiagnosisRecord = { ...value, ts: now, promptVersion: DIAGNOSIS_PROMPT_VERSION, digest: ctx.digest }
  const list = (await getMeta<DiagnosisRecord[]>('diagnoses')) ?? []
  const next = [record, ...list].slice(0, DIAGNOSES_KEEP)
  await setMeta('diagnoses', next)
  await setMeta('lastDiagnosisAt', now)
  return `诊断已保存（第 ${next.length}/${DIAGNOSES_KEEP} 条）。去「进步」页查看结论并决定是否采纳为计划约束。`
}

export const diagnosisPacket: PacketDef<DiagnosisCtx, DiagnosisResult> = {
  kind: 'diagnosis',
  label: 'AI 诊断（学习状态分析）',
  promptVersion: DIAGNOSIS_PROMPT_VERSION,
  buildPrompt,
  parse,
  preview,
  apply,
  egressFields: () => ['stats.digest(aggregate-only)'],
}
