// 任务结束微反馈：1–2 次点击 + 选填卡点。反馈会真实改变后续训练。
import { useState } from 'react'
import type { Energy, SelfDifficulty, SelfValue, TaskFeedback } from '../types/app'
import { Segmented } from './ui'

export function FeedbackForm({
  language, skill, exerciseType, contentIds, onSubmit, onCancel,
}: {
  language: TaskFeedback['language']
  skill: TaskFeedback['skill']
  exerciseType: TaskFeedback['exerciseType']
  contentIds: string[]
  onSubmit: (fb: TaskFeedback) => void
  onCancel: () => void
}) {
  const [difficulty, setDifficulty] = useState<SelfDifficulty | null>(null)
  const [value, setValue] = useState<SelfValue | null>(null)
  const [energy, setEnergy] = useState<Energy | null>(null)
  const [stuck, setStuck] = useState('')
  const [showStuck, setShowStuck] = useState(false)

  const canSubmit = difficulty && value && energy

  return (
    <div className="card fadein" aria-label="任务反馈">
      <h2>这次训练感觉如何？</h2>
      <p className="small dim">你的反馈会直接调整下次任务的难度、类型和复习间隔——不只是记录。</p>

      <div className="section-title">难度</div>
      <Segmented value={difficulty ?? ''} onChange={(v) => setDifficulty(v as SelfDifficulty)} options={[
        { value: 'too-easy', label: '太简单' }, { value: 'right', label: '合适' }, { value: 'too-hard', label: '太难' },
      ]} />

      <div className="section-title">价值</div>
      <Segmented value={value ?? ''} onChange={(v) => setValue(v as SelfValue)} options={[
        { value: 'useful', label: '有用' }, { value: 'neutral', label: '一般' }, { value: 'not-useful', label: '没帮助' },
      ]} />

      <div className="section-title">当前状态</div>
      <Segmented value={energy ?? ''} onChange={(v) => setEnergy(v as Energy)} options={[
        { value: 'good', label: '注意力好' }, { value: 'ok', label: '普通' }, { value: 'tired', label: '很疲惫' },
      ]} />

      {showStuck ? (
        <div style={{ marginTop: 10 }}>
          <label className="field">
            <span>哪里卡住了？（选填，会记入学习记录）</span>
            <textarea value={stuck} onChange={(e) => setStuck(e.target.value)} rows={2} placeholder="例如：推断题总在两个选项间犹豫" />
          </label>
        </div>
      ) : (
        <button className="btn subtle sm" style={{ marginTop: 10 }} onClick={() => setShowStuck(true)}>＋ 选填：哪里卡住了</button>
      )}

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn primary" disabled={!canSubmit} onClick={() => {
          if (!difficulty || !value || !energy) return
          onSubmit({ ts: Date.now(), language, skill, exerciseType, contentIds, difficulty, value, energy, stuckNote: stuck.trim() || undefined })
        }}>提交反馈</button>
        <button className="btn subtle" onClick={onCancel}>跳过</button>
      </div>
    </div>
  )
}
