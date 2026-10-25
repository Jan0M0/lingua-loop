// 故事运行器（v2 §3A.3）：先理解意义 → 轻理解（可选）→ 突出值得带走的表达 → 收藏进复习队列
import { useState } from 'react'
import type { LearningEvent, PlannedTask } from '../types/app'
import type { StoryExercise } from '../types/content'
import { useActions, useAppState } from '../state/AppContext'
import { speak, stopSpeaking } from '../audio/tts'
import { Badge } from '../components/ui'

type Phase = 'experience' | 'questions' | 'highlights'

export function StoryRunner({ task, onFinish }: { task: PlannedTask; onFinish: () => void }) {
  const { allExercises } = useAppState()
  const actions = useActions()
  const ex = allExercises.find((e) => e.id === task.contentIds?.[0]) as StoryExercise | undefined
  const [phase, setPhase] = useState<Phase>('experience')
  const [showText, setShowText] = useState(ex?.mode === 'reading')
  const [paraIdx, setParaIdx] = useState(1)
  const [choices, setChoices] = useState<Record<string, number>>({})
  const [checked, setChecked] = useState(false)
  const [saved, setSaved] = useState<Record<number, boolean>>({})
  const [startedAt] = useState(Date.now())

  if (!ex) {
    return <div className="card">找不到这个故事。<button className="btn" onClick={onFinish}>结束</button></div>
  }

  const fullText = ex.paragraphs.join(' ')

  const finish = async (opts: { answered: boolean }) => {
    stopSpeaking()
    let score: number | undefined
    let correct: boolean | undefined
    let errorTags: LearningEvent['errorTags'] = []
    if (opts.answered && ex.questions && ex.questions.length > 0) {
      const right = ex.questions.filter((q) => choices[q.id] === q.answerIndex).length
      score = right / ex.questions.length
      correct = score >= 0.5
      errorTags = ex.questions.filter((q) => choices[q.id] !== q.answerIndex).flatMap((q) => q.errorTags)
    }
    const ev: LearningEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(), language: ex.language,
      skill: ex.mode === 'listening' ? 'listening' : 'reading',
      exerciseType: 'story', contentId: ex.id, score, correct,
      secondsSpent: Math.round((Date.now() - startedAt) / 1000), hintsUsed: 0,
      errorTags: [...new Set(errorTags)], contentVersion: ex.contentVersion,
      detail: {
        questionResults: ex.questions?.map((q) => ({ qid: q.id, correct: choices[q.id] === q.answerIndex, chosen: choices[q.id] ?? -1, seconds: 0 })),
      },
    }
    await actions.recordEvent(ev)
    onFinish()
  }

  return (
    <div>
      <div className="card">
        <div className="spread">
          <h2>{ex.title}</h2>
          <Badge tone="accent">{ex.language === 'en' ? '小故事' : 'cuento'}</Badge>
        </div>
        <p className="dim" style={{ fontStyle: 'italic' }}>{ex.titleZh} · {ex.hookZh}</p>

        {phase === 'experience' && (
          <div className="fadein">
            {ex.mode === 'listening' && (
              <div className="notice info">
                🎧 这是听读联动：建议先不看文本听一遍抓大意，再看文本听第二遍。
              </div>
            )}
            <div className="row" style={{ margin: '10px 0' }}>
              <button className="btn primary sm" onClick={() => speak(fullText, ex.language, { rate: ex.language === 'es' ? 0.85 : 0.95 })}>▶ 朗读全文</button>
              <button className="btn sm" onClick={() => speak(ex.paragraphs.slice(0, paraIdx).join(' '), ex.language, { rate: ex.language === 'es' ? 0.85 : 0.95 })}>朗读到第 {paraIdx} 段</button>
              <button className="btn sm" onClick={() => stopSpeaking()}>⏹</button>
              <button className="btn subtle sm" onClick={() => setShowText(!showText)}>{showText ? '隐藏文本再听一遍' : '显示文本'}</button>
            </div>
            {showText ? (
              <div>
                {ex.paragraphs.slice(0, paraIdx).map((p, i) => (
                  <p key={i} style={{ fontSize: 16, lineHeight: 1.9 }}>{p}</p>
                ))}
                {paraIdx < ex.paragraphs.length && (
                  <button className="btn" onClick={() => setParaIdx(paraIdx + 1)}>继续读 ▾</button>
                )}
              </div>
            ) : (
              <div className="empty">正在听…（想看文本随时点"显示文本"）</div>
            )}
            {paraIdx >= ex.paragraphs.length && (
              <div className="row" style={{ marginTop: 12 }}>
                {ex.questions && ex.questions.length > 0 && (
                  <button className="btn primary" onClick={() => setPhase('questions')}>看看理解了吗（{ex.questions.length} 题）</button>
                )}
                <button className="btn" onClick={() => setPhase('highlights')}>先不答题，直接看收获</button>
              </div>
            )}
          </div>
        )}

        {phase === 'questions' && (
          <div className="fadein">
            {ex.questions!.map((q, qi) => {
              const chosen = choices[q.id]
              return (
                <div key={q.id} style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{qi + 1}. {q.stem}</div>
                  {q.options.map((opt, i) => {
                    let cls = 'option'
                    if (checked) {
                      if (i === q.answerIndex) cls += ' correct'
                      else if (i === chosen) cls += ' wrong'
                    } else if (i === chosen) cls += ' selected'
                    return (
                      <div key={i} className={cls} role="button" tabIndex={0}
                        onClick={() => { if (!checked) setChoices({ ...choices, [q.id]: i }) }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !checked) setChoices({ ...choices, [q.id]: i }) }}>
                        <span className="letter">{'ABC'[i]}</span><span>{opt}</span>
                      </div>
                    )
                  })}
                  {checked && <div className={`notice ${chosen === q.answerIndex ? 'info' : 'warn'}`}><div className="small">{q.explanation}</div></div>}
                </div>
              )
            })}
            {!checked ? (
              <div className="row">
                <button className="btn primary" disabled={ex.questions!.some((q) => choices[q.id] == null)} onClick={() => setChecked(true)}>对答案</button>
                <button className="btn subtle" onClick={() => setPhase('highlights')}>跳过，直接看收获</button>
              </div>
            ) : (
              <button className="btn primary lg" style={{ width: '100%' }} onClick={() => setPhase('highlights')}>看看这段里值得带走的表达 →</button>
            )}
          </div>
        )}

        {phase === 'highlights' && (
          <div className="fadein">
            <h3>✨ 值得带走的表达</h3>
            <p className="small dim">喜欢的点"收进复习"——它会进入你的词卡队列，明天在复习里以不同方式出现。</p>
            {ex.highlights.map((h, i) => (
              <div key={i} className="task-item">
                <div style={{ fontSize: 17, fontWeight: 700 }}>{h.expression}</div>
                <div className="dim small" style={{ margin: '4px 0' }}>{h.glossZh}</div>
                <div className="notice">{h.fromStory}<div className="small dim">—— 出自本篇</div></div>
                {h.extraExample && <div className="small" style={{ marginTop: 4 }}>再例如：{h.extraExample}</div>}
                <button
                  className={`btn sm ${saved[i] ? '' : 'primary'}`}
                  style={{ marginTop: 8 }}
                  disabled={saved[i]}
                  onClick={async () => {
                    const id = await actions.saveHighlightAsCard(h, ex.id)
                    setSaved({ ...saved, [i]: !!id })
                  }}
                >
                  {saved[i] ? '✓ 已在复习队列' : '收进复习'}
                </button>
              </div>
            ))}
            <button className="btn primary lg" style={{ width: '100%', marginTop: 8 }} onClick={() => finish({ answered: Object.keys(choices).length > 0 })}>
              完成，说说这次体验
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
