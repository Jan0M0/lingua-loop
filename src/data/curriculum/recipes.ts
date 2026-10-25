// 前 30 天每日任务配方 + 第 31 天后的每周模式。
// 说明：到期复习（SRS）由调度器每天自动置顶插入，不写在这些配方里；
// 配方决定"新学/训练"部分的结构。第 31 天后按 weeklyPatterns + 当周周主题继续编排。
import type { DayRecipe, RecipeSlot, WeeklyPattern } from './types'

const en = 'en' as const
const es = 'es' as const

function slot(s: Omit<RecipeSlot, 'language'> & { language?: 'en' | 'es' }): RecipeSlot {
  return { language: s.language ?? en, ...s } as RecipeSlot
}

export const dayRecipes: DayRecipe[] = [
  { day: 1, slots: [
    slot({ kind: 'diagnostic', language: en, skill: 'vocab', minutes: 8, labelZh: '英语微诊断：建立基线' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语第一批核心词卡' }),
    slot({ kind: 'diagnostic', language: es, skill: 'vocab', minutes: 6, labelZh: '西语微诊断：确定起点' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语第一批日常词卡' }),
  ]},
  { day: 2, slots: [
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 7, labelZh: '基础阅读：细节定位' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'listening', exerciseTypes: ['listening'], minutes: 4, labelZh: '西语慢速听力' }),
  ]},
  { day: 3, slots: [
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 5, labelZh: '英语听力：数字与关键词' }),
    slot({ kind: 'exercise', language: es, skill: 'grammar', exerciseTypes: ['grammar-note'], minutes: 5, labelZh: '西语语法小课' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
  ]},
  { day: 4, slots: [
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 7, labelZh: '英语阅读：主旨题' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 5, labelZh: '西语角色扮演' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
  ]},
  { day: 5, slots: [
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 5, labelZh: '英语听力：场景理解' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 5, labelZh: '西语 A1 短文' }),
  ]},
  { day: 6, slots: [
    slot({ kind: 'exercise', language: en, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 12, labelZh: '写作起步：不限时练结构' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 4, labelZh: '英语新词卡' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'listening', exerciseTypes: ['listening'], minutes: 4, labelZh: '西语听力' }),
  ]},
  { day: 7, slots: [
    slot({ kind: 'exercise', language: en, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 8, labelZh: '口语 Part 1：初次录音' }),
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 7, labelZh: '英语阅读' }),
    slot({ kind: 'exercise', language: es, skill: 'grammar', exerciseTypes: ['grammar-note'], minutes: 5, labelZh: '西语语法小课' }),
  ]},
  { day: 8, slots: [
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 7, labelZh: '阅读：同义改写识别' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 5, labelZh: '西语口语' }),
  ]},
  { day: 9, slots: [
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 5, labelZh: '英语听力：关键词捕捉' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'grammar', exerciseTypes: ['grammar-note'], minutes: 5, labelZh: '西语语法小课' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
  ]},
  { day: 10, slots: [
    slot({ kind: 'exercise', language: en, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 12, labelZh: '写作：Task 2 提纲练习' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 4, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 5, labelZh: '西语阅读' }),
  ]},
  { day: 11, slots: [
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 7, labelZh: '阅读：推断题' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'listening', exerciseTypes: ['listening'], minutes: 4, labelZh: '西语听力' }),
  ]},
  { day: 12, slots: [
    slot({ kind: 'exercise', language: en, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 8, labelZh: '口语 Part 1：扩展回答' }),
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 5, labelZh: '英语听力' }),
    slot({ kind: 'exercise', language: es, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 5, labelZh: '西语角色扮演' }),
  ]},
  { day: 13, slots: [
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 7, labelZh: '阅读：作者态度' }),
    slot({ kind: 'exercise', language: es, skill: 'grammar', exerciseTypes: ['grammar-note'], minutes: 5, labelZh: '西语语法小课' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
  ]},
  { day: 14, slots: [
    slot({ kind: 'exercise', language: en, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 15, labelZh: '写作：限时第一篇 Task 2' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 4, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 5, labelZh: '西语阅读' }),
  ]},
  { day: 15, slots: [
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 5, labelZh: '英语听力：多步骤信息' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'listening', exerciseTypes: ['listening'], minutes: 4, labelZh: '西语听力' }),
  ]},
  { day: 16, slots: [
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 7, labelZh: '阅读：段落匹配' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 8, labelZh: '西语写作：短消息' }),
  ]},
  { day: 17, slots: [
    slot({ kind: 'exercise', language: en, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 8, labelZh: '口语：Part 2 话题卡' }),
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 5, labelZh: '英语听力' }),
    slot({ kind: 'exercise', language: es, skill: 'grammar', exerciseTypes: ['grammar-note'], minutes: 5, labelZh: '西语语法小课' }),
  ]},
  { day: 18, slots: [
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: en, skill: 'grammar', exerciseTypes: ['cloze'], minutes: 4, labelZh: '英语语法语境填空' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 5, labelZh: '西语口语' }),
  ]},
  { day: 19, slots: [
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 7, labelZh: '阅读：中等难度限时' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'listening', exerciseTypes: ['listening'], minutes: 4, labelZh: '西语听力' }),
  ]},
  { day: 20, slots: [
    slot({ kind: 'exercise', language: en, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 15, labelZh: '写作：Task 1（按考试类型）' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 4, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 5, labelZh: '西语阅读' }),
  ]},
  { day: 21, slots: [
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 5, labelZh: '英语听力：态度判断' }),
    slot({ kind: 'exercise', language: en, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 8, labelZh: '口语：Part 1+影子跟读' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
  ]},
  { day: 22, slots: [
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 7, labelZh: '阅读：错题标签复练' }),
    slot({ kind: 'exercise', language: es, skill: 'grammar', exerciseTypes: ['grammar-note'], minutes: 5, labelZh: '西语语法小课' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
  ]},
  { day: 23, slots: [
    slot({ kind: 'exercise', language: en, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 15, labelZh: '写作：Task 2 限时' }),
    slot({ kind: 'exercise', language: en, skill: 'grammar', exerciseTypes: ['cloze'], minutes: 4, labelZh: '英语语法填空' }),
    slot({ kind: 'exercise', language: es, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 5, labelZh: '西语角色扮演' }),
  ]},
  { day: 24, slots: [
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 5, labelZh: '英语听力' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 5, labelZh: '西语阅读' }),
  ]},
  { day: 25, slots: [
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 7, labelZh: '阅读：套题节奏' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'listening', exerciseTypes: ['listening'], minutes: 4, labelZh: '西语听力' }),
  ]},
  { day: 26, slots: [
    slot({ kind: 'exercise', language: en, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 8, labelZh: '口语：Part 2 话题卡' }),
    slot({ kind: 'exercise', language: en, skill: 'grammar', exerciseTypes: ['cloze'], minutes: 4, labelZh: '英语语法填空' }),
    slot({ kind: 'exercise', language: es, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 8, labelZh: '西语写作' }),
  ]},
  { day: 27, slots: [
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 5, labelZh: '英语听力' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'grammar', exerciseTypes: ['grammar-note'], minutes: 5, labelZh: '西语语法小课' }),
  ]},
  { day: 28, slots: [
    slot({ kind: 'exercise', language: en, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 15, labelZh: '写作：混合限时' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 4, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 5, labelZh: '西语口语' }),
  ]},
  { day: 29, slots: [
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 7, labelZh: '阅读：高难度挑战' }),
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 5, labelZh: '英语听力' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
  ]},
  { day: 30, slots: [
    slot({ kind: 'exercise', language: en, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 15, labelZh: '写作：30 天检验' }),
    slot({ kind: 'exercise', language: en, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 8, labelZh: '口语：30 天检验' }),
    slot({ kind: 'exercise', language: es, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 5, labelZh: '西语阅读' }),
  ]},
]

// 第 31 天以后：按星期几的模式（结合当周课程主题由调度器具体化）
export const weeklyPatterns: WeeklyPattern[] = [
  { weekday: 0, slots: [
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 8, labelZh: '英语阅读（当周主题）' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'listening', exerciseTypes: ['listening'], minutes: 4, labelZh: '西语听力' }),
  ]},
  { weekday: 1, slots: [
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 6, labelZh: '英语听力' }),
    slot({ kind: 'exercise', language: es, skill: 'grammar', exerciseTypes: ['grammar-note', 'cloze'], minutes: 5, labelZh: '西语语法' }),
  ]},
  { weekday: 2, slots: [
    slot({ kind: 'exercise', language: en, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 16, labelZh: '英语写作（当周主题）' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 4, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 6, labelZh: '西语口语' }),
  ]},
  { weekday: 3, slots: [
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 5, labelZh: '英语新词卡' }),
    slot({ kind: 'exercise', language: en, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 8, labelZh: '英语阅读' }),
    slot({ kind: 'new-vocab', language: es, skill: 'vocab', minutes: 3, labelZh: '西语新词卡' }),
    slot({ kind: 'exercise', language: es, skill: 'reading', exerciseTypes: ['reading-mc'], minutes: 4, labelZh: '西语阅读' }),
  ]},
  { weekday: 4, slots: [
    slot({ kind: 'exercise', language: en, skill: 'listening', exerciseTypes: ['listening'], minutes: 6, labelZh: '英语听力' }),
    slot({ kind: 'exercise', language: en, skill: 'speaking', exerciseTypes: ['speaking-task'], minutes: 9, labelZh: '英语口语（当周主题）' }),
    slot({ kind: 'exercise', language: es, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 8, labelZh: '西语写作' }),
  ]},
  { weekday: 5, slots: [
    slot({ kind: 'exercise', language: en, skill: 'writing', exerciseTypes: ['writing-task'], minutes: 16, labelZh: '英语写作/限时（当周主题）' }),
    slot({ kind: 'exercise', language: en, skill: 'grammar', exerciseTypes: ['cloze'], minutes: 4, labelZh: '英语语法' }),
    slot({ kind: 'exercise', language: es, skill: 'listening', exerciseTypes: ['listening'], minutes: 4, labelZh: '西语听力' }),
  ]},
  { weekday: 6, slots: [
    slot({ kind: 'checkpoint', language: en, skill: 'reading', minutes: 6, labelZh: '英语周检查点与错题复练' }),
    slot({ kind: 'new-vocab', language: en, skill: 'vocab', minutes: 4, labelZh: '英语词卡补复习' }),
    slot({ kind: 'checkpoint', language: es, skill: 'reading', minutes: 4, labelZh: '西语周检查点' }),
  ]},
]
