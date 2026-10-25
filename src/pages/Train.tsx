// 训练页：承载具体任务运行器（计划内任务 + 首页探索的即开即走任务）
import { useAppState } from '../state/AppContext'
import { TaskRunner } from '../runners/TaskRunner'
import { EmptyState } from '../components/ui'
import { navigate, useRoute } from '../router'
import { useEffect } from 'react'
import { localDateKey } from '../engine/dates'
import type { PlannedTask } from '../types/app'

export function Train() {
  const route = useRoute()
  const { plan, ready, settings } = useAppState()
  const taskId = route.params.get('task')

  useEffect(() => {
    if (ready && settings.onboarded && !taskId) navigate('/today')
  }, [ready, settings.onboarded, taskId])

  if (!taskId) return null

  // 1) 计划内任务；2) 首页探索任务（sessionStorage，不占当日计划）
  let task: PlannedTask | undefined =
    plan?.date === localDateKey() ? plan.tasks.find((t) => t.id === taskId) : undefined
  if (!task) {
    try {
      const raw = sessionStorage.getItem(`ll-explore-${taskId}`)
      if (raw) task = JSON.parse(raw) as PlannedTask
    } catch {
      /* ignore */
    }
  }

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
