// 本地时区日期工具：所有"天"的概念都基于本地时间。
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dateKeyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, days: number): string {
  const d = dateKeyToDate(key)
  d.setDate(d.getDate() + days)
  return localDateKey(d)
}

export function daysBetween(fromKey: string, toKey: string): number {
  const a = dateKeyToDate(fromKey).getTime()
  const b = dateKeyToDate(toKey).getTime()
  return Math.round((b - a) / 86400000)
}

/** 自 startedAt 起的第几天（1-based） */
export function dayNumber(startedAt: string, today: string): number {
  if (!startedAt) return 1
  return Math.max(1, daysBetween(startedAt, today) + 1)
}

export function startOfDayTs(d: Date = new Date()): number {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c.getTime()
}

export function endOfDayTs(d: Date = new Date()): number {
  return startOfDayTs(d) + 86400000 - 1
}

/** 周一为一周开始；返回该周周一的 dateKey */
export function weekStartKey(key: string): string {
  const d = dateKeyToDate(key)
  const dow = (d.getDay() + 6) % 7 // 0=Mon
  d.setDate(d.getDate() - dow)
  return localDateKey(d)
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)} 分钟`
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return m === 0 ? `${h} 小时` : `${h} 小时 ${m} 分`
}

const WEEKDAYS_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
export function weekdayZh(key: string): string {
  return WEEKDAYS_ZH[dateKeyToDate(key).getDay()]
}
