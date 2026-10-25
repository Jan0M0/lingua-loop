import { describe, expect, it, beforeAll } from 'vitest'
import 'fake-indexeddb/auto'
import {
  addEvent,
  getSettings,
  saveSettings,
  putCardState,
  getAllCardStates,
  savePlan,
  getPlan,
  getAllEvents,
} from '../src/storage/db'
import { exportBackup, previewRestore, applyRestore } from '../src/storage/backup'
import { DEFAULT_SETTINGS, type DailyPlan, type LearningEvent } from '../src/types/app'

function ev(id: string): LearningEvent {
  return {
    id, ts: Date.now(), language: 'en', skill: 'reading', exerciseType: 'reading-mc', contentId: 'en-read-001',
    correct: true, secondsSpent: 100, hintsUsed: 0, errorTags: [], contentVersion: 1,
  }
}

describe('IndexedDB 存储与备份恢复', () => {
  beforeAll(async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, onboarded: true, seedSalt: 'db-test' })
    await addEvent(ev('evt-1'))
    await putCardState({ id: 'en-voc-001', ease: 2.5, intervalDays: 3, reps: 2, lapses: 0, dueAt: Date.now() + 86400000, addedAt: Date.now() })
    const plan: DailyPlan = { date: '2026-10-25', mode: 'standard', generatedAt: Date.now(), tasks: [], notes: [] }
    await savePlan(plan)
  })

  it('设置读写持久', async () => {
    const s = await getSettings()
    expect(s.seedSalt).toBe('db-test')
    expect(s.onboarded).toBe(true)
  })

  it('导出 → 预览 → 恢复（跳过冲突）', async () => {
    const backup = await exportBackup({ includeRecordings: false })
    expect(backup.app).toBe('lingua-loop')
    expect(backup.data.events.length).toBeGreaterThan(0)

    const existing = {
      events: await getAllEvents(),
      cardStates: await getAllCardStates(),
      drafts: [],
      customContent: [],
      settings: await getSettings(),
    }
    const { preview } = previewRestore(backup, existing)
    expect(preview!.conflicts.length).toBeGreaterThan(0) // 同一份数据当然全部冲突

    const res = await applyRestore(backup, 'skip', { replaceSettings: false, restoreRecordings: false })
    expect(res.imported).toBe(0)
    expect(res.skipped).toBeGreaterThan(0)
  })

  it('计划按日期读取', async () => {
    const p = await getPlan('2026-10-25')
    expect(p?.mode).toBe('standard')
    expect(await getPlan('1999-01-01')).toBeUndefined()
  })

  it('备份文件缺少标识时预览报错', () => {
    const r = previewRestore({ foo: 1 }, { events: [], cardStates: [], drafts: [], customContent: [], settings: DEFAULT_SETTINGS })
    expect(r.error).toBeDefined()
  })
})
