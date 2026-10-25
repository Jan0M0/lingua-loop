// 共享 UI 组件
import type { ReactNode } from 'react'

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'accent' | 'ok' | 'warn' | 'danger' }) {
  return <span className={`badge ${tone === 'default' ? '' : tone}`}>{children}</span>
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>
}

export function EmptyState({ icon = '🌱', title, hint, action }: { icon?: string; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="icon" aria-hidden>{icon}</div>
      <div>{title}</div>
      {hint && <div className="small dim">{hint}</div>}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  )
}

export function ProgressBar({ value, tone }: { value: number; tone?: 'ok' }) {
  return (
    <div className={`progress ${tone ?? ''}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal fadein" role="dialog" aria-modal="true" aria-label={title}>
        <div className="spread" style={{ marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
          <button className="btn subtle sm" onClick={onClose} aria-label="关闭">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="row" role="tablist">
      {options.map((o) => (
        <button key={o.value} className={`chip ${value === o.value ? 'on' : ''}`} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** 迷你柱状图（SVG，无依赖） */
export function MiniBars({ data, height = 60, format }: { data: { label: string; value: number }[]; height?: number; format?: (v: number) => string }) {
  if (data.length === 0) return null
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: height + 24 }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, textAlign: 'center', minWidth: 28 }}>
          <div title={format ? format(d.value) : String(d.value)} style={{
            height: `${Math.max(3, (d.value / max) * height)}px`,
            background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: 0.85,
          }} />
          <div className="small dim" style={{ fontSize: 11 }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

/** 迷你折线图（SVG） */
export function MiniLine({ points, height = 70, width = 260 }: { points: number[]; height?: number; width?: number }) {
  if (points.length < 2) return <div className="small dim">数据点不足，积累后显示趋势。</div>
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const step = width / (points.length - 1)
  const coords = points.map((p, i) => `${i * step},${height - ((p - min) / span) * (height - 10) - 5}`)
  return (
    <svg width={width} height={height} role="img" aria-label="趋势图" style={{ maxWidth: '100%' }}>
      <polyline points={coords.join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      {coords.map((c, i) => {
        const [x, y] = c.split(',')
        return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--accent)" />
      })}
    </svg>
  )
}
