# DATA_SCHEMA · 数据模型与备份格式

类型源码：`src/types/content.ts`（内容）、`src/types/app.ts`（应用状态）。本文件是人读版。

## 内容库（内置 + 用户导入）

所有内容继承公共元数据 `ContentMeta`：

| 字段 | 说明 |
| --- | --- |
| `id` | 全库唯一，前缀标识类型（en-voc- / es-read- / en-w-t2- …） |
| `language` / `skill` | en·es × reading·listening·writing·speaking·vocab·grammar |
| `type` | vocab-card / reading-mc / cloze / listening / writing-task / speaking-task / grammar-note / diagnostic |
| `topic` / `tags` | 主题 kebab-case；标签 1–5 个（主题或 ERROR_TAGS 错误标签） |
| `difficulty` | 1–5。EN：2≈Band5-6、3≈6.5、4≈7-8、5≈8+；ES：1=A1、2=A2、3=B1、4=B2 |
| `cefr` | 可选展示标签 |
| `estimatedMinutes` / `createdAt` / `contentVersion` / `source` / `license` | 时长、创建日期、版本、原创/导入、许可备注 |

选择题 `MCQuestion`：`id`（=`${contentId}-q${n}`）、`stem`、`options`（3–5）、`answerIndex`、`explanation`（证据型解析）、`errorTags`、`questionType`。

各类型专有字段见类型文件；校验规则见 `src/content/validate.ts`（`npm run validate:content`）。

## 用户数据（IndexedDB `lingua-loop` v1）

| Store | 主键 | 内容 |
| --- | --- | --- |
| `kv` | 'settings' 等 | Settings（目标/预算/比例/语音开关/seedSalt…） |
| `events` | 事件 id（`by-ts`/`by-content` 索引） | LearningEvent：每次训练的原子记录 |
| `cardStates` | 内容 id | CardState：SM-2 状态（ease/interval/reps/lapses/dueAt） |
| `skillStates` | `${lang}:${skill}` | SkillState：事件数、EWMA 表现、难度瞄准偏移、诊断先验 |
| `plans` | 日期 YYYY-MM-DD | DailyPlan：模式、任务列表（含理由）、说明 |
| `adjustments` | id | 反馈触发的可解释调整（含过期时间） |
| `drafts` | id | WritingDraft：作文文本 + 修订历史 + 自评 + 外部反馈存档 |
| `recordings` | id | 录音 Blob + 元数据（大小/秒数/关联任务） |
| `customContent` | 内容 id | 用户导入的内容（与内置同 schema） |

`LearningEvent` 关键字段：`ts/language/skill/exerciseType/contentId`、`correct`（客观题）、`score`（0–1，开放任务）、`secondsSpent/hintsUsed`、`selfDifficulty/selfValue/energy`（微反馈）、`errorTags`、`detail.questionResults`（逐题对错）、`detail.cardGrade`、`detail.selfEvalScores`、`note`。

## 备份 JSON 格式

```json
{
  "app": "lingua-loop",
  "formatVersion": 1,
  "exportedAt": "ISO 时间",
  "data": {
    "settings": {…}, "events": […], "cardStates": […], "skillStates": […],
    "plans": […], "adjustments": […], "drafts": […], "customContent": […],
    "recordings": [{ "meta": {…}, "blobBase64": "…" }]
  }
}
```

- 恢复流程：解析 → 校验标识与结构 → 预览（各 store 计数 + ID 冲突列表）→ 用户选择冲突策略（跳过/覆盖）→ 写入。
- 录音默认不含在导出中（可选包含，会显著增大文件）。

## 内容导入格式

对象数组（或 `{ items: [...] }`），与内置内容同 schema。导入前逐条跑与内置相同的校验器，任何 error 拦截该条；已存在 ID 默认跳过不覆盖。

## 版本迁移策略

DB `upgrade` 只做增量（新增 store/索引），不改写旧数据；TS 类型向后兼容新增可选字段。备份 `formatVersion` 变更时保持对旧版本的读取能力。
