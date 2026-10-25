# Lingua Loop · 本地优先语言训练应用

目标：**6 个月内冲刺 IELTS Overall 8.0（四项分项追踪）+ 西班牙语 CEFR B2**。
产品交付后的日常学习**不调用任何 LLM API、不需要账号、不需要联网、不产生 Token 费用**——自适应由本地确定性规则引擎完成。

## 快速开始

```bash
npm install       # 安装依赖（仅开发时需要）
npm run dev       # 开发模式 http://localhost:5173
```

生产构建与本地使用：

```bash
npm run build     # 类型检查 + 打包到 dist/
npm run preview   # 本地模拟生产环境 http://localhost:4173
```

也可以把 `dist/` 放到任意静态服务器或直接双击用本地服务打开。首次加载后，核心学习功能可**完全离线**使用（PWA 缓存了应用外壳与资源）。

## 它能做什么

- **今日**：每天自动排出最值得做的任务（到期复习 > 目标差距 > 错误率 > 时间预算），每个任务带"为什么安排它"的可解释理由；支持保底（5–10 分钟）/标准/冲刺三种日模式。
- **训练**：词卡四模式（中→英回忆/英→中/搭配填空/造句）、阅读理解、语法填空、语法小课、听力（系统 TTS 朗读脚本）、写作（限时/字数/规则检查/自评清单/草稿历史/导出/外部反馈存档）、口语（准备倒计时/录音/回放/自评/文字复盘）、微诊断。
- **复习**：SM-2 风格间隔重复 + 错题模式再练，队列规则透明（过期最久优先、弱点卡加权）。
- **课程**：英语 24 周（IELTS 导向）+ 西语 24 周（A1→B2）课程地图；前 30 天每日配方，第 31 天起由课程地图 + 内容库 + 复习状态自动继续编排。
- **进步**：真实数据的训练量、正确率趋势、技能掌握度（内部指数，含样本置信度）、错误模式、周报（样本不足会明说）。
- **记录 / 内容库 / 设置**：可搜索学习记录、作文草稿与录音管理（可删除）、内容导入导出、JSON 备份与冲突感知恢复、清空数据（双重确认）。

## 任务后微反馈会真实改变系统

每次任务结束 1–2 次点击（太简单/合适/太难；有用/一般/没帮助；精力状态）：
- 太难 → 下次自动降低该技能材料难度、拆小任务、卡片 ease 下调；
- 太简单 → 上调难度与复习间隔；
- 连续"没帮助" → 7 天内减少该类型任务；
- 疲惫 → 当天剩余任务低负荷优先。
所有调整记录在案（IndexedDB `adjustments`），可解释可追溯。

## 诚实的边界（不会假装的事）

- 掌握度 0–100 是**内部趋势指标**，不是 IELTS Band、不是 CEFR 认证；样本不足时明确显示"数据不足"。
- 写作规则检查只做可解释的启发式提示（字数/段落/句长/重复词/连接词密度/常见混淆），**绝不输出 Band 预测**；建议周期性交给合格老师/考官校准（支持导出 Markdown/TXT）。
- 听力由系统 TTS 朗读原创脚本；无可用语音时降级为文本理解模式并明确标注"不等价于真实听力模拟"。
- 浏览器 SpeechRecognition 默认关闭（可能依赖厂商在线服务）；录音用 MediaRecorder 仅存本设备，可随时删除。
- 内容用尽会明确提示，不会假装无限生成新题。

## 更多文档

- [QUICKSTART.md](QUICKSTART.md) — 三步上手
- [docs/CURRICULUM.md](docs/CURRICULUM.md) — 课程地图与编排规则
- [docs/DATA_SCHEMA.md](docs/DATA_SCHEMA.md) — 数据模型与备份格式
- [docs/OFFLINE_AND_PRIVACY.md](docs/OFFLINE_AND_PRIVACY.md) — 离线能力与隐私说明
- [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) — 已知限制
- [docs/CONTENT_AUTHORING.md](docs/CONTENT_AUTHORING.md) — 内容创作/导入规范
- [WORKLOG.md](WORKLOG.md) / [NEXT_STEPS.md](NEXT_STEPS.md) — 工作日志与后续计划

## 技术栈

Vite 6 + React 18 + TypeScript(strict) + IndexedDB(idb) + Vitest。无后端、无路由库（手写 hash 路由）、无图表库（手写 SVG）、无 UI 库。运行时依赖只有 `react`、`react-dom`、`idb`。

## 测试与校验

```bash
npm run test              # 全部单测（引擎/存储/内容）
npm run validate:content  # 内容库语义校验（重复 ID/答案越界/解析完整性等）
npm run typecheck         # strict 类型检查
```
