// 计划约束包：agent 不写计划，agent 只写约束。
// 调度器是确定性的（DECISIONS §13），这是资产；诊断结论进来后变成「带期限的约束条件」
// 塞进 adjustments 表，调度器照旧按规则算——「AI 参与决策」与「计划可复现、可解释、可撤销」同时成立。
// 硬边界（apply 前全部校验）：difficulty 只许 ±1；type-cap 1–6 次；skill-share 合计 ≤1；days ≤30。
import { addAdjustment } from '../../storage/db'
import type { Adjustment } from '../../types/app'
import type { Skill } from '../../types/content'
import { envelopeExample, unwrapEnvelope } from './parse'
import type { Digest, DiagnosisFinding } from './diagnosis'
import type { PacketDef } from './types'

export const PLAN_PROMPT_VERSION = 1

export type ConstraintDimension = 'type-cap' | 'skill-share' | 'difficulty'

export interface PlanConstraint {
  dimension: ConstraintDimension
  /** 约束作用的语言技能（reading/listening/…） */
  target: Skill
  /** type-cap：窗口内该技能最多安排次数；skill-share：目标占比 0–1；difficulty：难度偏移 -1/+1 */
  value: number
  /** 约束生效天数（1–30），到期自动失效 */
  days: number
  reason: string
}

export interface PlanCtx {
  digest: Digest
  /** 最新一次诊断里用户「采信」的结论（忽略的不传——不下发） */
  acceptedFindings: DiagnosisFinding[]
  /** 当前仍在生效的约束（让 agent 别重复/冲突） */
  existingConstraints: PlanConstraint[]
}

export interface PlanResult {
  constraints: PlanConstraint[]
}

export const MAX_CONSTRAINTS = 5
const SKILLS: Skill[] = ['reading', 'listening', 'writing', 'speaking', 'vocab', 'grammar']

/** 硬边界校验：单条约束是否合法（纯函数，测试直接覆盖） */
export function validateConstraint(c: unknown): { ok?: PlanConstraint; error?: string } {
  if (c == null || typeof c !== 'object') return { error: '不是对象' }
  const { dimension, target, value, days, reason } = c as Record<string, unknown>
  if (dimension !== 'type-cap' && dimension !== 'skill-share' && dimension !== 'difficulty') {
    return { error: `dimension 必须是 type-cap | skill-share | difficulty，收到「${String(dimension)}」` }
  }
  if (!SKILLS.includes(target as Skill)) return { error: `target「${String(target)}」不是合法技能` }
  const d = Number(days)
  if (!Number.isInteger(d) || d < 1 || d > 30) return { error: `days 必须是 1–30 的整数，收到「${String(days)}」` }
  const v = Number(value)
  if (dimension === 'type-cap') {
    if (!Number.isInteger(v) || v < 1 || v > 6) return { error: `type-cap 的 value 必须是 1–6 的整数（窗口内该技能最多安排几次），收到「${String(value)}」` }
  } else if (dimension === 'skill-share') {
    if (!Number.isFinite(v) || v < 0.05 || v > 0.6) return { error: `skill-share 的 value 必须在 0.05–0.6，收到「${String(value)}」` }
  } else {
    if (!Number.isInteger(v) || Math.abs(v) > 1) return { error: `difficulty 的 value 只许 ±1，收到「${String(value)}」` }
  }
  return { ok: { dimension, target: target as Skill, value: v, days: d, reason: typeof reason === 'string' ? reason.trim() : '' } }
}

function buildPrompt(ctx: PlanCtx): string {
  const lines: string[] = []
  lines.push('你是语言学习的排期顾问。基于下面的学习摘要和已采信的诊断结论，给出未来一段时间的「训练约束建议」。')
  lines.push('')
  lines.push('【重要】你不排计划，只写约束。确定性调度器会根据约束按规则排每天的安排。三种约束维度：')
  lines.push('- type-cap：某技能在约束期内最多被安排几次（如 writing 14 天内最多 2 次——用于减量提质）')
  lines.push('- skill-share：某技能的目标时间占比（如 listening 占 35%）')
  lines.push('- difficulty：某技能的目标难度偏移，只许 -1 或 +1（用于升/降档）')
  lines.push('')
  lines.push('【学习摘要 digest】')
  lines.push('```json')
  lines.push(JSON.stringify(ctx.digest, null, 2))
  lines.push('```')
  if (ctx.acceptedFindings.length) {
    lines.push('')
    lines.push('【已采信的诊断结论（约束必须服务这些结论）】')
    for (const f of ctx.acceptedFindings) lines.push(`- ${f.claim}（置信 ${f.confidence}）`)
  }
  if (ctx.existingConstraints.length) {
    lines.push('')
    lines.push('【当前仍在生效的约束（别重复，别冲突）】')
    for (const c of ctx.existingConstraints) lines.push(`- ${c.dimension} ${c.target}=${c.value}，剩 ${c.days} 天：${c.reason}`)
  }
  lines.push('')
  lines.push(`要求：最多 ${MAX_CONSTRAINTS} 条约束；每条都要有 reason（中文，说明它服务哪条诊断结论）；`)
  lines.push('days 按需给（1–30），小调整别一次锁一个月；不许给分数/等级；不许建议超出这三种维度的东西。')
  lines.push('只输出 JSON（可包在 markdown 代码块里），信封格式：')
  lines.push(envelopeExample('plan', [
    '{',
    '  "constraints": [',
    '    { "dimension": "type-cap", "target": "writing", "value": 2, "days": 14, "reason": "…" },',
    '    { "dimension": "difficulty", "target": "reading", "value": 1, "days": 7, "reason": "…" }',
    '  ]',
    '}',
  ].join('\n')))
  return lines.join('\n')
}

function parse(raw: string, ctx: PlanCtx) {
  const res = unwrapEnvelope<unknown>(raw, 'plan')
  if ('error' in res) return { warnings: [], error: res.error }
  const warnings = [...res.warnings]
  const data = res.payload as { constraints?: unknown }
  if (data == null || typeof data !== 'object' || !Array.isArray(data.constraints)) {
    return { warnings, error: '返回的 JSON 里没有 constraints 数组。' }
  }

  const constraints: PlanConstraint[] = []
  for (const raw0 of data.constraints) {
    if (constraints.length >= MAX_CONSTRAINTS) { warnings.push(`超过 ${MAX_CONSTRAINTS} 条，已截断。`); break }
    const { ok, error } = validateConstraint(raw0)
    if (!ok) { warnings.push(`拒收一条约束：${error}`); continue }
    // 同维度同目标的重复约束只保留最后一条
    const dupIdx = constraints.findIndex((c) => c.dimension === ok.dimension && c.target === ok.target)
    if (dupIdx >= 0) {
      warnings.push(`同维度同目标（${ok.dimension}/${ok.target}）出现多次，保留后一条。`)
      constraints[dupIdx] = ok
      continue
    }
    // skill-share 合计 ≤ 1（含现有生效的）
    if (ok.dimension === 'skill-share') {
      const existingShare = ctx.existingConstraints.filter((c) => c.dimension === 'skill-share' && !constraints.some((n) => n.dimension === 'skill-share' && n.target === c.target))
        .reduce((s, c) => s + c.value, 0)
      const newShare = constraints.filter((c) => c.dimension === 'skill-share').reduce((s, c) => s + c.value, 0) + ok.value
      if (existingShare + newShare > 1) { warnings.push(`拒收 skill-share/${ok.target}=${ok.value}：所有占比约束合计会超过 1。`); continue }
    }
    constraints.push(ok)
  }
  if (constraints.length === 0) {
    return { warnings, error: `没有任何约束通过硬边界校验。${warnings.slice(0, 3).join(' ')}` }
  }
  return { value: { constraints }, warnings }
}

function constraintDesc(c: PlanConstraint): string {
  if (c.dimension === 'type-cap') return `${c.days} 天内「${skillZh(c.target)}」最多安排 ${c.value} 次`
  if (c.dimension === 'skill-share') return `「${skillZh(c.target)}」目标占比 ${Math.round(c.value * 100)}%（${c.days} 天）`
  return `「${skillZh(c.target)}」目标难度${c.value > 0 ? '上' : '下'}调 ${Math.abs(c.value)} 档（${c.days} 天）`
}

function skillZh(s: string): string {
  return ({ reading: '阅读', listening: '听力', writing: '写作', speaking: '口语', vocab: '词汇', grammar: '语法' } as Record<string, string>)[s] ?? s
}

function preview(value: PlanResult): string {
  const lines = [`将写入 ${value.constraints.length} 条计划约束（Adjustment，到期自动失效，可随时在「调整记录」里看）：`]
  for (const c of value.constraints) lines.push(`· ${constraintDesc(c)} — ${c.reason}`)
  lines.push('', '确定性调度器不受影响：它照常按规则排计划，只是在这些边界内排。明天生成计划时生效。')
  return lines.join('\n')
}

async function apply(value: PlanResult): Promise<string> {
  const now = Date.now()
  let i = 0
  for (const c of value.constraints) {
    const adj: Adjustment = {
      id: `plan-c-${now}-${i++}`,
      ts: now,
      kind: 'plan-constraint',
      description: `${constraintDesc(c)}。${c.reason}`,
      expiresAt: now + c.days * 86400000,
      payload: { ...c },
    }
    await addAdjustment(adj)
  }
  return `已写入 ${value.constraints.length} 条计划约束，明天起生效（每条 ${value.constraints.map((c) => c.days).join('/')} 天后自动过期）。`
}

export const planPacket: PacketDef<PlanCtx, PlanResult> = {
  kind: 'plan',
  label: 'AI 计划约束（只写边界，不排计划）',
  promptVersion: PLAN_PROMPT_VERSION,
  buildPrompt,
  parse,
  preview,
  apply,
  egressFields: () => ['stats.digest(aggregate-only)', 'diagnosis.acceptedFindings'],
}
