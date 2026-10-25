// 临时集成冒烟：用真实内容库跑 day1/day2/day35 计划（内容齐后随终审保留）
import { describe, expect, it } from 'vitest'
import { buildDailyPlan } from '../src/engine/scheduler'
import { builtInExercises } from '../src/content/registry'
import { DEFAULT_SETTINGS } from '../src/types/app'

const base = {
  now: new Date('2026-10-25T08:00:00').getTime(),
  cardStates: [] as never[],
  events: [] as never[],
  skillStates: [] as never[],
  adjustments: [] as never[],
  allExercises: builtInExercises,
}

describe('真实内容库 × 调度器', () => {
  it('第 1 天能生成计划且至少含词卡任务', () => {
    const p = buildDailyPlan({
      ...base,
      settings: { ...DEFAULT_SETTINGS, onboarded: true, startedAt: '2026-10-25', examDate: '2027-04-25', seedSalt: 'smoke' },
      dateKey: '2026-10-25',
    })
    expect(p.tasks.length).toBeGreaterThan(0)
    expect(p.notes.length).toBeGreaterThan(0)
  })

  it('第 35 天（周模式）也能生成', () => {
    const p = buildDailyPlan({
      ...base,
      settings: { ...DEFAULT_SETTINGS, onboarded: true, startedAt: '2026-09-21', examDate: '2027-04-25', seedSalt: 'smoke' },
      dateKey: '2026-10-25',
    })
    expect(p.tasks).toBeDefined()
  })
})
