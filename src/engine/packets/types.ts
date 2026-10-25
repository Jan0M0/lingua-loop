// Agent 交接包（Packet）——产品与用户自己的 AI 之间的唯一数据交换协议。
// 产品的职责只有三件：定义结构、校验结构、接住结构。理解永远在 agent 那边。
// 运行期零 AI 调用（见 tests/no-ai-endpoints.test.ts 护栏）：本目录只产出「给用户复制的 prompt」
// 和「校验用户粘贴回来的 JSON」，不存在任何网络请求。

/** 四种包：批改 / 内容生成 / 诊断 / 计划约束 */
export type PacketKind = 'review' | 'content' | 'diagnosis' | 'plan'

export const PACKET_SCHEMA_VERSION = 1
export const PACKET_KINDS: PacketKind[] = ['review', 'content', 'diagnosis', 'plan']

/** 包信封：agent 返回结果时包一层，产品一眼认出这是给本产品的数据 */
export interface PacketEnvelope<T = unknown> {
  lingualoop: 'packet'
  schemaVersion: number
  kind: PacketKind
  promptVersion: number
  payload: T
}

/** 一个包的完整定义：如何生成 prompt、如何校验返回、如何落库 */
export interface PacketDef<TCtx, TResult> {
  kind: PacketKind
  /** 中文名（面板标题用） */
  label: string
  /** prompt 版本号：改措辞必须 +1；写进审计日志与落库记录，质量回溯靠它 */
  promptVersion: number
  buildPrompt(ctx: TCtx): string
  /** ctx 一并提供：内容包要去重 avoidIds，诊断包要校验 evidenceRefs 能否在 digest 里解析 */
  parse(raw: string, ctx: TCtx): PacketParseResult<TResult>
  /** 预览文案：应用前告诉用户「将写入什么、影响哪条记录」 */
  preview(value: TResult, ctx: TCtx): string
  apply(value: TResult, ctx: TCtx): Promise<string>
  /** 离开设备的字段清单（审计日志用）：描述 prompt 里包含哪几类数据，不记内容本身 */
  egressFields(ctx: TCtx): string[]
}

export interface PacketParseResult<T> {
  value?: T
  warnings: string[]
  error?: string
}

/** 审计：一次数据离开设备的记录（只记字段名与大小，不记内容） */
export interface EgressLogEntry {
  ts: number
  kind: PacketKind
  promptVersion: number
  fields: string[]
  bytes: number
}
