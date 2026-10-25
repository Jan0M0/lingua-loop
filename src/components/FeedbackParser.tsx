// 外部反馈解析面板（可复用）：粘贴文字 → 本地规则给出「候选错误标签 + 行动项」→ 用户勾选确认后才写库。
// 不调用任何模型；未确认前不改动任何学习数据（满足主提示词 §5.D「外部反馈不能自动覆盖用户数据」）。
import { useState } from 'react'
import type { ErrorTag, Language } from '../types/content'
import { parseFeedback, type FeedbackParseResult } from '../engine/feedback-parser'
import { tagLabel } from '../engine/tag-labels'

interface Props {
  text: string
  language: Language
  /** 已经确认过的标签：默认不再预选，避免重复写入 */
  alreadyTags?: ErrorTag[]
  onConfirm: (tags: ErrorTag[], actions: string[]) => Promise<string | void> | string | void
  confirmLabel?: string
}

export function FeedbackParser({ text, language, alreadyTags = [], onConfirm, confirmLabel = '确认写入这些标签' }: Props) {
  const [parsed, setParsed] = useState<FeedbackParseResult | null>(null)
  const [selTags, setSelTags] = useState<ErrorTag[]>([])
  const [selActions, setSelActions] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const run = () => {
    const r = parseFeedback(text, language)
    setParsed(r)
    setSelTags(r.candidates.map((c) => c.tag).filter((t) => !alreadyTags.includes(t)))
    setSelActions([])
    setMsg('')
  }

  const toggle = <T,>(list: T[], v: T, set: (next: T[]) => void) => {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  }

  const confirm = async () => {
    setBusy(true)
    try {
      const res = await onConfirm(selTags, selActions)
      setMsg(typeof res === 'string' ? res : '已写入。')
    } catch (err) {
      setMsg(`写入失败：${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="row">
        <button className="btn sm" disabled={!text.trim()} onClick={run}>解析为候选标签</button>
        <span className="small dim">本地关键词规则，不联网、不调用模型；只给候选，由你确认。</span>
      </div>

      {parsed && parsed.empty && (
        <div className="notice warn small">
          这段反馈里没识别出明确的错误标签（规则只认「时态/拼写/搭配/inference…」这类关键词）。原文已存档，你可以在「学习记录」里手动补标签或备注。
        </div>
      )}

      {parsed && parsed.candidates.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="small dim">候选标签（点一下取消/选中）</div>
          <div className="row" style={{ margin: '6px 0' }}>
            {parsed.candidates.map((c) => (
              <button
                key={c.tag}
                className={`chip ${selTags.includes(c.tag) ? 'on' : ''}`}
                onClick={() => toggle(selTags, c.tag, setSelTags)}
                title={`${c.tag}：${c.evidence.join(' / ')}`}
              >
                {tagLabel(c.tag)} <span style={{ opacity: 0.7 }}>· {c.hits} 处</span>
              </button>
            ))}
          </div>
          <details>
            <summary className="small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>看命中证据（原文）</summary>
            {parsed.candidates.map((c) => (
              <div key={c.tag} className="small dim" style={{ margin: '4px 0' }}>
                <b>{tagLabel(c.tag)}</b>（{c.tag}）：{c.evidence.join(' ／ ')}
              </div>
            ))}
          </details>
        </div>
      )}

      {parsed && parsed.actions.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="small dim">可采纳的行动项</div>
          {parsed.actions.map((a) => (
            <label key={a} className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '4px 0' }}>
              <input
                type="checkbox"
                checked={selActions.includes(a)}
                onChange={() => toggle(selActions, a, setSelActions)}
                style={{ marginTop: 3 }}
              />
              <span>{a}</span>
            </label>
          ))}
        </div>
      )}

      {parsed && (parsed.candidates.length > 0 || parsed.actions.length > 0) && (
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn primary sm" disabled={busy || (selTags.length === 0 && selActions.length === 0)} onClick={confirm}>
            {busy ? '写入中…' : `${confirmLabel}（${selTags.length} 标签 / ${selActions.length} 行动项）`}
          </button>
        </div>
      )}

      {msg && <div className="notice info small" style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  )
}
