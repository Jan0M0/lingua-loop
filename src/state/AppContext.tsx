// 全局应用状态：启动加载、动作封装。UI 只调用动作，不直接碰存储细节。
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  Adjustment,
  CardState,
  DailyPlan,
  LearningEvent,
  PlannedTask,
  RecordingMeta,
  Settings,
  SkillState,
  TaskFeedback,
  WritingDraft,
} from '../types/app'
import { DEFAULT_SETTINGS } from '../types/app'
import type { Exercise } from '../types/content'
import type { ErrorTag } from '../types/content'
import { builtInExercises } from '../content/registry'
import { buildDailyPlan, previewTomorrow } from '../engine/scheduler'
import { applyEaseDelta, applyFeedback, applySkillOffset } from '../engine/feedback'
import { gradeCard, newCardState, performanceToGrade } from '../engine/srs'
import { updateSkillState } from '../engine/mastery'
import { mergeTags } from '../engine/feedback-parser'
import { applyConfirmedFeedback } from '../storage/feedback-tags'
import { localDateKey } from '../engine/dates'
import * as db from '../storage/db'

export interface AppState {
  ready: boolean
  dbError: string | null
  settings: Settings
  events: LearningEvent[]
  cardStates: CardState[]
  skillStates: SkillState[]
  adjustments: Adjustment[]
  customContent: Exercise[]
  drafts: WritingDraft[]
  recordings: RecordingMeta[]
  plan: DailyPlan | null
  allExercises: Exercise[]
  storageEstimate: { usage: number; quota: number } | null
}

export interface AppActions {
  updateSettings(patch: Partial<Settings>): Promise<void>
  ensureTodayPlan(force?: boolean): Promise<DailyPlan | null>
  recordEvent(ev: LearningEvent): Promise<void>
  /** 用户手动编辑记录：备注与错误标签（§8.6 / §5.D 外部反馈确认后落库） */
  updateEvent(id: string, patch: { note?: string; errorTags?: string[] }): Promise<void>
  removeEvent(id: string): Promise<void>
  /** 把用户在外部反馈解析面板里确认的标签/行动项写进该写作任务最近一次事件，并记在草稿上 */
  applyDraftFeedbackTags(exerciseId: string, tags: ErrorTag[], actions?: string[]): Promise<{ eventId: string | null; note: string }>
  reviewCard(cardId: string, grade: 0 | 1 | 2 | 3, seconds: number, extra?: Partial<LearningEvent>): Promise<void>
  markTask(taskId: string, status: PlannedTask['status']): Promise<void>
  submitFeedback(fb: TaskFeedback): Promise<void>
  saveDraft(d: WritingDraft): Promise<void>
  removeDraft(id: string): Promise<void>
  addRecording(meta: RecordingMeta, blob: Blob): Promise<void>
  removeRecording(id: string): Promise<void>
  importCustomContent(items: Exercise[]): Promise<{ skipped: number; written: number }>
  setSkillPriors(language: 'en' | 'es', priors: Partial<Record<string, number>>): Promise<void>
  saveHighlightAsCard(highlight: { expression: string; glossZh: string; fromStory: string; extraExample?: string }, storyId: string): Promise<string | null>
  tomorrowPreview(): string[]
  refreshStorage(): Promise<void>
}

const StateCtx = createContext<AppState | null>(null)
const ActionsCtx = createContext<AppActions | null>(null)

export function useAppState(): AppState {
  const v = useContext(StateCtx)
  if (!v) throw new Error('AppProvider missing')
  return v
}

export function useActions(): AppActions {
  const v = useContext(ActionsCtx)
  if (!v) throw new Error('AppProvider missing')
  return v
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    ready: false,
    dbError: null,
    settings: { ...DEFAULT_SETTINGS },
    events: [],
    cardStates: [],
    skillStates: [],
    adjustments: [],
    customContent: [],
    drafts: [],
    recordings: [],
    plan: null,
    allExercises: [],
    storageEstimate: null,
  })

  const loadAll = useCallback(async () => {
    try {
      const [settings, events, cardStates, skillStates, adjustments, customContent, drafts, recordingsRaw, todayKey] =
        await Promise.all([
          db.getSettings(),
          db.getAllEvents(),
          db.getAllCardStates(),
          db.getAllSkillStates(),
          db.getAllAdjustments(),
          db.getAllCustomContent(),
          db.getAllDrafts(),
          db.getAllRecordings(),
          Promise.resolve(localDateKey()),
        ])
      const plan = await db.getPlan(todayKey)
      setState({
        ready: true,
        dbError: null,
        settings,
        events,
        cardStates,
        skillStates,
        adjustments,
        customContent,
        drafts,
        recordings: recordingsRaw.map(({ blob, ...meta }) => meta),
        plan: plan ?? null,
        allExercises: [...builtInExercises, ...customContent],
        storageEstimate: null,
      })
      if (navigator.storage?.estimate) {
        navigator.storage.estimate().then((e) => setState((s) => ({ ...s, storageEstimate: { usage: e.usage ?? 0, quota: e.quota ?? 0 } }))).catch(() => undefined)
      }
    } catch (err) {
      setState((s) => ({ ...s, ready: true, dbError: err instanceof Error ? err.message : String(err) }))
    }
  }, [])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  const actions = useMemo<AppActions>(() => {
    const regenerate = async (force: boolean): Promise<DailyPlan | null> => {
      const dateKey = localDateKey()
      const existing = await db.getPlan(dateKey)
      if (existing && !force) {
        setState((s) => (s.plan?.date === dateKey ? s : { ...s, plan: existing }))
        return existing
      }
      const [settings, events, cardStates, skillStates, adjustments, customContent] = await Promise.all([
        db.getSettings(),
        db.getAllEvents(),
        db.getAllCardStates(),
        db.getAllSkillStates(),
        db.getAllAdjustments(),
        db.getAllCustomContent(),
      ])
      const plan = buildDailyPlan({
        settings,
        dateKey,
        now: Date.now(),
        cardStates,
        allExercises: [...builtInExercises, ...customContent],
        events,
        skillStates,
        adjustments,
      })
      // 重排不能丢失当天已完成的任务状态（设置变更触发 force 重建时）：
      // 1) 新计划中同名/同内容任务继承状态；2) 已完成但被移出新计划的（如做完的诊断）追加保留。
      if (existing) {
        const altKey = (t: { kind: string; language: string; skill: string; contentIds?: string[] }) =>
          `${t.kind}:${t.language}:${t.skill}:${(t.contentIds ?? []).slice().sort().join(',')}`
        const oldById = new Map(existing.tasks.map((t) => [t.id, t]))
        const oldByAlt = new Map(existing.tasks.filter((t) => t.status !== 'pending').map((t) => [altKey(t), t]))
        plan.tasks = plan.tasks.map((t) => {
          const done = oldById.get(t.id) ?? oldByAlt.get(altKey(t))
          return done && done.status !== 'pending' ? { ...t, status: done.status } : t
        })
        const newIds = new Set(plan.tasks.map((t) => t.id))
        const newAltKeys = new Set(plan.tasks.map(altKey))
        const carried = existing.tasks.filter(
          (t) => t.status !== 'pending' && !newIds.has(t.id) && !newAltKeys.has(altKey(t))
        )
        if (carried.length) plan.tasks = [...plan.tasks, ...carried]
      }
      await db.savePlan(plan)
      setState((s) => ({ ...s, plan }))
      return plan
    }

    return {
      async updateSettings(patch) {
        const current = await db.getSettings()
        const next = { ...current, ...patch }
        await db.saveSettings(next)
        setState((s) => ({ ...s, settings: next }))
        // 目标/预算/优先级变化影响当天计划
        if (patch.dailyMinutes != null || patch.priorityEn != null || patch.dayModeOverride != null || patch.examType != null) {
          await regenerate(true)
        }
      },

      ensureTodayPlan: (force = false) => regenerate(force),

      async recordEvent(ev) {
        await db.addEvent(ev)
        const ss = state.skillStates.find((x) => x.language === ev.language && x.skill === ev.skill)
        const updated = updateSkillState(ss, ev.language, ev.skill, ev)
        await db.putSkillState(updated)
        setState((s) => ({
          ...s,
          events: [...s.events, ev],
          skillStates: ss
            ? s.skillStates.map((x) => (x.language === ev.language && x.skill === ev.skill ? updated : x))
            : [...s.skillStates, updated],
        }))
      },

      async reviewCard(cardId, grade, seconds, extra) {
        const now = Date.now()
        const existing = await (async () => {
          const all = await db.getAllCardStates()
          return all.find((c) => c.id === cardId)
        })()
        const prev = existing ?? newCardState(cardId, now)
        const next = gradeCard(prev, grade, now)
        await db.putCardState(next)
        const exercise = [...builtInExercises, ...state.customContent].find((e) => e.id === cardId)
        const ev: LearningEvent = {
          id: makeId('ev'),
          ts: now,
          language: (cardId.startsWith('en-') ? 'en' : 'es'),
          skill: 'vocab',
          exerciseType: 'vocab-card',
          contentId: cardId,
          correct: grade > 0,
          secondsSpent: seconds,
          hintsUsed: 0,
          errorTags: grade === 0 ? ['meaning'] : [],
          contentVersion: exercise?.contentVersion ?? 1,
          ...extra,
          detail: { cardGrade: grade, ...(extra?.detail ?? {}) },
        }
        setState((s) => ({
          ...s,
          cardStates: s.cardStates.some((c) => c.id === cardId)
            ? s.cardStates.map((c) => (c.id === cardId ? next : c))
            : [...s.cardStates, next],
        }))
        await actions.recordEvent(ev)
      },

      async updateEvent(id, patch) {
        const all = await db.getAllEvents()
        const ev = all.find((x) => x.id === id)
        if (!ev) return
        const next: LearningEvent = {
          ...ev,
          note: patch.note !== undefined ? patch.note.trim() || undefined : ev.note,
          errorTags: patch.errorTags !== undefined ? mergeTags([], patch.errorTags) : ev.errorTags,
        }
        await db.putEvent(next)
        setState((s) => ({ ...s, events: s.events.map((x) => (x.id === id ? next : x)) }))
      },

      async removeEvent(id) {
        await db.deleteEvent(id)
        setState((s) => ({ ...s, events: s.events.filter((x) => x.id !== id) }))
      },

      async applyDraftFeedbackTags(exerciseId, tags, actions = []) {
        const outcome = await applyConfirmedFeedback(exerciseId, tags, actions)
        if (outcome.event || outcome.draft) {
          setState((s) => ({
            ...s,
            events: outcome.event ? s.events.map((x) => (x.id === outcome.event!.id ? outcome.event! : x)) : s.events,
            drafts: outcome.draft
              ? s.drafts.some((d) => d.id === outcome.draft!.id)
                ? s.drafts.map((d) => (d.id === outcome.draft!.id ? outcome.draft! : d))
                : [...s.drafts, outcome.draft!]
              : s.drafts,
          }))
        }
        return { eventId: outcome.event?.id ?? null, note: outcome.note }
      },

      async markTask(taskId, status) {
        const dateKey = localDateKey()
        const plan = state.plan?.date === dateKey ? state.plan : await db.getPlan(dateKey)
        if (!plan) return
        const updated: DailyPlan = {
          ...plan,
          tasks: plan.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
        }
        await db.savePlan(updated)
        setState((s) => ({ ...s, plan: updated }))
      },

      async submitFeedback(fb) {
        const outcome = applyFeedback(fb, { events: state.events, adjustments: state.adjustments })
        for (const a of outcome.adjustments) await db.addAdjustment(a)
        const cardUpdates: CardState[] = []
        for (const [cid, delta] of Object.entries(outcome.cardEaseDelta)) {
          const c = state.cardStates.find((x) => x.id === cid)
          if (c) cardUpdates.push(applyEaseDelta(c, delta))
        }
        if (cardUpdates.length) await db.putCardStates(cardUpdates)
        const skillUpdates: SkillState[] = []
        for (const u of outcome.skillUpdates) {
          const ss = state.skillStates.find((x) => x.language === u.language && x.skill === u.skill)
          if (ss) skillUpdates.push(applySkillOffset(ss, u.targetDifficultyOffsetDelta))
        }
        for (const su of skillUpdates) await db.putSkillState(su)
        // 疲惫 → 当天剩余任务低负荷优先
        let plan = state.plan
        if (outcome.sameDayLightLoad && plan) {
          const sorted = [...plan.tasks].sort(
            (a, b) => Number(b.lowLoad ?? false) - Number(a.lowLoad ?? false)
          )
          plan = { ...plan, tasks: sorted, notes: [...plan.notes, '已按你的疲惫反馈调整：剩余任务低负荷优先。'] }
          await db.savePlan(plan)
        }
        setState((s) => ({
          ...s,
          adjustments: [...s.adjustments, ...outcome.adjustments],
          cardStates: s.cardStates.map((c) => cardUpdates.find((u) => u.id === c.id) ?? c),
          skillStates: s.skillStates.map((x) => skillUpdates.find((u) => u.id === x.id) ?? x),
          plan: plan ?? s.plan,
        }))
      },

      async saveDraft(d) {
        await db.saveDraft(d)
        setState((s) => ({
          ...s,
          drafts: s.drafts.some((x) => x.id === d.id) ? s.drafts.map((x) => (x.id === d.id ? d : x)) : [...s.drafts, d],
        }))
      },

      async removeDraft(id) {
        await db.deleteDraft(id)
        setState((s) => ({ ...s, drafts: s.drafts.filter((d) => d.id !== id) }))
      },

      async addRecording(meta, blob) {
        await db.saveRecording(meta, blob)
        setState((s) => ({ ...s, recordings: [...s.recordings, meta] }))
        await actions.refreshStorage()
      },

      async removeRecording(id) {
        await db.deleteRecording(id)
        setState((s) => ({ ...s, recordings: s.recordings.filter((r) => r.id !== id) }))
        await actions.refreshStorage()
      },

      async importCustomContent(items) {
        const res = await db.putCustomContent(items, 'skip')
        const custom = await db.getAllCustomContent()
        setState((s) => ({ ...s, customContent: custom, allExercises: [...builtInExercises, ...custom] }))
        return res
      },

      async saveHighlightAsCard(highlight, storyId) {
        const id = `voc-${storyId}-${highlight.expression.toLowerCase().replace(/[^a-zà-ÿ0-9]+/g, '-').slice(0, 24)}`
        const existing = [...builtInExercises, ...state.customContent].find((e) => e.id === id)
        if (existing) return id
        const card = {
          id,
          language: (storyId.startsWith('en-') ? 'en' : 'es') as 'en' | 'es',
          skill: 'vocab' as const,
          type: 'vocab-card' as const,
          topic: 'general',
          difficulty: 2 as const,
          estimatedMinutes: 1,
          tags: ['from-story'],
          createdAt: localDateKey(),
          contentVersion: 1,
          source: 'user-imported' as const,
          license: `来自故事 ${storyId} 的表达收藏`,
          term: highlight.expression,
          pos: 'expression',
          glossZh: highlight.glossZh,
          definition: highlight.fromStory,
          collocations: [highlight.fromStory, highlight.extraExample ?? highlight.fromStory],
          examples: [
            { sentence: highlight.fromStory, zh: highlight.glossZh },
            { sentence: highlight.extraExample ?? highlight.fromStory, zh: highlight.glossZh },
          ],
          commonError: undefined,
        }
        await db.putCustomContent([card], 'skip')
        const custom = await db.getAllCustomContent()
        setState((s) => ({ ...s, customContent: custom, allExercises: [...builtInExercises, ...custom] }))
        // 立即进入 SRS（明天到期复习）
        await actions.reviewCard(id, 2, 30, { detail: { mode: 'introduce' } })
        return id
      },

      async setSkillPriors(language, priors) {
        for (const [skill, prior] of Object.entries(priors)) {
          if (typeof prior !== 'number') continue
          const existing = await db.getAllSkillStates()
          const ss = existing.find((x) => x.language === language && x.skill === skill)
          const next = {
            id: `${language}:${skill}`,
            language: language as 'en' | 'es',
            skill: skill as SkillState['skill'],
            events: ss?.events ?? 0,
            ewmaPerf: ss?.ewmaPerf ?? prior / 100,
            targetDifficultyOffset: ss?.targetDifficultyOffset ?? 0,
            prior,
          }
          await db.putSkillState(next)
          setState((s) => ({
            ...s,
            skillStates: s.skillStates.some((x) => x.language === language && x.skill === skill)
              ? s.skillStates.map((x) => (x.language === language && x.skill === skill ? next : x))
              : [...s.skillStates, next],
          }))
        }
      },

      tomorrowPreview() {
        return previewTomorrow({
          settings: state.settings,
          dateKey: localDateKey(),
          now: Date.now(),
          cardStates: state.cardStates,
          allExercises: state.allExercises,
          events: state.events,
          skillStates: state.skillStates,
          adjustments: state.adjustments,
        })
      },

      async refreshStorage() {
        if (navigator.storage?.estimate) {
          try {
            const e = await navigator.storage.estimate()
            setState((s) => ({ ...s, storageEstimate: { usage: e.usage ?? 0, quota: e.quota ?? 0 } }))
          } catch {
            /* ignore */
          }
        }
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <StateCtx.Provider value={state}>
      <ActionsCtx.Provider value={actions}>{children}</ActionsCtx.Provider>
    </StateCtx.Provider>
  )
}

/** 由答题表现推导 SRS 等级（供运行器使用） */
export function gradeFromPerformance(correct: boolean, selfDifficulty?: LearningEvent['selfDifficulty'], hinted?: boolean): 0 | 1 | 2 | 3 {
  return performanceToGrade({ correct, selfDifficulty, hinted })
}
