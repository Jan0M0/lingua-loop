// 内容语义校验器：纯函数，被 tests/content.test.ts 与用户导入流程共用。
// 类型检查（tsc）负责结构；这里负责跨字段/语义规则。
import { ERROR_TAGS } from '../types/content'
import type { ContentIssue } from '../types/app'
import type {
  ClozeExercise,
  Exercise,
  FreeExpressionExercise,
  GrammarNote,
  ListeningExercise,
  MCQuestion,
  ReadingExercise,
  SpeakingExercise,
  StoryExercise,
  VocabCard,
  WritingExercise,
  DiagnosticExercise,
} from '../types/content'

const ID_PREFIX_RULES: { prefix: string; type: Exercise['type'] }[] = [
  { prefix: 'en-voc-', type: 'vocab-card' },
  { prefix: 'es-voc-', type: 'vocab-card' },
  { prefix: 'en-read-', type: 'reading-mc' },
  { prefix: 'es-read-', type: 'reading-mc' },
  { prefix: 'en-cloze-', type: 'cloze' },
  { prefix: 'es-cloze-', type: 'cloze' },
  { prefix: 'en-ls-', type: 'listening' },
  { prefix: 'es-ls-', type: 'listening' },
  { prefix: 'en-w-', type: 'writing-task' },
  { prefix: 'es-w-', type: 'writing-task' },
  { prefix: 'en-sp-', type: 'speaking-task' },
  { prefix: 'es-sp-', type: 'speaking-task' },
  { prefix: 'en-gr-', type: 'grammar-note' },
  { prefix: 'es-gr-', type: 'grammar-note' },
  { prefix: 'en-diag-', type: 'diagnostic' },
  { prefix: 'es-diag-', type: 'diagnostic' },
  { prefix: 'en-story-', type: 'story' },
  { prefix: 'es-story-', type: 'story' },
  { prefix: 'en-fe-', type: 'free-expression' },
  { prefix: 'es-fe-', type: 'free-expression' },
]

const LANG_BY_PREFIX: Record<string, 'en' | 'es'> = {
  en: 'en',
  es: 'es',
}

function validateMeta(ex: Exercise, issues: ContentIssue[]): void {
  if (!ex.id || typeof ex.id !== 'string') {
    issues.push({ level: 'error', id: ex.id ?? '(missing id)', message: '缺少 id' })
    return
  }
  if (!/^[a-z]{2}-[a-z0-9-]+$/.test(ex.id)) {
    issues.push({ level: 'error', id: ex.id, message: 'id 命名不规范（应形如 en-read-001）' })
  }
  const rule = ID_PREFIX_RULES.find((r) => ex.id.startsWith(r.prefix))
  if (rule && rule.type !== ex.type) {
    issues.push({ level: 'error', id: ex.id, message: `id 前缀 ${rule.prefix} 与 type=${ex.type} 不匹配` })
  }
  const langPrefix = ex.id.split('-')[0]
  if (LANG_BY_PREFIX[langPrefix] && LANG_BY_PREFIX[langPrefix] !== ex.language) {
    issues.push({ level: 'error', id: ex.id, message: `id 语言前缀与 language=${ex.language} 不一致` })
  }
  if (ex.difficulty == null || ex.difficulty < 1 || ex.difficulty > 5 || !Number.isInteger(ex.difficulty)) {
    issues.push({ level: 'error', id: ex.id, field: 'difficulty', message: 'difficulty 必须是 1–5 整数' })
  }
  if (!Number.isFinite(ex.estimatedMinutes) || ex.estimatedMinutes <= 0 || ex.estimatedMinutes > 60) {
    issues.push({ level: 'error', id: ex.id, field: 'estimatedMinutes', message: 'estimatedMinutes 必须在 1–60' })
  }
  if (!Array.isArray(ex.tags) || ex.tags.length < 1 || ex.tags.length > 5) {
    issues.push({ level: 'error', id: ex.id, field: 'tags', message: '需要 1–5 个标签' })
  } else {
    for (const t of ex.tags) {
      if (!/^[a-z0-9-]+$/.test(t)) {
        issues.push({ level: 'error', id: ex.id, field: 'tags', message: `标签格式不规范: ${t}` })
      }
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ex.createdAt ?? '')) {
    issues.push({ level: 'error', id: ex.id, field: 'createdAt', message: 'createdAt 应为 YYYY-MM-DD' })
  }
  if (ex.contentVersion == null || ex.contentVersion < 1) {
    issues.push({ level: 'error', id: ex.id, field: 'contentVersion', message: 'contentVersion ≥ 1' })
  }
  if (ex.source !== 'original' && ex.source !== 'user-imported') {
    issues.push({ level: 'error', id: ex.id, field: 'source', message: 'source 必须是 original | user-imported' })
  }
  if (!ex.topic || !/^[a-z0-9-]+$/.test(ex.topic)) {
    issues.push({ level: 'warning', id: ex.id, field: 'topic', message: 'topic 应为 kebab-case 主题词' })
  }
}

function validateQuestions(
  exId: string,
  questions: MCQuestion[] | undefined,
  issues: ContentIssue[],
  opts: { requireType?: boolean } = {}
): void {
  if (!questions || questions.length === 0) {
    issues.push({ level: 'error', id: exId, field: 'questions', message: '缺少题目' })
    return
  }
  const seen = new Set<string>()
  questions.forEach((q, i) => {
    if (!q.id) {
      issues.push({ level: 'error', id: exId, field: `questions[${i}].id`, message: '缺少题目 id' })
    } else {
      if (seen.has(q.id)) issues.push({ level: 'error', id: exId, field: q.id, message: '题目 id 重复' })
      seen.add(q.id)
      if (q.id !== `${exId}-q${i + 1}`) {
        issues.push({ level: 'error', id: exId, field: q.id, message: `题目 id 应为 ${exId}-q${i + 1}` })
      }
    }
    if (!q.stem || !q.stem.trim()) {
      issues.push({ level: 'error', id: exId, field: `questions[${i}].stem`, message: '题干为空' })
    }
    if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 5) {
      issues.push({ level: 'error', id: exId, field: `questions[${i}].options`, message: '选项应为 3–5 个' })
    }
    if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex >= (q.options?.length ?? 0)) {
      issues.push({ level: 'error', id: exId, field: `questions[${i}].answerIndex`, message: '答案索引越界' })
    }
    const dup = new Set(q.options ?? []).size !== (q.options ?? []).length
    if (dup) issues.push({ level: 'error', id: exId, field: `questions[${i}].options`, message: '选项重复' })
    if (!q.explanation || q.explanation.trim().length < 20) {
      issues.push({
        level: 'error',
        id: exId,
        field: `questions[${i}].explanation`,
        message: '解析过短：需指出证据并说明干扰项为何错',
      })
    }
    if (!Array.isArray(q.errorTags) || q.errorTags.length === 0) {
      issues.push({ level: 'error', id: exId, field: `questions[${i}].errorTags`, message: '缺少错误标签' })
    } else {
      for (const t of q.errorTags) {
        if (!(ERROR_TAGS as readonly string[]).includes(t)) {
          issues.push({ level: 'error', id: exId, field: `questions[${i}].errorTags`, message: `未知错误标签: ${t}` })
        }
      }
    }
  })
}

function nonEmpty(s: unknown): boolean {
  return typeof s === 'string' && s.trim().length > 0
}

export function validateExercise(ex: Exercise): ContentIssue[] {
  const issues: ContentIssue[] = []
  validateMeta(ex, issues)
  switch (ex.type) {
    case 'vocab-card': {
      const v = ex as VocabCard
      if (!nonEmpty(v.term)) issues.push({ level: 'error', id: ex.id, field: 'term', message: 'term 为空' })
      if (!nonEmpty(v.glossZh)) issues.push({ level: 'error', id: ex.id, field: 'glossZh', message: '中文释义为空' })
      if (!nonEmpty(v.definition)) issues.push({ level: 'error', id: ex.id, field: 'definition', message: 'definition 为空' })
      if (!Array.isArray(v.collocations) || v.collocations.length < 2) {
        issues.push({ level: 'error', id: ex.id, field: 'collocations', message: '至少 2 个搭配' })
      }
      if (!Array.isArray(v.examples) || v.examples.length < 2) {
        issues.push({ level: 'error', id: ex.id, field: 'examples', message: '至少 2 个例句' })
      } else {
        v.examples.forEach((e, i) => {
          if (!nonEmpty(e.sentence) || !nonEmpty(e.zh)) {
            issues.push({ level: 'error', id: ex.id, field: `examples[${i}]`, message: '例句或中文翻译为空' })
          }
        })
      }
      break
    }
    case 'reading-mc': {
      const r = ex as ReadingExercise
      if (!nonEmpty(r.title)) issues.push({ level: 'error', id: ex.id, field: 'title', message: '标题为空' })
      const words = (r.passage ?? '').trim().split(/\s+/).filter(Boolean).length
      if (words < 60) {
        issues.push({ level: 'error', id: ex.id, field: 'passage', message: `文章过短（${words} 词，至少 60）` })
      }
      if ((r.questions ?? []).length < 3 || (r.questions ?? []).length > 6) {
        issues.push({ level: 'error', id: ex.id, field: 'questions', message: '阅读题应为 3–6 道' })
      }
      validateQuestions(ex.id, r.questions, issues)
      break
    }
    case 'cloze': {
      const c = ex as ClozeExercise
      const blanks = (c.passage ?? '').match(/_{2,}/g)?.length ?? 0
      if (blanks !== (c.questions ?? []).length) {
        issues.push({
          level: 'error',
          id: ex.id,
          field: 'passage',
          message: `空位数量 ${blanks} 与题目数 ${c.questions?.length ?? 0} 不一致`,
        })
      }
      validateQuestions(ex.id, c.questions, issues)
      break
    }
    case 'listening': {
      const l = ex as ListeningExercise
      if (!Array.isArray(l.script) || l.script.length < 4) {
        issues.push({ level: 'error', id: ex.id, field: 'script', message: '听力脚本至少 4 行' })
      } else {
        l.script.forEach((line, i) => {
          if (!nonEmpty(line.speaker) || !nonEmpty(line.line)) {
            issues.push({ level: 'error', id: ex.id, field: `script[${i}]`, message: '脚本行缺少 speaker 或内容' })
          }
        })
      }
      if ((l.questions ?? []).length < 2) {
        issues.push({ level: 'error', id: ex.id, field: 'questions', message: '听力至少 2 题' })
      }
      if (l.transcriptMode !== 'after' && l.transcriptMode !== 'always') {
        issues.push({ level: 'error', id: ex.id, field: 'transcriptMode', message: 'transcriptMode 应为 after | always' })
      }
      validateQuestions(ex.id, l.questions, issues)
      break
    }
    case 'writing-task': {
      const w = ex as WritingExercise
      if (!nonEmpty(w.prompt)) issues.push({ level: 'error', id: ex.id, field: 'prompt', message: '写作指令为空' })
      const [lo, hi] = w.targetWords ?? [0, 0]
      if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo <= 0 || hi < lo) {
        issues.push({ level: 'error', id: ex.id, field: 'targetWords', message: 'targetWords 应为 [最小, 目标]' })
      }
      if (!Array.isArray(w.checklist) || w.checklist.length < 3) {
        issues.push({ level: 'error', id: ex.id, field: 'checklist', message: '至少 3 个自评维度' })
      }
      break
    }
    case 'speaking-task': {
      const s = ex as SpeakingExercise
      if (!nonEmpty(s.prompt)) issues.push({ level: 'error', id: ex.id, field: 'prompt', message: '口语任务为空' })
      if (s.prepSeconds == null || s.prepSeconds < 0 || s.prepSeconds > 300) {
        issues.push({ level: 'error', id: ex.id, field: 'prepSeconds', message: 'prepSeconds 0–300' })
      }
      if (s.speakSeconds == null || s.speakSeconds < 20 || s.speakSeconds > 900) {
        issues.push({ level: 'error', id: ex.id, field: 'speakSeconds', message: 'speakSeconds 20–900' })
      }
      if (!Array.isArray(s.selfEvalDimensions) || s.selfEvalDimensions.length < 3) {
        issues.push({ level: 'error', id: ex.id, field: 'selfEvalDimensions', message: '至少 3 个自评维度' })
      }
      break
    }
    case 'grammar-note': {
      const g = ex as GrammarNote
      if (!nonEmpty(g.explanationZh) || g.explanationZh.length < 40) {
        issues.push({ level: 'error', id: ex.id, field: 'explanationZh', message: '中文讲解过短' })
      }
      if (!Array.isArray(g.examples) || g.examples.length < 2) {
        issues.push({ level: 'error', id: ex.id, field: 'examples', message: '至少 2 个例句' })
      }
      if ((g.quickChecks ?? []).length < 2) {
        issues.push({ level: 'error', id: ex.id, field: 'quickChecks', message: '至少 2 道快检题' })
      }
      validateQuestions(ex.id, g.quickChecks, issues)
      break
    }
    case 'diagnostic': {
      const d = ex as DiagnosticExercise
      if ((d.questions ?? []).length < 8) {
        issues.push({ level: 'error', id: ex.id, field: 'questions', message: '诊断至少 8 题' })
      }
      d.questions?.forEach((q, i) => {
        if (!['reading', 'listening', 'writing', 'speaking', 'vocab', 'grammar'].includes(q.skill)) {
          issues.push({ level: 'error', id: ex.id, field: `questions[${i}].skill`, message: '诊断题缺少合法 skill' })
        }
      })
      validateQuestions(ex.id, d.questions, issues)
      break
    }
    case 'story': {
      const s = ex as StoryExercise
      if (!nonEmpty(s.title) || !nonEmpty(s.hookZh)) {
        issues.push({ level: 'error', id: ex.id, field: 'title/hookZh', message: '故事缺标题或钩子' })
      }
      if (!Array.isArray(s.paragraphs) || s.paragraphs.length < 2) {
        issues.push({ level: 'error', id: ex.id, field: 'paragraphs', message: '故事至少 2 段（支持"尝一口"）' })
      } else {
        s.paragraphs.forEach((p, i) => {
          if (!nonEmpty(p)) issues.push({ level: 'error', id: ex.id, field: `paragraphs[${i}]`, message: '空段落' })
        })
      }
      if (!Array.isArray(s.highlights) || s.highlights.length < 1 || s.highlights.length > 3) {
        issues.push({ level: 'error', id: ex.id, field: 'highlights', message: '故事需要 1–3 个值得带走的表达' })
      } else {
        s.highlights.forEach((h, i) => {
          if (!nonEmpty(h.expression) || !nonEmpty(h.glossZh) || !nonEmpty(h.fromStory)) {
            issues.push({ level: 'error', id: ex.id, field: `highlights[${i}]`, message: '表达缺少 expression/glossZh/fromStory' })
          }
        })
      }
      if (s.questions && s.questions.length > 0) {
        if (s.questions.length < 2) {
          issues.push({ level: 'error', id: ex.id, field: 'questions', message: '故事理解题应为 2–3 道或省略' })
        }
        validateQuestions(ex.id, s.questions, issues)
      }
      if (s.mode !== 'reading' && s.mode !== 'listening') {
        issues.push({ level: 'error', id: ex.id, field: 'mode', message: 'mode 应为 reading | listening' })
      }
      break
    }
    case 'free-expression': {
      const f = ex as FreeExpressionExercise
      if (!nonEmpty(f.prompt)) issues.push({ level: 'error', id: ex.id, field: 'prompt', message: '自由表达缺提示' })
      if (!Array.isArray(f.reflectionHints) || f.reflectionHints.length < 1 || f.reflectionHints.length > 3) {
        issues.push({ level: 'error', id: ex.id, field: 'reflectionHints', message: '复盘提示 1–3 条' })
      }
      if (!Array.isArray(f.starterPhrases) || f.starterPhrases.length < 2) {
        issues.push({ level: 'error', id: ex.id, field: 'starterPhrases', message: '至少 2 条开头表达' })
      }
      if (!['write', 'speak', 'either'].includes(f.form)) {
        issues.push({ level: 'error', id: ex.id, field: 'form', message: 'form 应为 write | speak | either' })
      }
      break
    }
  }
  return issues
}

/** 校验一批内容（内置库或导入预览） */
export function validateAll(exercises: Exercise[]): ContentIssue[] {
  const issues: ContentIssue[] = []
  const seen = new Map<string, string>()
  for (const ex of exercises) {
    if (seen.has(ex.id)) {
      issues.push({ level: 'error', id: ex.id, message: `ID 重复（也出现在 ${seen.get(ex.id)}）` })
    } else {
      seen.set(ex.id, ex.type)
    }
    issues.push(...validateExercise(ex))
  }
  return issues
}

/** 用户导入时对原始 JSON 做结构 + 语义校验（tsc 不经过这里） */
export function validateRawContent(raw: unknown): { ok: Exercise[]; issues: ContentIssue[] } {
  const issues: ContentIssue[] = []
  if (!Array.isArray(raw)) {
    return { ok: [], issues: [{ level: 'error', id: '(root)', message: '导入内容应为对象数组' }] }
  }
  // 结构快速检查后再进入语义校验
  const typed: Exercise[] = []
  raw.forEach((item, i) => {
    if (item == null || typeof item !== 'object') {
      issues.push({ level: 'error', id: `(item ${i})`, message: '不是对象' })
      return
    }
    const obj = item as Record<string, unknown>
    if (typeof obj.id !== 'string' || typeof obj.type !== 'string') {
      issues.push({ level: 'error', id: `(item ${i})`, message: '缺少 id 或 type' })
      return
    }
    typed.push(item as Exercise)
  })
  issues.push(...validateAll(typed))
  const errorIds = new Set(issues.filter((i) => i.level === 'error').map((i) => i.id))
  return { ok: typed.filter((e) => !errorIds.has(e.id)), issues }
}
