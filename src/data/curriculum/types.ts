// 课程地图与每日配方类型。内容在第 31 天后由"周主题 + 内容库 + 复习状态"继续自动编排。
import type { ExerciseType, Language, Skill } from '../../types/content'

export interface WeekPlan {
  /** 1–24 */
  week: number
  language: Language
  /** 周主题（中文） */
  theme: string
  focusSkills: Skill[]
  /** 本周目标（中文，具体可检验） */
  goalsZh: string[]
  /** 本周建议总投入分钟数（该语言） */
  recommendedMinutes: number
  /** 检查点：周末自查（中文） */
  checkpoint: string
  /** 本周重点错误标签（可选） */
  errorFocus?: string[]
}

export interface RecipeSlot {
  kind: 'srs' | 'new-vocab' | 'exercise' | 'diagnostic' | 'checkpoint'
  language: Language
  skill?: Skill
  exerciseTypes?: ExerciseType[]
  minutes: number
  labelZh: string
}

export interface DayRecipe {
  /** 1–30 */
  day: number
  slots: RecipeSlot[]
}

/** 第 31 天以后按周循环的模式（周一~周日），结合当周周主题使用 */
export interface WeeklyPattern {
  /** 0=周一 … 6=周日 */
  weekday: number
  slots: RecipeSlot[]
}
