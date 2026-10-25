// 选择题运行器：阅读 / 语法填空 / 语法小课 / 诊断
import { useMemo, useState } from 'react'
import type { LearningEvent, PlannedTask } from '../types/app'
import type { DiagnosticExercise, Exercise, GrammarNote, ReadingExercise, ClozeExercise } from '../types/content'
import { useActions, useAppState } from '../state/AppContext'
import { scoreDiagnostic } from '../engine/diagnostics'
import { Badge } from '../components/ui'

function eventId(): string {
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function MCRunner({ task, onFinish }: { task: PlannedTask; onFinish: () => void }) {
  const { allExercises, settings } = useAppState()
  const actions = useActions()
  const ex = allExercises.find((e) => e.id === task.contentIds?.[0]) as Exercise | undefined
  const [choices, setChoices] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [seconds] = useState(Date.now())
  const [diagResult, setDiagResult] = useState<ReturnType<typeof scoreDiagnostic> | null>(null)

  const questions = useMemo(() => {
    if (!ex) return []
    if (ex.type === 'reading-mc') return ex.questions
    if (ex.type === 'cloze') return ex.questions
    if (ex.type === 'grammar-note') return ex.quickChecks
    if (ex.type === 'diagnostic') return ex.questions
    return []
  }, [ex])

  if (!ex || questions.length === 0) {
    return <div className="card">找不到该练习内容。<button className="btn" onClick={onFinish}>结束任务</button></div>
  }

  const allAnswered = questions.every((q) => choices[q.id] != null)
  const correctCount = questions.filter((q) => choices[q.id] === q.answerIndex).length
  const score = correctCount / questions.length

  const submit = async () => {
    setSubmitted(true)
    const secs = Math.round((Date.now() - seconds) / 1000)
    const wrongTags = questions.filter((q) => choices[q.id] !== q.answerIndex).flatMap((q) => q.errorTags)
    if (ex.type === 'diagnostic') {
      const d = ex as DiagnosticExercise
      const result = scoreDiagnostic(d.language, d.questions.map((q, i) => ({
        qid: q.id, skill: q.skill, difficulty: Math.min(5, 1 + Math.floor(i / Math.max(1, d.questions.length / 3)) * 2), correct: choices[q.id] === q.answerIndex,
      })))
      setDiagResult(result)
      await actions.updateSettings({ diagnosticsDone: { ...settings.diagnosticsDone, [d.language]: true } })
      await actions.setSkillPriors(d.language, result.skillPriors)
      await actions.recordEvent({
        id: eventId(), ts: Date.now(), language: d.language, skill: 'vocab', exerciseType: 'diagnostic',
        contentId: d.id, score, correct: score >= 0.5, secondsSpent: secs, hintsUsed: 0,
        errorTags: [...new Set(wrongTags)], contentVersion: d.contentVersion,
        detail: { questionResults: d.questions.map((q) => ({ qid: q.id, correct: choices[q.id] === q.answerIndex, chosen: choices[q.id] ?? -1, seconds: 0 })) },
      } as LearningEvent)
      return
    }
    const ev: LearningEvent = {
      id: eventId(), ts: Date.now(), language: ex.language, skill: ex.skill, exerciseType: ex.type,
      contentId: ex.id, score, correct: score >= 0.5, secondsSpent: secs, hintsUsed: 0,
      errorTags: [...new Set(wrongTags)], contentVersion: ex.contentVersion,
      detail: { questionResults: questions.map((q) => ({ qid: q.id, correct: choices[q.id] === q.answerIndex, chosen: choices[q.id] ?? -1, seconds: 0 })) },
    }
    await actions.recordEvent(ev)
  }

  const renderPassage = () => {
    if (ex.type === 'reading-mc') {
      const r = ex as ReadingExercise
      return (
        <div className="card">
          <div className="spread">
            <h2>{r.title}</h2>
            <Badge>{r.titleZh}</Badge>
          </div>
          {r.passage.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )
    }
    if (ex.type === 'cloze') {
      const c = ex as ClozeExercise
      return (
        <div className="card">
          <h2>{c.title} <span className="dim small">{c.titleZh}</span></h2>
          <p className="dim small">{c.intro}</p>
          <p style={{ lineHeight: 1.9 }}>{c.passage}</p>
          <p className="small dim">按顺序作答下方各空。</p>
        </div>
      )
    }
    if (ex.type === 'grammar-note') {
      const g = ex as GrammarNote
      return (
        <div className="card">
          <h2>{g.title} <span className="dim small">{g.titleZh}</span></h2>
          <p>{g.explanationZh}</p>
          {g.examples.map((e, i) => (
            <div key={i} className="notice">{e.target}<div className="small dim">{e.zh}</div></div>
          ))}
        </div>
      )
    }
    if (ex.type === 'diagnostic') {
      return (
        <div className="card">
          <h2>{ex.language === 'en' ? '英语' : '西语'}微诊断</h2>
          <p className="dim small">约 8–16 题，难度递增。做不出就选最接近的，结果只用于安排起步难度。</p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      {renderPassage()}
      <div className="card">
        {questions.map((q, qi) => {
          const chosen = choices[q.id]
          const isCorrect = chosen === q.answerIndex
          return (
            <div key={q.id} style={{ marginBottom: 18 }} aria-label={`第 ${qi + 1} 题`}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {qi + 1}. {q.stem}
                {'skill' in q && (q as { skill?: string }).skill && <Badge tone="accent">{(q as { skill: string }).skill}</Badge>}
              </div>
              {q.options.map((opt, i) => {
                let cls = 'option'
                if (submitted) {
                  if (i === q.answerIndex) cls += ' correct'
                  else if (i === chosen) cls += ' wrong'
                } else if (i === chosen) cls += ' selected'
                return (
                  <div key={i} className={cls} role="button" tabIndex={0}
                    onClick={() => { if (!submitted) setChoices({ ...choices, [q.id]: i }) }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !submitted) setChoices({ ...choices, [q.id]: i }) }}>
                    <span className="letter">{'ABCDE'[i]}</span><span>{opt}</span>
                  </div>
                )
              })}
              {submitted && (
                <div className={`notice ${isCorrect ? 'info' : 'warn'}`}>
                  <div>{isCorrect ? '✓ 正确' : '✗ 正确答案：' + 'ABCDE'[q.answerIndex]}</div>
                  <div className="small">{q.explanation}</div>
                  <div>{q.errorTags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                </div>
              )}
            </div>
          )
        })}
        {!submitted ? (
          <button className="btn primary lg" disabled={!allAnswered} onClick={submit}>提交答案（{Object.keys(choices).length}/{questions.length}）</button>
        ) : ex.type === 'diagnostic' && diagResult ? (
          <div className="fadein">
            <div className="notice info">
              <div style={{ fontWeight: 700 }}>{diagResult.levelLabelZh} · 加权 {diagResult.overallScore}/100</div>
              {diagResult.adviceZh.map((a, i) => <div key={i} className="small">• {a}</div>)}
            </div>
            <button className="btn primary lg" onClick={onFinish}>完成诊断</button>
          </div>
        ) : (
          <div className="fadein">
            <div className="notice info">得分：{correctCount}/{questions.length}（{Math.round(score * 100)}%）。错题已记录，可在「复习」里按错误类型再练。</div>
            <button className="btn primary lg" onClick={onFinish}>完成练习</button>
          </div>
        )}
      </div>
    </div>
  )
}
