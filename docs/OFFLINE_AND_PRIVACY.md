# OFFLINE_AND_PRIVACY · 离线能力与隐私

## 0 Token 承诺的边界

- **没有**任何 LLM/AI API 调用、API Key、后端服务器、云数据库、埋点分析、在线向量库。
- 自适应完全由本地确定性规则引擎完成（SRS/调度/反馈规则全部可测试、可解释）。
- 构建产物运行时的第三方依赖只有 React 与 idb（IndexedDB 封装），均本地打包，无 CDN 字体/脚本。

## 离线工作方式

1. **首次加载**（需要一次网络或本地静态服务）：浏览器下载并缓存应用外壳（index.html、JS/CSS 资源、manifest、图标）。生产模式注册 Service Worker（`public/sw.js`）。
2. **之后离线**：SW 对应用资源 cache-first；导航请求 network-first + 缓存回退。学习、复习、进度、设置、导出全部可用。
3. **仅当**你主动点击外部参考链接（IELTS/DELE/CEFR 官网）时才会发起外网请求。

限制：开发模式（`npm run dev`）不注册 SW；首次安装 PWA 到桌面需要一次在线加载。

## 数据在哪里

| 数据 | 位置 | 清除方式 |
| --- | --- | --- |
| 设置、学习事件、卡片状态、计划、调整 | IndexedDB `lingua-loop` | 设置 → 危险区 → 清空全部数据 |
| 作文草稿与修订历史 | IndexedDB `drafts` | 同上，或记录页单篇删除 |
| 口语录音 | IndexedDB `recordings`（Blob） | 记录页逐条/全部删除 |
| 自定义导入内容 | IndexedDB `customContent` | 随清空删除 |

备份导出的 JSON **包含你的个人学习内容（以及可选的录音）**，请保存在安全位置。

## 语音相关

- **TTS（speechSynthesis）**：调用操作系统自带语音，不经过网络（前提是系统语音本身离线可用；个别系统语音可能由厂商提供，可在系统设置查看）。没有可用语音时，听力自动降级为文本模式并明确标注。
- **录音（MediaRecorder）**：音频只写入本设备 IndexedDB，不上传任何地方；提供逐条与全部删除。
- **浏览器语音识别（SpeechRecognition）**：默认关闭。开启后浏览器可能将音频发往其厂商的在线服务处理——这是浏览器行为，不是本应用的行为；关闭它不影响任何功能（本应用当前也未在核心流程中使用它，设置项保留仅为知情提示）。

## 断网自检方法

构建后用 `npm run preview` 打开应用 → 完成一次任务 → 浏览器 DevTools → Network 切到 Offline → 刷新页面与继续训练。应用外壳来自缓存，任务数据来自 IndexedDB。
