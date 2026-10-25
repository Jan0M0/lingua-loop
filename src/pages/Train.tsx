// 训练页：承载具体任务运行器
import { useAppState } from '../state/AppContext'
import { TaskRunner } from '../runners/TaskRunner'
import { EmptyState } from '../components/ui'
import { navigate, useRoute } from '../router'
import { useEffect } from 'react'
import { localDateKey } from '../engine/dates'

export function Train() {
  const route = useRoute()
  const { plan, ready, settings } = useAppState()
  const taskId = route.params.get('task')

  useEffect(() => {
    if (ready && settings.onboarded && !taskId) navigate('/today')
  }, [ready, settings.onboarded, taskId])

  if (!taskId) return null
  const task = plan?.date === localDateKey() ? plan.tasks.find((t) => t.id === taskId) : undefined
  if (!task) {
    return (
      <div className="card">
        <EmptyState icon="🧭" title="没有找到这个任务" hint="它可能属于别的日期，或计划已重新生成。"
          action={<button className="btn primary" onClick={() => navigate('/today')}>回到今日</button>} />
      </div>
    )
  }
  return <TaskRunner task={task} />
}
