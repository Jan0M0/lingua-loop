// 导出审计：记录哪些字段离开了设备（只记字段名与大小，不记内容本身）。
// 挂在 kv 的 egressLog 键上，保留最近 200 条——不加新 store，不升 DB 版本。
import { getMeta, setMeta } from './db'
import type { EgressLogEntry, PacketKind } from '../engine/packets/types'

const KEY = 'egressLog'
const KEEP = 200

export async function logEgress(kind: PacketKind, promptVersion: number, fields: string[], bytes: number): Promise<void> {
  const list = (await getMeta<EgressLogEntry[]>(KEY)) ?? []
  const next: EgressLogEntry[] = [{ ts: Date.now(), kind, promptVersion, fields, bytes }, ...list].slice(0, KEEP)
  await setMeta(KEY, next)
}

export async function getEgressLog(): Promise<EgressLogEntry[]> {
  return (await getMeta<EgressLogEntry[]>(KEY)) ?? []
}
