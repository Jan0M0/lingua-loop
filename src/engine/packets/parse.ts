// 从 agent 回复中提取并校验 JSON —— 所有包共用的解析底座。
// agent 的回复不可信：可能带寒暄、markdown 代码块、截断。这里只做「提取 + 剥信封」，语义校验在各包的 parse。
import { PACKET_SCHEMA_VERSION, type PacketKind, type PacketEnvelope } from './types'

export interface ExtractedJson {
  text: string
  warnings: string[]
}

/** 常见围栏剥离 + 平衡花括号扫描，尽力从任意文本里抠出 JSON 对象/数组 */
export function extractJson(raw: string): ExtractedJson | null {
  const warnings: string[] = []
  let text = raw.trim()
  if (!text) return null

  // 1) 整段直接是 JSON
  if (looksLikeJson(text)) return { text, warnings }

  // 2) markdown 代码块 ```json ... ``` 或 ``` ... ```
  const fences = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)]
  if (fences.length > 1) warnings.push('回复里有多个代码块，取最后一个（通常是最终结果）。')
  for (const f of fences.reverse()) {
    const body = f[1].trim()
    if (looksLikeJson(body)) return { text: body, warnings }
  }

  // 3) 平衡花括号扫描：从第一个 { 或 [ 开始，找配对的结束
  const start = text.search(/[{[]/)
  if (start === -1) return null
  const open = text[start]
  const close = open === '{' ? '}' : ']'
  let depth = 0
  let inStr = false
  let esc = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (esc) { esc = false; continue }
    if (ch === '\\') { esc = true; continue }
    if (ch === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (ch === open) depth++
    else if (ch === close) {
      depth--
      if (depth === 0) {
        const candidate = text.slice(start, i + 1)
        if (looksLikeJson(candidate)) {
          if (i + 1 < text.length - 2) warnings.push('JSON 之后还有多余文字，已忽略。')
          return { text: candidate, warnings }
        }
        return null
      }
    }
  }
  return null
}

function looksLikeJson(s: string): boolean {
  if (!s) return false
  try {
    JSON.parse(s)
    return true
  } catch {
    return false
  }
}

/** JSON.parse + 剥信封：裸 payload 和 {lingualoop:'packet'} 信封都吃，向后兼容 */
export function unwrapEnvelope<T = unknown>(
  raw: string,
  expectKind: PacketKind
): { payload: T; warnings: string[]; envelope: PacketEnvelope<T> | null } | { error: string } {
  const extracted = extractJson(raw)
  if (!extracted) return { error: '没有在回复里找到可解析的 JSON。' }
  let data: unknown
  try {
    data = JSON.parse(extracted.text)
  } catch (e) {
    return { error: 'JSON 解析失败：' + (e instanceof Error ? e.message : String(e)) }
  }
  const warnings = [...extracted.warnings]

  if (
    data != null &&
    typeof data === 'object' &&
    'lingualoop' in data &&
    (data as { lingualoop?: unknown }).lingualoop === 'packet'
  ) {
    const env = data as PacketEnvelope<T>
    if (env.kind !== expectKind) {
      return { error: `信封 kind 是「${env.kind}」，期望「${expectKind}」——可能粘错了别的包的结果。` }
    }
    if (typeof env.schemaVersion === 'number' && env.schemaVersion > PACKET_SCHEMA_VERSION) {
      warnings.push(`信封 schemaVersion ${env.schemaVersion} 高于本应用支持的 ${PACKET_SCHEMA_VERSION}，已按当前规则校验。`)
    }
    return { payload: env.payload, warnings, envelope: env }
  }
  return { payload: data as T, warnings, envelope: null }
}

/** 供 prompt 用的信封示例（四包共用，保持与 llms.txt / agent 文档一致） */
export function envelopeExample(kind: PacketKind, payloadExample: string): string {
  return [
    '{',
    `  "lingualoop": "packet",`,
    `  "schemaVersion": ${PACKET_SCHEMA_VERSION},`,
    `  "kind": "${kind}",`,
    '  "promptVersion": <原样返回我给你的 promptVersion>,',
    `  "payload": ${payloadExample}`,
    '}',
  ].join('\n')
}
