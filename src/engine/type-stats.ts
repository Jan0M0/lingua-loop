// 分题型统计：正确率与作答速度（§5.B「记录每种题型正确率与耗时，可分开看速度和准确度」）。
// 只用品类内已有的事件数据；没有题型标记的旧记录不计入，并在 UI 里如实说明。
import type { LearningEvent } from '../types/app'
import type { Language, Skill } from '../types/content'

export const QUESTION_TYPE_LABEL: Record<string, string> = {
  'main-idea': '主旨',
  detail: '细节',
  inference: '推断',
  attitude: '作者态度',
  matching: '段落匹配',
  paraphrase: '同义改写',
  structure: '篇章结构',
  grammar: '语法',
  vocab: '词汇',
  'listening-detail': '听力细节',
  'listening-inference': '听力推断',
}

export interface TypeStat {
  type: string
  label: string
  attempts: number
  correct: number
  /** 0–1 */
  accuracy: number
  /** 平均每题用时（秒）；没有有效计时则为 null */
  avgSeconds: number | null
}

export interface TypeStatsOptions {
  language: Language
  /** 默认为阅读 + 听力 */
  skills?: Skill[]
  /** 低于该作答量时 UI 应标注「样本少」 */
  minAttempts?: number
}

const DEFAULT_SKILLS: Skill[] = ['reading', 'listening']

/**
 * 按题型聚合正确率与平均用时。
 * 说明：每题用时为「上一题作答到本题作答」的间隔（运行器侧估算），不是逐题秒表。
 */
export function questionTypeStats(events: LearningEvent[], opts: TypeStatsOptions): TypeStat[] {
  const skills = opts.skills ?? DEFAULT_SKILLS
  const bucket = new Map<string, { attempts: number; correct: number; secondsSum: number; timed: number }>()

  for (const ev of events) {
    if (ev.language !== opts.language) continue
    if (!skills.includes(ev.skill)) continue
    for (const q of ev.detail?.questionResults ?? []) {
      const type = q.questionType
      if (!type) continue
      const b = bucket.get(type) ?? { attempts: 0, correct: 0, secondsSum: 0, timed: 0 }
      b.attempts += 1
      if (q.correct) b.correct += 1
      if (typeof q.seconds === 'number' && q.seconds > 0) {
        b.secondsSum += q.seconds
        b.timed += 1
      }
      bucket.set(type, b)
    }
  }

  return [...bucket.entries()]
    .map(([type, b]) => ({
      type,
      label: QUESTION_TYPE_LABEL[type] ?? type,
      attempts: b.attempts,
      correct: b.correct,
      accuracy: b.attempts ? b.correct / b.attempts : 0,
      avgSeconds: b.timed ? Math.round(b.secondsSum / b.timed) : null,
    }))
    .sort((a, b) => b.attempts - a.attempts || a.type.localeCompare(b.type))
}

/** 找出「最慢」和「最易错」的题型，用于一句话结论；样本不足返回空数组 */
export function typeStatsHighlights(stats: TypeStat[], minAttempts = 5): string[] {
  const enough = stats.filter((s) => s.attempts >= minAttempts)
  if (enough.length === 0) return []
  const out: string[] = []
  const weakest = [...enough].sort((a, b) => a.accuracy - b.accuracy)[0]
  const slowest = [...enough]
    .filter((s) => s.avgSeconds != null)
    .sort((a, b) => (b.avgSeconds ?? 0) - (a.avgSeconds ?? 0))[0]
  if (weakest && weakest.accuracy < 0.7) out.push(`正确率最低：${weakest.label}（${Math.round(weakest.accuracy * 100)}%，${weakest.attempts} 题）`)
  if (slowest && slowest.avgSeconds != null) out.push(`最耗时：${slowest.label}（平均 ${slowest.avgSeconds} 秒/题）`)
  return out
}
