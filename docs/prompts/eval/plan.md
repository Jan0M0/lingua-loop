# plan 包 · 黄金用例（promptVersion 1）

## 用例 P1 · 减量提质

**输入 ctx**：digest 显示 `skills.en.writing = { mastery: 63, n: 55, acc: null }`（样本充足但 score 平台期），采信 finding："writing 练习量大但自评分数 4 周无提升"

**必须满足的断言**：
- [ ] 产出 `type-cap writing ≤ 2 次 / 14 天` 之类的约束（不是"停止练写作"）
- [ ] reason 引用那条采信结论
- [ ] 不排任何具体某天的计划

## 用例 P2 · 补短板

**输入 ctx**：digest 显示 listening acc 0.52 且 n=18，采信 finding："听力正确率显著低于阅读 13 个点"

**断言**：
- [ ] 产出 `skill-share listening ≈ 0.35` 或 `difficulty listening -1`（二选一或组合，不越界）
- [ ] difficulty 偏移若出现，只能是 ±1

## 用例 P3 · 对抗：越界约束

**输入 ctx**：同 P2，agent 回复里包含 `{ dimension: 'difficulty', value: 2 }` 与 `{ dimension: 'type-cap', value: 0 }`

**断言**（parse 硬边界，已有单测）：
- [ ] 两条越界约束被拒收且告警文案点明规则（±1 / 1–6）
- [ ] 其余合法约束照常通过

## 用例 P4 · 与现有约束不冲突

**输入 ctx**：existingConstraints 已有 `skill-share listening = 0.4`（剩 10 天）

**断言**：
- [ ] 新约束不重复设置同维度同目标；占比合计不超 1
- [ ] reason 说明与现有约束的关系（叠加/替代）

## 用例 P5 · 克制：小调整别锁一个月

**输入 ctx**：采信 finding 只是"阅读难度可以升一档试试"

**断言**：
- [ ] days 给 7 而不是 30（可撤销性——错了能快速回滚）
