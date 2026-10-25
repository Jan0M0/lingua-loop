// 写作规则反馈器：只做可解释的辅助检查。
// 边界：这里没有任何"Band 分数预测"——未经合格考官评分，一切只是启发式提示。
import type { WritingExercise } from '../types/content'

export interface CheckResult {
  id: string
  label: string
  status: 'ok' | 'warn' | 'info'
  detail: string
}

const FILLERS = ['very', 'really', 'a lot of', 'thing', 'things', 'stuff', 'good', 'bad', 'big', 'small']
const CONFUSION_PAIRS: { pattern: RegExp; hint: string }[] = [
  { pattern: /\bthere\s+(is|are)\s+(a|an|the)?\s*\b(?!\w*\s+(are|is))\w+\s+(?:which|who)\b/i, hint: '检查 there is/are 与 which/who 从句是否冗余' },
  { pattern: /\bits\s+(a|an|the)\b/i, hint: "its 是物主代词；it's = it is。此处可能应为 it's" },
  { pattern: /\btheir\s+(is|are|was|were)\b/i, hint: 'their 是物主代词；此处可能应为 there is/are' },
  { pattern: /\bthen\s+(the|a|an)\s+\w+\s+(is|are)\s+better\b/i, hint: '比较句常见错误：检查 than 与 then' },
  { pattern: /\bmore\s+\w+er\b|\bmost\s+\w+er\b/i, hint: '比较级叠加：more 与 -er 不能同时使用' },
  { pattern: /\ba\s+[aeiou]/i, hint: '检查冠词 a/an（以元音音素开头的词前用 an）' },
  { pattern: /\bdiscuss\s+about\b/i, hint: 'discuss 是及物动词：discuss sth，不加 about' },
  { pattern: /\bcan\s+be\s+able\s+to\b/i, hint: 'can 与 be able to 语义重复' },
]
const MARKERS = ['however', 'moreover', 'furthermore', 'in addition', 'therefore', 'thus', 'consequently', 'nevertheless', 'on the other hand', 'in conclusion', 'to sum up', 'firstly', 'secondly', 'finally']

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-zà-ÿ']+/g) ?? []
}

function countSyllablesApprox(w: string): number {
  const m = w.toLowerCase().match(/[aeiouyà-ÿ]{1,2}/g)
  return Math.max(1, m ? m.length : 1)
}

export interface WritingAnalysis {
  wordCount: number
  paragraphs: number
  sentences: number
  avgSentenceWords: number
  longestSentence: number
  longShare: number // >30 词句子占比
  checks: CheckResult[]
}

export function analyzeWriting(text: string, task?: WritingExercise): WritingAnalysis {
  const w = words(text)
  const wordCount = w.length
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).filter((p) => p.trim()).length : 0
  const sentenceArr = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0)
  const sentences = sentenceArr.length
  const lens = sentenceArr.map((s) => words(s).length)
  const avgSentenceWords = sentences ? Math.round((lens.reduce((a, b) => a + b, 0) / sentences) * 10) / 10 : 0
  const longest = lens.length ? Math.max(...lens) : 0
  const longShare = lens.length ? Math.round((lens.filter((l) => l > 30).length / lens.length) * 100) : 0
  const checks: CheckResult[] = []

  // 字数与目标
  const [lo, hi] = task?.targetWords ?? [150, 190]
  if (wordCount < lo) checks.push({ id: 'wordcount', label: '字数', status: 'warn', detail: `当前 ${wordCount} 词，低于最低要求 ${lo} 词` })
  else if (wordCount > hi + 80) checks.push({ id: 'wordcount', label: '字数', status: 'warn', detail: `当前 ${wordCount} 词，明显超出目标 ${hi} 词，考虑压缩` })
  else checks.push({ id: 'wordcount', label: '字数', status: 'ok', detail: `${wordCount} 词，在目标范围（${lo}–${hi}+）内` })

  // 段落结构
  if (paragraphs < (task?.variant === 'ielts-t2' ? 4 : 3)) {
    checks.push({ id: 'paragraphs', label: '段落结构', status: 'warn', detail: `共 ${paragraphs} 段；${task?.variant === 'ielts-t2' ? 'Task 2 建议开头+2 主体段+结论（≥4 段）' : '建议至少 3 段（开头/主体/收尾）'}` })
  } else {
    checks.push({ id: 'paragraphs', label: '段落结构', status: 'ok', detail: `${paragraphs} 段，结构完整` })
  }

  // 句长分布
  if (longShare > 30) checks.push({ id: 'sentence-length', label: '句长分布', status: 'warn', detail: `${longShare}% 的句子超过 30 词，长句过密会提高语法出错概率，考虑拆分` })
  else if (avgSentenceWords > 0 && avgSentenceWords < 10) checks.push({ id: 'sentence-length', label: '句长分布', status: 'warn', detail: `平均句长 ${avgSentenceWords} 词偏短，句式多样性可能不足` })
  else checks.push({ id: 'sentence-length', label: '句长分布', status: 'ok', detail: `平均 ${avgSentenceWords} 词，最长 ${longest} 词，分布健康` })

  // 宽泛词/填充词
  const fillerCount = FILLERS.reduce((acc, f) => {
    const re = new RegExp(`\\b${f}\\b`, 'gi')
    return acc + (text.match(re)?.length ?? 0)
  }, 0)
  if (fillerCount >= 6) checks.push({ id: 'fillers', label: '宽泛用词', status: 'warn', detail: `very/good/thing 等宽泛词出现 ${fillerCount} 次，尝试换成更精确的表达` })
  else checks.push({ id: 'fillers', label: '宽泛用词', status: 'ok', detail: `宽泛词仅 ${fillerCount} 次` })

  // 重复词（>2 音节的内容词重复 4+ 次）
  const freq = new Map<string, number>()
  for (const x of w) if (x.length > 5 && countSyllablesApprox(x) > 1) freq.set(x, (freq.get(x) ?? 0) + 1)
  const repeated = [...freq.entries()].filter(([, c]) => c >= 4).sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (repeated.length) {
    checks.push({ id: 'repetition', label: '词汇重复', status: repeated.some(([, c]) => c >= 6) ? 'warn' : 'info', detail: `高频重复：${repeated.map(([k, c]) => `${k}×${c}`).join('、')}，考虑同义替换` })
  }

  // 衔接词密度
  const markerCount = MARKERS.reduce((acc, m) => acc + (text.match(new RegExp(`\\b${m}\\b`, 'gi'))?.length ?? 0), 0)
  const markerDensity = sentences > 0 ? markerCount / sentences : 0
  if (markerCount >= 10 || (sentences >= 5 && markerDensity > 0.8)) {
    checks.push({ id: 'markers', label: '衔接手段', status: 'warn', detail: `显性连接词出现 ${markerCount} 次（约每句 ${markerDensity.toFixed(1)} 个），可能过度依赖（高分更常用指代与语义衔接）` })
  } else if (markerCount === 0 && sentences > 4) {
    checks.push({ id: 'markers', label: '衔接手段', status: 'info', detail: '未检出常见连接词，检查句际衔接是否清楚' })
  } else {
    checks.push({ id: 'markers', label: '衔接手段', status: 'ok', detail: `连接词使用 ${markerCount} 次，密度正常` })
  }

  // 拼写/搭配常见混淆
  for (const { pattern, hint } of CONFUSION_PAIRS) {
    if (pattern.test(text)) {
      checks.push({ id: `confusion-${hint.slice(0, 8)}`, label: '常见混淆提示', status: 'warn', detail: hint })
    }
  }

  // 标点与空格
  if (/\s,|\s\./.test(text)) checks.push({ id: 'spacing', label: '标点空格', status: 'warn', detail: '检测到逗号/句号前有空格（英文标点紧跟前词）' })
  if (/\b(\w+)\s+\1\b/i.test(text)) checks.push({ id: 'doubled', label: '重复词', status: 'warn', detail: '检测到相邻重复词（如 the the），请检查' })
  if (text.trim() && !/[.!?]["')\]]?\s*$/.test(text.trim())) checks.push({ id: 'ending', label: '句末标点', status: 'info', detail: '最后一句缺少句末标点' })
  const noCapStart = sentenceArr.filter((s) => s.trim() && /^[a-zà-ÿ]/.test(s.trim())).length
  if (noCapStart > 0) checks.push({ id: 'capitals', label: '大写', status: 'warn', detail: `${noCapStart} 个句子以小写开头` })

  checks.push({
    id: 'boundary',
    label: '边界说明',
    status: 'info',
    detail: '以上是规则化自查提示，不能预测或替代真实 IELTS 评分。请结合自评清单，并定期找合格老师/考官校准。',
  })

  return { wordCount, paragraphs, sentences, avgSentenceWords, longestSentence: longest, longShare, checks }
}
