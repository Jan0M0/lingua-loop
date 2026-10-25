# Lingua Loop · Agent 协作说明

> 给任何 agent（ChatGPT / Claude / Gemini / 本地 agent）的说明：用户会把这个产品的「交接包指令」粘给你。
> 读完这份你就知道该怎么配合。信封 schema 与代码同源：`src/engine/packets/types.ts`。

## 你会收到什么

一段以「你是语言学习教练 / 出题人 / 数据分析师 / 排期顾问」开头的中文指令，末尾带信封格式示例。
它来自 Lingua Loop——一个本地优先的语言学习应用。用户复制指令给你 = 用户主动把指令中列明的数据
交给你处理（应用本身零联网、零 API 调用）。

## 你该做什么（按包类型）

### review（批改）
- 找语言问题：`candidates: [{ tag, evidence }]`，tag 只能从指令里的标签表选，evidence 逐字引用原文。
- `actions`：最多 6 条中文具体改进动作；`summaryZh`：一两句总评。
- **绝不给分数/Band/CEFR**。

### content（内容生成）
- 完全原创（人物、数据、情节自拟），禁止复制真题或商业题库。
- 严格遵守指令里的 id 前缀（如 `en-voc-`）、题目编号（`${内容id}-q1`）与字段示例。
- explanation 必须引用原文证据并说明干扰项为何错，不许写"因为 A 对"。
- 按指令给的数量出题（一次 5–10 条），难度锚点按指令。

### diagnosis（诊断）
- 只基于给你的 digest（数字聚合）。每条 finding 的 `evidenceRefs` 必须指向 digest 里真实存在的路径
  （如 `skills.en.listening.acc`、`errorTags.0.count`）——应用会逐条解析，解析不到整条拒收。
- 数据不足就说"样本不足"，别猜。最多 5 条 findings、3 条 focus、5 条 actions。

### plan（计划约束）
- 你不排计划，只写约束：`type-cap`（某技能窗口内最多几次）、`skill-share`（占比 0.05–0.6）、
  `difficulty`（±1）。每条带 reason，服务已采信的诊断结论。
- days 1–30。越界会被硬边界校验拒收。

## 输出格式

只输出 JSON（可包 markdown 代码块），用信封包裹：

```json
{
  "lingualoop": "packet",
  "schemaVersion": 1,
  "kind": "<review|content|diagnosis|plan>",
  "promptVersion": <原样返回>,
  "payload": { … }
}
```

不要在 JSON 外加解释——应用会自动剥离寒暄，但干净的单个 JSON 最稳。

## 为什么这些红线存在

Lingua Loop 的定位是"可信工具"而不是"分数预测器"；确定性调度、可解释计划、0 Token（零 AI API 调用）
是它的核心资产。你的输出只会以「通过校验的结构化数据」的形式进入产品，并且用户在应用里先预览再确认。
