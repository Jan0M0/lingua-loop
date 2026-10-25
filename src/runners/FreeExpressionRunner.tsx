// 自由表达工作室（v2 §3A.3）：开放式表达，先说/写出来，再自选复盘方式；不判对错
import { useEffect, useRef, useState } from 'react'
import type { LearningEvent, PlannedTask, WritingDraft } from '../types/app'
import type { FreeExpressionExercise } from '../types/content'
import { useActions, useAppState } from '../state/AppContext'
import { recordingSupported, startRecording, type RecorderHandle } from '../audio/recorder'
import { speak, stopSpeaking } from '../audio/tts'
import { Badge } from '../components/ui'

export function FreeExpressionRunner({ task, onFinish }: { task: PlannedTask; onFinish: () => void }) {
  const { allExercises } = useAppState()
  const actions = useActions()
  const ex = allExercises.find((e) => e.id === task.contentIds?.[0]) as FreeExpressionExercise | undefined
  const [form, setForm] = useState<'write' | 'speak'>(ex?.form === 'speak' ? 'speak' : 'write')
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [reflection, setReflection] = useState<string[]>([])
  const [startedAt] = useState(Date.now())
  const recRef = useRef<RecorderHandle | null>(null)
  const urlRef = useRef<string | null>(null)

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
    return <div className="card">找不到这个表达提示。<button className="btn" onClick={onFinish}>结束</button></div>
  }

  const canWrite = ex.form !== 'speak'
  const canSpeak = ex.form !== 'write' && recordingSupported()

  const save = async () => {
    setSaved(true)
    if (form === 'write' && text.trim()) {
      const draft: WritingDraft = {
        id: `draft-${ex.id}-${Date.now()}`,
        exerciseId: ex.id,
        language: ex.language,
        text,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        history: [],
      }
      await actions.saveDraft(draft)
    }
    const ev: LearningEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(), language: ex.language, skill: form === 'write' ? 'writing' : 'speaking',
      exerciseType: 'free-expression', contentId: ex.id,
      secondsSpent: Math.round((Date.now() - startedAt) / 1000), hintsUsed: 0,
      errorTags: [], contentVersion: ex.contentVersion,
      detail: form === 'write' ? { wordCount: text.trim() ? text.trim().split(/\s+/).length : 0 } : { recordedSeconds: elapsed },
      note: reflection.join('；') || undefined,
    }
    await actions.recordEvent(ev)
    if (form === 'speak' && urlRef.current) {
      const blob = await fetch(urlRef.current).then((r) => r.blob())
      await actions.addRecording(
        { id: `rec-${Date.now()}`, exerciseId: ex.id, language: ex.language, ts: Date.now(), seconds: elapsed, sizeBytes: blob.size },
        blob
      )
      if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; setAudioUrl(null) }
    }
    onFinish()
  }

  return (
    <div className="card">
      <div className="spread">
        <h2>🎙️ {ex.title}</h2>
        <Badge tone="accent">自由表达 · 不判对错</Badge>
      </div>
      <p style={{ fontSize: 16 }}>{ex.prompt}</p>
      <p className="small dim">{ex.promptZh}</p>

      <div className="notice info" style={{ marginTop: 8 }}>
        目标是把意思表达出来。没有标准答案，没有自动评分——复盘提示只帮你自己看一遍。
      </div>

      {(canWrite && canSpeak) && (
        <div className="row" style={{ margin: '12px 0' }}>
          <button className={`chip ${form === 'write' ? 'on' : ''}`} onClick={() => setForm('write')}>✍️ 写</button>
          <button className={`chip ${form === 'speak' ? 'on' : ''}`} onClick={() => setForm('speak')}>🎙️ 说</button>
        </div>
      )}

      {form === 'write' ? (
        <div>
          <div className="section-title">可以这样开头</div>
          {ex.starterPhrases.map((p, i) => (
            <div key={i} className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small">{p}</span>
              <button className="btn subtle sm" onClick={() => speak(p, ex.language)}>🔊</button>
            </div>
          ))}
          <textarea
            value={text} onChange={(e) => setText(e.target.value)} rows={8}
            placeholder={ex.language === 'en' ? 'Just write it as you would say it…' : 'Escríbelo como lo dirías…'}
            aria-label="自由表达输入区"
          />
          <div className="small dim">{text.trim() ? text.trim().split(/\s+/).length : 0} 词</div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          {!recording ? (
            <button className="btn primary lg" disabled={saved} onClick={() => {
              startRecording().then((h) => { recRef.current = h; setRecording(true); setElapsed(0) }).catch(() => setForm('write'))
            }}>● 开始说（可随时停）</button>
          ) : (
            <>
              <div className="mono" style={{ fontSize: 28, color: 'var(--danger)' }}>
                {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
              </div>
              <button className="btn primary lg" onClick={async () => {
                setRecording(false)
                const h = recRef.current
                recRef.current = null
                if (h) {
                  const blob = await h.stop()
                  const url = URL.createObjectURL(blob)
                  urlRef.current = url
                  setAudioUrl(url)
                }
              }}>说完，停</button>
            </>
          )}
          {audioUrl && (
            <div style={{ marginTop: 10 }}>
              <audio controls src={audioUrl} style={{ width: '100%' }} />
              <button className="btn sm" onClick={() => { setElapsed(0); setAudioUrl(null); if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null } }}>↺ 重说</button>
            </div>
          )}
          {!recordingSupported() && <div className="notice warn">此浏览器不支持录音，已切换为写。录音只保存在本设备。</div>}
        </div>
      )}

      <div className="section-title" style={{ marginTop: 14 }}>说完/写完后，自己看一眼（可选）</div>
      {ex.reflectionHints.map((h, i) => (
        <label key={i} className="row small" style={{ padding: '4px 0', cursor: 'pointer' }}>
          <input type="checkbox" checked={reflection.includes(h)} onChange={(e) => {
            setReflection(e.target.checked ? [...reflection, h] : reflection.filter((x) => x !== h))
          }} />
          <span>{h}</span>
        </label>
      ))}

      <button className="btn primary lg" style={{ width: '100%', marginTop: 14 }} disabled={saved} onClick={save}>
        {saved ? '已保存' : form === 'write' ? '保存这段表达' : '保存这次录音'}
      </button>
      <p className="small dim" style={{ textAlign: 'center' }}>写的内容在「学习记录」可找到；录音可随时删除。</p>
    </div>
  )
}
