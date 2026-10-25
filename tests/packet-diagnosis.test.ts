// 诊断包：evidenceRefs 防幻觉是核心——引用解析不到 digest 真实路径的结论直接拒收。
import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { buildStateDigest, diagnosisPacket, getPath, type Digest, type DiagnosisCtx } from '../src/engine/packets/diagnosis'
import type { LearningEvent, Settings } from '../src/types/app'
import { DEFAULT_SETTINGS } from '../src/types/app'
import type { Exercise, VocabCard } from '../src/types/content'

const NOW = new Date('2026-10-25T08:00:00').getTime()

function vocab(id: string): VocabCard {
  return {
    id, language: 'en', skill: 'vocab', type: 'vocab-card', topic: 'general', difficulty: 3,
    estimatedMinutes: 1, tags: ['general'], createdAt: '2026-10-25', contentVersion: 1, source: 'original',
    term: 't', pos: 'n.', glossZh: 'g', definition: 'd', collocations: ['a b', 'c d'],
    examples: [{ sentence: 's', zh: 'z' }, { sentence: 's2', zh: 'z2' }],
  }
}

function events(n: number): LearningEvent[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `e${i}`, ts: NOW - (i % 20) * 86400000, language: 'en', skill: i % 2 ? 'reading' : 'listening',
    exerciseType: 'reading-mc', contentId: 'en-read-001', correct: i % 3 !== 0, secondsSpent: 120,
    hintsUsed: 0, errorTags: i % 3 === 0 ? ['inference' as const] : [], contentVersion: 1,
  }))
}

const settings: Settings = { ...DEFAULT_SETTINGS, onboarded: true, startedAt: '2026-10-25' }

const digest = buildStateDigest({
  settings, events: events(12), skillStates: [], adjustments: [], allExercises: [vocab('en-voc-001')], plans: [], now: NOW,
})

const ctx: DiagnosisCtx = { digest }

function wrap(payload: unknown): string {
  return JSON.stringify({ lingualoop: 'packet', schemaVersion: 1, kind: 'diagnosis', promptVersion: 1, payload })
}

describe('buildStateDigest', () => {
  it('窗口统计、技能聚合、错误标签计数都来自真实事件', () => {
    expect(digest.window.sessions).toBe(12)
    expect(digest.window.minutes).toBe(24)
    expect(digest.skills.en.reading!.n + digest.skills.en.listening!.n).toBe(12)
    expect(digest.skills.en.reading!.acc).not.toBeNull()
    expect(digest.errorTags.filter((t) => t.tag === 'inference').reduce((s, t) => s + t.count, 0)).toBe(4)
  })

  it('digest 里不含任何原文（只有数字与聚合）', () => {
    const s = JSON.stringify(digest)
    expect(s).not.toContain('term')
    expect(s).not.toContain('例句')
  })
})

describe('getPath', () => {
  it('解析数组与嵌套路径', () => {
    expect(getPath(digest, 'window.days')).toBe(28)
    expect(getPath(digest, 'skills.en.reading.acc')).toBe(digest.skills.en.reading!.acc)
    expect(getPath(digest, 'errorTags.0.tag')).toBe(digest.errorTags[0].tag)
  })
  it('越界/不存在返回 undefined', () => {
    expect(getPath(digest, 'errorTags.99.acc')).toBeUndefined()
    expect(getPath(digest, 'skills.en.pinyin')).toBeUndefined()
    expect(getPath(digest, 'window.days.x')).toBeUndefined()
  })
})

describe('诊断包 parse（防幻觉硬校验）', () => {
  it('引用真实路径的结论通过，并保留置信度', () => {
    const r = diagnosisPacket.parse(wrap({
      findings: [{ claim: '听力正确率明显低于阅读', evidenceRefs: ['skills.en.listening.acc', 'skills.en.reading.acc'], confidence: 'high' }],
      focus: [{ skill: 'listening', tag: 'detail', weeks: 2, reason: 'r' }],
      actions: ['精听每天 10 分钟，逐句跟读'],
    }), ctx)
    expect(r.error).toBeUndefined()
    expect(r.value!.findings[0].status).toBe('accepted')
    expect(r.value!.findings[0].evidenceRefs).toHaveLength(2)
    expect(r.value!.focus[0].weeks).toBe(2)
  })

  it('引用不存在路径的结论被拒收并告警', () => {
    const r = diagnosisPacket.parse(wrap({
      findings: [
        { claim: '你的口语很好', evidenceRefs: ['skills.en.speaking.band'], confidence: 'high' },
        { claim: '推断题是主要丢分点', evidenceRefs: ['errorTags.0.count'], confidence: 'medium' },
      ],
      focus: [], actions: [],
    }), ctx)
    expect(r.value!.findings).toHaveLength(1)
    expect(r.value!.findings[0].claim).toContain('推断')
    expect(r.warnings.join(' ')).toContain('拒收')
  })

  it('全部结论引用无效 → 整体报错，不给半成品', () => {
    const r = diagnosisPacket.parse(wrap({
      findings: [{ claim: '凭感觉你听力不行', evidenceRefs: ['vibes.0'], confidence: 'low' }],
      focus: [], actions: [],
    }), ctx)
    expect(r.value).toBeUndefined()
    expect(r.error).toContain('evidenceRefs')
  })

  it('findings 超过 5 条截断；weeks 夹在 1–2', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      claim: `结论 ${i}`, evidenceRefs: ['window.sessions'], confidence: 'low' as const,
    }))
    const r = diagnosisPacket.parse(wrap({ findings: many, focus: [{ skill: 'reading', weeks: 9, reason: '' }], actions: [] }), ctx)
    expect(r.value!.findings).toHaveLength(5)
    expect(r.value!.focus[0].weeks).toBe(2)
  })

  it('prompt 含 digest 全文与"不许给 Band/CEFR"红线', () => {
    const p = diagnosisPacket.buildPrompt(ctx)
    expect(p).toContain('"window"')
    expect(p).toContain('Band')
    expect(p).toContain('硬校验') // evidenceRefs 必须解析到 digest 真实路径
  })
})
