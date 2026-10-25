// 内容注册表：自动收集 src/data/content 下所有内容模块。
// 新增内容文件即自动生效；用户导入的内容在 db 的 customContent store，另行合并。
import type { ContentModule, Exercise } from '../types/content'

const modules = import.meta.glob<ContentModule>('/src/data/content/**/*.ts', { eager: true })

export const builtInExercises: Exercise[] = Object.entries(modules).flatMap(([, mod]) => mod?.items ?? [])

const byId = new Map<string, Exercise>()
for (const ex of builtInExercises) byId.set(ex.id, ex)

export function getExercise(id: string, extra: Exercise[] = []): Exercise | undefined {
  return byId.get(id) ?? extra.find((e) => e.id === id)
}

export interface QueryOptions {
  language?: 'en' | 'es'
  skill?: string
  type?: string
  topic?: string
  tag?: string
  minDifficulty?: number
  maxDifficulty?: number
}

export function queryExercises(opts: QueryOptions, extra: Exercise[] = []): Exercise[] {
  const all = [...builtInExercises, ...extra]
  return all.filter((ex) => {
    if (opts.language && ex.language !== opts.language) return false
    if (opts.skill && ex.skill !== opts.skill) return false
    if (opts.type && ex.type !== opts.type) return false
    if (opts.topic && ex.topic !== opts.topic) return false
    if (opts.tag && !ex.tags.includes(opts.tag)) return false
    if (opts.minDifficulty != null && ex.difficulty < opts.minDifficulty) return false
    if (opts.maxDifficulty != null && ex.difficulty > opts.maxDifficulty) return false
    return true
  })
}

export function contentStats(): Record<string, number> {
  const stats: Record<string, number> = {}
  for (const ex of builtInExercises) {
    const key = `${ex.language}:${ex.type}`
    stats[key] = (stats[key] ?? 0) + 1
  }
  return stats
}
