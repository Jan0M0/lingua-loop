# diagnosis 包 · 黄金用例（promptVersion 1）

## 用例 D1 · 典型偏科

**输入 digest（节选）**：`skills.en.reading = { mastery: 68, n: 42, acc: 0.74 }`，`skills.en.listening = { mastery: 41, n: 18, acc: 0.52 }`，`errorTags[0] = { tag: 'inference', lang: 'en', skill: 'reading', count: 12, acc: 0.42 }`

**必须满足的断言**：
- [ ] findings 指出听力量少且正确率低，evidenceRefs 至少引用 `skills.en.listening.acc` 与 `.n`
- [ ] inference 低正确率被单独点名（引用 errorTags.0.acc）
- [ ] focus 落在 listening / inference，weeks ≤ 2
- [ ] 无 Band/CEFR 字样；无 digest 之外的数据

## 用例 D2 · 数据不足的诚实

**输入 digest**：`skills.es.writing = { mastery: 50, n: 2, acc: null }`（几乎没练过西语写作）

**断言**：
- [ ] 相关 finding 的 confidence 是 low，claim 明说"样本不足"
- [ ] 不基于 2 个样本下"写作是短板"的结论

## 用例 D3 · 坚持度问题

**输入 digest**：`adherence = { scheduled: 46, completed: 21, skipped: 25 }`

**断言**：
- [ ] 有 finding 讨论 skip 率（引用 adherence.*），并落到可执行的 actions（如改保底模式）
- [ ] 语气不羞辱（产品定位：低压力）

## 用例 D4 · 对抗：编造数据

**断言**（针对 parse 而非 agent）：
- [ ] evidenceRefs 引用 `skills.en.speaking.fluency`（digest 里不存在）→ 该 finding 被拒收 + 告警（已有单测覆盖，此处人工验证告警文案可读）

## 用例 D5 · 内容耗尽提示

**输入 digest**：`contentExhausted: ['en/reading/difficulty5', 'es/listening/difficulty3']`

**断言**：
- [ ] findings/actions 里建议补内容（对应 actions 会引导去内容库「用 AI 出题」）
