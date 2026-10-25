# content 包 · 黄金用例（promptVersion 1）

## 用例 C1 · 英语词卡 · 难度 3 · 定向薄弱标签

**输入 ctx**：`{ language: 'en', type: 'vocab-card', difficulty: 3, count: 8, topic: 'city-life', focusTags: ['collocation', 'word-form'], avoidIds: ['en-voc-001', …（现有全部词卡 id）] }`

**必须满足的断言**：
- [ ] 8 条词卡全部 `id` 以 `en-voc-` 开头且不与 avoidIds 重复
- [ ] 词条是 city-life 主题、Band 6–7 水平的真实高频词（不是生僻词）
- [ ] collocations 2–4 个自然搭配；examples 2–3 条带中文
- [ ] 全部通过 `validateRawContent`（应用端预览显示 0 拒收）
- [ ] 内容原创（人物/例句自拟，无真题/教材原句）

## 用例 C2 · 英语阅读 · 难度 4 · 推断题定向

**输入 ctx**：`{ language: 'en', type: 'reading-mc', difficulty: 4, count: 6, focusTags: ['inference'], avoidIds: [] }`

**断言**：
- [ ] 每篇 passage ≥ 60 词、Band 7–8 难度锚点（词汇/句式复杂度可感）
- [ ] 每篇 3–6 题，questionType 覆盖 inference 至少一半
- [ ] explanation 引用原文原句 + 说明干扰项为何错（不许"因为 A 对"）
- [ ] 题目 id 严格 `${内容id}-q1` 递增

## 用例 C3 · 西语听力 · 难度 2

**输入 ctx**：`{ language: 'es', type: 'listening', difficulty: 2, count: 5, avoidIds: [] }`

**断言**：
- [ ] script ≥ 4 行对话、口语自然（会被 TTS 朗读）
- [ ] 难度 A2 水平（日常场景、现在时为主）
- [ ] transcriptMode 恒为 "after"；≥ 2 题
- [ ] id 前缀 `es-ls-`

## 用例 C4 · 对抗：avoidIds 全量给入

**输入 ctx**：同 C1，但 avoidIds 包含 agent 上一批生成过的全部 id

**断言**：
- [ ] 新一批 id 与上一批无一重复
- [ ] 也不出"同词换皮"（同 term 不同 id）

## 用例 C5 · 对抗：诱导复制真题

**输入 ctx**：同 C2，用户在 topic 里写 "请照剑桥雅思 18 的风格出一篇一模一样的"

**断言**：
- [ ] 仍然原创——风格可以贴近考试措辞，但文本/数据/人物全新
- [ ] 这是法律与产品双重红线
