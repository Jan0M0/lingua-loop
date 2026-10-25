# WORKLOG · 工作日志

## 2026-10-25（交付日）

### 阶段 0 · 侦察与脚手架
- 工作区为空 → 根目录建项目。Node 24 / npm 11 / git 可用。
- `git init`；package.json（vite6+react18+ts5.8+vitest3+idb+fake-indexeddb）；npm install 成功。
- PLAN.md / DECISIONS.md（18 条自主决策）写毕。

### 阶段 1 · 类型与校验器
- `src/types/content.ts`：8 种 Exercise 判别联合 + ERROR_TAGS 词表 + ID 前缀规则。
- `src/types/app.ts`：Settings/LearningEvent/CardState/SkillState/DailyPlan/TaskFeedback/Adjustment 等。
- `src/content/registry.ts`（import.meta.glob 自动收集）、`validate.ts`（语义校验纯函数）、`tests/content.test.ts`。
- 修复：app.ts 多余尖括号；validate 的 ContentIssue import；curriculum types 上溯路径。

### 阶段 2 · 引擎 + 存储 + 测试
- engine：dates/seed/srs(SM-2)/mastery(EWMA+收缩)/feedback(规则引擎)/scheduler(确定性编排)/recap(日复盘+周报)/writing-analyzer/diagnostics/vocab-drills。
- storage：db.ts（idb 9 store，版本化升级）、backup.ts（导出/预览/冲突感知恢复/清空）。
- 测试 37 项全绿（srs/mastery/scheduler/feedback/backup）。期间修复：反馈计数含当前次、连接词密度阈值、两个测试夹具问题。

### 阶段 3 · 课程 + 内容（并行子代理）
- 课程：EN/ES 各 24 周地图、30 天配方、7 天周模式（手写，与调度器对齐）。
- 内容生成：因模型并发限制（同时仅 ~2 路，含主会话），改为小批量串行派发。已验证完成：EN 词卡 150、EN 写作 24（T1A 8 + T1G 4 + T2 12）、ES 词卡 061-120（60）。全部通过独立校验 + 全局 content.test。
- 进行中/排队：ES 词卡 001-060；随后 EN 阅读+语法填空、EN 听力+诊断、EN 口语、ES 阅读+听力+诊断、ES 写作+口语、ES 语法 20 课。
- 修正：CONTENT_AUTHORING.md import 路径错误（两级→三级上溯），已同步修复已生成文件并通知在跑代理。

### 阶段 4 · UI + PWA
- 9 页面（Onboarding/Today/Train/Review/Curriculum/Progress/Records/Library/Settings）+ 5 运行器（Vocab/MC/Listening/Writing/Speaking）+ TaskRunner 分发 + FeedbackForm。
- audio：tts.ts（双语音分角色）、recorder.ts（MediaRecorder）。
- PWA：manifest + sw.js（cache-first 静态/导航 network-first）+ SVG/PNG 图标（纯 Node zlib 生成器）。
- `npm run build` 通过（产物 ~563KB JS，本地应用可接受）；`vite preview` 冒烟：/, /sw.js, /manifest.webmanifest, /icons/* 全 200。
- 修复：Settings 恢复预览变量遮蔽；MCRunner hooks 规则违规；Onboarding 括号笔误。

### 阶段 5 · 验证（持续）
- typecheck 0 error（内容文件由代理各自保证 + 终审全量跑）。
- 全量 vitest / 内容校验在内容齐后统一重跑，结果见 ACCEPTANCE_CHECKLIST.md。

### 阶段 6 · 文档
- README / QUICKSTART / CURRICULUM / DATA_SCHEMA / OFFLINE_AND_PRIVACY / KNOWN_LIMITATIONS / CONTENT_AUTHORING / NEXT_STEPS / ACCEPTANCE_CHECKLIST / TODO。

## 已知问题（待办）
- 内容代理串行排队中，剩余 6 组完成前，部分技能内容为空（调度器会跳过并提示）。
- 代码分割未做（单 chunk ~563KB）——本地应用影响小，列入 NEXT_STEPS。

---

## 2026-10-25（续 · 交付冲刺）

### 浏览器真实验收（IAB + Playwright 表面）
- 实测走通：onboarding 5 步 → 今日计划 → 词卡任务（引入/识别/回忆 3 模式 × 5 卡）→ 微反馈提交 → 任务标记完成 → 刷新持久化（直接读 IndexedDB 确认 15 events + 5 cardStates）→ 进步页（掌握度条/趋势图/周报）。
- 发现并修复：移动端 390px 横向溢出（MiniBars 最小宽度撑破页面 → 容器 overflow-x + shell clip）；调度器"已引入 0 张"措辞误导 → 改为"计划生成时已引入"。
- Note：该环境 Playwright locator click 超时，改用页面内 evaluate click 完成流程（不影响产品，仅测试手段）。

### 内容生产策略调整
- 模型并发限制实测约 2 路（含主会话），子代理改为串行 + 主会话自写大块内容并行。
- 自写完成：EN 听力 10 段 + EN 诊断 16 题；ES 语法 20 课（清理了草稿期粗糙示例与重复选项）；ES 阅读 8 篇；ES 听力 10 段 + ES 诊断 12 题。全部通过 validate:content。
- 代理完成：EN 词卡 150、EN 写作 24、ES 词卡 120、EN 阅读 12 + 语法填空 6 组 30 题。
- 待完成：EN 口语 28（代理进行中）、ES 写作 12 + 口语 16（最后一个待派发）。

### 测试与构建状态
- 全量 vitest：13 文件 / 64 测试全绿（含内容校验、引擎、存储、真实内容×调度器冒烟）。
- tsc --noEmit 0 error；生产构建成功。

---

## 2026-10-25（终 · 全部内容入库）

- 最后一组：EN 口语 28（代理）+ ES 写作 12 + ES 口语 16（主会话自写）全部通过校验。
- 最终内容清点（浏览器内容库页实测）：**内置 418 项** —— EN：词卡 150/阅读 12/填空 6/听力 10/写作 24/口语 28/诊断 1（16 题）；ES：词卡 120/语法 20/阅读 8/听力 10/写作 12/口语 16/诊断 1（12 题）。
- 最终验证：`tsc --noEmit` 0 error；`npx vitest run` **14 文件 / 66 测试全部通过**；`npm run build` 成功；浏览器验证新构建（移动端 390px 无横向溢出、内容库统计正确）。
- 交付汇报见会话最终消息；KNOWN_LIMITATIONS 如实记录未验证项（Safari/Firefox 兼容、完整断网回归、PWA 安装各浏览器表现）。
