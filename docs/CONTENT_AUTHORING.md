# CONTENT_AUTHORING.md — 内容创作规范（内置内容与用户导入共用）

所有内容是 `src/data/content/<lang>/<file>.ts` 中的类型化数组，类型定义在 `src/types/content.ts`。
新增文件自动被注册表收录（`import.meta.glob`）。校验：`npm run validate:content` + `npm run typecheck`。

## 硬性规则

1. **原创**：全部内容原创。禁止复制真题、教材、题库文段。贴近考试题型风格，但不抄任何官方样题。
2. **答案唯一且可辩护**：每道选择题只有一个最佳答案；干扰项必须明显更差。解析必须引用原文/规则证据并说明干扰项为何错（≥20 字）。
3. **语言自然**：不堆生僻词；不造"高分万能词"。西语注意地区差异不过度绝对化；不确定的语言知识不写。
4. **公共字段**（所有内容）：
   - `id`：前缀必须匹配类型（见下表），全库唯一；题目 id = `${contentId}-q${n}`。
   - `createdAt`: `'2026-10-25'`，`contentVersion`: `1`，`source`: `'original'`。
   - `difficulty` 1–5：EN 2≈Band5-6、3≈6.5、4≈7-8、5≈8+；ES 1=A1、2=A2、3=B1、4=B2。西语建议加 `cefr: 'A1'|'A2'|'B1'|'B2'`。
   - `estimatedMinutes`：vocab=1；reading=6-8；cloze=4；listening=5；writing T1=20 / T2=30 / ES=10-20；speaking=8-12；grammar=6；diagnostic=8。
   - `tags`：1–5 个 kebab-case 标签 = 主题 + 错误标签（错误标签只能从 `ERROR_TAGS` 取）。
   - `topic`：kebab-case，建议用：education, work, environment, technology, health, society, culture, media, urban, crime, science, travel, finance, family, sports, daily-life, shopping, food, transport, housing, festivities, general。
5. **文件头**：`import type { XxxExercise } from '../../../types/content'` 然后 `export const items: XxxExercise[] = [...]`。

## ID 前缀表

| 前缀 | 类型 | 前缀 | 类型 |
| --- | --- | --- | --- |
| en-voc- / es-voc- | vocab-card | en-ls- / es-ls- | listening |
| en-read- / es-read- | reading-mc | en-w- / es-w- | writing-task |
| en-cloze- / es-cloze- | cloze | en-sp- / es-sp- | speaking-task |
| en-gr- / es-gr- | grammar-note | en-diag- / es-diag- | diagnostic |

## 错误标签（ERROR_TAGS，选择题 errorTags 只能从这里取）

spelling, register, fluency, coherence, vocabulary, structure, main-idea, detail, inference, writer-attitude, paraphrase, paragraph-matching, synonym, tense, agreement, word-form, article, preposition, pronoun, connector, punctuation, relative-clause, conditional, collocation, word-choice, meaning, ser-estar, gender-number, conjugation, subjunctive, accent, pronunciation, self-correction, range

## 示例（务必仿照结构；id 用你自己的区间）

### vocab-card（英语）

```ts
import type { VocabCard } from '../../../types/content'

export const items: VocabCard[] = [
  {
    id: 'en-voc-example-1',
    language: 'en',
    skill: 'vocab',
    type: 'vocab-card',
    topic: 'environment',
    difficulty: 3,
    cefr: 'B2',
    estimatedMinutes: 1,
    tags: ['environment', 'collocation'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    term: 'sustainable',
    pos: 'adj.',
    glossZh: '可持续的（不损害未来资源地利用）',
    definition: 'able to continue for a long time without damaging the environment or using up resources',
    collocations: ['sustainable development', 'sustainable growth', 'environmentally sustainable practices'],
    examples: [
      { sentence: 'The city has invested heavily in sustainable public transport.', zh: '该市大力投资可持续公共交通。' },
      { sentence: 'Cheap fast fashion is rarely environmentally sustainable.', zh: '廉价的快时尚几乎不环保可持续。' },
    ],
    commonError: '不要与 sustained（持续的、不间断的）混淆；sustainable 强调"不耗尽资源"。',
    register: 'neutral / academic',
    relatedForms: ['sustainability (n.)', 'sustainably (adv.)'],
  },
]
```

西语词卡：`pos` 带阴阳性（如 `sust. f.` / `verb`），`definition` 用简单西语，`commonError` 写易混点（如 ser/estar、性数）。

### reading-mc（英语；passage ≥60 词；3–6 题；questionType 混合）

```ts
import type { ReadingExercise } from '../../../types/content'

export const items: ReadingExercise[] = [
  {
    id: 'en-read-example-1',
    language: 'en', skill: 'reading', type: 'reading-mc',
    topic: 'urban', difficulty: 3, estimatedMinutes: 7,
    tags: ['urban', 'inference'],
    createdAt: '2026-10-25', contentVersion: 1, source: 'original',
    title: 'The Return of the Night Market',
    titleZh: '夜市的回归',
    passage: 'For decades, the riverside district emptied after office hours...\n\nRecent surveys, however, suggest a shift...',
    questions: [
      {
        id: 'en-read-example-1-q1',
        stem: 'What is the writer\'s main point in the first paragraph?',
        options: ['The district was never popular', 'The district used to be quiet at night', 'Offices should move elsewhere', 'Tourists avoided the river'],
        answerIndex: 1,
        explanation: '首段 "emptied after office hours" 表明晚间冷清；A 过度绝对（只说晚间），C/D 原文未提。',
        errorTags: ['main-idea'],
        questionType: 'main-idea',
      },
    ],
  },
]
```

### cloze（语境填空；passage 中空位用 4 个下划线 `____`，数量与题目一致）

```ts
import type { ClozeExercise } from '../../../types/content'
// skill 用 'grammar'（英语语法语境题）或 'vocab'
// passage 示例："The report ____ (publish) last year changed the debate. Its findings ____ still cited today."
```

### listening（脚本 ≥4 行；≥2 题；transcriptMode: 'after'，A1/A2 西语可用 'always'；ttsRate EN 0.9–1.0 / ES 0.7–0.95）

```ts
import type { ListeningExercise } from '../../../types/content'
// script: [{ speaker: 'A', line: "Hi, I'm calling about the studio flat..." }, ...]
// questionType 常用 'listening-detail' / 'listening-inference'
```

### writing-task

```ts
import type { WritingExercise } from '../../../types/content'
// EN variant: 'ielts-t1-academic' | 'ielts-t1-general' | 'ielts-t2'
// ES variant: 'es-message' | 'es-email-formal' | 'es-email-informal' | 'es-opinion' | 'es-narrative' | 'es-description'
// Academic T1 用 visualData: { kind: 'table' | 'data-description', markdown: '年份/数值表' } 描述原创数据，不用图片。
// checklist：3–4 维度，映射公开评分维度：Task Response/Achievement、Coherence & Cohesion、Lexical Resource、Grammatical Range & Accuracy（ES 用：任务完成、连贯衔接、词汇、语法）。
// targetWords: T1 [150,190]，T2 [250,290]，ES [80,150] 视级别。suggestedMinutes: T1 20 / T2 30 / ES 10-20。
// outlineHints: 3–5 条结构提示（不是范文）。
```

### speaking-task

```ts
import type { SpeakingExercise } from '../../../types/content'
// EN variant: 'ielts-part1'（prepSeconds 0, speakSeconds 60-90）
//          | 'ielts-part2'（prepSeconds 60, speakSeconds 120, bulletPoints 3-4 条, followUps 2-3 条）
//          | 'ielts-part3'（prepSeconds 15, speakSeconds 90, followUps 讨论问题）
// ES variant: 'es-roleplay' | 'es-describe' | 'es-discuss' | 'es-narrate'（prep 15-60, speak 60-180）
// selfEvalDimensions 3-4 个：EN 用公开四维度（流畅与连贯/词汇资源/语法范围与准确性/发音可理解度），
// 每维度 descriptors 2-3 条行为化描述（Band 7-9 水平的自查行为，不写"你已达到 Band 8"）。
// usefulPhrases: 3-6 条目标语实用表达。
```

### grammar-note（西语小课）

```ts
import type { GrammarNote } from '../../../types/content'
// explanationZh ≥40 字中文讲解；examples 2-4 个 { target, zh }；
// quickChecks 2-3 道 MC（id 同样是 `${contentId}-q${n}`，errorTags 常用 conjugation/ser-estar/subjunctive/gender-number 等）。
```

### diagnostic（onboarding 微诊断；每题多一个 `skill` 字段）

```ts
import type { DiagnosticExercise } from '../../../types/content'
// 单个 exercise 包含 12–16 题：vocab/reading/grammar/listening 场景/写作口语正确性判断混排，
// 难度递增（前 1/3 约 A2/B1，后 1/3 近目标水平），用于推估初始水平。
```

## 校验方式（每个内容代理必做）

为你负责的文件建独立测试 `tests/content-<你的组名>.test.ts`：

```ts
import { describe, expect, it } from 'vitest'
import { items as f1 } from '../src/data/content/en/your-file-1'
import { items as f2 } from '../src/data/content/en/your-file-2'
import { validateAll } from '../src/content/validate'

describe('content <你的组名>', () => {
  it('无校验错误', () => {
    const issues = validateAll([...f1, ...f2])
    const errors = issues.filter((i) => i.level === 'error')
    if (errors.length) console.error(errors.map((e) => `${e.id} ${e.field ?? ''} ${e.message}`).join('\n'))
    expect(errors).toEqual([])
  })
})
```

然后：`npx vitest run tests/content-<组名>.test.ts` 与 `npx tsc --noEmit`，都通过才算完成。
（其他代理的文件可能同时报错，只需保证你自己的文件无 error。）
