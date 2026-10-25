// 听力运行器：TTS 朗读脚本 + 作答 + 复盘（无语音时提供文本模式并明确标注）
import { useRef, useState } from 'react'
import type { LearningEvent, PlannedTask } from '../types/app'
import type { ListeningExercise } from '../types/content'
import { useActions, useAppState } from '../state/AppContext'
import { speakScriptLines, stopSpeaking, ttsCapability } from '../audio/tts'
import { Badge } from '../components/ui'

export function ListeningRunner({ task, onFinish }: { task: PlannedTask; onFinish: () => void }) {
  const { allExercises, settings } = useAppState()
  const actions = useActions()
  const ex = allExercises.find((e) => e.id === task.contentIds?.[0]) as ListeningExercise | undefined
  const [choices, setChoices] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [currentLine, setCurrentLine] = useState(-1)
  const [rate, setRate] = useState(ex?.ttsRate ?? 0.95)
  const [playing, setPlaying] = useState(false)
  const [showScriptAnyway, setShowScriptAnyway] = useState(false)
  const [startedAt] = useState(Date.now())
  /** 每题首次作答时间点：用于估算分题型速度 */
  const answerTimes = useRef<Record<string, number>>({})
  const recordChoice = (qid: string, optionIndex: number) => {
    if (submitted) return
    if (answerTimes.current[qid] == null) answerTimes.current[qid] = Date.now()
    setChoices((prev) => ({ ...prev, [qid]: optionIndex }))
  }

  if (!ex) {
    return <div className="card">找不到该听力内容。<button className="btn" onClick={onFinish}>结束任务</button></div>
  }

  const cap = ttsCapability()
  const canSpeak = settings.ttsEnabled && cap.supported && ((ex.language === 'en' && cap.enVoice) || (ex.language === 'es' && cap.esVoice))
  const allAnswered = ex.questions.every((q) => choices[q.id] != null)
  const correctCount = ex.questions.filter((q) => choices[q.id] === q.answerIndex).length
  const score = correctCount / ex.questions.length

  const play = (from = 0) => {
    setPlaying(true)
    const ok = speakScriptLines(ex.script, ex.language, {
      rate, from,
      onLine: (i) => setCurrentLine(i),
      onDone: () => { setPlaying(false); setCurrentLine(-1) },
    })
    if (!ok) setPlaying(false)
  }

  const submit = async () => {
    setSubmitted(true)
    stopSpeaking()
    const wrongTags = ex.questions.filter((q) => choices[q.id] !== q.answerIndex).flatMap((q) => q.errorTags)
    let prevAt = startedAt
    const questionResults = ex.questions.map((q) => {
      const at = answerTimes.current[q.id] ?? prevAt
      const dwell = Math.max(0, Math.round((at - prevAt) / 1000))
      prevAt = at
      return {
        qid: q.id,
        correct: choices[q.id] === q.answerIndex,
        chosen: choices[q.id] ?? -1,
        seconds: dwell,
        questionType: q.questionType,
      }
    })
    const ev: LearningEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(), language: ex.language, skill: 'listening', exerciseType: 'listening',
      contentId: ex.id, score, correct: score >= 0.5, secondsSpent: Math.round((Date.now() - startedAt) / 1000),
      hintsUsed: 0, errorTags: [...new Set(wrongTags)], contentVersion: ex.contentVersion,
      detail: { questionResults },
    }
    await actions.recordEvent(ev)
  }

  return (
    <div>
      <div className="card">
        <div className="spread">
          <h2>{ex.title}</h2>
          <Badge tone="accent">{ex.language === 'en' ? '英语听力' : '西语听力'}</Badge>
        </div>
        <p className="dim small">{ex.setting}</p>
        {!canSpeak && (
          <div className="notice warn">
            ⚠️ 当前没有可用的{ex.language === 'en' ? '英语' : '西语'}系统语音。你仍可用<b>文本理解模式</b>完成训练，但这不等价于真实听力模拟。
            {cap.supported && <span> 可在系统设置中安装语音后回来重做。</span>}
          </div>
        )}
        {canSpeak && (
          <>
            <div className="row" style={{ margin: '10px 0' }}>
              <button className="btn primary" onClick={() => (playing ? (stopSpeaking(), setPlaying(false)) : play(0))}>
                {playing ? '⏹ 停止' : '▶ 播放全部'}
              </button>
              <label className="small dim">
                语速 <input type="range" min="0.5" max="1.2" step="0.05" value={rate} onChange={(e) => setRate(Number(e.target.value))} /> {rate.toFixed(2)}×
              </label>
            </div>
            {!playing && ex.script.length > 5 && (
              <div className="row small">
                <span className="dim">从第几行重听：</span>
                {ex.script.map((_, i) => (
                  <button key={i} className="btn sm" onClick={() => play(i)} aria-label={`从第 ${i + 1} 行播放`}>{i + 1}</button>
                ))}
              </div>
            )}
          </>
        )}
        {(submitted || showScriptAnyway || ex.transcriptMode === 'always') && (
          <div className="fadein" style={{ marginTop: 10 }}>
            <div className="section-title">脚本{submitted ? '（复盘）' : '（支持模式）'}</div>
            {ex.script.map((l, i) => (
              <div key={i} style={{ padding: '4px 8px', borderRadius: 6, background: i === currentLine ? 'var(--accent-soft)' : undefined }}>
                <b className="dim">{l.speaker}:</b> {l.line}
              </div>
            ))}
          </div>
        )}
        {!submitted && ex.transcriptMode === 'after' && !showScriptAnyway && (
          <button className="btn subtle sm" onClick={() => setShowScriptAnyway(true)}>提前看脚本（会降低训练效果）</button>
        )}
      </div>

      <div className="card">
        {ex.questions.map((q, qi) => {
          const chosen = choices[q.id]
          const isCorrect = chosen === q.answerIndex
          return (
            <div key={q.id} style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{qi + 1}. {q.stem}</div>
              {q.options.map((opt, i) => {
                let cls = 'option'
                if (submitted) {
                  if (i === q.answerIndex) cls += ' correct'
                  else if (i === chosen) cls += ' wrong'
                } else if (i === chosen) cls += ' selected'
                return (
                  <div key={i} className={cls} role="button" tabIndex={0}
                    onClick={() => recordChoice(q.id, i)}
                    onKeyDown={(e) => { if (e.key === 'Enter') recordChoice(q.id, i) }}>
                    <span className="letter">{'ABCD'[i]}</span><span>{opt}</span>
                  </div>
                )
              })}
              {submitted && (
                <div className={`notice ${isCorrect ? 'info' : 'warn'}`}>
                  <div>{isCorrect ? '✓ 正确' : '✗ 正确答案：' + 'ABCDE'[q.answerIndex]}</div>
                  <div className="small">{q.explanation}</div>
                </div>
              )}
            </div>
          )
        })}
        {!submitted ? (
          <button className="btn primary lg" disabled={!allAnswered} onClick={submit}>提交答案</button>
        ) : (
          <div className="fadein">
            <div className="notice info">得分：{correctCount}/{ex.questions.length}（{Math.round(score * 100)}%）。对照上面脚本看看错在哪一句。</div>
            <button className="btn primary lg" onClick={onFinish}>完成练习</button>
          </div>
        )}
      </div>
    </div>
  )
}
