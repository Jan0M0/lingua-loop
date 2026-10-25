// 交接包解析底座：extractJson / unwrapEnvelope —— agent 回复不可信（寒暄/代码块/多余文字），底座要稳。
import { describe, expect, it } from 'vitest'
import { extractJson, unwrapEnvelope, envelopeExample } from '../src/engine/packets/parse'

describe('extractJson', () => {
  it('整段就是 JSON', () => {
    expect(extractJson('{"a":1}')?.text).toBe('{"a":1}')
  })

  it('从寒暄 + markdown 代码块里抠出 JSON', () => {
    const raw = '好的，这是结果：\n```json\n{"a": 1}\n```\n希望有帮助！'
    expect(extractJson(raw)?.text).toBe('{"a": 1}')
  })

  it('没有代码块时做平衡花括号扫描，忽略尾部多余文字', () => {
    const raw = '结果如下 {"x": [1, {"y": "}" }, 3]} 以上。'
    const r = extractJson(raw)
    expect(r).not.toBeNull()
    expect(JSON.parse(r!.text)).toEqual({ x: [1, { y: '}' }, 3] })
    expect(r!.warnings.join(' ')).toContain('忽略')
  })

  it('字符串里的花括号不破坏配对', () => {
    const raw = '前言 {"s": "a{b}c", "t": "}"}'
    expect(JSON.parse(extractJson(raw)!.text)).toEqual({ s: 'a{b}c', t: '}' })
  })

  it('完全不含 JSON 时返回 null', () => {
    expect(extractJson('抱歉，我不能这么做。')).toBeNull()
    expect(extractJson('')).toBeNull()
  })
})

describe('unwrapEnvelope', () => {
  it('裸 payload 与信封 payload 都能取出（向后兼容）', () => {
    const bare = unwrapEnvelope<{ candidates: unknown[] }>('{"candidates": []}', 'review')
    expect('payload' in bare && bare.payload.candidates).toEqual([])
    const enveloped = unwrapEnvelope<{ candidates: unknown[] }>(
      JSON.stringify({ lingualoop: 'packet', schemaVersion: 1, kind: 'review', promptVersion: 1, payload: { candidates: [1] } }),
      'review',
    )
    expect('payload' in enveloped && enveloped.payload.candidates).toEqual([1])
  })

  it('信封 kind 不匹配时明确报错（防粘错包）', () => {
    const r = unwrapEnvelope(JSON.stringify({ lingualoop: 'packet', schemaVersion: 1, kind: 'content', promptVersion: 1, payload: {} }), 'review')
    expect('error' in r && r.error).toContain('粘错')
  })

  it('坏 JSON 报解析失败', () => {
    const r = unwrapEnvelope('{oops', 'review')
    expect('error' in r).toBe(true)
  })
})

describe('envelopeExample', () => {
  it('四种包共用同一份信封示例', () => {
    const ex = envelopeExample('review', '{ "x": 1 }')
    expect(ex).toContain('"lingualoop": "packet"')
    expect(ex).toContain('"kind": "review"')
    expect(ex).toContain('"payload": { "x": 1 }')
  })
})
