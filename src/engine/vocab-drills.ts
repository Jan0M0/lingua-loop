// 词卡练习生成：从 VocabCard 确定性生成四种训练模式（中→英回忆、英→中理解、搭配填空、造句自评）。
import type { VocabCard } from '../types/content'
import { seededRandom, seededShuffle } from './seed'

export type DrillMode = 'recall-zh-en' | 'recognize-en-zh' | 'collocation-cloze' | 'make-sentence'

export interface Drill {
  cardId: string
  mode: DrillMode
  prompt: string
  hint?: string
  /** 选择题选项（recognize / cloze 模式）；造句与回忆为空 */
  options?: string[]
  answerIndex?: number
  answer: string // 正确答案文本（回忆/造句模式下用于自查对照）
  reference: string // 完整参考（释义+例句等）
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-zà-ÿ0-9\s]/gi, '').replace(/\s+/g, ' ').trim()
}

/** 从搭配短语生成填空：优先挖掉词条本身（若出现），否则挖最长的实词 */
function buildCloze(card: VocabCard, distractors: string[]): { sentence: string; answer: string } | null {
  const col = card.collocations[0]
  if (!col) return null
  const termCore = normalize(card.term)
  const parts = col.split(/\s+/)
  let idx = parts.findIndex((p) => normalize(p).includes(termCore) || termCore.includes(normalize(p)))
  if (idx === -1) {
    let best = -1
    let bestLen = 2
    parts.forEach((p, i) => {
      if (p.length > bestLen) { best = i; bestLen = p.length }
    })
    idx = best
  }
  if (idx === -1) return null
  const answer = parts[idx].replace(/[^A-Za-zà-ÿ'--]/g, '')
  if (!answer) return null
  const sentence = [...parts.slice(0, idx), '____', ...parts.slice(idx + 1)].join(' ')
  return { sentence, answer }
}

export function generateDrill(card: VocabCard, mode: DrillMode, allCards: VocabCard[], seed: string): Drill {
  const rng = seededRandom(`${seed}:${card.id}:${mode}`)
  const base: Drill = { cardId: card.id, mode, prompt: '', answer: '', reference: `${card.glossZh}｜${card.definition}` }
  switch (mode) {
    case 'recognize-en-zh': {
      const wrong = seededShuffle(allCards.filter((c) => c.id !== card.id && c.language === card.language), rng).slice(0, 3)
      const options = seededShuffle([card.glossZh, ...wrong.map((c) => c.glossZh)], rng)
      return {
        ...base,
        prompt: card.term,
        hint: card.pos,
        options,
        answerIndex: options.indexOf(card.glossZh),
        answer: card.glossZh,
      }
    }
    case 'collocation-cloze': {
      const built = buildCloze(card, [])
      const wrong = seededShuffle(allCards.filter((c) => c.id !== card.id && c.language === card.language), rng).slice(0, 3)
      if (!built) {
        // 无可用搭配时退化为英→中
        return generateDrill(card, 'recognize-en-zh', allCards, seed)
      }
      const distractors = wrong.map((c) => buildCloze(c, [])?.answer).filter((x): x is string => !!x && normalize(x) !== normalize(built.answer))
      const options = seededShuffle([built.answer, ...distractors.slice(0, 3)], rng)
      return {
        ...base,
        prompt: `${built.sentence}（${card.term}）`,
        hint: '填入缺少的词',
        options,
        answerIndex: options.indexOf(built.answer),
        answer: built.answer,
        reference: `${card.collocations.join('；')}｜${card.examples[0]?.sentence ?? ''}`,
      }
    }
    case 'make-sentence': {
      return {
        ...base,
        prompt: `用「${card.term}」造一个句（写或说）`,
        hint: card.commonError ?? undefined,
        answer: card.examples.map((e) => e.sentence).join(' / '),
        reference: `搭配：${card.collocations.join('；')}`,
      }
    }
    case 'recall-zh-en':
    default:
      return {
        ...base,
        prompt: card.glossZh,
        hint: card.pos,
        answer: card.term,
        reference: `搭配：${card.collocations.join('；')}｜例句：${card.examples[0]?.sentence ?? ''}`,
      }
  }
}

/** 一张卡的练习序列：新卡走 introduce（识别→回忆），复习卡按熟练度轮换 */
export function drillModesFor(isNew: boolean, reps: number, seed: string): DrillMode[] {
  const rng = seededRandom(`${seed}:modes:${reps}`)
  if (isNew) return ['recognize-en-zh', 'recall-zh-en', 'collocation-cloze']
  if (reps >= 4 && rng() < 0.5) return ['recall-zh-en', 'make-sentence']
  const pool: DrillMode[] = ['recognize-en-zh', 'recall-zh-en', 'collocation-cloze']
  return [pool[Math.floor(rng() * pool.length)]]
}

export function normalizeAnswer(s: string): string {
  return normalize(s)
}
