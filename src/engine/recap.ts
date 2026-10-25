// 每日复盘与每周报告：只用真实存储的数据；样本不足时明说。
import type { DailyPlan, LearningEvent } from '../types/app'
import { localDateKey, weekStartKey, dateKeyToDate } from './dates'
import { formatMinutes } from './dates'

export interface DailyRecap {
  dateKey: string
  minutes: number
  tasksDone: number
  tasksTotal: number
  accuracy: number | null
  accuracyBySkill: Record<string, { correct: number; total: number }>
  topErrorTags: { tag: string; count: number }[]
  vocabularyReviewed: number
  newCardsIntroduced: number
  summaryZh: string[]
  tomorrowPrioritiesZh: string[]
}

export function dailyRecap(
  dateKey: string,
  events: LearningEvent[],
  plan: DailyPlan | undefined,
  tomorrowPriorities: string[]
): DailyRecap {
  const dayEvents = events.filter((e) => localDateKey(new Date(e.ts)) === dateKey)
  const minutes = Math.round(dayEvents.reduce((s, e) => s + e.secondsSpent, 0) / 60)
  const tasksDone = plan?.tasks.filter((t) => t.status === 'done').length ?? dayEvents.length
  const tasksTotal = plan?.tasks.length ?? dayEvents.length
  const objective = dayEvents.filter((e) => e.correct != null)
  const accuracy = objective.length >= 3 ? objective.filter((e) => e.correct).length / objective.length : null

  const bySkill: DailyRecap['accuracyBySkill'] = {}
  for (const e of objective) {
    const k = `${e.language}:${e.skill}`
    bySkill[k] = bySkill[k] ?? { correct: 0, total: 0 }
    bySkill[k].total += 1
    if (e.correct) bySkill[k].correct += 1
  }
  const tagCount = new Map<string, number>()
  for (const e of dayEvents) for (const t of e.errorTags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1)
  const topErrorTags = [...tagCount.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 3)
  const vocabularyReviewed = dayEvents.filter((e) => e.exerciseType === 'vocab-card' && e.detail?.cardGrade != null).length
  const newCardsIntroduced = dayEvents.filter((e) => e.exerciseType === 'vocab-card' && e.detail?.mode === 'introduce').length

  const summaryZh: string[] = []
  if (dayEvents.length === 0) {
    summaryZh.push('今天还没有学习记录。哪怕 5 分钟的保底训练也能保持节奏。')
  } else {
    summaryZh.push(`完成 ${tasksDone}/${tasksTotal} 个任务，共 ${formatMinutes(minutes)}。`)
    if (accuracy != null) {
      summaryZh.push(`客观题正确率 ${Math.round(accuracy * 100)}%（${objective.length} 次作答）。`)
    } else {
      summaryZh.push('今天的作答样本不足以计算正确率（少于 3 次客观题作答）。')
    }
    if (topErrorTags.length) summaryZh.push(`最常出现的错误类型：${topErrorTags.map((t) => `${t.tag}×${t.count}`).join('、')}。`)
    if (vocabularyReviewed) summaryZh.push(`词卡复习 ${vocabularyReviewed} 张${newCardsIntroduced ? `，新学 ${newCardsIntroduced} 张` : ''}。`)
  }
  return {
    dateKey, minutes, tasksDone, tasksTotal, accuracy, accuracyBySkill: bySkill, topErrorTags,
    vocabularyReviewed, newCardsIntroduced, summaryZh, tomorrowPrioritiesZh: tomorrowPriorities,
  }
}

export interface WeeklyReport {
  weekStartKey: string
  plannedMinutes: number
  actualMinutes: number
  eventsCount: number
  coverage: Record<string, number> // lang:skill → minutes
  coverageGaps: string[]
  accuracy: number | null
  accuracyBySkill: Record<string, { correct: number; total: number }>
  dueCompletion: number | null // 到期复习完成率
  difficultyMatch: { tooEasy: number; right: number; tooHard: number }
  improvements: string[]
  concerns: string[]
  suggestionsZh: string[]
  dataSufficient: boolean
}

export function weeklyReport(
  weekStart: string,
  events: LearningEvent[],
  plans: DailyPlan[],
  cardDueCounts: { dueInWeek: number; reviewedInWeek: number }
): WeeklyReport {
  const start = dateKeyToDate(weekStart).getTime()
  const end = start + 7 * 86400000
  const weekEvents = events.filter((e) => e.ts >= start && e.ts < end)
  const weekPlans = plans.filter((p) => p.date >= weekStart && p.date < localDateKey(new Date(end)))
  const actualMinutes = Math.round(weekEvents.reduce((s, e) => s + e.secondsSpent, 0) / 60)
  const plannedMinutes = weekPlans.reduce((s, p) => s + p.tasks.reduce((a, t) => a + t.estMinutes, 0), 0)

  const coverage: Record<string, number> = {}
  for (const e of weekEvents) {
    const k = `${e.language}:${e.skill}`
    coverage[k] = (coverage[k] ?? 0) + e.secondsSpent / 60
  }
  const expectKeys = ['en:reading', 'en:listening', 'en:writing', 'en:speaking', 'es:reading', 'es:listening', 'es:writing', 'es:speaking']
  const coverageGaps = expectKeys.filter((k) => !(coverage[k] >= 5))

  const objective = weekEvents.filter((e) => e.correct != null)
  const accuracy = objective.length >= 8 ? objective.filter((e) => e.correct).length / objective.length : null
  const bySkill: WeeklyReport['accuracyBySkill'] = {}
  for (const e of objective) {
    const k = `${e.language}:${e.skill}`
    bySkill[k] = bySkill[k] ?? { correct: 0, total: 0 }
    bySkill[k].total += 1
    if (e.correct) bySkill[k].correct += 1
  }
  const dueCompletion =
    cardDueCounts.dueInWeek > 0 ? Math.min(1, cardDueCounts.reviewedInWeek / cardDueCounts.dueInWeek) : null

  const dm = { tooEasy: 0, right: 0, tooHard: 0 }
  for (const e of weekEvents) {
    if (e.selfDifficulty === 'too-easy') dm.tooEasy += 1
    else if (e.selfDifficulty === 'too-hard') dm.tooHard += 1
    else if (e.selfDifficulty === 'right') dm.right += 1
  }

  const dataSufficient = weekEvents.length >= 15
  const improvements: string[] = []
  const concerns: string[] = []
  const suggestionsZh: string[] = []

  if (!dataSufficient) {
    concerns.push('本周学习事件少于 15 条，以下结论仅供参考，样本不足。')
  }

  // 各技能正确率对比（有数据才说）
  const skillAccs = Object.entries(bySkill).filter(([, v]) => v.total >= 5)
  skillAccs.sort((a, b) => b[1].correct / b[1].total - a[1].correct / a[1].total)
  if (skillAccs.length >= 2) {
    const best = skillAccs[0]
    const worst = skillAccs[skillAccs.length - 1]
    improvements.push(`「${best[0]}」正确率 ${Math.round((best[1].correct / best[1].total) * 100)}%，表现最稳。`)
    concerns.push(`「${worst[0]}」正确率 ${Math.round((worst[1].correct / worst[1].total) * 100)}%，是本周短板。`)
    suggestionsZh.push(`下周优先给「${worst[0]}」加练 2–3 次，错题逐题看解析。`)
  } else if (dataSufficient) {
    concerns.push('各技能的客观题样本都还太少（每项 <5），还谈不上趋势。')
  }

  if (plannedMinutes > 0 && actualMinutes < plannedMinutes * 0.6) {
    concerns.push(`实际 ${formatMinutes(actualMinutes)} / 计划 ${formatMinutes(plannedMinutes)}，完成率不到 60%。`)
    suggestionsZh.push('如果时间预算不现实，请在设置里调低每日分钟数——可持续比强度更重要。')
  } else if (plannedMinutes > 0) {
    improvements.push(`时间投入达到计划的 ${Math.round((actualMinutes / plannedMinutes) * 100)}%。`)
  }
  if (dueCompletion != null) {
    if (dueCompletion >= 0.9) improvements.push(`到期复习完成率 ${Math.round(dueCompletion * 100)}%，记忆巩固做得好。`)
    else {
      concerns.push(`到期复习完成率只有 ${Math.round(dueCompletion * 100)}%，逾期卡会越积越多。`)
      suggestionsZh.push('把「复习」放在每天第一个任务，优先清到期卡。')
    }
  }
  if (coverageGaps.length) concerns.push(`本周未覆盖（<5 分钟）：${coverageGaps.join('、')}。`)
  if (dm.tooHard > dm.right && dm.tooHard >= 3) suggestionsZh.push('反馈偏难偏多：已自动下调部分材料难度，任务也会拆得更小。')
  if (dm.tooEasy > dm.right && dm.tooEasy >= 3) suggestionsZh.push('反馈偏简单偏多：已自动上调材料难度与复习间隔。')

  if (suggestionsZh.length === 0) suggestionsZh.push('节奏健康：保持当前计划，注意休息日安排。')

  return {
    weekStartKey: weekStart, plannedMinutes, actualMinutes, eventsCount: weekEvents.length,
    coverage, coverageGaps, accuracy, accuracyBySkill: bySkill, dueCompletion, difficultyMatch: dm,
    improvements, concerns, suggestionsZh, dataSufficient,
  }
}

export function thisWeekStart(now = Date.now()): string {
  return weekStartKey(localDateKey(new Date(now)))
}
