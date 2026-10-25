// 计划约束包：agent 只写约束不写计划；硬边界（±1 难度 / days ≤30 / 占比合计 ≤1）全部在 parse 拦下。
import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { planPacket, validateConstraint, type PlanCtx } from '../src/engine/packets/plan'
import type { Digest } from '../src/engine/packets/diagnosis'
import { getAllAdjustments } from '../src/storage/db'

const digest: Digest = {
  window: { days: 28, sessions: 40, minutes: 1800 },
  skills: { en: { reading: { mastery: 62, n: 38, acc: 0.71 }, listening: { mastery: 48, n: 21, acc: 0.58 } }, es: {} },
  errorTags: [{ tag: 'inference', lang: 'en', skill: 'reading', count: 11, acc: 0.45 }],
  adherence: { scheduled: 46, completed: 33, skipped: 13 },
  recentAdjustments: ['type-deprioritize:listening x2'],
  contentExhausted: ['en/reading/difficulty5'],
}

const baseCtx: PlanCtx = { digest, acceptedFindings: [], existingConstraints: [] }

function wrap(constraints: unknown[]): string {
  return JSON.stringify({ lingualoop: 'packet', schemaVersion: 1, kind: 'plan', promptVersion: 1, payload: { constraints } })
}

describe('validateConstraint 硬边界', () => {
  it('合法约束通过', () => {
    expect(validateConstraint({ dimension: 'type-cap', target: 'writing', value: 2, days: 14, reason: 'r' }).ok).toBeTruthy()
    expect(validateConstraint({ dimension: 'skill-share', target: 'listening', value: 0.35, days: 14, reason: 'r' }).ok).toBeTruthy()
    expect(validateConstraint({ dimension: 'difficulty', target: 'reading', value: 1, days: 7, reason: 'r' }).ok).toBeTruthy()
  })

  it('difficulty 只许 ±1', () => {
    expect(validateConstraint({ dimension: 'difficulty', target: 'reading', value: 2, days: 7 }).error).toContain('±1')
    expect(validateConstraint({ dimension: 'difficulty', target: 'reading', value: -2, days: 7 }).error).toBeTruthy()
  })

  it('days ≤30、type-cap 1–6、skill-share 0.05–0.6', () => {
    expect(validateConstraint({ dimension: 'type-cap', target: 'writing', value: 2, days: 31 }).error).toContain('days')
    expect(validateConstraint({ dimension: 'type-cap', target: 'writing', value: 0, days: 14 }).error).toContain('1–6')
    expect(validateConstraint({ dimension: 'type-cap', target: 'writing', value: 9, days: 14 }).error).toBeTruthy()
    expect(validateConstraint({ dimension: 'skill-share', target: 'listening', value: 0.9, days: 14 }).error).toContain('0.05–0.6')
  })

  it('非法技能/维度拒绝', () => {
    expect(validateConstraint({ dimension: 'type-cap', target: 'pinyin', value: 2, days: 14 }).error).toContain('技能')
    expect(validateConstraint({ dimension: 'weekly-list', target: 'writing', value: 2, days: 14 }).error).toContain('dimension')
  })
})

describe('计划包 parse', () => {
  it('合法约束通过 parse', () => {
    const r = planPacket.parse(wrap([
      { dimension: 'type-cap', target: 'writing', value: 2, days: 14, reason: '减量提质' },
      { dimension: 'difficulty', target: 'reading', value: 1, days: 7, reason: '已稳定在 70% 正确率' },
    ]), baseCtx)
    expect(r.error).toBeUndefined()
    expect(r.value!.constraints).toHaveLength(2)
  })

  it('越界约束被拒收并告警，其余照常通过', () => {
    const r = planPacket.parse(wrap([
      { dimension: 'type-cap', target: 'writing', value: 2, days: 14, reason: 'r' },
      { dimension: 'difficulty', target: 'reading', value: 3, days: 7, reason: 'bad' },
    ]), baseCtx)
    expect(r.value!.constraints).toHaveLength(1)
    expect(r.warnings.join(' ')).toContain('±1')
  })

  it('同维度同目标重复约束只保留后一条', () => {
    const r = planPacket.parse(wrap([
      { dimension: 'type-cap', target: 'writing', value: 2, days: 14, reason: 'a' },
      { dimension: 'type-cap', target: 'writing', value: 4, days: 14, reason: 'b' },
    ]), baseCtx)
    expect(r.value!.constraints).toHaveLength(1)
    expect(r.value!.constraints[0].value).toBe(4)
    expect(r.warnings.join(' ')).toContain('保留后一条')
  })

  it('skill-share 与现有约束合计 >1 时拒收新增', () => {
    const ctxWithExisting: PlanCtx = {
      ...baseCtx,
      existingConstraints: [{ dimension: 'skill-share', target: 'listening', value: 0.5, days: 14, reason: '' }],
    }
    const r = planPacket.parse(wrap([
      { dimension: 'skill-share', target: 'reading', value: 0.6, days: 14, reason: 'r' },
    ]), ctxWithExisting)
    expect(r.value).toBeUndefined()
    expect(r.warnings.join(' ')).toContain('超过 1')
  })

  it('prompt 明示"只写约束不排计划"并带采信结论', () => {
    const ctx2: PlanCtx = {
      ...baseCtx,
      acceptedFindings: [{ claim: '听力正确率低 13 个点', evidenceRefs: ['skills.en.listening.acc'], confidence: 'high', status: 'accepted' }],
    }
    const p = planPacket.buildPrompt(ctx2)
    expect(p).toContain('你不排计划，只写约束')
    expect(p).toContain('听力正确率低 13 个点')
  })
})

describe('计划包 apply（真实 IndexedDB 行为）', () => {
  it('约束写成 plan-constraint Adjustment，带到期时间', async () => {
    const r = planPacket.parse(wrap([
      { dimension: 'type-cap', target: 'writing', value: 2, days: 14, reason: '减量提质' },
    ]), baseCtx)
    const note = await planPacket.apply(r.value!, baseCtx)
    const all = await getAllAdjustments()
    expect(all).toHaveLength(1)
    expect(all[0].kind).toBe('plan-constraint')
    expect(all[0].expiresAt).toBeGreaterThan(Date.now() + 13 * 86400000)
    expect(all[0].payload).toMatchObject({ dimension: 'type-cap', target: 'writing', value: 2 })
    expect(note).toContain('1 条')
  })
})
