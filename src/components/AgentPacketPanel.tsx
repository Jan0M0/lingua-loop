// Agent 交接包通用面板：① 复制指令 ② 交给用户自己的 agent 跑 ③ 粘回/拖回结果 → 本地校验 → 预览 → 应用。
// 四种包（批改/内容/诊断/计划）共用这一个外壳；理解在 agent 那边，本产品只定义结构、校验结构、接住结构。
// 隐私口径：复制即审计（记字段名与大小，不记内容）；失败时 agent 原文保留不清空；应用前必预览。
import { useRef, useState } from 'react'
import type { PacketDef, PacketParseResult } from '../engine/packets/types'
import { logEgress } from '../storage/egress'
import { useActions } from '../state/AppContext'

interface Props<TCtx, TResult> {
  def: PacketDef<TCtx, TResult>
  ctx: TCtx
  /** 复制后打开的 agent（默认 ChatGPT；换 Claude/Gemini 由调用方指定） */
  agentUrl?: string
  /** 应用成功后的回调；缺省自动全量刷新应用状态 */
  onApplied?: () => void
}

export function AgentPacketPanel<TCtx, TResult>({ def, ctx, agentUrl = 'https://chatgpt.com', onApplied }: Props<TCtx, TResult>) {
  const actions = useActions()
  const prompt = def.buildPrompt(ctx)
  const [copied, setCopied] = useState(false)
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState<PacketParseResult<TResult> | null>(null)
  const [applyNote, setApplyNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const stage: 0 | 1 | 2 | 3 = applyNote != null ? 3 : parsed?.value != null ? 2 : copied ? 1 : 0
  const steps = ['① 复制指令', '② 交给你的 AI', '③ 粘回结果', '④ 完成']

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      setNotice('复制失败（浏览器拒绝了剪贴板权限）：展开「指令全文」手动全选复制即可。')
      return
    }
    setCopied(true)
    // 审计：此刻这批字段离开了设备
    void logEgress(def.kind, def.promptVersion, def.egressFields(ctx), new Blob([prompt]).size).catch(() => undefined)
    try {
      window.open(agentUrl, '_blank')
      setNotice('已复制指令并打开新窗口。把指令粘贴给 agent，跑完把它的回复整段粘/拖回下面的框。')
    } catch {
      setNotice('已复制指令（新窗口被浏览器拦截）：手动打开你的 agent，粘贴指令，跑完把回复粘回下面。')
    }
  }

  const readFile = async (file: File) => {
    const text = await file.text()
    setRaw(text)
    setParsed(null)
    setApplyNote(null)
    setNotice(`已读入 ${file.name}（${(text.length / 1024).toFixed(1)} KB）。点「解析校验」继续。`)
  }

  const doParse = () => {
    if (!raw.trim()) return
    setApplyNote(null)
    setNotice('')
    setParsed(def.parse(raw, ctx))
  }

  const reset = () => {
    setParsed(null)
    setApplyNote(null)
    setRaw('')
    setNotice('')
  }

  const doApply = async () => {
    if (!parsed?.value) return
    setBusy(true)
    try {
      const note = await def.apply(parsed.value, ctx)
      setApplyNote(note)
      setParsed(null)
      if (onApplied) onApplied()
      else await actions.reloadAll()
    } catch (err) {
      setNotice('应用失败（原文已保留，可修正后重新解析）：' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="spread" style={{ marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>{def.label}</h3>
        <span className="small dim mono">packet v{def.promptVersion}</span>
      </div>

      <div className="row small" style={{ gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <span key={s} className={`chip ${i === stage ? 'on' : i < stage ? '' : ''}`} style={{ cursor: 'default', opacity: i <= stage ? 1 : 0.45 }}>{s}</span>
        ))}
      </div>

      <p className="small dim" style={{ margin: '0 0 8px' }}>
        这一步会把以下数据带出设备（由你的 agent 处理，本应用全程不联网）：<b>{def.egressFields(ctx).join('、') || '（无用户数据）'}</b>。
        结果要过本地校验才落地；不合规格式直接拒收。
      </p>

      <div className="row" style={{ marginBottom: 8 }}>
        <button className="btn primary" onClick={() => void copyPrompt()}>复制指令并打开 {agentUrl.includes('chatgpt') ? 'ChatGPT' : 'Agent'}</button>
        <a className="btn subtle" href={agentUrl} target="_blank" rel="noreferrer">只开窗口</a>
      </div>
      <details style={{ marginBottom: 10 }}>
        <summary className="small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>指令全文（{prompt.length.toLocaleString()} 字符）</summary>
        <pre className="mono" style={{ whiteSpace: 'pre-wrap', maxHeight: 220, overflow: 'auto', fontSize: 12, background: 'var(--bg-2, #f6f7f9)', padding: 8, borderRadius: 8 }}>{prompt}</pre>
      </details>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const f = e.dataTransfer.files?.[0]
          if (f) void readFile(f)
        }}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border, #d0d5dd)'}`,
          borderRadius: 10,
          padding: 10,
          transition: 'border-color .15s',
        }}
      >
        <textarea
          value={raw}
          onChange={(e) => { setRaw(e.target.value); if (parsed) setParsed(null) }}
          rows={6}
          placeholder={stage >= 1 ? '把 agent 的完整回复粘到这里，或把 .txt / .json 文件拖进来…' : '先复制指令给 agent，跑完再把回复粘到这里（也支持拖入 .txt / .json 文件）…'}
          aria-label="agent 回复输入区"
          style={{ width: '100%' }}
        />
        <div className="row" style={{ marginTop: 6 }}>
          <button className="btn" disabled={!raw.trim()} onClick={doParse}>解析校验</button>
          <button className="btn subtle sm" onClick={() => fileRef.current?.click()}>或选择文件（.txt / .json）</button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.json,text/plain,application/json"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void readFile(f) }}
          />
        </div>
      </div>

      {notice && <div className="notice info small" style={{ marginTop: 8 }}>{notice}</div>}

      {parsed?.error && (
        <div className="notice warn small" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
          没通过校验：{parsed.error}
          {'\n'}agent 的原文还留在框里——可以让它修正后重试（常见问题：没按信封格式、加了多余解释文字）。
        </div>
      )}

      {parsed?.value != null && (
        <div className="fadein" style={{ marginTop: 8 }}>
          <div className="notice" style={{ whiteSpace: 'pre-wrap' }}>
            <b>应用前预览（还没写入任何数据）</b>
            {'\n'}{def.preview(parsed.value, ctx)}
          </div>
          {parsed.warnings.length > 0 && (
            <div className="notice warn small" style={{ whiteSpace: 'pre-wrap' }}>⚠ {parsed.warnings.join('\n⚠ ')}</div>
          )}
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn primary" disabled={busy} onClick={() => void doApply()}>{busy ? '写入中…' : '确认写入'}</button>
            <button className="btn subtle" onClick={() => setParsed(null)}>先不写</button>
          </div>
        </div>
      )}

      {applyNote != null && (
        <div className="fadein">
          <div className="notice info" style={{ whiteSpace: 'pre-wrap' }}>✅ {applyNote}</div>
          <button className="btn subtle sm" onClick={reset}>再来一次</button>
        </div>
      )}
    </div>
  )
}
