// 首页：今天最值得做的事 + 为什么 + 保底入口 + 复盘
import { useEffect, useMemo } from 'react'
import { useActions, useAppState } from '../state/AppContext'
import { dailyRecap } from '../engine/recap'
import { currentWeekPlan } from '../engine/scheduler'
import { dayNumber, daysBetween, formatMinutes, localDateKey, weekdayZh } from '../engine/dates'
import { sortDue } from '../engine/srs'
import { Badge, EmptyState, ProgressBar, Segmented } from '../components/ui'
import { navigate } from '../router'
import type { DayMode } from '../types/app'

const KIND_LABEL: Record<string, string> = {
  'srs-review': '到期复习', 'new-vocab': '新词卡', exercise: '训练', diagnostic: '微诊断', checkpoint: '周检查点', rest: '休息',
}

export function Today() {
  const state = useAppState()
  const actions = useActions()

  useEffect(() => {
    if (state.ready && state.settings.onboarded) void actions.ensureTodayPlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ready])

  const today = localDateKey()
  const day = dayNumber(state.settings.startedAt || today, today)
  const examLeft = state.settings.examDate ? daysBetween(today, state.settings.examDate) : null
  const plan = state.plan?.date === today ? state.plan : null

  const doneMin = plan ? plan.tasks.filter((t) => t.status === 'done').reduce((a, t) => a + t.estMinutes, 0) : 0
  const totalMin = plan ? plan.tasks.reduce((a, t) => a + t.estMinutes, 0) : 0
  const allDone = plan != null && plan.tasks.length > 0 && plan.tasks.every((t) => t.status !== 'pending')
  const nextTask = plan?.tasks.find((t) => t.status === 'pending')

  const recap = useMemo(() => {
    if (!allDone) return null
    return dailyRecap(today, state.events, plan ?? undefined, actions.tomorrowPreview())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, today, state.events.length, plan])

  const dueNow = sortDue(state.cardStates, Date.now())
  const enWeek = currentWeekPlan('en', day)
  const esWeek = currentWeekPlan('es', day)

  if (!state.settings.onboarded) return null

  return (
    <div>
      <div className="card">
        <div className="spread">
          <div>
            <h2 style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {greeting()}，今天练什么已经为你排好
            </h2>
            <div className="small dim">
              {today} {weekdayZh(today)} · 学习第 {day} 天
              {examLeft != null && examLeft > 0 && <> · 距考试 <b>{examLeft}</b> 天</>}
            </div>
          </div>
          <div className="row">
            <Badge tone="accent">EN 第 {enWeek.week} 周</Badge>
            <Badge tone="accent">ES 第 {esWeek.week} 周</Badge>
          </div>
        </div>

        <div className="spread" style={{ marginTop: 12 }}>
          <Segmented
            value={modeValue(state.settings.dayModeOverride, plan?.mode)}
            onChange={(v) => {
              if (v === 'auto') void actions.updateSettings({ dayModeOverride: 'auto' })
              else void actions.updateSettings({ dayModeOverride: v as DayMode })
            }}
            options={[
              { value: 'minimum', label: '保底 5-10 分钟' },
              { value: 'standard', label: '标准日' },
              { value: 'sprint', label: '冲刺日' },
              { value: 'auto', label: '自动' },
            ]}
          />
        </div>
        {plan && (
          <div style={{ marginTop: 10 }}>
            <div className="spread small">
              <span>今日进度 {doneMin}/{totalMin} 分钟 · {plan.tasks.filter((t) => t.status === 'done').length}/{plan.tasks.length} 任务</span>
              <span className="dim">{plan.mode === 'minimum' ? '保底日：少量但有效' : plan.mode === 'sprint' ? '冲刺日：量力而行' : '标准日'}</span>
            </div>
            <ProgressBar value={totalMin ? (doneMin / totalMin) * 100 : 0} tone={allDone ? 'ok' : undefined} />
          </div>
        )}

        {nextTask && (
          <button className="btn primary lg" style={{ width: '100%', marginTop: 12 }} onClick={() => navigate('/train', { task: nextTask.id })}>
            ▶ {allDone ? '' : '继续：'}{KIND_LABEL[nextTask.kind]} · {nextTask.reasons[0]}（约 {nextTask.estMinutes} 分钟）
          </button>
        )}
      </div>

      {plan?.notes.map((n, i) => <div key={i} className="notice info">{n}</div>)}

      {dueNow.length > 0 && (
        <div className="notice warn">
          ⏰ 现在有 <b>{dueNow.length}</b> 张词卡到期。复习永远排在第一位——记忆曲线等不了。
        </div>
      )}

      {plan == null || plan.tasks.length === 0 ? (
        <div className="card">
          <EmptyState icon="🌤️" title="今天还没有可执行的任务" hint="可能内容库为空或设置有变化。试着重新生成今日计划。"
            action={<button className="btn primary" onClick={() => void actions.ensureTodayPlan(true)}>重新生成今日计划</button>} />
        </div>
      ) : (
        <>
          <div className="section-title">今日任务（为什么是它们 ↓）</div>
          {plan.tasks.map((t) => (
            <div key={t.id} className={`task-item ${t.status === 'done' ? 'done' : ''}`}>
              <div className="spread">
                <div className="row">
                  <Badge tone={t.language === 'en' ? 'accent' : 'default'}>{t.language === 'en' ? 'EN' : 'ES'}</Badge>
                  <b>{KIND_LABEL[t.kind]}</b>
                  <span className="dim small">约 {t.estMinutes} 分钟</span>
                  {t.lowLoad && <Badge tone="ok">轻负荷</Badge>}
                </div>
                {t.status === 'pending' ? (
                  <button className="btn sm primary" onClick={() => navigate('/train', { task: t.id })}>开始</button>
                ) : t.status === 'done' ? (
                  <Badge tone="ok">已完成</Badge>
                ) : (
                  <Badge>已跳过</Badge>
                )}
              </div>
              <ul className="reasons">{t.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
              {t.status === 'pending' && (
                <button className="btn subtle sm" onClick={() => void actions.markTask(t.id, 'skipped')}>今天先跳过这个</button>
              )}
            </div>
          ))}
          {!allDone && (
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <button className="btn" onClick={() => navigate('/progress')}>今天先到这里（看看今天的复盘）</button>
            </div>
          )}
        </>
      )}

      {recap && (
        <div className="card fadein">
          <h2>🌙 今日复盘</h2>
          {recap.summaryZh.map((s, i) => <p key={i} style={{ margin: '4px 0' }}>• {s}</p>)}
          {recap.topErrorTags.length > 0 && (
            <p className="small">最常见错误类型：{recap.topErrorTags.map((t) => `${t.tag}×${t.count}`).join('、')}——明天会在同类任务上优先补练。</p>
          )}
          {recap.tomorrowPrioritiesZh.length > 0 && (
            <>
              <h3>明天优先</h3>
              <ul className="small dim">{recap.tomorrowPrioritiesZh.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </>
          )}
          <p className="small dim">连续学习靠节奏而不是愧疚感。今天做到这里已经很好。</p>
        </div>
      )}

      <div className="card">
        <h3>📌 最低保底日</h3>
        <p className="small dim">时间很少？切换到「保底 5-10 分钟」模式：只清到期词卡 + 一个 3 分钟小任务，保住连续性，不制造羞耻感。</p>
        <button className="btn" onClick={() => void actions.updateSettings({ dayModeOverride: 'minimum' })}>切换到保底模式</button>
      </div>
    </div>
  )
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
}

function modeValue(override: string, planMode?: DayMode): string {
  if (override === 'auto') return planMode === 'minimum' ? 'minimum' : 'standard'
  return override
}
