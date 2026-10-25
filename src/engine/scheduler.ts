// 每日任务编排器：确定性、可解释、可测试。
// 输入真实状态（到期卡、近期事件、掌握度、课程进度），输出带理由的 DailyPlan。
import type { Adjustment, CardState, DailyPlan, DayMode, LearningEvent, PlannedTask, Settings, SkillState } from '../types/app'
import type { Exercise, Language, Skill } from '../types/content'
import { dayNumber, daysBetween, localDateKey } from './dates'
import { seededRandom, seededShuffle } from './seed'
import { sortDue } from './srs'
import { computeMastery, type MasteryResult } from './mastery'
import { activeDeprioritizations } from './feedback'
import { dayRecipes, weeklyPatterns } from '../data/curriculum/recipes'
import { enWeeks } from '../data/curriculum/en-weeks'
import { esWeeks } from '../data/curriculum/es-weeks'
import type { RecipeSlot, WeekPlan } from '../data/curriculum/types'

export interface SchedulerInput {
  settings: Settings
  dateKey: string // 本地 YYYY-MM-DD
  now: number
  cardStates: CardState[]
  allExercises: Exercise[] // 内置 + 用户导入
  events: LearningEvent[] // 全部事件（用于冷却/错题/掌握度）
  skillStates: SkillState[]
  adjustments: Adjustment[]
  vocabBatchSize?: number // 新词卡一次引入数量，默认 8
}

const REVIEW_MINUTES_PER_CARD = 0.5
const COOLDOWN_DAYS = 7

function taskSeq(dateKey: string, salt: string, i: number): string {
  return `${dateKey}:${salt}:${i}`
}

/** 目标难度：由掌握度 + 用户反馈偏移推算（1–5） */
function targetDifficulty(m: MasteryResult | undefined, ss: SkillState | undefined): number {
  const mastery = m?.value ?? 50
  const offset = ss?.targetDifficultyOffset ?? 0
  const base = Math.max(1, Math.min(5, Math.round(1 + (mastery / 100) * 4)))
  return Math.max(1, Math.min(5, Math.round(base + offset)))
}

function recentUseMap(events: LearningEvent[], now: number): Map<string, number> {
  const m = new Map<string, number>()
  for (const ev of events) {
    const prev = m.get(ev.contentId)
    if (prev == null || ev.ts > prev) m.set(ev.contentId, ev.ts)
  }
  return m
}

/** 内容选择：难度接近目标 → 冷却之外 → 最久未用 → 确定性打散 */
function pickExercise(
  pool: Exercise[],
  target: number,
  usedRecently: Map<string, number>,
  rng: () => number,
  cooldownDays: number,
  now: number
): Exercise | undefined {
  if (pool.length === 0) return undefined
  const cooled = pool.filter((e) => {
    const last = usedRecently.get(e.id)
    return last == null || now - last > cooldownDays * 86400000
  })
  const candidates = cooled.length > 0 ? cooled : pool // 全部冷却中则放宽（按最久未用）
  const byDist = [...candidates].sort(
    (a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target)
  )
  const bestDist = Math.abs(byDist[0].difficulty - target)
  const tier = byDist.filter((e) => Math.abs(e.difficulty - target) <= bestDist + 1)
  const shuffled = seededShuffle(tier, rng)
  shuffled.sort((a, b) => (usedRecently.get(a.id) ?? 0) - (usedRecently.get(b.id) ?? 0))
  return shuffled[0]
}

function skillLabelZh(skill: string): string {
  const map: Record<string, string> = { reading: '阅读', listening: '听力', writing: '写作', speaking: '口语', vocab: '词汇', grammar: '语法' }
  return map[skill] ?? skill
}

function langLabelZh(lang: string): string {
  return lang === 'en' ? '英语' : '西语'
}

export function currentWeekPlan(language: Language, day: number): WeekPlan {
  const weeks = language === 'en' ? enWeeks : esWeeks
  const idx = Math.min(weeks.length - 1, Math.max(0, Math.floor((day - 1) / 7)))
  return weeks[idx]
}

/** 计算某语言某技能的掌握度（带缓存语义的轻量重复计算） */
function masteryOf(language: Language, skill: Skill, events: LearningEvent[], skillStates: SkillState[], now: number): MasteryResult {
  const ss = skillStates.find((s) => s.language === language && s.skill === skill)
  return computeMastery(language, skill, events, ss?.prior ?? 50, now)
}

/** 近 7 天某技能客观正确率；null = 无数据 */
function recentAccuracy(language: Language, skill: Skill, events: LearningEvent[], now: number): number | null {
  const rel = events.filter(
    (e) => e.language === language && e.skill === skill && e.correct != null && now - e.ts < 7 * 86400000
  )
  if (rel.length < 3) return null
  return rel.filter((e) => e.correct).length / rel.length
}

export function buildDailyPlan(input: SchedulerInput): DailyPlan {
  const { settings, dateKey, now, cardStates, allExercises, events, skillStates, adjustments } = input
  const notes: string[] = []
  const tasks: PlannedTask[] = []

  // 1) 模式与时间预算
  let mode: DayMode
  if (settings.dayModeOverride === 'minimum') mode = 'minimum'
  else if (settings.dayModeOverride === 'sprint') mode = 'sprint'
  else if (settings.dayModeOverride === 'standard') mode = 'standard'
  else mode = 'standard'
  const budget =
    mode === 'minimum' ? Math.min(10, settings.dailyMinutes || 10)
    : mode === 'sprint' ? Math.min(180, Math.round(settings.dailyMinutes * 1.5))
    : settings.dailyMinutes

  const day = dayNumber(settings.startedAt || dateKey, dateKey)
  const enWeek = currentWeekPlan('en', day)
  const esWeek = currentWeekPlan('es', day)

  // 2) 疲劳检测：今天已有疲惫反馈 → 建议轻量
  const todayStart = now - ((now + new Date(now).getTimezoneOffset() * 60000) % 86400000)
  const tiredToday = events.some((e) => e.energy === 'tired' && e.ts >= todayStart - 86400000 && now - e.ts < 5 * 3600000)
  if (tiredToday) {
    notes.push('检测到你今天反馈过疲惫：优先安排低认知负荷任务，随时可以「今天先到这里」。')
  }

  // 3) 到期复习置顶（SRS 承诺优先）
  const depri = activeDeprioritizations(adjustments, now)
  const depriTypes = new Set(depri.map((a) => (a.payload as { exerciseType?: string })?.exerciseType).filter(Boolean))
  let used = 0
  const reviewCap = mode === 'minimum' ? Math.min(16, budget / REVIEW_MINUTES_PER_CARD) : Math.min(30, Math.ceil(budget * 0.4) / REVIEW_MINUTES_PER_CARD)
  for (const lang of ['en', 'es'] as Language[]) {
    const due = sortDue(cardStates.filter((s) => s.id.startsWith(lang === 'en' ? 'en-' : 'es-')), now)
    if (due.length === 0) continue
    const take = due.slice(0, Math.ceil(reviewCap * (lang === 'en' ? settings.priorityEn / 100 : 1 - settings.priorityEn / 100) || 1))
    const ids = take.map((s) => s.id)
    if (ids.length === 0) continue
    const est = Math.max(2, Math.round(ids.length * REVIEW_MINUTES_PER_CARD))
    const mostOverdue = Math.max(...take.map((s) => Math.floor((now - (s.dueAt ?? now)) / 86400000)))
    const heavy = take.filter((s) => s.lapses >= 2).length
    tasks.push({
      id: `srs-${lang}-${dateKey}`,
      kind: 'srs-review',
      language: lang,
      skill: 'vocab',
      contentIds: ids,
      estMinutes: est,
      reasons: [
        `${ids.length} 张${langLabelZh(lang)}词卡到期`,
        ...(mostOverdue > 0 ? [`最久的已过期 ${mostOverdue} 天`] : []),
        ...(heavy > 0 ? [`${heavy} 张是反复出错的弱点卡`] : []),
      ],
      status: 'pending',
      lowLoad: true,
    })
    used += est
  }

  // 4) 选择配方：前 30 天用每日配方，之后按星期模式 + 当周主题
  let slots: RecipeSlot[]
  let basis: string
  if (day <= 30) {
    slots = dayRecipes[day - 1]?.slots ?? weeklyPatterns[new Date(now).getDay()]?.slots ?? []
    basis = `第 ${day} 天配方`
  } else {
    const weekday = (dateKeyToDateDow(dateKey) + 6) % 7
    slots = weeklyPatterns[weekday]?.slots ?? []
    basis = `第 31+ 天 · ${langLabelZh('en')}第 ${enWeek.week} 周（${enWeek.theme}）/ ${langLabelZh('es')}第 ${esWeek.week} 周（${esWeek.theme}）`
  }
  notes.push(`今日编排依据：${basis}${day <= 30 ? `；本周主题：${enWeek.theme} / ${esWeek.theme}` : ''}`)

  // 考试倒计时
  if (settings.examDate) {
    const left = daysBetween(dateKey, settings.examDate)
    if (left > 0) notes.push(`距 IELTS 目标日期还有 ${left} 天。`)
  }

  // 5) 逐槽实例化
  const usedRecently = recentUseMap(events, now)
  const seenCards = new Set(cardStates.map((s) => s.id))
  const batchSize = input.vocabBatchSize ?? 8
  let slotIdx = 0

  for (const s of slots) {
    if (mode === 'minimum' && used >= budget) break
    if (used + s.minutes > budget + 4) continue // 超预算的槽跳过（srs 已置顶）
    const rng = seededRandom(taskSeq(dateKey, settings.seedSalt, slotIdx++))
    const week = s.language === 'en' ? enWeek : esWeek

    if (s.kind === 'diagnostic') {
      const done = settings.diagnosticsDone[s.language as 'en' | 'es']
      if (done) continue
      const diag = allExercises.find((e) => e.type === 'diagnostic' && e.language === s.language)
      if (!diag) continue
      tasks.push({
        id: `diag-${s.language}-${dateKey}`,
        kind: 'diagnostic',
        language: s.language,
        skill: 'vocab',
        contentIds: [diag.id],
        estMinutes: s.minutes,
        reasons: [`首次${langLabelZh(s.language)}微诊断：建立四项基线，之后任务会按结果调整`],
        status: 'pending',
      })
      used += s.minutes
      continue
    }

    if (s.kind === 'checkpoint') {
      const weekEnd = (s.language === 'en' ? enWeek : esWeek).checkpoint
      tasks.push({
        id: `cp-${s.language}-${dateKey}`,
        kind: 'checkpoint',
        language: s.language,
        skill: s.skill ?? 'reading',
        estMinutes: s.minutes,
        reasons: [`周检查点：${weekEnd}`],
        status: 'pending',
        lowLoad: true,
      })
      used += s.minutes
      continue
    }

    if (s.kind === 'new-vocab') {
      const fresh = allExercises
        .filter((e) => e.language === s.language && e.type === 'vocab-card' && !seenCards.has(e.id))
        .sort((a, b) => a.id.localeCompare(b.id))
      const n = Math.max(3, Math.min(batchSize, Math.round(s.minutes)))
      const picked = fresh.slice(0, n)
      if (picked.length === 0) {
        // 词库用尽：转为复习或提示
        notes.push(`${langLabelZh(s.language)}新词卡已全部引入，后续以复习巩固为主。`)
        continue
      }
      tasks.push({
        id: `nv-${s.language}-${dateKey}-${slotIdx}`,
        kind: 'new-vocab',
        language: s.language,
        skill: 'vocab',
        exerciseType: 'vocab-card',
        contentIds: picked.map((p) => p.id),
        estMinutes: Math.max(3, picked.length),
        reasons: [
          `新词卡 ${picked.length} 张（本周主题：${week.theme}）`,
          `当前${langLabelZh(s.language)}词库累计已引入 ${seenCards.size ? Array.from(seenCards).filter((x) => x.startsWith(s.language === 'en' ? 'en-' : 'es-')).length : 0} 张`,
        ],
        status: 'pending',
        lowLoad: true,
      })
      used += Math.max(3, picked.length)
      continue
    }

    // exercise 槽
    const skill = s.skill ?? 'reading'
    const mastery = masteryOf(s.language, skill, events, skillStates, now)
    const ss = skillStates.find((x) => x.language === s.language && x.skill === skill)
    const target = targetDifficulty(mastery, ss)
    let types = s.exerciseTypes
    // GT 模式下 Task 1 优先书信
    if (s.language === 'en' && skill === 'writing' && settings.examType === 'general') {
      types = ['writing-task']
    }
    let pool = allExercises.filter(
      (e) =>
        e.language === s.language &&
        e.skill === skill &&
        (types == null || types.includes(e.type)) &&
        !depriTypes.has(e.type) &&
        (s.language !== 'en' || skill !== 'writing' || settings.examType !== 'general' || (e as { variant?: string }).variant !== 'ielts-t1-academic')
    )
    if (pool.length === 0 && types != null) {
      pool = allExercises.filter((e) => e.language === s.language && e.skill === skill && !depriTypes.has(e.type))
    }
    let cooldown = COOLDOWN_DAYS
    let pick = pickExercise(pool, target, usedRecently, rng, cooldown, now)
    if (!pick && pool.length > 0) {
      cooldown = Math.max(1, Math.floor(COOLDOWN_DAYS / 2))
      pick = pickExercise(pool, target, usedRecently, rng, cooldown, now)
    }
    if (!pick) {
      notes.push(`${langLabelZh(s.language)}「${skillLabelZh(skill)}」当前筛选条件下暂无可用内容，已跳过该槽（可在内容库查看余量）。`)
      continue
    }
    // GT 模式：academic T1 被选中时替换为 GT 书信（如可用）
    if (
      s.language === 'en' && skill === 'writing' && settings.examType === 'general' &&
      (pick as { variant?: string }).variant === 'ielts-t1-academic'
    ) {
      const gt = allExercises.find((e) => (e as { variant?: string }).variant === 'ielts-t1-general')
      if (gt) pick = gt
    }
    const reasons: string[] = [
      `${langLabelZh(s.language)}${skillLabelZh(skill)} · ${pick.topic} 主题（本周：${week.theme}）`,
      `难度 ${pick.difficulty}/5，瞄准你当前水平（掌握度 ${mastery.value}/100${mastery.confidence === 'insufficient' ? '，样本还少' : ''}）`,
    ]
    const acc = recentAccuracy(s.language, skill, events, now)
    if (acc != null && acc < 0.65) reasons.push(`近 7 天该技能正确率 ${Math.round(acc * 100)}%，低于目标线，安排加强训练`)
    if (mastery.staleDays != null && mastery.staleDays >= 5) reasons.push(`${mastery.staleDays} 天没有练过这个技能`)
    tasks.push({
      id: `ex-${s.language}-${pick.id}-${dateKey}`,
      kind: 'exercise',
      language: s.language,
      skill,
      exerciseType: pick.type,
      contentIds: [pick.id],
      estMinutes: s.minutes,
      reasons,
      status: 'pending',
      lowLoad: skill === 'listening',
    })
    used += s.minutes
  }

  // 6) 疲惫时重排：低负荷任务提前
  if (tiredToday) {
    tasks.sort((a, b) => Number(b.lowLoad ?? false) - Number(a.lowLoad ?? false))
  }

  // 7) 保底日兜底：至少 1 个任务
  if (tasks.length === 0) {
    const anyVocab = allExercises.find((e) => e.type === 'vocab-card')
    if (anyVocab) {
      tasks.push({
        id: `fallback-${dateKey}`,
        kind: 'new-vocab',
        language: anyVocab.language,
        skill: 'vocab',
        exerciseType: 'vocab-card',
        contentIds: [anyVocab.id],
        estMinutes: 3,
        reasons: ['今天没有其他可安排内容，先认识 1 张卡，保持连续性'],
        status: 'pending',
        lowLoad: true,
      })
    } else {
      notes.push('内容库为空：请先导入或补充内容（设置 → 内容库）。')
    }
  }

  return { date: dateKey, mode, generatedAt: now, tasks, notes }
}

function dateKeyToDateDow(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

/** 明日预览（用于今日复盘"明天优先做什么"） */
export function previewTomorrow(input: SchedulerInput): string[] {
  const tomorrow = localDateKey(new Date(input.now + 86400000))
  const plan = buildDailyPlan({ ...input, dateKey: tomorrow, now: input.now + 86400000 })
  return plan.tasks.slice(0, 3).map((t) => t.reasons[0] ?? t.id)
}

/** 错题再练集合：从近期错误事件收集可重练的选择题内容 */
export function errorRetrainSet(events: LearningEvent[], allExercises: Exercise[], now = Date.now(), limit = 6): Exercise[] {
  const wrong = new Map<string, number>()
  for (const ev of events) {
    if (ev.correct === false && now - ev.ts < 21 * 86400000) {
      wrong.set(ev.contentId, (wrong.get(ev.contentId) ?? 0) + 1)
    }
  }
  const ids = [...wrong.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id)
  return ids.map((id) => allExercises.find((e) => e.id === id)).filter((e): e is Exercise => e != null)
}
