// 学习记录：可搜索/过滤/备注/删除；作文草稿与录音管理
import { useEffect, useMemo, useState } from 'react'
import { useActions, useAppState } from '../state/AppContext'
import { deleteEvent, getAllRecordings, deleteRecording } from '../storage/db'
import { Badge, EmptyState, Segmented } from '../components/ui'
import type { LearningEvent } from '../types/app'

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function Records() {
  const state = useAppState()
  const actions = useActions()
  const [q, setQ] = useState('')
  const [langFilter, setLangFilter] = useState<'all' | 'en' | 'es'>('all')
  const [tab, setTab] = useState<'events' | 'drafts' | 'recordings'>('events')
  const [recordings, setRecordings] = useState<(LearningEvent extends never ? never : { id: string; exerciseId: string; ts: number; seconds: number; sizeBytes: number; blob: Blob })[]>([])

  useEffect(() => {
    if (tab === 'recordings') void getAllRecordings().then((rs) => setRecordings(rs))
  }, [tab, state.recordings.length])

  const events = useMemo(() => {
    const sorted = [...state.events].sort((a, b) => b.ts - a.ts)
    return sorted.filter((e) => {
      if (langFilter !== 'all' && e.language !== langFilter) return false
      if (!q.trim()) return true
      const s = q.trim().toLowerCase()
      return e.contentId.toLowerCase().includes(s) || e.skill.includes(s) || (e.note ?? '').toLowerCase().includes(s) || e.errorTags.join(' ').includes(s)
    })
  }, [state.events, q, langFilter])

  return (
    <div>
      <div className="card">
        <div className="spread">
          <h2>学习记录</h2>
          <Segmented value={tab} onChange={setTab} options={[
            { value: 'events', label: `事件 ${state.events.length}` },
            { value: 'drafts', label: `作文 ${state.drafts.length}` },
            { value: 'recordings', label: `录音 ${state.recordings.length}` },
          ]} />
        </div>

        {tab === 'events' && (
          <>
            <div className="row" style={{ margin: '10px 0' }}>
              <input type="text" placeholder="搜索内容 ID / 技能 / 错误标签 / 备注…" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
              <Segmented value={langFilter} onChange={setLangFilter} options={[
                { value: 'all', label: '全部' }, { value: 'en', label: 'EN' }, { value: 'es', label: 'ES' },
              ]} />
            </div>
            {events.length === 0 ? (
              <EmptyState icon="🗒️" title="没有匹配的学习事件" hint="完成训练后，每一次作答都会记录在这里。" />
            ) : (
              <div style={{ maxHeight: 480, overflow: 'auto' }}>
                <table className="data">
                  <thead><tr><th>时间</th><th>语言/技能</th><th>内容</th><th>结果</th><th>标签</th><th></th></tr></thead>
                  <tbody>
                    {events.slice(0, 200).map((e) => (
                      <tr key={e.id}>
                        <td className="small">{fmtTime(e.ts)}</td>
                        <td className="small">{e.language === 'en' ? 'EN' : 'ES'}/{e.skill}</td>
                        <td className="mono small">{e.contentId}</td>
                        <td className="small">
                          {e.correct != null ? (e.correct ? '✓' : '✗') : e.score != null ? `${Math.round(e.score * 100)}%` : '—'}
                          <span className="dim"> {Math.round(e.secondsSpent / 60)}分</span>
                        </td>
                        <td>{e.errorTags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}</td>
                        <td>
                          <button className="btn subtle sm" title="删除这条记录" onClick={async () => {
                            if (!confirm('删除这一条学习记录？此操作不可撤销。')) return
                            await deleteEvent(e.id)
                            location.reload()
                          }}>删除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {events.length > 200 && <p className="small dim">仅显示前 200 条（共 {events.length} 条）。</p>}
              </div>
            )}
          </>
        )}

        {tab === 'drafts' && (
          state.drafts.length === 0 ? (
            <EmptyState icon="✍️" title="还没有作文草稿" hint="完成写作任务后，草稿与修订历史会保存在这里。" />
          ) : (
            state.drafts.map((d) => (
              <div key={d.id} className="task-item">
                <div className="spread">
                  <b className="mono small">{d.exerciseId}</b>
                  <div className="row">
                    <button className="btn sm" onClick={() => {
                      const blob = new Blob([d.text], { type: 'text/plain' })
                      const a = document.createElement('a')
                      a.href = URL.createObjectURL(blob)
                      a.download = `${d.exerciseId}.txt`
                      a.click()
                      URL.revokeObjectURL(a.href)
                    }}>导出</button>
                    <button className="btn sm danger" onClick={async () => {
                      if (!confirm('删除这篇草稿（含修订历史）？')) return
                      await actions.removeDraft(d.id)
                    }}>删除</button>
                  </div>
                </div>
                <div className="small dim">{new Date(d.updatedAt).toLocaleString()} · {d.text.trim().split(/\s+/).length} 词 · {d.history.length} 次修订</div>
                <details style={{ marginTop: 6 }}>
                  <summary className="small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>查看正文</summary>
                  <pre className="mono small" style={{ whiteSpace: 'pre-wrap' }}>{d.text}</pre>
                  {d.externalFeedback && <div className="notice warn"><b>外部反馈存档：</b>{d.externalFeedback}</div>}
                </details>
              </div>
            ))
          )
        )}

        {tab === 'recordings' && (
          <>
            <div className="notice info">
              录音只保存在这台设备的 IndexedDB 里。共 {state.recordings.length} 条，约 {Math.round(state.recordings.reduce((a, r) => a + r.sizeBytes, 0) / 1024)} KB。
              {state.storageEstimate && <> 存储占用 {Math.round(state.storageEstimate.usage / 1024 / 1024)} MB / 可用约 {Math.round(state.storageEstimate.quota / 1024 / 1024)} MB。</>}
            </div>
            {recordings.length === 0 ? (
              <EmptyState icon="🎙️" title="还没有录音" hint="口语任务的录音（如果你允许）会出现在这里。" />
            ) : (
              recordings.map((r) => (
                <div key={r.id} className="task-item">
                  <div className="spread">
                    <b className="mono small">{r.exerciseId}</b>
                    <div className="row">
                      <button className="btn sm" onClick={() => {
                        const blob = new Blob([r.blob], { type: 'audio/webm' })
                        const a = document.createElement('a')
                        a.href = URL.createObjectURL(blob)
                        a.download = `${r.exerciseId}-${r.ts}.webm`
                        a.click()
                        URL.revokeObjectURL(a.href)
                      }}>下载</button>
                      <button className="btn sm danger" onClick={async () => {
                        if (!confirm('删除这条录音？')) return
                        await deleteRecording(r.id)
                        await actions.refreshStorage()
                      }}>删除</button>
                    </div>
                  </div>
                  <div className="small dim">{new Date(r.ts).toLocaleString()} · {r.seconds} 秒 · {Math.round(r.sizeBytes / 1024)} KB</div>
                  <audio controls src={URL.createObjectURL(r.blob)} style={{ width: '100%', marginTop: 6 }} />
                </div>
              ))
            )}
            {state.recordings.length > 0 && (
              <button className="btn danger" onClick={async () => {
                if (!confirm(`删除全部 ${state.recordings.length} 条录音？不可撤销。`)) return
                for (const r of state.recordings) await deleteRecording(r.id)
                await actions.refreshStorage()
                location.reload()
              }}>删除全部录音</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
