// 微诊断评分：用 12–16 道混合题推估初始水平，只用于设定先验，不作为任何官方等级。
import type { Language, Skill } from '../types/content'

export interface DiagnosticAnswer {
  qid: string
  skill: Skill
  difficulty: number // 该题所在内容的难度 1–5
  correct: boolean
}

export interface DiagnosticResult {
  language: Language
  overallScore: number // 0–100
  levelLabelZh: string
  skillPriors: Partial<Record<Skill, number>> // 0–100，写入 SkillState.prior
  adviceZh: string[]
}

const SKILL_LABEL: Record<string, string> = {
  reading: '阅读', listening: '听力', writing: '写作', speaking: '口语', vocab: '词汇', grammar: '语法',
}

/**
 * 逻辑：加权正确率（难题权重高）→ 0–100。
 * 英语：≈40→Band 5.5、55→6.5、70→7.5、82→8 方向的内部估计；
 * 西语：≈30→A1、50→A2、70→B1、85→B2 方向。均非官方判定。
 */
export function scoreDiagnostic(language: Language, answers: DiagnosticAnswer[]): DiagnosticResult {
  if (answers.length === 0) {
    return {
      language,
      overallScore: 50,
      levelLabelZh: language === 'en' ? '未诊断（按中等偏上估计起步）' : '未诊断（按 A1 起步）',
      skillPriors: {},
      adviceZh: ['没有作答：已用默认假设，学习几天后数据会自动修正。'],
    }
  }
  let weighted = 0
  let totalWeight = 0
  const bySkill = new Map<Skill, { w: number; c: number }>()
  for (const a of answers) {
    const w = 0.6 + a.difficulty * 0.25 // 难度 1→0.85、5→1.85
    weighted += (a.correct ? 1 : 0) * w
    totalWeight += w
    const s = bySkill.get(a.skill) ?? { w: 0, c: 0 }
    s.w += w
    if (a.correct) s.c += w
    bySkill.set(a.skill, s)
  }
  const overall = Math.round((weighted / totalWeight) * 100)
  const skillPriors: Partial<Record<Skill, number>> = {}
  for (const [skill, v] of bySkill) {
    skillPriors[skill] = Math.round((v.c / v.w) * 100)
  }

  let levelLabelZh: string
  const advice: string[] = []
  if (language === 'en') {
    if (overall < 35) levelLabelZh = '内部估计 ≈ Band 5 或以下（仅训练参考）'
    else if (overall < 50) levelLabelZh = '内部估计 ≈ Band 5.5–6（仅训练参考）'
    else if (overall < 65) levelLabelZh = '内部估计 ≈ Band 6.5 左右（仅训练参考）'
    else if (overall < 78) levelLabelZh = '内部估计 ≈ Band 7 左右（仅训练参考）'
    else levelLabelZh = '内部估计 ≈ Band 7.5+ 方向（仅训练参考）'
    advice.push('该估计只用于安排起步难度；真实 Band 以官方考试或合格考官评分为准。')
  } else {
    if (overall < 30) levelLabelZh = '内部估计 ≈ A1 入门（仅训练参考）'
    else if (overall < 50) levelLabelZh = '内部估计 ≈ A2 方向（仅训练参考）'
    else if (overall < 70) levelLabelZh = '内部估计 ≈ B1 方向（仅训练参考）'
    else levelLabelZh = '内部估计 ≈ B1+/B2 方向（仅训练参考）'
    advice.push('该估计只用于安排起步级别；正式等级以 DELE/Siele 等考试为准。')
  }

  const weak = [...bySkill.entries()].filter(([, v]) => v.w >= 0.85).map(([skill, v]) => ({ skill, acc: v.c / v.w })).sort((a, b) => a.acc - b.acc)
  if (weak.length) {
    advice.push(`相对最弱：${SKILL_LABEL[weak[0].skill]}（${Math.round(weak[0].acc * 100)}%），近期会多安排这类训练。`)
  }
  return { language, overallScore: overall, levelLabelZh, skillPriors, adviceZh: advice }
}
