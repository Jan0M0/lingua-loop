// SM-2 风格间隔重复。所有字段可导出迁移（docs/DATA_SCHEMA.md）。
import type { CardState, LearningEvent } from '../types/app'

export const MIN_EASE = 1.3
export const MAX_EASE = 3.0
export const MAX_INTERVAL = 365

export function newCardState(id: string, now = Date.now()): CardState {
  return { id, ease: 2.5, intervalDays: 0, reps: 0, lapses: 0, dueAt: null, addedAt: now }
}

export type SrsGrade = 0 | 1 | 2 | 3 // again / hard / good / easy

/**
 * 复习一张卡。规则透明可测：
 * - again(0)：reps 清零、lapses+1、ease-0.2、10 分钟后再现
 * - hard(1)：ease-0.15、interval×1.2（至少 1 天）
 * - good(2)：reps 0→1 天，1→3 天，之后 ×ease
 * - easy(3)：ease+0.15、good 基础 ×1.3
 */
export function gradeCard(state: CardState, grade: SrsGrade, now = Date.now()): CardState {
  let { ease, intervalDays, reps, lapses } = state
  switch (grade) {
    case 0:
      ease = Math.max(MIN_EASE, ease - 0.2)
      reps = 0
      lapses += 1
      intervalDays = 0
      return {
        ...state,
        ease,
        intervalDays,
        reps,
        lapses,
        dueAt: now + 10 * 60 * 1000,
        lastGrade: grade,
        lastReviewedAt: now,
      }
    case 1: {
      ease = Math.max(MIN_EASE, ease - 0.15)
      intervalDays = reps === 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.2))
      reps += 1
      break
    }
    case 2: {
      if (reps === 0) intervalDays = 1
      else if (reps === 1) intervalDays = 3
      else intervalDays = Math.max(1, Math.round(intervalDays * ease))
      reps += 1
      break
    }
    case 3: {
      ease = Math.min(MAX_EASE, ease + 0.15)
      if (reps === 0) intervalDays = 2
      else if (reps === 1) intervalDays = 5
      else intervalDays = Math.max(2, Math.round(intervalDays * ease * 1.3))
      reps += 1
      break
    }
  }
  intervalDays = Math.min(MAX_INTERVAL, intervalDays)
  return {
    ...state,
    ease,
    intervalDays,
    reps,
    lapses,
    dueAt: now + intervalDays * 86400000,
    lastGrade: grade,
    lastReviewedAt: now,
  }
}

/** 由答题表现 + 自评难度映射到 SRS 等级 */
export function performanceToGrade(opts: {
  correct: boolean
  selfDifficulty?: LearningEvent['selfDifficulty']
  hinted?: boolean
}): SrsGrade {
  const { correct, selfDifficulty, hinted } = opts
  if (!correct) return 0
  if (selfDifficulty === 'too-easy') return 3
  if (selfDifficulty === 'too-hard' || hinted) return 1
  return 2
}

/** 到期卡排序：过期最久优先；同日到期按 lapses 降序（弱点优先） */
export function sortDue(states: CardState[], now = Date.now()): CardState[] {
  return states
    .filter((s) => !s.suspended && s.dueAt != null && s.dueAt <= now)
    .sort((a, b) => (a.dueAt! - b.dueAt!) || (b.lapses - a.lapses))
}

/** 学习中的卡（已学但未到期）数量，用于负载估算 */
export function activeCardCount(states: CardState[], now = Date.now()): number {
  return states.filter((s) => !s.suspended && s.reps > 0 && (s.dueAt == null || s.dueAt > now)).length
}

/** 预计到期数（未来 n 天） */
export function upcomingDue(states: CardState[], days: number, now = Date.now()): number {
  const horizon = now + days * 86400000
  return states.filter((s) => !s.suspended && s.dueAt != null && s.dueAt > now && s.dueAt <= horizon).length
}
