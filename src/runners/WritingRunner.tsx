// 写作运行器：限时/字数/规则分析/自评清单/草稿历史/导出/AI 批改（agent 交接包）+ 离线关键词通道
import { useEffect, useMemo, useState } from 'react'
import type { LearningEvent, PlannedTask, WritingDraft } from '../types/app'
import type { WritingExercise } from '../types/content'
import { useActions, useAppState } from '../state/AppContext'
import { analyzeWriting, type WritingAnalysis } from '../engine/writing-analyzer'
import { Badge } from '../components/ui'
import { FeedbackParser } from '../components/FeedbackParser'
import { AgentPacketPanel } from '../components/AgentPacketPanel'
import { reviewPacket } from '../engine/packets/review'
import { getMeta } from '../storage/db'

const EVAL_OPTIONS = ['没做到', '部分做到', '做到了'] as const

export function WritingRunner({ task, onFinish }: { task: PlannedTask; onFinish: () => void }) {
  const { allExercises, drafts } = useAppState()
  const actions = useActions()
  const ex = allExercises.find((e) => e.id === task.contentIds?.[0]) as WritingExercise | undefined
  const existingDraft = useMemo(() => drafts.find((d) => d.exerciseId === ex?.id), [drafts, ex])
  const [text, setText] = useState(existingDraft?.text ?? '')
  const [timerOn, setTimerOn] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState((ex?.suggestedMinutes ?? 20) * 60)
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null)
  const [selfEval, setSelfEval] = useState<Record<string, number>>({})
  const [external, setExternal] = useState(existingDraft?.externalFeedback ?? '')
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [lastReview, setLastReview] = useState<{ exerciseId: string; ts: number } | null>(null)

  // 「上次 AI 批改」提示（P6）
  useEffect(() => {
    void getMeta<{ exerciseId: string; ts: number }>('lastReviewAt').then((r) => setLastReview(r ?? null)).catch(() => undefined)
  }, [ex?.id])

  useEffect(() => {
    if (!timerOn) return
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [timerOn])

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  const persist = async (label: string) => {
    if (!ex) return
    const draft: WritingDraft = {
      id: existingDraft?.id ?? `draft-${ex.id}`,
      exerciseId: ex.id,
      language: ex.language,
      text,
      createdAt: existingDraft?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      history: [...(existingDraft?.history ?? []), ...(existingDraft && existingDraft.text !== text ? [{ ts: Date.now(), text: existingDraft.text, label }] : [])].slice(-8),
      selfEvalScores: Object.entries(selfEval).map(([dimension, score]) => ({ dimension, score })),
      externalFeedback: external || undefined,
    }
    await actions.saveDraft(draft)
    setSavedAt(Date.now())
  }

  const exportText = (format: 'md' | 'txt') => {
    if (!ex) return
    const content = `# ${ex.title}\n\n${ex.prompt}\n\n---\n\n${text}`
    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${ex.id}.${format}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  if (!ex) {
    return <div className="card">找不到该写作任务。<button className="btn" onClick={onFinish}>结束任务</button></div>
  }

  const [lo, hi] = ex.targetWords

  const finish = async () => {
    const a = analyzeWriting(text, ex)
    setAnalysis(a)
    await persist('完成并分析')
    const evalScores = ex.checklist.map((c) => ({ dimension: c.dimension, score: selfEval[c.dimension] ?? 0 }))
    const avgScore = evalScores.reduce((s, x) => s + x.score, 0) / Math.max(1, evalScores.length) / 2
    const ev: LearningEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(), language: ex.language, skill: 'writing', exerciseType: 'writing-task',
      contentId: ex.id, score: avgScore, secondsSpent: (ex.suggestedMinutes * 60) - secondsLeft,
      hintsUsed: 0, errorTags: [], contentVersion: ex.contentVersion,
      detail: { wordCount, minutes: ex.suggestedMinutes, selfEvalScores: evalScores },
    }
    await actions.recordEvent(ev)
  }

  return (
    <div>
      <div className="card">
        <div className="spread">
          <h2>{ex.title}</h2>
          <Badge tone="accent">{ex.variant.includes('t1') ? 'Task 1' : ex.variant === 'ielts-t2' ? 'Task 2' : '西语写作'}</Badge>
        </div>
        <p>{ex.prompt}</p>
        <p className="small dim">{ex.promptZh}</p>
        {ex.visualData && (
          <div className="notice">
            <b>{ex.visualData.kind === 'table' ? '数据表' : '数据描述'}</b>
            <pre className="mono" style={{ whiteSpace: 'pre-wrap', margin: '6px 0 0', fontSize: 13 }}>{ex.visualData.markdown}</pre>
          </div>
        )}
        <div className="row small dim" style={{ marginTop: 8 }}>
          <span>目标 {lo}–{hi}+ 词 · 建议 {ex.suggestedMinutes} 分钟</span>
          {ex.outlineHints && ex.outlineHints.length > 0 && <span>提示见下方折叠</span>}
        </div>
        {ex.outlineHints && (
          <details style={{ marginTop: 8 }}>
            <summary className="small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>结构提纲（不是范文）</summary>
            <ul className="small dim">{ex.outlineHints.map((h, i) => <li key={i}>{h}</li>)}</ul>
          </details>
        )}
      </div>

      <div className="card">
        <div className="spread" style={{ marginBottom: 8 }}>
          <div className="row">
            <button className="btn sm" onClick={() => setTimerOn(!timerOn)}>{timerOn ? '暂停' : '开始计时'}</button>
            <span className="mono" aria-label="剩余时间">{String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</span>
            {secondsLeft === 0 && <Badge tone="warn">时间到</Badge>}
          </div>
          <span className={wordCount >= lo && wordCount <= hi + 80 ? 'small' : 'small warn'} style={{ color: wordCount >= lo ? 'var(--ok)' : 'var(--warn)' }}>{wordCount} 词</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder={ex.language === 'en' ? 'Write your response here…' : 'Escribe aquí…'}
          aria-label="作文输入区"
        />
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn" onClick={() => persist('手动保存')}>保存草稿</button>
          <button className="btn" onClick={() => exportText('md')}>导出 .md</button>
          <button className="btn" onClick={() => exportText('txt')}>导出 .txt</button>
          {savedAt && <span className="small dim">已保存 {new Date(savedAt).toLocaleTimeString()}</span>}
        </div>
      </div>

      {!analysis ? (
        <div className="card">
          <h3>写完之后：自评清单（对应公开评分维度）</h3>
          {ex.checklist.map((c) => (
            <div key={c.dimension} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>{c.dimension}</div>
              <ul className="small dim" style={{ margin: '4px 0' }}>{c.descriptors.map((d, i) => <li key={i}>{d}</li>)}</ul>
              <div className="row">
                {EVAL_OPTIONS.map((o, i) => (
                  <button key={o} className={`chip ${selfEval[c.dimension] === i ? 'on' : ''}`} onClick={() => setSelfEval({ ...selfEval, [c.dimension]: i })}>{o}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="notice info">
            自评只用于自我校准与记录。本应用的规则检查<b>不能预测或替代真实 IELTS/DELE 评分</b>；建议定期把导出的作文交给合格老师或考官校准。
          </div>
          <button className="btn primary lg" disabled={wordCount < 20} onClick={finish}>完成并分析</button>
          {wordCount < 20 && <div className="small dim" style={{ marginTop: 6 }}>至少写 20 词才能分析。</div>}
        </div>
      ) : (
        <div className="card fadein">
          <h3>规则检查结果（可解释提示，非评分）</h3>
          {analysis.checks.map((c) => (
            <div key={c.id} className={`notice ${c.status === 'warn' ? 'warn' : c.status === 'ok' ? 'info' : ''}`}>
              <b>{c.label}</b>：<span className="small">{c.detail}</span>
            </div>
          ))}
          <h3 style={{ marginTop: 12 }}>AI 批改（推荐）</h3>
          {lastReview && lastReview.exerciseId === ex.id && (
            <p className="small dim" style={{ margin: 0 }}>
              上次批改：{Math.floor((Date.now() - lastReview.ts) / 86400000) === 0 ? '今天' : `${Math.floor((Date.now() - lastReview.ts) / 86400000)} 天前`}。
            </p>
          )}
          <p className="small dim">
            把这篇作文交给你的 AI 批改：结果按统一错误标签入库（与错题本同一套体系），<b>不给分、不猜等级</b>。
            复制指令 → 粘给你的 agent → 把回复粘回来，本地校验后才写入。
          </p>
          <AgentPacketPanel
            def={reviewPacket}
            ctx={{
              language: ex.language,
              skill: 'writing',
              exerciseId: ex.id,
              taskTitle: ex.title,
              taskPrompt: ex.prompt,
              sourceText: text,
              checklist: ex.checklist.map((c) => c.dimension),
              alreadyTags: existingDraft?.confirmedTags ?? [],
            }}
            onApplied={() => void actions.reloadAll()}
          />

          <details style={{ marginTop: 12 }}>
            <summary className="small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>离线通道：粘贴老师/其他工具的批改（不用 AI，本地关键词解析）</summary>
            <div style={{ marginTop: 8 }}>
              <textarea value={external} onChange={(e) => setExternal(e.target.value)} rows={4} placeholder="粘贴老师的批改/建议…" />
              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn" onClick={() => persist('保存外部反馈')}>保存反馈原文</button>
              </div>
              {external.trim() && (
                <div style={{ marginTop: 8 }}>
                  <FeedbackParser
                    text={external}
                    language={ex.language}
                    alreadyTags={existingDraft?.confirmedTags ?? []}
                    onConfirm={async (tags, acts) => {
                      const res = await actions.applyDraftFeedbackTags(ex.id, tags, acts)
                      return res.note
                    }}
                  />
                </div>
              )}
            </div>
          </details>

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn primary lg" onClick={onFinish}>完成任务</button>
            <span className="small dim">AI 批改是可选的，不批改也能完成。</span>
          </div>

          {existingDraft && existingDraft.history.length > 0 && (
            <details style={{ marginTop: 10 }}>
              <summary className="small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>修订历史（初稿 vs 修改稿）</summary>
              {existingDraft.history.map((h, i) => (
                <div key={i} className="notice small">{h.label} · {new Date(h.ts).toLocaleString()}
                  <pre className="mono" style={{ whiteSpace: 'pre-wrap', margin: '4px 0 0', fontSize: 12 }}>{h.text.slice(0, 400)}{h.text.length > 400 ? '…' : ''}</pre>
                </div>
              ))}
            </details>
          )}
        </div>
      )}
    </div>
  )
}
