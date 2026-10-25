// 复习页：到期词卡 + 错题模式再练（可解释的复习队列）
import { useMemo, useState } from 'react'
import { useAppState } from '../state/AppContext'
import { sortDue, upcomingDue } from '../engine/srs'
import { errorRetrainSet } from '../engine/scheduler'
import { TaskRunner } from '../runners/TaskRunner'
import { Badge, EmptyState } from '../components/ui'
import { navigate } from '../router'
import type { PlannedTask } from '../types/app'

export function Review() {
  const state = useAppState()
  const [active, setActive] = useState<PlannedTask | null>(null)

  const esOff = state.settings.priorityEn >= 100
  const enOff = state.settings.priorityEn <= 0
  const langOk = (id: string) => (esOff ? !id.startsWith('es-') : enOff ? !id.startsWith('en-') : true)
  const due = useMemo(
    () => sortDue(state.cardStates, Date.now()).filter((c) => langOk(c.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.cardStates, esOff, enOff],
  )
  const upcoming7 = upcomingDue(state.cardStates.filter((c) => langOk(c.id)), 7)
  const wrongExercises = useMemo(
    () => errorRetrainSet(state.events, state.allExercises).filter((e) => (esOff ? e.language === 'en' : enOff ? e.language === 'es' : true)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.events, state.allExercises, esOff, enOff],
  )

  if (active) return <TaskRunner task={active} fromReview />

  const startDue = (limit: number) => {
    const cards = due.slice(0, limit)
    setActive({
      id: `review-manual-${Date.now()}`, kind: 'srs-review', language: cards[0].id.startsWith('en-') ? 'en' : 'es',
      skill: 'vocab', contentIds: cards.map((c) => c.id),
      estMinutes: Math.max(2, Math.round(cards.length * 0.5)),
      reasons: [`手动复习：${cards.length} 张到期卡`], status: 'pending', lowLoad: true,
    })
  }

  const startWrong = () => {
    if (wrongExercises.length === 0) return
    const ex = wrongExercises[0]
    setActive({
      id: `wrong-manual-${Date.now()}`, kind: 'exercise', language: ex.language, skill: ex.skill,
      exerciseType: ex.type, contentIds: [ex.id], estMinutes: ex.estimatedMinutes,
      reasons: ['错题再练：这是你近 3 周错误最多的内容之一'], status: 'pending',
    })
  }

  const byLang = (prefix: string) => due.filter((d) => d.id.startsWith(prefix))

  return (
    <div>
      {(esOff || enOff) && (
        <div className="notice info">
          {esOff
            ? '西语已停用（设置里配比 100/0）：西语卡片和错题不再进入复习队列，数据已保留，随时可改回。'
            : '英语已停用（设置里配比 0/100）：英语卡片和错题不再进入复习队列，数据已保留，随时可改回。'}
        </div>
      )}
      <div className="card">
        <h2>到期复习</h2>
        {due.length === 0 ? (
          <EmptyState icon="✅" title="没有到期卡片" hint={upcoming7 > 0 ? `未来 7 天内将有 ${upcoming7} 张陆续到期。` : '学到新词卡后，这里会按记忆曲线安排复习。'} />
        ) : (
          <>
            <div className="row" style={{ marginBottom: 10 }}>
              <Badge tone="warn">共 {due.length} 张到期</Badge>
              {byLang('en-').length > 0 && <Badge tone="accent">英语 {byLang('en-').length}</Badge>}
              {byLang('es-').length > 0 && <Badge tone="accent">西语 {byLang('es-').length}</Badge>}
            </div>
            <div className="small dim" style={{ marginBottom: 10 }}>
              排序规则：过期最久优先，反复出错的卡（lapses ≥ 2）加权提前。这是队列的真实顺序，不是随机。
            </div>
            <div className="row">
              <button className="btn primary" onClick={() => startDue(Math.min(12, due.length))}>复习前 {Math.min(12, due.length)} 张</button>
              {due.length > 12 && <button className="btn" onClick={() => startDue(due.length)}>全部复习（{due.length}）</button>}
            </div>
            <details style={{ marginTop: 10 }}>
              <summary className="small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>查看队列（前 20）</summary>
              <table className="data">
                <thead><tr><th>卡片</th><th>过期天数</th><th>失误次数</th><th>间隔</th></tr></thead>
                <tbody>
                  {due.slice(0, 20).map((c) => (
                    <tr key={c.id}>
                      <td className="mono small">{c.id}</td>
                      <td>{c.dueAt ? Math.max(0, Math.floor((Date.now() - c.dueAt) / 86400000)) : 0}</td>
                      <td>{c.lapses}</td>
                      <td>{c.intervalDays} 天</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </>
        )}
      </div>

      <div className="card">
        <h2>错题模式再练</h2>
        {wrongExercises.length === 0 ? (
          <EmptyState icon="🔍" title="暂无错题记录" hint="做错的客观题会自动进入这里，按错误频率排序。" />
        ) : (
          <>
            <p className="small dim">近 3 周你错误最多的内容（按错误次数排序）。重做后，只有答对才会离开这个列表。</p>
            {wrongExercises.map((ex) => (
              <div key={ex.id} className="task-item">
                <div className="spread">
                  <div>
                    <b>{ex.language === 'en' ? 'EN' : 'ES'} · {ex.skill}</b>
                    <span className="dim small"> {'title' in ex ? (ex as { title: string }).title : ex.id} · 错 {state.events.filter((e) => e.contentId === ex.id && e.correct === false).length} 次</span>
                  </div>
                  <button className="btn sm primary" onClick={() => setActive({
                    id: `wrong-${ex.id}-${Date.now()}`, kind: 'exercise', language: ex.language, skill: ex.skill,
                    exerciseType: ex.type, contentIds: [ex.id], estMinutes: ex.estimatedMinutes,
                    reasons: ['错题再练'], status: 'pending',
                  })}>再练一次</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn subtle" onClick={() => navigate('/today')}>← 回到今日</button>
      </div>
    </div>
  )
}
