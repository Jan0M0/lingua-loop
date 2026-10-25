// 首页（v2 §3A.2）：第一屏 = 兴趣驱动的内容入口；结构化训练（长期路线）放次要位置。
import { useEffect, useMemo, useState } from 'react'
import { useActions, useAppState } from '../state/AppContext'
import { tagLabel } from '../engine/tag-labels'
import { dailyRecap } from '../engine/recap'
import { currentWeekPlan } from '../engine/scheduler'
import { recommendExplore, topicLabel } from '../engine/recommend'
import { computeMastery } from '../engine/mastery'
import { dayNumber, daysBetween, localDateKey, weekdayZh } from '../engine/dates'
import { sortDue } from '../engine/srs'
import { getMeta } from '../storage/db'
import type { Exercise } from '../types/content'
import { Badge, EmptyState, ProgressBar, Segmented } from '../components/ui'
import { navigate } from '../router'
import type { DayMode, PlannedTask } from '../types/app'

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
  const dueNow = sortDue(state.cardStates, Date.now())

  const doneMin = plan ? plan.tasks.filter((t) => t.status === 'done').reduce((a, t) => a + t.estMinutes, 0) : 0
  const totalMin = plan ? plan.tasks.reduce((a, t) => a + t.estMinutes, 0) : 0
  const allDone = plan != null && plan.tasks.length > 0 && plan.tasks.every((t) => t.status !== 'pending')
  const nextTask = plan?.tasks.find((t) => t.status === 'pending')

  const [showRecapOnDemand, setShowRecapOnDemand] = useState(false)
  const [showRoute, setShowRoute] = useState(false)
  const [diagDue, setDiagDue] = useState(false)
  const [diagDismissed, setDiagDismissed] = useState(false)

  // P6：距上次 AI 诊断 >7 天（或学了 8 天以上还没做过）→ 轻提示，可关
  useEffect(() => {
    void (async () => {
      const last = await getMeta<number>('lastDiagnosisAt')
      if (last == null) setDiagDue(day >= 8)
      else setDiagDue(Date.now() - last > 7 * 86400000)
    })().catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day])

  const recap = useMemo(() => {
    if (!allDone && !showRecapOnDemand) return null
    return dailyRecap(today, state.events, plan ?? undefined, actions.tomorrowPreview())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, showRecapOnDemand, today, state.events.length, plan])

  if (!state.settings.onboarded) return null

  return (
    <div>
      <div className="spread" style={{ marginBottom: 10 }}>
        <div>
          <h2 style={{ margin: 0 }}>{greeting()}，今天想接触点什么？</h2>
          <div className="small dim">
            学习第 {day} 天
            {examLeft != null && examLeft > 0 && <> · 距考试 {examLeft} 天（考试训练在长期路线里）</>}
          </div>
        </div>
      </div>

      <ExploreCard nextTask={nextTask} dueCount={dueNow.length} />

      {dueNow.length > 0 && (
        <div className="notice warn">
          ⏰ 有 <b>{dueNow.length}</b> 张词卡到期（不少来自你收藏过的表达）——顺手清一下，几分钟的事。
        </div>
      )}

      {diagDue && !diagDismissed && (
        <div className="notice info spread">
          <span>🩺 有一阵子没做 AI 诊断了（每周一次就够）——去「进步」页看看你的学习状态有没有新信号。</span>
          <span className="row">
            <button className="btn sm" onClick={() => navigate('progress')}>去做诊断</button>
            <button className="btn subtle sm" onClick={() => setDiagDismissed(true)}>先不</button>
          </span>
        </div>
      )}

      {/* —— 长期路线（次要位置，需要结构化训练时展开） —— */}
      <div className="card">
        <div className="spread" style={{ cursor: 'pointer' }} role="button" tabIndex={0}
          onClick={() => setShowRoute(!showRoute)}
          onKeyDown={(e) => { if (e.key === 'Enter') setShowRoute(!showRoute) }}>
          <div>
            <b>🧭 沿着我的长期路线</b>
            <span className="small dim"> {state.settings.priorityEn >= 100 ? 'IELTS 8 的系统训练' : state.settings.priorityEn <= 0 ? '西语 B2 的系统训练' : 'IELTS 8 + 西语 B2 的系统训练'}{plan ? ` · 今日 ${plan.tasks.filter(t => t.status === 'done').length}/${plan.tasks.length} 项` : ''}</span>
          </div>
          <span className="small dim">{showRoute ? '收起 ▴' : '展开 ▾'}</span>
        </div>
        {showRoute && (
          <div className="fadein" style={{ marginTop: 12 }}>
            {plan == null || plan.tasks.length === 0 ? (
              <EmptyState icon="🌤️" title="今天没有可执行的任务" hint="可能内容库为空或设置有变化。"
                action={<button className="btn primary" onClick={() => void actions.ensureTodayPlan(true)}>重新生成今日计划</button>} />
            ) : (
              <>
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
                <div style={{ marginTop: 10 }}>
                  <div className="spread small">
                    <span>今日进度 {doneMin}/{totalMin} 分钟 · {plan.tasks.filter((t) => t.status === 'done').length}/{plan.tasks.length} 任务</span>
                    <span className="dim">{plan.mode === 'minimum' ? '保底日：少量但有效' : plan.mode === 'sprint' ? '冲刺日：量力而行' : '标准日'}</span>
                  </div>
                  <ProgressBar value={totalMin ? (doneMin / totalMin) * 100 : 0} tone={allDone ? 'ok' : undefined} />
                </div>
                {plan.notes.map((n, i) => <div key={i} className="notice info">{n}</div>)}
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
                {!allDone && !showRecapOnDemand && (
                  <div style={{ textAlign: 'center', margin: '12px 0' }}>
                    <button className="btn" onClick={() => setShowRecapOnDemand(true)}>今天先到这里（生成今日复盘）</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {recap && (
        <div className="card fadein">
          <h2>🌙 今日复盘</h2>
          {recap.summaryZh.map((s, i) => <p key={i} style={{ margin: '4px 0' }}>• {s}</p>)}
          {recap.topErrorTags.length > 0 && (
            <p className="small">最常见错误类型：{recap.topErrorTags.map((t) => `${tagLabel(t.tag)}×${t.count}`).join('、')}——明天会在同类任务上优先补练。</p>
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
    </div>
  )
}

// ---------- 兴趣探索卡片（第一屏核心） ----------

function ExploreCard({ nextTask, dueCount }: { nextTask?: PlannedTask; dueCount: number }) {
  const state = useAppState()
  const actions = useActions()
  const [lang, setLang] = useState<'en' | 'es'>(state.settings.priorityEn <= 0 ? 'es' : 'en')
  const [excluded, setExcluded] = useState<string[]>([])
  const [reseed, setReseed] = useState(0)
  const esOff = state.settings.priorityEn >= 100
  const enOff = state.settings.priorityEn <= 0

  // 单语言模式：当前语言被停用时自动切到另一边
  useEffect(() => {
    if (lang === 'es' && esOff) setLang('en')
    if (lang === 'en' && enOff) setLang('es')
  }, [lang, esOff, enOff])

  const targetDifficulty = useMemo(() => {
    const ss = state.skillStates.find((x) => x.language === lang && x.skill === 'reading')
    const m = computeMastery(lang, 'reading', state.events, ss?.prior ?? 50, Date.now())
    return Math.max(1, Math.min(5, Math.round(1 + (m.value / 100) * 4)))
  }, [state.events, state.skillStates, lang])

  const recommendation = useMemo(() => {
    void reseed
    return recommendExplore(
      {
        interests: state.settings.interests,
        language: lang,
        targetDifficulty,
        allExercises: state.allExercises,
        events: state.events,
        adjustments: state.adjustments,
      },
      excluded,
      `explore-${Date.now() >> 20}-${reseed}`
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settings.interests, state.allExercises, state.events, state.adjustments, lang, targetDifficulty, excluded, reseed])

  const freeExpression = useMemo(() => {
    const recent = new Set(state.events.filter((e) => e.exerciseType === 'free-expression' && Date.now() - e.ts < 14 * 86400000).map((e) => e.contentId))
    const pool = state.allExercises.filter((e) => e.type === 'free-expression' && e.language === lang && !recent.has(e.id))
    const all = pool.length > 0 ? pool : state.allExercises.filter((e) => e.type === 'free-expression' && e.language === lang)
    return all[0]
  }, [state.allExercises, state.events, lang])

  const exploreTopics = useMemo(() => {
    // 我今天想探索：兴趣主题优先，不足补充常见主题
    const pool = state.allExercises.filter((e) => e.language === lang && (e.type === 'story' || e.type === 'listening' || e.type === 'reading-mc'))
    const topics = [...new Set(pool.map((e) => e.topic))]
    const interests = state.settings.interests.filter((t) => topics.includes(t))
    const rest = topics.filter((t) => !interests.includes(t)).slice(0, 8 - interests.length)
    return [...interests, ...rest].slice(0, 8)
  }, [state.allExercises, state.settings.interests, lang])

  const startTask = (ex: Exercise, reasons: string[], topic?: string) => {
    const task: PlannedTask = {
      id: `explore-${ex.id}-${Date.now()}`,
      kind: 'exercise',
      language: ex.language,
      skill: ex.skill,
      exerciseType: ex.type,
      contentIds: [ex.id],
      estMinutes: ex.estimatedMinutes,
      reasons,
      status: 'pending',
      topic,
      lowLoad: ex.type === 'story' || ex.type === 'listening',
    }
    // 探索任务不入当日计划（轻量、即开即走），直接进入运行器
    navigate('/train', { task: task.id })
    sessionStorage.setItem(`ll-explore-${task.id}`, JSON.stringify(task))
  }

  return (
    <div className="card" style={{ borderColor: 'var(--accent)' }}>
      <div className="spread" style={{ marginBottom: 8 }}>
        <Segmented value={lang} onChange={setLang} options={[
          ...(enOff ? [] : [{ value: 'en' as const, label: 'English' }]),
          ...(esOff ? [] : [{ value: 'es' as const, label: 'Español' }]),
        ]} />
        {dueCount > 0 && <span className="small dim">{dueCount} 张卡到期</span>}
      </div>

      {recommendation ? (
        <div className="fadein">
          <div className="small dim">给我一个有意思的东西</div>
          <h3 style={{ margin: '4px 0', fontSize: 18 }}>{recommendation.exercise.type === 'story' ? '📖 ' : recommendation.exercise.type === 'listening' ? '🎧 ' : '📄 '}
            {'title' in recommendation.exercise ? (recommendation.exercise as { title: string }).title : recommendation.exercise.id}
          </h3>
          {recommendation.exercise.type === 'story' && (
            <p className="dim" style={{ fontStyle: 'italic', marginTop: 0 }}>{(recommendation.exercise as { hookZh: string }).hookZh}</p>
          )}
          <div className="small dim">{recommendation.reasons.join(' · ')}</div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn primary" onClick={() => startTask(recommendation.exercise, recommendation.reasons, recommendation.exercise.topic)}>
              开始（约 {recommendation.exercise.estimatedMinutes} 分钟）
            </button>
            <button className="btn" onClick={() => {
              setExcluded([...excluded, recommendation!.exercise.id])
              setReseed(reseed + 1)
            }}>换一个</button>
          </div>
        </div>
      ) : (
        <EmptyState icon="🌱" title="这个语言暂时没有可推荐的新内容了"
          hint="你近期读过的内容都会避开。可以在设置里改兴趣，或导入更多内容。" />
      )}

      {nextTask && (
        <button className="btn" style={{ width: '100%', marginTop: 10 }} onClick={() => navigate('/train', { task: nextTask.id })}>
          ▶ 继续上次的训练：{KIND_LABEL[nextTask.kind]} · {nextTask.reasons[0]}
        </button>
      )}

      <div className="section-title">我今天想探索…</div>
      <div className="row">
        {exploreTopics.map((t) => (
          <button key={t} className="chip" onClick={() => {
            const pool = state.allExercises.filter((e) => e.language === lang && e.topic === t && (e.type === 'story' || e.type === 'listening' || e.type === 'reading-mc'))
            const recent = new Set(state.events.filter((e) => Date.now() - e.ts < 21 * 86400000).map((e) => e.contentId))
            const fresh = pool.filter((e) => !recent.has(e.id))
            const pick = (fresh.length > 0 ? fresh : pool)[0]
            if (pick) startTask(pick, [`你自己选的主题：${topicLabel(t)}`], t)
          }}>{topicLabel(t)}</button>
        ))}
      </div>

      <div className="section-title">或者，随便来点别的</div>
      <div className="row">
        {freeExpression && (
          <button className="btn" onClick={() => startTask(freeExpression, ['轻松表达一会儿，不判对错'], freeExpression.topic)}>
            🎙️ 轻松聊一会儿
          </button>
        )}
        {dueCount > 0 && (
          <button className="btn" onClick={() => navigate('/review')}>🔄 顺手复习（{dueCount} 张）</button>
        )}
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
