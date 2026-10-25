// 任务运行器总入口：按任务类型分发，结束后收集微反馈
import { useState } from 'react'
import type { PlannedTask, TaskFeedback } from '../types/app'
import { useActions } from '../state/AppContext'
import { VocabRunner } from './VocabRunner'
import { MCRunner } from './MCRunner'
import { ListeningRunner } from './ListeningRunner'
import { WritingRunner } from './WritingRunner'
import { SpeakingRunner } from './SpeakingRunner'
import { StoryRunner } from './StoryRunner'
import { FreeExpressionRunner } from './FreeExpressionRunner'
import { FeedbackForm } from '../components/FeedbackForm'
import { navigate } from '../router'

export function TaskRunner({ task, fromReview }: { task: PlannedTask; fromReview?: boolean }) {
  const actions = useActions()
  const [phase, setPhase] = useState<'run' | 'feedback'>('run')

  const finishRun = () => setPhase('feedback')

  const submitFeedback = async (fb: TaskFeedback) => {
    await actions.submitFeedback(fb)
    await actions.markTask(task.id, 'done')
    navigate('/today')
  }

  return (
    <div>
      {phase === 'run' && (
        <>
          {task.kind === 'checkpoint' ? (
            <CheckpointRunner task={task} onDone={finishRun} />
          ) : task.kind === 'srs-review' || task.kind === 'new-vocab' ? (
            <VocabRunner task={task} onFinish={finishRun} />
          ) : task.exerciseType === 'story' ? (
            <StoryRunner task={task} onFinish={finishRun} />
          ) : task.exerciseType === 'free-expression' ? (
            <FreeExpressionRunner task={task} onFinish={finishRun} />
          ) : task.exerciseType === 'listening' ? (
            <ListeningRunner task={task} onFinish={finishRun} />
          ) : task.exerciseType === 'writing-task' ? (
            <WritingRunner task={task} onFinish={finishRun} />
          ) : task.exerciseType === 'speaking-task' ? (
            <SpeakingRunner task={task} onFinish={finishRun} />
          ) : (
            <MCRunner task={task} onFinish={finishRun} />
          )}
          {fromReview && (
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <button className="btn subtle" onClick={() => navigate('/review')}>← 返回复习（不标记完成）</button>
            </div>
          )}
        </>
      )}
      {phase === 'feedback' && (
        <FeedbackForm
          language={task.language}
          skill={task.skill}
          exerciseType={task.exerciseType ?? 'vocab-card'}
          contentIds={task.contentIds ?? []}
          topic={task.topic}
          onSubmit={submitFeedback}
          onCancel={async () => {
            await actions.markTask(task.id, 'done')
            navigate('/today')
          }}
        />
      )}
    </div>
  )
}

function CheckpointRunner({ task, onDone }: { task: PlannedTask; onDone: () => void }) {
  return (
    <div className="card">
      <h2>🧭 周检查点</h2>
      <p>花 2 分钟诚实地核对本周目标，然后看看自己的错误标签趋势（在「进步」页面）。</p>
      <div className="notice info">{task.reasons[0]}</div>
      <button className="btn primary lg" style={{ width: '100%' }} onClick={onDone}>已核对，完成</button>
    </div>
  )
}
