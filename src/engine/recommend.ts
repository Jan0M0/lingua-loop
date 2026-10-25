// v2 §3A 推荐引擎：为"给我一个有意思的东西"服务。
// 规则透明可解释：兴趣主题 > 未读过 > 难度接近 > 近期多样性；不用随机性假装个性化。
import type { Adjustment, LearningEvent } from '../types/app'
import type { Exercise } from '../types/content'
import { seededRandom, seededShuffle } from './seed'

export interface RecommendInput {
  interests: string[]
  language: 'en' | 'es'
  /** 目标难度（由掌握度推算，外部传入） */
  targetDifficulty: number
  allExercises: Exercise[]
  events: LearningEvent[]
  adjustments: Adjustment[]
  now?: number
}

export interface Recommendation {
  exercise: Exercise
  reasons: string[]
}

/** 可作为"有意思的东西"推荐的内容形态 */
const EXPLORE_TYPES: Exercise['type'][] = ['story', 'listening', 'reading-mc']

export function topicWeightAdjustments(adjustments: Adjustment[], now = Date.now()): Map<string, number> {
  // kind: 'topic-boost' / 'topic-deprioritize'，payload: { topic }
  const m = new Map<string, number>()
  for (const a of adjustments) {
    if (a.kind !== 'topic-boost' && a.kind !== 'topic-deprioritize') continue
    if (a.expiresAt != null && a.expiresAt <= now) continue
    const topic = (a.payload as { topic?: string })?.topic
    if (!topic) continue
    m.set(topic, (m.get(topic) ?? 0) + (a.kind === 'topic-boost' ? 1 : -2))
  }
  return m
}

/**
 * 选一个"有意思的东西"。排除 excludeIds（"换一个"用）。
 * 返回 undefined 表示该语言没有可推荐内容。
 */
export function recommendExplore(input: RecommendInput, excludeIds: string[] = [], seed = 'explore'): Recommendation | undefined {
  const { interests, language, targetDifficulty, allExercises, events, adjustments } = input
  const now = input.now ?? Date.now()

  const excluded = new Set(excludeIds)
  // 近 21 天读过的内容（理解型内容不给重复推荐）
  const recentlyDone = new Set(
    events.filter((e) => now - e.ts < 21 * 86400000 && EXPLORE_TYPES.includes(e.exerciseType)).map((e) => e.contentId)
  )
  const topicAdj = topicWeightAdjustments(adjustments, now)
  const interestSet = new Set(interests)

  const pool = allExercises.filter(
    (e) =>
      e.language === language &&
      EXPLORE_TYPES.includes(e.type) &&
      !excluded.has(e.id) &&
      !recentlyDone.has(e.id)
  )
  if (pool.length === 0) return undefined

  // 评分：兴趣命中 +2；反馈升权 +1 / 降权 -2；难度接近 +1；近期主题多样性（近 5 次探索同主题 -1）
  const recentTopics = events
    .filter((e) => EXPLORE_TYPES.includes(e.exerciseType) && now - e.ts < 7 * 86400000)
    .sort((a, b) => b.ts - a.ts)
    .map((e) => allExercises.find((x) => x.id === e.contentId)?.topic)
    .filter((t): t is string => !!t)
    .slice(0, 5)

  const scored = pool.map((ex) => {
    let score = 0
    const reasons: string[] = []
    if (interestSet.has(ex.topic)) {
      score += 2
      reasons.push(`匹配你的兴趣「${topicLabel(ex.topic)}」`)
    }
    const adj = topicAdj.get(ex.topic) ?? 0
    if (adj > 0) {
      score += 2 // 反馈"有趣"的主题等同兴趣权重
      reasons.push('你最近觉得这类主题有趣')
    } else if (adj < 0) {
      score -= 3 // "不合口味"强降权（一周内）
    }
    if (recentTopics.filter((t) => t === ex.topic).length >= 2) {
      score -= 1.5
      reasons.push('（同类主题刚看过不少，优先换换口味）')
    }
    const dist = Math.abs(ex.difficulty - targetDifficulty)
    if (dist <= 1) score += 1
    if (dist === 0) reasons.push(`难度 ${ex.difficulty}/5 正好在你当前的水平`)
    return { ex, score, reasons }
  })

  const maxScore = Math.max(...scored.map((s) => s.score))
  const top = scored.filter((s) => s.score >= maxScore - 0.01)
  const rng = seededRandom(`${seed}:${input.interests.join(',')}:${language}:${Math.floor(now / 60000)}`)
  const picked = seededShuffle(top, rng)[0]
  if (!picked) return undefined

  const reasons = [...picked.reasons]
  if (reasons.length === 0) {
    reasons.push(`按你的水平挑的${picked.ex.type === 'story' ? '一篇小故事' : picked.ex.type === 'listening' ? '一段听力' : '一篇短文'}（难度 ${picked.ex.difficulty}/5）`)
  }

  return { exercise: picked.ex, reasons }
}

function topicLabel(topic: string): string {
  const map: Record<string, string> = {
    technology: '科技与 AI', business: '商业', psychology: '心理与人际', travel: '旅行',
    food: '食物与烹饪', history: '历史', culture: '文化', science: '科学', nature: '自然',
    sports: '体育', movies: '电影与故事', society: '社会议题', 'creative-writing': '创意写作',
    music: '音乐', 'daily-life': '日常生活', work: '工作与学习',
    education: '教育', housing: '住房', media: '媒体', shopping: '购物', health: '健康',
    finance: '理财', urban: '城市', family: '家庭', crime: '社会与法治', transport: '交通',
    general: '综合', festivities: '节日',
  }
  return map[topic] ?? topic
}

export { topicLabel }
