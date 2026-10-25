// 技能掌握度：基于真实学习事件的内部趋势指标（0–100）。
// 明确：这不是 IELTS Band，也不是 CEFR 认证，只是产品内部的进度信号。
import type { LearningEvent, MasteryConfidence, SkillState } from '../types/app'

const EWMA_ALPHA = 0.25
const SHRINK_K = 8
const PRIOR_DEFAULT = 50

/** 单个事件的表现分（0–1）：客观题看对错；开放任务看自评 */
export function eventPerformance(ev: LearningEvent): number | null {
  if (ev.correct != null) {
    // 难题做对略加权，简单题做错略减权
    return ev.correct ? 1 : 0
  }
  if (ev.score != null) return Math.max(0, Math.min(1, ev.score))
  if (ev.selfDifficulty === 'too-easy') return 0.95
  if (ev.selfDifficulty === 'right') return 0.75
  if (ev.selfDifficulty === 'too-hard') return 0.45
  if (ev.detail?.selfEvalScores?.length) {
    const avg = ev.detail.selfEvalScores.reduce((s, x) => s + x.score, 0) / ev.detail.selfEvalScores.length
    return Math.max(0, Math.min(1, avg))
  }
  return null // 无法评估（如仅记录完成的任务）
}

export interface MasteryResult {
  language: string
  skill: string
  value: number // 0-100
  confidence: MasteryConfidence
  sampleSize: number
  lastTrainedAt?: number
  staleDays?: number
  ewma: number
}

export function computeMastery(
  language: string,
  skill: string,
  events: LearningEvent[],
  prior: number,
  now = Date.now()
): MasteryResult {
  const relevant = events
    .filter((e) => e.language === language && e.skill === skill)
    .sort((a, b) => a.ts - b.ts) // 时间正序做 EWMA
  let ewma = prior / 100
  let usable = 0
  let lastTs: number | undefined
  for (const ev of relevant) {
    const p = eventPerformance(ev)
    if (p == null) {
      lastTs = ev.ts
      continue
    }
    ewma = usable === 0 ? p : EWMA_ALPHA * p + (1 - EWMA_ALPHA) * ewma
    usable += 1
    lastTs = ev.ts
  }
  const n = usable
  // 收缩到先验：样本少时不过度自信
  const c = n / (n + SHRINK_K)
  const value = Math.round(100 * (prior / 100 * (1 - c) + ewma * c))
  const confidence: MasteryConfidence = n < 5 ? 'insufficient' : n < 15 ? 'low' : n < 40 ? 'medium' : 'high'
  let staleDays: number | undefined
  if (lastTs != null) staleDays = Math.floor((now - lastTs) / 86400000)
  return { language, skill, value, confidence, sampleSize: n, lastTrainedAt: lastTs, staleDays, ewma }
}

/** 增量更新 SkillState（用于持久化，避免每次全量重算） */
export function updateSkillState(state: SkillState | undefined, language: SkillState['language'], skill: SkillState['skill'], ev: LearningEvent): SkillState {
  const base: SkillState =
    state ?? { language, skill, events: 0, ewmaPerf: 0.5, targetDifficultyOffset: 0, prior: PRIOR_DEFAULT }
  const p = eventPerformance(ev)
  const ewma = p == null ? base.ewmaPerf : base.events === 0 ? p : EWMA_ALPHA * p + (1 - EWMA_ALPHA) * base.ewmaPerf
  return { ...base, events: base.events + 1, ewmaPerf: ewma, lastTrainedAt: ev.ts }
}

export function skillKey(language: string, skill: string): string {
  return `${language}:${skill}`
}

/** 瓶颈技能排序：掌握度低且（样本不足→需要覆盖）或（久未训练→需要回补）优先 */
export function rankSkillNeeds(
  masteries: MasteryResult[],
  now = Date.now()
): { language: string; skill: string; score: number; reason: string }[] {
  return masteries
    .map((m) => {
      let score = 100 - m.value
      let reason = `掌握度 ${m.value}/100`
      if (m.confidence === 'insufficient') {
        score += 40
        reason = '数据不足，需要先建立基线'
      }
      if (m.staleDays != null && m.staleDays >= 7) {
        score += Math.min(30, m.staleDays * 2)
        reason += `；已 ${m.staleDays} 天未练`
      }
      return { language: m.language, skill: m.skill, score, reason }
    })
    .sort((a, b) => b.score - a.score)
}
