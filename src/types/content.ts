// 内容库 schema —— 所有内置与用户导入的练习内容都遵守本文件类型。
// 语义校验（重复 ID、答案越界等）见 src/content/validate.ts。

export type Language = 'en' | 'es'

/** 兴趣主题词表（onboarding / 设置 / 推荐共用；用户可自由增删，不限于此清单） */
export const INTEREST_TOPICS = [
  'technology', 'business', 'psychology', 'travel', 'food', 'history',
  'culture', 'science', 'nature', 'sports', 'movies', 'society',
  'creative-writing', 'music', 'daily-life', 'work',
] as const
export type InterestTopic = (typeof INTEREST_TOPICS)[number]

export type Skill = 'reading' | 'listening' | 'writing' | 'speaking' | 'vocab' | 'grammar'

export type Difficulty = 1 | 2 | 3 | 4 | 5

export type ExerciseType =
  | 'vocab-card'
  | 'reading-mc'
  | 'cloze'
  | 'listening'
  | 'writing-task'
  | 'speaking-task'
  | 'grammar-note'
  | 'diagnostic'
  | 'story'
  | 'free-expression'

/** 错误标签统一词表（中英西共用），用于错因归类与再训练 */
export const ERROR_TAGS = [
  // 通用
  'spelling', 'register', 'fluency', 'coherence', 'vocabulary', 'structure',
  // 英语阅读/听力
  'main-idea', 'detail', 'inference', 'writer-attitude', 'paraphrase', 'paragraph-matching', 'synonym',
  // 语法
  'tense', 'agreement', 'word-form', 'article', 'preposition', 'pronoun', 'connector', 'punctuation', 'relative-clause', 'conditional',
  // 词汇使用
  'collocation', 'word-choice', 'meaning',
  // 西语特有
  'ser-estar', 'gender-number', 'conjugation', 'subjunctive', 'accent',
  // 口语
  'pronunciation', 'self-correction', 'range',
] as const
export type ErrorTag = (typeof ERROR_TAGS)[number]

export type QuestionType =
  | 'main-idea' | 'detail' | 'inference' | 'attitude'
  | 'matching' | 'paraphrase' | 'structure' | 'grammar' | 'vocab' | 'listening-detail' | 'listening-inference'

/** 所有内容共有的元数据 */
export interface ContentMeta {
  /** 唯一 ID，命名规范见 docs/CONTENT_AUTHORING.md，如 en-read-001 */
  id: string
  language: Language
  skill: Skill
  type: ExerciseType
  /** 主题（kebab-case，如 environment / daily-life） */
  topic: string
  /** 1=最易 … 5=最难（英语≈2:Band5-6 3:Band6-7 4:Band7-8 5:Band8+；西语≈1:A1 2:A2 3:B1 4:B2） */
  difficulty: Difficulty
  /** 可选展示用 CEFR 标签 */
  cefr?: string
  estimatedMinutes: number
  /** 1–5 个标签：主题或错误标签（ERROR_TAGS 子集） */
  tags: string[]
  /** ISO 日期 YYYY-MM-DD */
  createdAt: string
  contentVersion: number
  source: 'original' | 'user-imported'
  /** 外部来源备注（原创内容可省略） */
  license?: string
}

// ---------- 选择题 ----------

export interface MCQuestion {
  /** 形如 `${contentId}-q1` */
  id: string
  stem: string
  options: string[]
  answerIndex: number
  /** 证据型解析：指出原文/规则依据，并说明干扰项为何错 */
  explanation: string
  errorTags: ErrorTag[]
  questionType?: QuestionType
}

// ---------- 词卡 ----------

export interface VocabCard extends ContentMeta {
  type: 'vocab-card'
  skill: 'vocab'
  /** 词条（英语单词/搭配 或 西语单词/表达） */
  term: string
  /** 词性；西语含阴阳性，如 sust. m. */
  pos: string
  /** 中文释义 */
  glossZh: string
  /** 目标语简明定义（自然、贴合目标水平） */
  definition: string
  /** 2–4 个自然搭配 */
  collocations: string[]
  /** 2–3 个例句 + 中文 */
  examples: { sentence: string; zh: string }[]
  /** 常见错误/易混点说明（中文） */
  commonError?: string
  /** 语域说明 */
  register?: string
  /** 相关词形/同族词 */
  relatedForms?: string[]
}

// ---------- 阅读 ----------

export interface ReadingExercise extends ContentMeta {
  type: 'reading-mc'
  skill: 'reading'
  title: string
  titleZh: string
  /** 段落用空行分隔 */
  passage: string
  questions: MCQuestion[]
}

// ---------- 语境填空（含英语语法语境题） ----------

export interface ClozeExercise extends ContentMeta {
  type: 'cloze'
  skill: 'grammar' | 'vocab' | 'reading'
  title: string
  titleZh: string
  /** 完整语境短文（≤120 词）或题干说明 */
  intro: string
  /** 空位以 ____ 标注，与 questions 一一对应，按顺序填 */
  passage: string
  questions: MCQuestion[]
}

// ---------- 听力 ----------

export interface ListeningScriptLine {
  speaker: string
  line: string
}

export interface ListeningExercise extends ContentMeta {
  type: 'listening'
  skill: 'listening'
  title: string
  titleZh: string
  /** 场景中文说明 */
  setting: string
  script: ListeningScriptLine[]
  /** TTS 语速提示 0.5–1.2，西语低级别建议 0.8 */
  ttsRate?: number
  /** 作答后再显示脚本；'always' 用于 A1 支持模式 */
  transcriptMode: 'after' | 'always'
  questions: MCQuestion[]
}

// ---------- 写作 ----------

export type WritingVariant =
  | 'ielts-t1-academic'
  | 'ielts-t1-general'
  | 'ielts-t2'
  | 'es-message'
  | 'es-email-formal'
  | 'es-email-informal'
  | 'es-opinion'
  | 'es-narrative'
  | 'es-description'

export interface WritingExercise extends ContentMeta {
  type: 'writing-task'
  skill: 'writing'
  variant: WritingVariant
  title: string
  /** 目标语任务指令（原创、贴近考试措辞但不复制真题） */
  prompt: string
  promptZh: string
  /** Academic 图表任务：用文字/表格描述原创数据（不使用外部图片） */
  visualData?: { kind: 'table' | 'data-description'; markdown: string }
  /** [最少, 目标] 字数 */
  targetWords: [number, number]
  suggestedMinutes: number
  /** 自评维度：dimension 使用公开评分维度的简洁表达 */
  checklist: { dimension: string; descriptors: string[] }[]
  /** 结构提纲提示（不是范文） */
  outlineHints?: string[]
}

// ---------- 口语 ----------

export type SpeakingVariant =
  | 'ielts-part1'
  | 'ielts-part2'
  | 'ielts-part3'
  | 'es-roleplay'
  | 'es-describe'
  | 'es-discuss'
  | 'es-narrate'

export interface SpeakingExercise extends ContentMeta {
  type: 'speaking-task'
  skill: 'speaking'
  variant: SpeakingVariant
  title: string
  prompt: string
  promptZh: string
  /** Part 2 话题卡要点 / 角色扮演情境要点 */
  bulletPoints?: string[]
  /** 后续追问 */
  followUps?: string[]
  prepSeconds: number
  speakSeconds: number
  /** 自评维度（对应公开评分维度的行为化描述） */
  selfEvalDimensions: { dimension: string; descriptors: string[] }[]
  usefulPhrases?: string[]
}

// ---------- 语法小课 ----------

export interface GrammarNote extends ContentMeta {
  type: 'grammar-note'
  skill: 'grammar'
  title: string
  titleZh: string
  /** 中文讲解（简洁，含行内示例） */
  explanationZh: string
  examples: { target: string; zh: string }[]
  quickChecks: MCQuestion[]
}

// ---------- 诊断 ----------

export interface DiagnosticExercise extends ContentMeta {
  type: 'diagnostic'
  /** 覆盖多技能的混合选择题，用于 onboarding 微诊断 */
  questions: (MCQuestion & { skill: Skill })[]
}

// ---------- 微型故事 / 兴趣探索卡（v2 §3A：先理解意义，再注意语言形式） ----------

export interface StoryHighlight {
  /** 目标语表达（词、搭配或语块） */
  expression: string
  /** 中文释义（自然、贴合故事语境） */
  glossZh: string
  /** 该表达在故事中的原句 */
  fromStory: string
  /** 例句（故事外的一个自然用例） */
  extraExample?: string
}

export interface StoryExercise extends ContentMeta {
  type: 'story'
  /** reading 或 listening（listening 表示优先以 TTS 听读联动方式体验） */
  mode: 'reading' | 'listening'
  title: string
  titleZh: string
  /** 一句话钩子：让人想知道后续（中文） */
  hookZh: string
  /** 正文分段（每段 2-5 句，便于"尝一口"与分段收听） */
  paragraphs: string[]
  /** 轻理解问题（2-3 道，非考试措辞；可选） */
  questions?: MCQuestion[]
  /** 值得带走 1-3 个表达（读完/听完后自然突出） */
  highlights: StoryHighlight[]
}

// ---------- 自由表达（v2 §3A.3 表达工作室提示） ----------

export interface FreeExpressionExercise extends ContentMeta {
  type: 'free-expression'
  language: Language
  title: string
  titleZh: string
  /** 表达提示（目标语，开放式，不设唯一答案） */
  prompt: string
  promptZh: string
  /** 支持形式 */
  form: 'write' | 'speak' | 'either'
  /** 复盘自查提示（3 条以内） */
  reflectionHints: string[]
  /** 可参考的开头表达（自然、非模板腔） */
  starterPhrases: string[]
}

export type Exercise =
  | VocabCard
  | ReadingExercise
  | ClozeExercise
  | ListeningExercise
  | WritingExercise
  | SpeakingExercise
  | GrammarNote
  | DiagnosticExercise
  | StoryExercise
  | FreeExpressionExercise

/** 内容文件模块的统一导出形状 */
export interface ContentModule {
  items: Exercise[]
}
