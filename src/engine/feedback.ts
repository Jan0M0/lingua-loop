// 反馈应用规则：微反馈必须真实改变后续训练（否则只是收集数据）。
import type { Adjustment, CardState, LearningEvent, SkillState, TaskFeedback } from '../types/app'

function id(): string {
  return `adj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export interface FeedbackOutcome {
  adjustments: Adjustment[]
  cardEaseDelta: Record<string, number>
  skillUpdates: { language: string; skill: string; targetDifficultyOffsetDelta: number }[]
  sameDayLightLoad: boolean
}

/**
 * 处理一次任务微反馈：
 * - 太简单 → 该技能目标难度 +1 档（上限 1）；涉及卡 ease +0.1
 * - 太难 → 目标难度 -1 档（下限 -1）；涉及卡 ease -0.1；下次拆小步骤（任务时长减半说明）
 * - 没帮助 → 记录 7 天内该 (exerciseType,skill) 降权
 * - 很疲惫 → 当日后续优先低认知负荷任务
 */
export function applyFeedback(
  fb: TaskFeedback,
  history: { events: LearningEvent[]; adjustments: Adjustment[] },
  now = Date.now()
): FeedbackOutcome {
  const adjustments: Adjustment[] = []
  const cardEaseDelta: Record<string, number> = {}
  const skillUpdates: FeedbackOutcome['skillUpdates'] = []
  let sameDayLightLoad = fb.energy === 'tired'

  if (fb.difficulty === 'too-easy') {
    skillUpdates.push({ language: fb.language, skill: fb.skill, targetDifficultyOffsetDelta: +0.34 })
    for (const cid of fb.contentIds) cardEaseDelta[cid] = +0.1
    adjustments.push({
      id: id(),
      ts: now,
      kind: 'skill-difficulty',
      description: `「${skillLabel(fb.skill)}」训练反馈偏简单：下次自动选择更高难度的材料，复习间隔拉长`,
    })
  } else if (fb.difficulty === 'too-hard') {
    skillUpdates.push({ language: fb.language, skill: fb.skill, targetDifficultyOffsetDelta: -0.34 })
    for (const cid of fb.contentIds) cardEaseDelta[cid] = -0.1
    adjustments.push({
      id: id(),
      ts: now,
      kind: 'skill-difficulty',
      description: `「${skillLabel(fb.skill)}」训练反馈偏难：下次降低材料难度或拆小任务，先补基础再进阶`,
    })
  }

  if (fb.value === 'not-useful') {
    const recent = [
      ...history.events.filter((e) => now - e.ts < 7 * 86400000).map((e) => ({ ts: e.ts, exerciseType: e.exerciseType, skill: e.skill, selfValue: e.selfValue })),
      ...history.adjustments.filter((a) => a.kind === 'type-deprioritize' && a.payload && (a.payload as { exerciseType?: string }).exerciseType === fb.exerciseType).map((a) => ({ ts: a.ts, exerciseType: fb.exerciseType, skill: fb.skill, selfValue: 'not-useful' as const })),
    ]
    const notUsefulSameType = recent.filter((r) => r.exerciseType === fb.exerciseType && r.selfValue === 'not-useful').length
    // recent 只含历史；当前这次是第 notUsefulSameType + 1 次，≥2 即触发
    if (notUsefulSameType >= 1) {
      adjustments.push({
        id: id(),
        ts: now,
        kind: 'type-deprioritize',
        description: `连续反馈「没帮助」：未来 7 天减少「${typeLabel(fb.exerciseType)}」类任务，优先其他训练方式`,
        expiresAt: now + 7 * 86400000,
        payload: { exerciseType: fb.exerciseType, skill: fb.skill, language: fb.language },
      })
    } else {
      adjustments.push({
        id: id(),
        ts: now,
        kind: 'plan-note',
        description: `记录：本次「${typeLabel(fb.exerciseType)}」训练价值不高，继续观察同类反馈`,
      })
    }
  }

  if (fb.energy === 'tired') {
    adjustments.push({
      id: id(),
      ts: now,
      kind: 'plan-note',
      description: '你反馈状态疲惫：今日剩余任务将优先安排低认知负荷内容（词卡复习、带脚本的听力），也可以直接结束今天',
    })
  }

  if (fb.stuckNote?.trim()) {
    adjustments.push({
      id: id(),
      ts: now,
      kind: 'plan-note',
      description: `你的卡点记录：${fb.stuckNote.trim().slice(0, 120)}`,
    })
  }

  return { adjustments, cardEaseDelta, skillUpdates, sameDayLightLoad }
}

/** 把 cardEaseDelta 应用到卡片状态 */
export function applyEaseDelta(state: CardState, delta: number): CardState {
  return { ...state, ease: Math.max(1.3, Math.min(3.0, state.ease + delta)) }
}

export function applySkillOffset(state: SkillState, delta: number): SkillState {
  return { ...state, targetDifficultyOffset: Math.max(-1, Math.min(1, state.targetDifficultyOffset + delta)) }
}

export function activeDeprioritizations(adjustments: Adjustment[], now = Date.now()): Adjustment[] {
  return adjustments.filter((a) => a.kind === 'type-deprioritize' && (a.expiresAt == null || a.expiresAt > now))
}

export function skillLabel(skill: string): string {
  const map: Record<string, string> = {
    reading: '阅读', listening: '听力', writing: '写作', speaking: '口语', vocab: '词汇', grammar: '语法',
  }
  return map[skill] ?? skill
}

export function typeLabel(type: string): string {
  const map: Record<string, string> = {
    'vocab-card': '词卡', 'reading-mc': '阅读练习', cloze: '语法填空', listening: '听力练习',
    'writing-task': '写作任务', 'speaking-task': '口语任务', 'grammar-note': '语法小课', diagnostic: '诊断',
  }
  return map[type] ?? type
}
