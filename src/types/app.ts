// 应用状态模型：设置、学习事件、卡片状态、技能状态、计划、反馈、调整记录。
import type { ErrorTag, ExerciseType, Language, Skill } from './content'

export interface Settings {
  appName: string
  examType: 'academic' | 'general'
  /** YYYY-MM-DD（本地时区） */
  examDate: string
  dailyMinutes: number
  /** 英语优先级 0–100，西语 = 100 − 英语 */
  priorityEn: number
  skillSelfRatings: Partial<Record<Language, Partial<Record<Skill, 'weak' | 'average' | 'strong'>>>>
  ttsEnabled: boolean
  /** 默认 false；浏览器语音识别可能依赖厂商在线服务 */
  speechRecognitionEnabled: boolean
  onboarded: boolean
  startedAt: string
  /** 今日模式覆盖：auto 按时间预算 */
  dayModeOverride: 'auto' | 'minimum' | 'standard' | 'sprint'
  diagnosticsDone: Partial<Record<Language, boolean>>
  /** 随机种子盐，保证计划可复现且每人不同 */
  seedSalt: string
}

export const DEFAULT_SETTINGS: Settings = {
  appName: 'Lingua Loop',
  examType: 'academic',
  examDate: '',
  dailyMinutes: 60,
  priorityEn: 70,
  skillSelfRatings: {},
  ttsEnabled: true,
  speechRecognitionEnabled: false,
  onboarded: false,
  startedAt: '',
  dayModeOverride: 'auto',
  diagnosticsDone: {},
  seedSalt: 'default',
}

export type SelfDifficulty = 'too-easy' | 'right' | 'too-hard'
export type SelfValue = 'useful' | 'neutral' | 'not-useful'
export type Energy = 'good' | 'ok' | 'tired'

/** 一条学习事件：每次训练（或一张卡、一道题）至少落一条 */
export interface LearningEvent {
  id: string
  ts: number
  language: Language
  skill: Skill
  exerciseType: ExerciseType
  contentId: string
  /** 客观题正确与否（适用时） */
  correct?: boolean
  /** 0–1 得分（适用时） */
  score?: number
  secondsSpent: number
  hintsUsed: number
  answerChanges?: number
  selfDifficulty?: SelfDifficulty
  selfValue?: SelfValue
  energy?: Energy
  errorTags: ErrorTag[]
  note?: string
  contentVersion: number
  detail?: {
    questionResults?: { qid: string; correct: boolean; chosen: number; seconds: number }[]
    wordCount?: number
    minutes?: number
    selfEvalScores?: { dimension: string; score: number }[]
    recordedSeconds?: number
    cardGrade?: number
    mode?: string
  }
}

/** SRS 卡片状态（SM-2 风格） */
export interface CardState {
  /** 内容 ID */
  id: string
  ease: number
  intervalDays: number
  reps: number
  lapses: number
  /** 到期时间戳；null = 尚未开始学 */
  dueAt: number | null
  lastGrade?: number
  lastReviewedAt?: number
  addedAt: number
  suspended?: boolean
}

export type MasteryConfidence = 'insufficient' | 'low' | 'medium' | 'high'

export interface SkillState {
  /** `${language}:${skill}`（存储主键） */
  id?: string
  language: Language
  skill: Skill
  events: number
  lastTrainedAt?: number
  /** 近期表现 EWMA（0–1） */
  ewmaPerf: number
  /** 内容难度瞄准偏移（由反馈调节，-1..1） */
  targetDifficultyOffset: number
  /** 诊断建立的初始先验（0–100），无则 50 */
  prior: number
}

export type TaskKind = 'srs-review' | 'new-vocab' | 'exercise' | 'diagnostic' | 'checkpoint' | 'rest'

export interface PlannedTask {
  id: string
  kind: TaskKind
  language: Language
  skill: Skill
  exerciseType?: ExerciseType
  /** 具体内容（练习/新词卡/诊断） */
  contentIds?: string[]
  /** 估计分钟 */
  estMinutes: number
  /** 为什么安排它（可解释性） */
  reasons: string[]
  status: 'pending' | 'done' | 'skipped'
  /** 0–100 */
  progress?: number
  /** 低认知负荷任务（疲惫时优先） */
  lowLoad?: boolean
}

export type DayMode = 'minimum' | 'standard' | 'sprint'

export interface DailyPlan {
  /** 本地日期 YYYY-MM-DD */
  date: string
  mode: DayMode
  generatedAt: number
  tasks: PlannedTask[]
  notes: string[]
}

/** 任务结束后的微反馈 */
export interface TaskFeedback {
  ts: number
  language: Language
  skill: Skill
  exerciseType: ExerciseType
  contentIds: string[]
  difficulty: SelfDifficulty
  value: SelfValue
  energy: Energy
  stuckNote?: string
}

/** 引擎做出的可解释调整记录 */
export interface Adjustment {
  id: string
  ts: number
  kind: 'card-ease' | 'skill-difficulty' | 'type-deprioritize' | 'plan-note'
  description: string
  /** 调整何时失效 */
  expiresAt?: number
  payload?: Record<string, unknown>
}

export interface WritingDraft {
  id: string
  exerciseId: string
  language: Language
  text: string
  createdAt: number
  updatedAt: number
  /** 修订历史（初稿 vs 修改稿对比用） */
  history: { ts: number; text: string; label: string }[]
  selfEvalScores?: { dimension: string; score: number }[]
  externalFeedback?: string
}

export interface RecordingMeta {
  id: string
  exerciseId: string
  language: Language
  ts: number
  seconds: number
  sizeBytes: number
  note?: string
}

export interface ContentIssue {
  level: 'error' | 'warning'
  id: string
  field?: string
  message: string
}
