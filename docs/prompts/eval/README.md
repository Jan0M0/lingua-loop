# Prompt 回归集 · 使用说明

prompt 没法单测——我们把「模型质量」换成了「prompt 质量」，所以质量护栏是这套人工回归集。

## 怎么用

1. 每次修改 `src/engine/packets/*.ts` 里的 `buildPrompt` / `parse`，**必须把 `promptVersion` +1**。
2. 改完手动跑一遍本目录该包的全部用例：把输入 ctx 填进对应页面（或在 node 里直接调 `buildPrompt`），
   把产出指令交给你的 agent，对照「必须满足的断言」逐条人工核对输出。
3. 不要自动化这步——人工对 3–5 个用例的成本远低于维护一套 prompt 断言框架。
4. 断言失败 → 修 prompt → 再跑 → 全过才算改完。

## 版本记录

| 包 | 常量 | 当前 | 备注 |
|---|---|---|---|
| review | `REVIEW_PROMPT_VERSION` | 1 | 初版 |
| content | `CONTENT_PROMPT_VERSION` | 1 | 初版（词卡/阅读/听力） |
| diagnosis | `DIAGNOSIS_PROMPT_VERSION` | 1 | 初版（28 天窗口） |
| plan | `PLAN_PROMPT_VERSION` | 1 | 初版（三维度硬边界） |

promptVersion 会随交接包写进 `egressLog`（设置→导出审计）与诊断记录——将来质量回退，能定位到是哪版 prompt 产出的数据。
