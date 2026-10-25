// 词卡运行器：到期复习（四种模式）与新卡引入
import { useMemo, useState } from 'react'
import type { PlannedTask } from '../types/app'
import type { VocabCard } from '../types/content'
import { useActions, useAppState } from '../state/AppContext'
import { drillModesFor, generateDrill, type Drill } from '../engine/vocab-drills'
import { speak } from '../audio/tts'
import { Badge, ProgressBar } from '../components/ui'

export function VocabRunner({ task, onFinish }: { task: PlannedTask; onFinish: () => void }) {
  const { allExercises, cardStates } = useAppState()
  const actions = useActions()
  const ids = task.contentIds ?? []
  const isNew = task.kind === 'new-vocab'

  // 为每张卡生成练习序列
  const queue = useMemo(() => {
    const vocabAll = allExercises.filter((e): e is VocabCard => e.type === 'vocab-card' && e.language === task.language)
    return ids.map((id) => {
      const card = vocabAll.find((c) => c.id === id)
      if (!card) return null
      const state = cardStates.find((c) => c.id === id)
      const modes = isNew
        ? (['introduce', 'recognize-en-zh', 'recall-zh-en'] as const)
        : drillModesFor(false, state?.reps ?? 0, `${task.id}:${id}`)
      return { card, modes: modes as string[] }
    }).filter((x): x is { card: VocabCard; modes: string[] } => x != null)
  }, [ids, allExercises, cardStates, isNew, task.language, task.id])

  const [cardIdx, setCardIdx] = useState(0)
  const [modeIdx, setModeIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [choice, setChoice] = useState<number | null>(null)
  const [sentence, setSentence] = useState('')
  const [cardStart] = useState(Date.now())

  const entry = queue[cardIdx]
  const mode = entry?.modes[modeIdx] ?? 'recognize-en-zh'

  const nextStep = () => {
    if (!entry) return
    if (modeIdx + 1 < entry.modes.length) {
      setModeIdx(modeIdx + 1)
    } else if (cardIdx + 1 < queue.length) {
      setCardIdx(cardIdx + 1)
      setModeIdx(0)
    } else {
      onFinish()
    }
    setRevealed(false)
    setChoice(null)
    setSentence('')
  }

  const vocabAll = allExercises.filter((e): e is VocabCard => e.type === 'vocab-card' && e.language === task.language)

  const doIntroduce = async () => {
    if (!entry) return
    await actions.reviewCard(entry.card.id, 2, Math.round((Date.now() - cardStart) / 1000), { detail: { mode: 'introduce' } })
    nextStep()
  }

  if (!entry) {
    return <div className="card">这个任务没有可用的词卡内容（可能内容已被删除）。<button className="btn" onClick={onFinish}>结束任务</button></div>
  }

  const card = entry.card
  const total = queue.reduce((a, q) => a + q.modes.length, 0)
  const done = queue.slice(0, cardIdx).reduce((a, q) => a + q.modes.length, 0) + modeIdx

  // 新卡第一步：完整展示卡片信息
  if (mode === 'introduce') {
    return (
      <div>
        <div className="spread" style={{ marginBottom: 8 }}>
          <Badge tone="accent">新词 {cardIdx + 1}/{queue.length}</Badge>
          <button className="btn sm" onClick={() => speak(card.term, card.language)}>🔊 读一遍</button>
        </div>
        <ProgressBar value={(done / Math.max(1, total)) * 100} />
        <div className="flip-card" style={{ marginTop: 12 }}>
          <div className="big">{card.term} <span className="dim small">{card.pos}</span></div>
          <div>{card.glossZh}</div>
          <div className="dim small" style={{ marginTop: 6 }}>{card.definition}</div>
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <h3>搭配</h3>
          {card.collocations.map((c) => (
            <div key={c} className="row" style={{ justifyContent: 'space-between' }}>
              <span>{c}</span>
              <button className="btn subtle sm" onClick={() => speak(c, card.language)}>🔊</button>
            </div>
          ))}
          <h3 style={{ marginTop: 10 }}>例句</h3>
          {card.examples.map((e) => (
            <div key={e.sentence} style={{ marginBottom: 6 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>{e.sentence}</span>
                <button className="btn subtle sm" onClick={() => speak(e.sentence, card.language)}>🔊</button>
              </div>
              <div className="small dim">{e.zh}</div>
            </div>
          ))}
          {card.commonError && <div className="notice warn">⚠️ {card.commonError}</div>}
          <button className="btn primary lg" style={{ width: '100%', marginTop: 8 }} onClick={doIntroduce}>记住了，开始检验</button>
        </div>
      </div>
    )
  }

  const drill: Drill = generateDrill(card, mode as Drill['mode'], vocabAll, task.id)

  // 回忆 / 造句：自评等级
  if (drill.mode === 'recall-zh-en' || drill.mode === 'make-sentence') {
    return (
      <div>
        <div className="spread"><Badge tone="accent">{isNew ? '新卡检验' : '复习'} {cardIdx + 1}/{queue.length}</Badge><span className="small dim">{drill.mode === 'recall-zh-en' ? '回想并说出/写出' : '主动造句'}</span></div>
        <ProgressBar value={(done / Math.max(1, total)) * 100} />
        <div className="flip-card" style={{ marginTop: 12 }}>
          <div className="dim small">{drill.hint}</div>
          <div className="big">{drill.prompt}</div>
          {drill.mode === 'make-sentence' && (
            <textarea style={{ maxWidth: 480, margin: '10px auto 0' }} rows={2} value={sentence} onChange={(e) => setSentence(e.target.value)} placeholder="写下你的句子（选填，写完对照例句）" />
          )}
          {revealed ? (
            <div className="fadein" style={{ marginTop: 12 }}>
              <div className="notice info">参考：{drill.answer}</div>
              <div className="small dim">{drill.reference}</div>
              <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
                <button className="btn danger" onClick={async () => { await actions.reviewCard(card.id, 0, 30); nextStep() }}>没想起来</button>
                <button className="btn" onClick={async () => { await actions.reviewCard(card.id, 1, 30); nextStep() }}>想起但费劲</button>
                <button className="btn" onClick={async () => { await actions.reviewCard(card.id, 2, 30); nextStep() }}>想起来了</button>
                <button className="btn" onClick={async () => { await actions.reviewCard(card.id, 3, 30); nextStep() }}>很轻松</button>
              </div>
            </div>
          ) : (
            <button className="btn primary lg" style={{ marginTop: 16 }} onClick={() => { setRevealed(true); if (drill.mode === 'recall-zh-en' && drill.answer) speak(drill.answer, card.language) }}>
              显示答案
            </button>
          )}
        </div>
      </div>
    )
  }

  // 选择题（识别 / 搭配填空）
  return (
    <div>
      <div className="spread"><Badge tone="accent">{isNew ? '新卡检验' : '复习'} {cardIdx + 1}/{queue.length}</Badge><span className="small dim">{drill.mode === 'collocation-cloze' ? '搭配填空' : '词义理解'}</span></div>
      <ProgressBar value={(done / Math.max(1, total)) * 100} />
      <div className="card" style={{ marginTop: 12 }}>
        {drill.hint && <div className="small dim">{drill.hint}</div>}
        <div className="big" style={{ fontSize: 20, fontWeight: 700, margin: '6px 0 14px' }}>{drill.prompt}</div>
        {drill.options?.map((opt, i) => {
          const isAnswer = i === drill.answerIndex
          const cls = choice == null ? 'option' : i === choice ? (isAnswer ? 'option correct' : 'option wrong') : isAnswer ? 'option correct' : 'option'
          return (
            <div key={i} className={cls} onClick={() => { if (choice == null) setChoice(i) }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' && choice == null) setChoice(i) }}>
              <span className="letter">{'ABCD'[i]}</span>
              <span>{opt}</span>
            </div>
          )
        })}
        {choice != null && (
          <div className="fadein">
            <div className={`notice ${choice === drill.answerIndex ? 'info' : 'warn'}`}>
              {choice === drill.answerIndex ? '✓ 正确' : `✗ 正确答案：${drill.options?.[drill.answerIndex ?? 0]}`}
            </div>
            <div className="small dim">{drill.reference}</div>
            <button className="btn primary" style={{ marginTop: 8 }} onClick={async () => {
              await actions.reviewCard(card.id, choice === drill.answerIndex ? 2 : 0, 15)
              nextStep()
            }}>下一题</button>
          </div>
        )}
      </div>
    </div>
  )
}
