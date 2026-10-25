// IndexedDB 存储层：idb 封装，版本化升级，所有用户数据只在本设备。
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
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
import { DEFAULT_SETTINGS } from '../types/app'
import type { Exercise } from '../types/content'

export const DB_NAME = 'lingua-loop'
export const DB_VERSION = 1

interface LinguaDB extends DBSchema {
  kv: { key: string; value: unknown }
  events: { key: string; value: LearningEvent; indexes: { 'by-ts': number; 'by-content': string } }
  cardStates: { key: string; value: CardState }
  skillStates: { key: string; value: SkillState }
  plans: { key: string; value: DailyPlan }
  adjustments: { key: string; value: Adjustment }
  drafts: { key: string; value: WritingDraft }
  recordings: { key: string; value: RecordingMeta & { blob: Blob } }
  customContent: { key: string; value: Exercise }
}

export type LinguaDatabase = IDBPDatabase<LinguaDB>

let dbPromise: Promise<LinguaDatabase> | null = null

export function openLinguaDB(): Promise<LinguaDatabase> {
  if (!dbPromise) {
    dbPromise = openDB<LinguaDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // 版本升级策略：只新增 store / 索引，不动旧数据（向后兼容）
        if (oldVersion < 1) {
          db.createObjectStore('kv')
          const events = db.createObjectStore('events', { keyPath: 'id' })
          events.createIndex('by-ts', 'ts')
          events.createIndex('by-content', 'contentId')
          db.createObjectStore('cardStates', { keyPath: 'id' })
          db.createObjectStore('skillStates', { keyPath: 'id' })
          db.createObjectStore('plans', { keyPath: 'date' })
          db.createObjectStore('adjustments', { keyPath: 'id' })
          db.createObjectStore('drafts', { keyPath: 'id' })
          db.createObjectStore('recordings', { keyPath: 'id' })
          db.createObjectStore('customContent', { keyPath: 'id' })
        }
        // 未来版本：if (oldVersion < 2) { ... } 只做增量
      },
      blocked() {
        console.warn('数据库升级被其他标签页阻塞，请关闭其他 Lingua Loop 标签页。')
      },
    })
  }
  return dbPromise
}

// ---------- kv ----------

export async function getSettings(): Promise<Settings> {
  const db = await openLinguaDB()
  const s = (await db.get('kv', 'settings')) as Settings | undefined
  return { ...DEFAULT_SETTINGS, ...(s ?? {}) }
}

export async function saveSettings(s: Settings): Promise<void> {
  const db = await openLinguaDB()
  await db.put('kv', s, 'settings')
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await openLinguaDB()
  return (await db.get('kv', key)) as T | undefined
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await openLinguaDB()
  await db.put('kv', value, key)
}

// ---------- events ----------

export async function addEvent(ev: LearningEvent): Promise<void> {
  const db = await openLinguaDB()
  await db.put('events', ev)
}

export async function getAllEvents(): Promise<LearningEvent[]> {
  const db = await openLinguaDB()
  return db.getAll('events')
}

export async function deleteEvent(id: string): Promise<void> {
  const db = await openLinguaDB()
  await db.delete('events', id)
}

// ---------- cards ----------

export async function getAllCardStates(): Promise<CardState[]> {
  const db = await openLinguaDB()
  return db.getAll('cardStates')
}

export async function putCardState(state: CardState): Promise<void> {
  const db = await openLinguaDB()
  await db.put('cardStates', state)
}

export async function putCardStates(states: CardState[]): Promise<void> {
  const db = await openLinguaDB()
  const tx = db.transaction('cardStates', 'readwrite')
  await Promise.all(states.map((s) => tx.store.put(s)))
  await tx.done
}

// ---------- skills ----------

export async function getAllSkillStates(): Promise<SkillState[]> {
  const db = await openLinguaDB()
  return db.getAll('skillStates')
}

export async function putSkillState(s: SkillState): Promise<void> {
  const db = await openLinguaDB()
  await db.put('skillStates', { ...s, id: `${s.language}:${s.skill}` })
}

// ---------- plans ----------

export async function getPlan(dateKey: string): Promise<DailyPlan | undefined> {
  const db = await openLinguaDB()
  return db.get('plans', dateKey)
}

export async function savePlan(plan: DailyPlan): Promise<void> {
  const db = await openLinguaDB()
  await db.put('plans', plan)
}

export async function getAllPlans(): Promise<DailyPlan[]> {
  const db = await openLinguaDB()
  return db.getAll('plans')
}

// ---------- adjustments ----------

export async function addAdjustment(a: Adjustment): Promise<void> {
  const db = await openLinguaDB()
  await db.put('adjustments', a)
}

export async function getAllAdjustments(): Promise<Adjustment[]> {
  const db = await openLinguaDB()
  return db.getAll('adjustments')
}

// ---------- drafts ----------

export async function saveDraft(d: WritingDraft): Promise<void> {
  const db = await openLinguaDB()
  await db.put('drafts', d)
}

export async function getAllDrafts(): Promise<WritingDraft[]> {
  const db = await openLinguaDB()
  return db.getAll('drafts')
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await openLinguaDB()
  await db.delete('drafts', id)
}

// ---------- recordings ----------

export async function saveRecording(meta: RecordingMeta, blob: Blob): Promise<void> {
  const db = await openLinguaDB()
  await db.put('recordings', { ...meta, blob })
}

export async function getAllRecordings(): Promise<(RecordingMeta & { blob: Blob })[]> {
  const db = await openLinguaDB()
  return db.getAll('recordings')
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await openLinguaDB()
  await db.delete('recordings', id)
}

// ---------- custom content ----------

export async function getAllCustomContent(): Promise<Exercise[]> {
  const db = await openLinguaDB()
  return db.getAll('customContent')
}

export async function putCustomContent(items: Exercise[], mode: 'skip' | 'overwrite' = 'skip'): Promise<{ skipped: number; written: number }> {
  const db = await openLinguaDB()
  const tx = db.transaction('customContent', 'readwrite')
  let skipped = 0
  let written = 0
  for (const item of items) {
    const existing = await tx.store.get(item.id)
    if (existing && mode === 'skip') {
      skipped += 1
      continue
    }
    await tx.store.put(item)
    written += 1
  }
  await tx.done
  return { skipped, written }
}

// ---------- 清空 ----------

export async function clearAllData(): Promise<void> {
  const db = await openLinguaDB()
  const tx = db.transaction(['events', 'cardStates', 'skillStates', 'plans', 'adjustments', 'drafts', 'recordings', 'customContent', 'kv'], 'readwrite')
  for (const store of ['events', 'cardStates', 'skillStates', 'plans', 'adjustments', 'drafts', 'recordings', 'customContent', 'kv'] as const) {
    await tx.objectStore(store).clear()
  }
  await tx.done
}

// blob → base64（备份用）；分块避免栈溢出
export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

export function base64ToBlob(b64: string, type: string): Blob {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type })
}
