// 备份与恢复：导出/导入 JSON。恢复前做结构校验与冲突报告，默认不覆盖已有数据。
import type {
  Adjustment,
  CardState,
  DailyPlan,
  LearningEvent,
  RecordingMeta,
  Settings,
  SkillState,
  WritingDraft,
} from '../types/app'
import type { Exercise } from '../types/content'
import {
  addAdjustment,
  base64ToBlob,
  blobToBase64,
  clearAllData,
  getAllAdjustments,
  getAllCardStates,
  getAllCustomContent,
  getAllDrafts,
  getAllEvents,
  getAllPlans,
  getAllRecordings,
  getAllSkillStates,
  getSettings,
  openLinguaDB,
  putCardStates,
  putCustomContent,
  saveDraft,
  savePlan,
  saveRecording,
  saveSettings,
  addEvent,
  putSkillState,
} from './db'

export interface BackupFile {
  app: 'lingua-loop'
  formatVersion: 1
  exportedAt: string
  data: {
    settings: Settings
    events: LearningEvent[]
    cardStates: CardState[]
    skillStates: SkillState[]
    plans: DailyPlan[]
    adjustments: Adjustment[]
    drafts: WritingDraft[]
    customContent: Exercise[]
    recordings?: { meta: RecordingMeta; blobBase64: string }[]
  }
}

export async function exportBackup(opts: { includeRecordings: boolean }): Promise<BackupFile> {
  const [settings, events, cardStates, skillStates, plans, adjustments, drafts, customContent, recordings] =
    await Promise.all([
      getSettings(),
      getAllEvents(),
      getAllCardStates(),
      getAllSkillStates(),
      getAllPlans(),
      getAllAdjustments(),
      getAllDrafts(),
      getAllCustomContent(),
      opts.includeRecordings ? getAllRecordings() : Promise.resolve([]),
    ])
  const recBackups = []
  for (const r of recordings) {
    recBackups.push({ meta: { id: r.id, exerciseId: r.exerciseId, language: r.language, ts: r.ts, seconds: r.seconds, sizeBytes: r.sizeBytes, note: r.note }, blobBase64: await blobToBase64(r.blob) })
  }
  return {
    app: 'lingua-loop',
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    data: { settings, events, cardStates, skillStates, plans, adjustments, drafts, customContent, recordings: recBackups },
  }
}

export interface RestorePreview {
  counts: { events: number; cardStates: number; skillStates: number; plans: number; adjustments: number; drafts: number; customContent: number; recordings: number }
  conflicts: { store: string; id: string }[]
  settingsDifferent: boolean
  hasRecordings: boolean
}

export function previewRestore(raw: unknown, existing: { events: LearningEvent[]; cardStates: CardState[]; drafts: WritingDraft[]; customContent: Exercise[]; settings: Settings }): { preview?: RestorePreview; file?: BackupFile; error?: string } {
  if (raw == null || typeof raw !== 'object') return { error: '文件不是有效 JSON 对象' }
  const f = raw as BackupFile
  if (f.app !== 'lingua-loop' || f.formatVersion !== 1 || f.data == null) {
    return { error: '不是 Lingua Loop 备份文件（缺少 app/formatVersion 标识）' }
  }
  const d = f.data
  const counts = {
    events: d.events?.length ?? 0,
    cardStates: d.cardStates?.length ?? 0,
    skillStates: d.skillStates?.length ?? 0,
    plans: d.plans?.length ?? 0,
    adjustments: d.adjustments?.length ?? 0,
    drafts: d.drafts?.length ?? 0,
    customContent: d.customContent?.length ?? 0,
    recordings: d.recordings?.length ?? 0,
  }
  const conflicts: RestorePreview['conflicts'] = []
  const exEvents = new Set(existing.events.map((e) => e.id))
  for (const e of d.events ?? []) if (exEvents.has(e.id)) conflicts.push({ store: 'events', id: e.id })
  const exCards = new Set(existing.cardStates.map((c) => c.id))
  for (const c of d.cardStates ?? []) if (exCards.has(c.id)) conflicts.push({ store: 'cardStates', id: c.id })
  const exDrafts = new Set(existing.drafts.map((x) => x.id))
  for (const x of d.drafts ?? []) if (exDrafts.has(x.id)) conflicts.push({ store: 'drafts', id: x.id })
  const exContent = new Set(existing.customContent.map((x) => x.id))
  for (const x of d.customContent ?? []) if (exContent.has(x.id)) conflicts.push({ store: 'customContent', id: x.id })
  return {
    preview: {
      counts,
      conflicts,
      settingsDifferent: JSON.stringify(d.settings) !== JSON.stringify(existing.settings),
      hasRecordings: counts.recordings > 0,
    },
    file: f,
  }
}

export async function applyRestore(
  file: BackupFile,
  conflictMode: 'skip' | 'overwrite',
  opts: { replaceSettings: boolean; restoreRecordings: boolean }
): Promise<{ skipped: number; imported: number }> {
  const db = await openLinguaDB()
  const d = file.data
  let skipped = 0
  let imported = 0

  if (opts.replaceSettings && d.settings) await saveSettings(d.settings)

  for (const ev of d.events ?? []) {
    const exists = await db.get('events', ev.id)
    if (exists && conflictMode === 'skip') { skipped += 1; continue }
    await addEvent(ev)
    imported += 1
  }
  for (const c of d.cardStates ?? []) {
    const exists = await db.get('cardStates', c.id)
    if (exists && conflictMode === 'skip') { skipped += 1; continue }
    await putCardStates([{ ...c }])
    imported += 1
  }
  for (const s of d.skillStates ?? []) {
    const id = s.id ?? `${s.language}:${s.skill}`
    const exists = await db.get('skillStates', id)
    if (exists && conflictMode === 'skip') { skipped += 1; continue }
    await putSkillState({ ...s, id })
    imported += 1
  }
  for (const p of d.plans ?? []) {
    const exists = await db.get('plans', p.date)
    if (exists && conflictMode === 'skip') { skipped += 1; continue }
    await savePlan(p)
    imported += 1
  }
  for (const a of d.adjustments ?? []) {
    const exists = await db.get('adjustments', a.id)
    if (exists && conflictMode === 'skip') { skipped += 1; continue }
    await addAdjustment(a)
    imported += 1
  }
  for (const x of d.drafts ?? []) {
    const exists = await db.get('drafts', x.id)
    if (exists && conflictMode === 'skip') { skipped += 1; continue }
    await saveDraft(x)
    imported += 1
  }
  if (d.customContent?.length) {
    const r = await putCustomContent(d.customContent, conflictMode === 'skip' ? 'skip' : 'overwrite')
    skipped += r.skipped
    imported += r.written
  }
  if (opts.restoreRecordings && d.recordings?.length) {
    for (const r of d.recordings) {
      const exists = await db.get('recordings', r.meta.id)
      if (exists && conflictMode === 'skip') { skipped += 1; continue }
      await saveRecording(r.meta, base64ToBlob(r.blobBase64, 'audio/webm'))
      imported += 1
    }
  }
  return { skipped, imported }
}

export async function wipeEverything(): Promise<void> {
  await clearAllData()
}

export function downloadBackupFile(backup: BackupFile): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lingua-loop-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
