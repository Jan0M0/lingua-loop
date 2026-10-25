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

## 2026-10-25（续2 · v1 遗留 P0 + v2 自然习得改造）

### v1 遗留 P0 验收（用户指令：找最高优先级未完成项继续做）
1. **断网验证（原 △ → ✅）**：实测发现两个真实缺陷并修复——
   - SW 在 window.load 后注册，首次在线加载的哈希资源从未进入 fetch 拦截 → 离线缺资源。修：main.tsx 注册成功后把 DOM 声明的资源显式 cache.addAll。
   - 深挖发现该环境（IAB/Chromium）离线时 **type=module 脚本请求（cors 模式）不经过 SW**（classic no-cors 正常）→ 白屏。修：vite 构建改 rollup `format:'iife'` + `inlineDynamicImports` + 保留默认哈希文件名（防止 SW cache-first 永远命中旧缓存），scripts/fix-script-tag.mjs 把 `<script type="module" crossorigin>` 改写为 `<script defer>`。期间还发现并修复经典脚本在 head 立即执行导致 #root 不存在的次生 bug（defer 解决）；index.html 增加启动错误可见面板 + console 诊断环。
   - 离线回归全通：断网 reload 加载、完成 16 题诊断、反馈提交、IndexedDB 落库（events/skillStates/plans）、进步页、备份导出。
2. **备份导出→恢复（浏览器级）**：DataTransfer 文件注入 → 预览（计数 + 冲突提示）→ 跳过模式执行（导入 0/跳过 8）✅。
3. **设置重排**：保底 2 任务/11 分钟 ↔ 标准 3 任务/14 分钟实时切换 ✅；发现**重排丢已完成任务状态缺陷**（诊断完成后 diagnosticsDone=true，重排不再安排诊断，done 记录消失）→ 修复：AppContext.regenerate 按 id/内容键继承状态 + 把已完成但被移出计划的任务追加保留。实测 1 done 在模式切换间保持。
4. 「今天先到这里」缺陷修复：原按钮跳进步页而非日复盘；现点击即在今日页生成复盘（showRecapOnDemand）。

### v2 §3A 自然习得改造（按新主提示词执行）
- 类型：新增 `story`（StoryExercise：mode/hookZh/paragraphs/轻questions/1-3 highlights）与 `free-expression` 两种 Exercise；Settings 增 interests/motivations；TaskFeedback 增 interest + topic；Adjustment 增 topic-boost/topic-deprioritize；INTEREST_TOPICS 词表。
- 推荐引擎 engine/recommend.ts：兴趣(+2)/反馈升权(+2)/降权(-3)/难度接近(+1)/近期主题多样性(-1.5)/近 21 天去重/内容耗尽返回 undefined；理由可解释；8 项单测。
- 内容：EN 故事 6 篇 + ES 故事 6 篇（含听读联动 mode:listening 2 篇）+ EN/ES 自由表达提示各 4 个，全部通过校验（内置库累计 438 项）。
- UI：首页重构为"内容入口"第一屏（给我一个有意思的东西[推荐+换一个+理由] / 继续上次 / 我今天想探索[主题 chips] / 轻松聊一会儿 / 顺手复习），长期路线折叠为次要区块；引导 6 步（增兴趣+动机，均可跳过）；设置页兴趣编辑。
- 运行器：StoryRunner（听读联动/隐藏文本再听/逐段继续/跳过答题路径/highlights 收藏——saveHighlightAsCard 生成 customContent 词卡并立即进 SRS）；FreeExpressionRunner（写/说双形式、开头表达 TTS、复盘提示勾选、录音存 IndexedDB、明确"不判对错"）。
- FeedbackForm：新增"有趣/一般/不合口味"维度（有 topic 时显示），提交后 7 天主题升降权。

### v2 浏览器实测（origin 4327）
引导兴趣步选择生效 → 首页推荐命中 food 故事 → 读完跳过答题 → 收藏 3 表达（customContent 3 + cardStates 3）→ 反馈"有趣"（adjustments 1 条 topic-boost）→ 回首页推荐自动避开已读并按难度推荐 → 换一个生效 → 切 Español 推荐西语 food 故事 → 自由表达工作室（西语提示+textarea+复盘）→ 长期路线展开（4 任务/22 分钟）→ 全部通过。

### 最终验证
- `npx tsc --noEmit` → 0 error
- `npx vitest run` → 15 文件 / 74 测试全部通过
- `npm run build` → 成功（IIFE + defer + 哈希文件名）
- 小修复：topicLabel 补全 education/housing/media/shopping/health/finance/urban/family/crime/transport/festivities 中文映射。

## 2026-10-25（续1 · 全部内容入库 · v1 交付时点）
- 最后一组：EN 口语 28（代理）+ ES 写作 12 + ES 口语 16（主会话自写）全部通过校验。
- 最终内容清点（浏览器内容库页实测）：**内置 418 项**（v2 故事与自由表达补齐后为 438 项） —— EN：词卡 150/阅读 12/填空 6/听力 10/写作 24/口语 28/诊断 1（16 题）；ES：词卡 120/语法 20/阅读 8/听力 10/写作 12/口语 16/诊断 1（12 题）。
- 最终验证：`tsc --noEmit` 0 error；`npx vitest run` **14 文件 / 66 测试全部通过**；`npm run build` 成功；浏览器验证新构建（移动端 390px 无横向溢出、内容库统计正确）。
- 交付汇报见会话最终消息；KNOWN_LIMITATIONS 如实记录未验证项（Safari/Firefox 兼容、完整断网回归、PWA 安装各浏览器表现）。

---

## 2026-10-25（续3 · 验收清单缺口补齐：记录可编辑 + 外部反馈解析 + 分题型统计）

### 起手：按验收清单找缺口（不改架构）
- 重读 WORKLOG / TODO / ACCEPTANCE / NEXT_STEPS / DECISIONS + git log；`tsc` 0 error、`vitest` 15 文件 / 74 测试全绿 —— 文档声称的状态与实际一致。
- 逐条核对主提示词与代码，发现三处「文档没写、UI 却承诺或标准未落地」的缺口：
  1. §8.6 学习记录要求「可搜索、过滤、**编辑备注**、删除」——`note` 字段存在且被搜索，但没有任何编辑入口。
  2. §5.D 要求「粘贴外部反馈 → 拆成用户可确认的错误标签与行动项」——写作页只做存档，且文案承诺「到学习记录里自行确认」，而记录页同样没有标签编辑（死路）。
  3. §5.B 要求「记录每种题型正确率与耗时，可分开看速度和准确度」——运行器把每题 `seconds` 写死 0，无 `questionType`，进步页也没有分题型统计。

### 实现
- **新增 `src/engine/feedback-parser.ts`**：本地关键词规则（中/英/西，34 条规则全部映射到 `ERROR_TAGS` 词表），整词边界 + 常见词尾（articles/tildes），输出候选标签（命中次数 + 原句证据）与行动项；`mergeTags` 做并集去重并过滤词表外脏数据。纯函数、无网络、结果确定。
- **新增 `src/engine/tag-labels.ts`**：错误标签中文展示名（标签本身仍是稳定 ID），记录页/进步页/日复盘/解析面板统一走它——顺带修掉「inference / en:listening 这类内部键直接怼给用户」的不一致。
- **新增 `src/storage/feedback-tags.ts`**：`applyConfirmedFeedback()` 写库层——只写该作文最近一次事件、标签取并集（绝不覆盖）、行动项追加进备注（保留原备注）、草稿留 `confirmedTags` / `actionItems`。独立成模块是为了能用 fake-indexeddb 真测。
- **新增 `src/components/FeedbackParser.tsx`**：解析按钮 → 候选标签 chips（可点选/取消，带命中证据）→ 行动项勾选 → 确认写入（写前不改任何数据）。
- **记录页**：每条事件可展开编辑备注 + 44 个标签点选 + 保存（不再整页 reload）；删除改为 action 更新状态；作文草稿页可把外部反馈解析成标签并确认写入「最近一次写作事件 + 草稿」。
- **写作页**：粘贴反馈后可直接解析确认，文案改为与实现一致的说明。
- **分题型统计**：`detail.questionResults[]` 增加可选 `questionType` 与逐题估算用时（上一题作答→本题作答的间隔）；阅读/语法/诊断（MCRunner）与听力（ListeningRunner）都写入；新增 `src/engine/type-stats.ts` 聚合正确率/平均用时 + 一句结论（样本 <5 题不结论）；进步页新增「分题型：正确率与速度」表格。
- **窄屏修复**：390px 下记录表 6 列被压成逐字换行、按钮被裁切 → `@media (max-width:640px)` 下记录表改卡片式堆叠（带 `data-label`），实测无横向溢出。
- **周报文案**：`coverageLabel()` 把 `en:listening` 渲染成「英语·听力」。

### 验证
- `npx tsc --noEmit` → 0 error。
- `npx vitest run` → **18 文件 / 103 测试全部通过**（新增 feedback-parser 12、feedback-tags 7、type-stats 9、周报中文标签 1）。
- `npm run build` → 成功（IIFE + defer + 哈希文件名，产物 965KB / gzip 310KB）。
- **真实浏览器（本机 Chrome headless + CDP，origin 4321）9/9 通过**：打开编辑面板 → 改备注 + 加「主旨」标签 → IndexedDB 落库且列表回显；作文页解析外部反馈 → 候选标签命中时态/冠词/连接词/拼写 → 确认后写入写作事件（4 标签）与草稿；界面回显「已写入」。
- 进步页播种 10 题分题型数据实测：推断 3 题 33% / 42 秒，细节 3 题 100% / 16 秒；错误模式与周报覆盖缺口均为中文；390px 无横向溢出。

### 环境说明
- `agent-browser` 未安装且需 500MB 下载 → 改用本机 Chrome `--headless=new --remote-debugging-port` + 自写 CDP 脚本驱动（脚本放在临时目录，不进仓库）。

## 2026-10-25 · 交付体验修复：装成桌面应用，摆脱命令行

**背景**：用户反馈"不太行"——日常使用还得先跑 start.cmd/终端服务，预览页还因 4322 服务未启动显示"页面加载失败"（WorkBuddy 会话结束后服务随之停止；另外早前 ZCode 侧清理端口时也误杀过 4322）。`file://` 双击方案不可行（IndexedDB 被禁），正确答案是 PWA 安装：应用本身是带 SW 的 PWA，安装后从桌面图标启动，由 SW 缓存供给，**不再需要任何本地服务**。

**改动**
- `src/hooks/usePwaInstall.ts`（新增）：捕获 `beforeinstallprompt` / `appinstalled`，检测 standalone 已安装态。
- 设置页第一张卡片「安装为桌面应用」：可安装时给「安装到桌面」按钮；IAB/不支持时降级为指引文案（Chrome/Edge 地址栏安装图标、iOS 添加到主屏幕）；已安装后显示一句确认。装一次即可双击桌面图标离线使用。
- `main.tsx`：请求 `navigator.storage.persist()`（安装后长期离线使用，降低浏览器清理 IndexedDB 的风险）；页面侧缓存写入后清理旧构建哈希资源（cache-first 下每次重建会无限累积——实测从 6 个旧资源清到仅当前构建）。
- `start.cmd` 重写：中文提示；已在运行则直接开浏览器（可放心重复双击）；服务最小化到任务栏；装完桌面应用后明确告知两个窗口都可关闭；Node.js 缺失时给出安装指引。
- `QUICKSTART.md`：上手方式改为「start.cmd → 设置页点安装 → 之后双击桌面图标，免服务免命令行」，file:// 警告保留。
- 统一端口到 **4322**（与 start.cmd、用户现有标签页一致）；停掉 ZCode 侧遗留的 4327 服务。

**验证（如实）**
- `npm run build`（tsc --noEmit 0 错误）→ 成功；`npx vitest run` → **18 文件 / 103 测试全部通过**。
- 浏览器实测（IAB，origin http://localhost:4322）：页面正常加载；安装卡片位于设置页首位、IAB 下正确降级为指引文案；`serviceWorker.controller` active、scope 正确；缓存仅含当前构建资源（旧 5 个已清理）；CSS 经 JS 内联 `<style>` 生效（card 12px 圆角、主题蓝按钮、系统字体）；`storage.persisted()` 在 IAB 中为 false（嵌入式浏览器不授予，真实 Chrome 安装 PWA 后通常自动授予——该调用本就是"请求"语义）。
- 已知限制：IAB 内嵌浏览器不触发 `beforeinstallprompt`（无法在预览面板里演示"安装到桌面"按钮本身），需在系统 Chrome/Edge 中打开 http://localhost:4322 验证；SW 图标（192/512 PNG）由浏览器在安装时自行拉取，未列入 SW 缓存清单（安装动作发生在服务在线时，无影响）。

## 2026-10-25 · 发布到 GitHub + 一行命令云端部署

- `package.json` 新增 `start` 脚本：`vite preview --port 4322 --strictPort --open`（克隆后 `npm start` 即起服务并开浏览器）。
- QUICKSTART 新增「新机器/云端：一行命令」：`git clone https://github.com/Jan0M0/lingua-loop.git && cd lingua-loop && npm install && npm run build && npm start`，并说明数据按地址隔离、http 非 localhost 下 PWA 受限。
- 推送前扫描确认：无 .env/密钥/个人数据入库。
- 仓库：github.com/Jan0M0/lingua-loop（public，便于任何 agent 免凭证 clone；可随时 `gh repo edit Jan0M0/lingua-loop --visibility private` 转私）。

## 2026-10-25 · Agent 交接包架构（P0–P7 全量落地）

**核心决定：只做一个原语。** 四个能力（批改/内容/诊断/计划）全部是「交接包（Packet）」的配置，不是四份重写。
产品职责永远三件事：定义结构、校验结构、接住结构；理解永远在 agent 那边（运行期零 AI 调用，护栏测试锁死）。

**P0 原语 + 通用面板**
- `src/engine/packets/`：`types.ts`（PacketKind/PacketEnvelope/PacketDef——buildPrompt/parse(ctx)/preview/apply/egressFields）、`parse.ts`（extractJson 平衡括号扫描 + unwrapEnvelope 裸/信封双吃 + envelopeExample 四包共用）、`review.ts`（批改：标签必须出自 ERROR_TAGS、evidence 必须逐字引用原文、绝不给分）。
- `src/components/AgentPacketPanel.tsx`：步骤条（①复制 ②交给 AI ③粘回 ④完成）、「复制并打开 ChatGPT」、拖入/选择 .txt/.json、解析→**预览（将写入什么、影响哪条）**→确认、失败保留原文、复制即记 egress 审计。
- FeedbackParser（关键词通道）按方案"明确不做"保留为离线降级，收纳进写作页折叠；两个调用点不破坏。

**P1 内容生成**（`content.ts` + 内容库「✨ 用 AI 出题」入口）：prompt 内嵌完整字段示例、ID 前缀规范（en-voc-/en-read-/en-ls-）、题目编号 `${id}-qN`、难度锚点（en: Band 对应 / es: CEFR 对应）、原创红线、avoidIds 防撞号；parse 逐条喂 validateRawContent，apply 打 `agent-generated` 标记入库，内容库可按「AI 生成」单独筛选。首批三种题型：词卡/单选阅读/单选听力。

**P2 口语通道**：SpeakingRunner 拆出 done 阶段（先落库再批改，写入路径才存在）；导出录音为用户主动动作；transcript ≥20 字才出批改面板；批改进同一套标签体系（feedback-tags.ts 参数化 recordLabel）。

**P3 诊断包**（`diagnosis.ts` + Progress「AI 诊断」卡片）：buildStateDigest 从真实数据算 28 天窗口聚合（掌握度/正确率/错误标签计数/坚持度/内容余量），**不含任何原文**；防幻觉硬校验——每条结论的 evidenceRefs 必须能在 digest 里解析到，解析不到整条拒收；记录存 kv `diagnoses`（留 12 次，带 promptVersion）；Progress 展示结论 + 证据数值 + 采信/忽略。

**P4 计划约束**（`plan.ts` + scheduler 接入）：agent 只写约束不排计划——type-cap/skill-share/difficulty 三维度；硬边界全部在 parse 拦截（difficulty ±1、days ≤30、占比合计 ≤1、cap 1–6）；写成 Adjustment kind `plan-constraint`（expiresAt 自动过期，无需 DB 迁移）；`readPlanConstraints` + `recentPlans` 输入让确定性调度器在边界内照常排（跨天计数、since 语义、更严格 cap 优先）；难度偏移写进任务理由保持可解释。忽略的结论不下发给 plan 包。

**P5 分发 + 审计**：`public/llms.txt`（agent 版说明书：四包何时调用、信封格式、红线）+ `agent/lingua-loop.md`（仓库内 agent 协作说明），与 `packets/types.ts` 常量同源；`storage/egress.ts` kv `egressLog`（200 条，只记字段名与字节数）+ 设置页「导出审计」表。

**P6 打磨**：批改主按钮化（不再藏 details）、上次批改时间显示（kv lastReviewAt）、Today 页距上次诊断 >7 天轻提示（可关）、出题（内容库）与批改（任务页）入口分离、面板步骤条与文件拖入。

**P7 回归集骨架**：`docs/prompts/eval/`（README + 四包各 3–5 黄金用例：输入 + 必须满足的断言，含对抗用例——诱导给分/复制真题/编造数据/越界约束）；PROMPT_VERSION 常量随包走，写入审计日志与诊断记录。改 prompt 必须 +1 并人工过一遍用例。

**护栏与测试**
- `tests/no-ai-endpoints.test.ts`：完成标准第 5 条写成测试——src/ 全目录大小写敏感扫 `api.openai|anthropic|generativelanguage` 必须空 + 依赖清单断言（只有 react/react-dom/idb）。顺手把阅读语料里的 "philanthropic funding" 改为 "charitable funding"（全小写子串会命中 anthropic，且 charitable 语义等价）。
- 新增测试：packets-parse 9、packet-review 6、packet-content 7、packet-diagnosis 9、packet-plan 10、scheduler-constraints 6、no-ai-endpoints 2。**全量 25 文件 / 152 测全绿**（原 103 → +49），tsc 0 错误，build 成功。

**浏览器实测（IAB，origin 4322）**
- 内容包端到端：出题弹窗（表单/面板/步骤条/审计提示/文件入口）→ 模拟 agent 信封回复 → 解析预览（en-voc-901/902 词卡）→ 确认写入「入库 2 条」→ 内容库筛「AI 生成」精确命中 2 条带徽章。
- 诊断包端到端：诊断面板 → 模拟回复 → 应用「已保存 1/12」→ 刷新后结论+证据数值+建议聚焦+采信/忽略按钮全部渲染（修了一个 UX 缺陷：应用后面板不再挡住结论列表）。
- 计划约束端到端：忽略 1 条结论 → 按钮实时变为「把采信的 1 条结论…」→ 面板写入「已写入 1 条计划约束，明天起生效（14 天自动过期）」。
- 设置页导出审计表渲染（空态文案正常）。

**六条完成标准逐条对照**
1. 补题 5 分钟闭环 ✓（出题入口一键到入库，实测走通；上限 10 条/次）
2. 写作+口语批改进统一标签体系 ✓（同一 reviewPacket → applyConfirmedFeedback；单测覆盖写入与并集不覆盖；口语页批改走 done 阶段，浏览器未逐页点击，组件同款已实测——如实说明）
3. 每周诊断改动两周安排 ✓（诊断→采信→约束→调度器跨天生效，单测覆盖 cap/since/过期/偏移；Today 页 >7 天提醒）
4. 离开设备的字段可审计 ✓（复制即记 kv egressLog 200 条，设置页表格；IAB 剪贴板受限时降级提示且不误记）
5. grep 测试 ✓（见上，152 测之一）
6. 断网核心可用 ✓（本轮零新增网络调用；离线能力此前里程碑已实测，SW 逻辑未动）

## 2026-10-25 · 单语言模式：配比支持 100/0，可完全停用西语（或英语）

用户反馈不想学西语——原配比滑块最低 90/10，西语永远占 10%。补上真正的开关：

- **设置页/引导页**：配比滑块 10–90 → **0–100**；拉满显示「只学英语（西语已停用）」（0% 反之），附说明：排题、复习、探索全部跳过，数据保留随时改回。
- **调度器**：停用语言的槽整体跳过（配方/诊断/新词/检查点全覆盖）并在计划说明里明示；到期卡不进 SRS 队列（share ≤ 0 直接 continue）；保底兜底任务只从启用语言取。原 `|| 1` 强制西语至少 1 张卡的行为一并修掉。
- **复习页**：停用语言的到期卡与错题再练过滤掉，页顶留说明（数据保留）。
- **首页**：探索卡语言切换隐藏停用侧（当前语言被停用时自动切换）；长期路线标题按模式显示「IELTS 8 / 西语 B2 / 双语」。
- 测试：+3（100/0 无西语任务+说明、西语到期卡不进队列、0/100 镜像）。**155 测全绿**，tsc 0 错，build 成功。
- 浏览器实测（4322）：滑块拉 100 → 设置页标签/今日页（Español 切换消失、标题变化、无 ES 任务）/复习页提示全部生效；测后已把配比恢复 70/30。
