// 口语运行器：准备倒计时 → 录音/计时 → 回放/自评 → 落库（done 阶段）→ AI 批改（可选）→ 返回
// 录音永不自动上传：导出是用户主动动作；AI 批改只吃「转录文本」，不吃音频。
import { useEffect, useRef, useState } from 'react'
import type { LearningEvent, PlannedTask } from '../types/app'
import type { SpeakingExercise } from '../types/content'
import { useActions, useAppState } from '../state/AppContext'
import { speak, stopSpeaking } from '../audio/tts'
import { recordingSupported, startRecording, type RecorderHandle } from '../audio/recorder'
import { Badge } from '../components/ui'
import { AgentPacketPanel } from '../components/AgentPacketPanel'
import { reviewPacket } from '../engine/packets/review'

type Phase = 'prep' | 'speaking' | 'review' | 'done'

export function SpeakingRunner({ task, onFinish }: { task: PlannedTask; onFinish: () => void }) {
  const { allExercises } = useAppState()
  const actions = useActions()
  const ex = allExercises.find((e) => e.id === task.contentIds?.[0]) as SpeakingExercise | undefined
  const [phase, setPhase] = useState<Phase>('prep')
  const [secondsLeft, setSecondsLeft] = useState(ex?.prepSeconds ?? 0)
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [selfEval, setSelfEval] = useState<Record<string, number>>({})
  const [transcript, setTranscript] = useState('')
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [doneEventId, setDoneEventId] = useState<string | null>(null)
  const recRef = useRef<RecorderHandle | null>(null)
  const urlRef = useRef<string | null>(null)

  const supported = recordingSupported()

  useEffect(() => {
    if (phase !== 'prep' || secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [phase, secondsLeft])

  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [recording])

  useEffect(() => () => {
    stopSpeaking()
    recRef.current?.cancel()
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
  }, [])

  if (!ex) {
    return <div className="card">找不到该口语任务。<button className="btn" onClick={onFinish}>结束任务</button></div>
  }

  const beginSpeaking = () => {
    setPhase('speaking')
    if (!supported) return
    startRecording()
      .then((h) => { recRef.current = h; setRecording(true); setElapsed(0) })
      .catch((e: unknown) => setPermissionError(e instanceof Error ? e.message : '无法访问麦克风'))
  }

  const stopSpeakingRec = async () => {
    setRecording(false)
    const handle = recRef.current
    recRef.current = null
    setPhase('review')
    if (handle) {
      const blob = await handle.stop()
      const url = URL.createObjectURL(blob)
      urlRef.current = url
      setAudioUrl(url)
    }
  }

  const finish = async () => {
    const evalScores = ex.selfEvalDimensions.map((d) => ({ dimension: d.dimension, score: selfEval[d.dimension] ?? 0 }))
    const avg = evalScores.reduce((s, x) => s + x.score, 0) / Math.max(1, evalScores.length) / 2
    const ev: LearningEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(), language: ex.language, skill: 'speaking', exerciseType: 'speaking-task',
      contentId: ex.id, score: avg, secondsSpent: ex.prepSeconds + elapsed,
      hintsUsed: 0, errorTags: [], contentVersion: ex.contentVersion,
      detail: { recordedSeconds: elapsed, selfEvalScores: evalScores },
      note: transcript.trim() || undefined,
    }
    await actions.recordEvent(ev)
    setDoneEventId(ev.id)
    if (urlRef.current && recRef.current === null) {
      // 保存录音到 IndexedDB；对象 URL 留给 done 阶段回放/导出，组件卸载时统一回收
      const blob = await fetch(urlRef.current).then((r) => r.blob())
      await actions.addRecording(
        { id: `rec-${Date.now()}`, exerciseId: ex.id, language: ex.language, ts: Date.now(), seconds: elapsed, sizeBytes: blob.size },
        blob
      )
    }
    setPhase('done')
  }

  /** 用户主动导出录音（交给多模态 agent 转写时用；应用自身永不外传音频） */
  const exportRecording = async () => {
    if (!urlRef.current) return
    const blob = await fetch(urlRef.current).then((r) => r.blob())
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${ex.id}-${new Date().toISOString().slice(0, 10)}.webm`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div>
      <div className="card">
        <div className="spread">
          <h2>{ex.title}</h2>
          <Badge tone="accent">{ex.variant}</Badge>
        </div>
        <p style={{ fontSize: 16 }}>{ex.prompt}</p>
        <p className="small dim">{ex.promptZh}</p>
        {ex.bulletPoints && (
          <ul>{ex.bulletPoints.map((b, i) => <li key={i}>{b}</li>)}</ul>
        )}
        {ex.usefulPhrases && (
          <details style={{ marginTop: 8 }}>
            <summary className="small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>实用表达（点开，可朗读）</summary>
            {ex.usefulPhrases.map((p, i) => (
              <div key={i} className="row" style={{ justifyContent: 'space-between' }}>
                <span>{p}</span>
                <button className="btn subtle sm" onClick={() => speak(p, ex.language)}>🔊</button>
              </div>
            ))}
          </details>
        )}
        {ex.followUps && (
          <details style={{ marginTop: 6 }}>
            <summary className="small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>后续追问</summary>
            <ul className="small dim">{ex.followUps.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </details>
        )}
      </div>

      <div className="card">
        {phase === 'prep' && (
          <>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div className="mono" style={{ fontSize: 40, fontWeight: 700 }}>{String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</div>
              <div className="dim small">准备时间</div>
            </div>
            <button className="btn primary lg" style={{ width: '100%' }} onClick={beginSpeaking}>
              {secondsLeft > 0 ? '跳过准备，开始作答' : '开始作答'}
            </button>
          </>
        )}
        {phase === 'speaking' && (
          <>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div className="mono" style={{ fontSize: 40, fontWeight: 700, color: recording ? 'var(--danger)' : 'inherit' }}>
                {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')} / {Math.floor(ex.speakSeconds / 60)}:{String(ex.speakSeconds % 60).padStart(2, '0')}
              </div>
              <div className="dim small">{recording ? '● 录音中' : supported ? '录音未启动' : '录音功能不可用，请用其他设备录音，完成后回来继续'}</div>
              {permissionError && <div className="notice warn">麦克风不可用：{permissionError}。仍可完成文字复盘。</div>}
            </div>
            <button className="btn primary lg" style={{ width: '100%' }} onClick={stopSpeakingRec}>说完，停止</button>
          </>
        )}
        {phase === 'review' && (
          <div className="fadein">
            {audioUrl ? (
              <div style={{ marginBottom: 10 }}>
                <audio controls src={audioUrl} style={{ width: '100%' }} />
                <div className="row">
                  <button className="btn sm" onClick={() => { setPhase('speaking'); setElapsed(0) }}>↺ 重录</button>
                  <button className="btn sm" onClick={() => void exportRecording()}>⬇ 导出录音（主动操作，应用不会自动上传）</button>
                </div>
              </div>
            ) : (
              <div className="notice warn">没有录音（未授权或浏览器不支持）。你仍可以完成自评与文字复盘。</div>
            )}
            <h3>自评（对应公开评分维度，行为化自查）</h3>
            {ex.selfEvalDimensions.map((d) => (
              <div key={d.dimension} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600 }}>{d.dimension}</div>
                <ul className="small dim" style={{ margin: '4px 0' }}>{d.descriptors.map((x, i) => <li key={i}>{x}</li>)}</ul>
                <div className="row">
                  {['没做到', '部分做到', '做到了'].map((o, i) => (
                    <button key={o} className={`chip ${selfEval[d.dimension] === i ? 'on' : ''}`} onClick={() => setSelfEval({ ...selfEval, [d.dimension]: i })}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
            <label className="field">
              <span>文字复盘（选填）：写下或粘贴你实际说的话，便于对照检查</span>
              <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={4} />
            </label>
            <button className="btn primary lg" style={{ width: '100%' }} onClick={finish}>保存并进入复盘</button>
          </div>
        )}
        {phase === 'done' && (
          <div className="fadein">
            <div className="notice info">✅ 口语练习已保存（{elapsed} 秒{transcript.trim() ? ' · 含文字复盘' : ''}）。</div>
            {audioUrl && (
              <div style={{ margin: '10px 0' }}>
                <audio controls src={audioUrl} style={{ width: '100%' }} />
                <button className="btn sm" onClick={() => void exportRecording()}>⬇ 导出录音</button>
              </div>
            )}
            <h3>AI 批改（可选）</h3>
            {transcript.trim().length >= 20 ? (
              <>
                <p className="small dim">
                  流程：导出录音 → 交给你的多模态 agent 转写 → 把转录文本存进复盘文字（上面「保存复盘文字」）→ 点下面的批改。
                  结果按统一错误标签写入这次口语记录，<b>不给分、不猜等级</b>；音频本身永远不经本应用上传。
                </p>
                <AgentPacketPanel
                  def={reviewPacket}
                  ctx={{
                    language: ex.language,
                    skill: 'speaking',
                    exerciseId: ex.id,
                    taskTitle: ex.title,
                    taskPrompt: ex.prompt,
                    sourceText: transcript,
                    checklist: ex.selfEvalDimensions.map((d) => d.dimension),
                  }}
                  onApplied={() => void actions.reloadAll()}
                />
              </>
            ) : (
              <div>
                <p className="small dim">AI 批改需要文字：导出录音交给你的 agent 转写，或直接把你的复述写下来（至少 20 字）。</p>
                <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={4} aria-label="口语复盘文字" />
                <div className="row" style={{ marginTop: 6 }}>
                  <button
                    className="btn sm"
                    disabled={transcript.trim().length < 20}
                    onClick={() => { if (doneEventId) void actions.updateEvent(doneEventId, { note: transcript.trim() }) }}
                  >保存复盘文字</button>
                </div>
              </div>
            )}
            <button className="btn primary lg" style={{ width: '100%', marginTop: 12 }} onClick={onFinish}>完成并返回</button>
          </div>
        )}
      </div>
      <p className="small dim" style={{ textAlign: 'center' }}>录音只保存在本设备，可在「学习记录」中随时删除。</p>
    </div>
  )
}
