// 进步页：真实数据的趋势、掌握度（含置信度）、错误模式、周报 + AI 诊断（P3/P4）
import { useEffect, useMemo, useState } from 'react'
import { useActions, useAppState } from '../state/AppContext'
import { computeMastery } from '../engine/mastery'
import { weeklyReport, thisWeekStart } from '../engine/recap'
import { questionTypeStats, typeStatsHighlights } from '../engine/type-stats'
import { formatMinutes, localDateKey, dateKeyToDate } from '../engine/dates'
import { Badge, EmptyState, MiniBars, MiniLine, ProgressBar, Segmented } from '../components/ui'
import { tagLabel } from '../engine/tag-labels'
import { AgentPacketPanel } from '../components/AgentPacketPanel'
import { buildStateDigest, diagnosisPacket, getPath, type DiagnosisRecord } from '../engine/packets/diagnosis'
import { planPacket, type PlanConstraint } from '../engine/packets/plan'
import { getAllPlans, getMeta, setMeta } from '../storage/db'

const SKILL_LABEL: Record<string, string> = { reading: '阅读', listening: '听力', writing: '写作', speaking: '口语', vocab: '词汇', grammar: '语法' }
const CONF_LABEL: Record<string, string> = { insufficient: '数据不足', low: '低置信', medium: '中置信', high: '较高置信' }

export function Progress() {
  const state = useAppState()
  const actions = useActions()
  const [lang, setLang] = useState<'en' | 'es'>('en')
  const now = Date.now()

  // —— AI 诊断（P3）：记录存 kv，最多保留 12 次 ——
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>([])
  const [allPlans, setAllPlans] = useState<Parameters<typeof buildStateDigest>[0]['plans']>([])
  const [showDiagPanel, setShowDiagPanel] = useState(false)
  const [showPlanPanel, setShowPlanPanel] = useState(false)

  const loadDiagnoses = async () => {
    const d = await getMeta<DiagnosisRecord[]>('diagnoses')
    setDiagnoses(d ?? [])
  }
  useEffect(() => {
    void loadDiagnoses()
    void getAllPlans().then(setAllPlans)
  }, [])

  const digest = useMemo(
    () => buildStateDigest({
      settings: state.settings,
      events: state.events,
      skillStates: state.skillStates,
      adjustments: state.adjustments,
      allExercises: state.allExercises,
      plans: allPlans,
      now,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.events, state.skillStates, state.adjustments, state.allExercises, allPlans, now],
  )

  const latestDiag = diagnoses[0]
  const acceptedFindings = useMemo(
    () => (diagnoses[0]?.findings ?? []).filter((f) => f.status === 'accepted'),
    [diagnoses],
  )
  const existingConstraints = useMemo(
    () => state.adjustments
      .filter((a) => a.kind === 'plan-constraint' && (a.expiresAt == null || a.expiresAt > now))
      .map((a) => a.payload as unknown as PlanConstraint),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.adjustments, now],
  )
  // 交接包 ctx 稳定化：面板的 prompt 构建（含 digest 序列化）只在真变化时重算
  const diagnosisCtx = useMemo(() => ({ digest }), [digest])
  const planCtx = useMemo(
    () => ({ digest, acceptedFindings, existingConstraints }),
    [digest, acceptedFindings, existingConstraints],
  )

  const toggleFinding = async (idx: number) => {
    if (!latestDiag) return
    const next = diagnoses.map((rec, ri) => ri === 0
      ? { ...rec, findings: rec.findings.map((f, fi) => fi === idx ? { ...f, status: f.status === 'accepted' ? 'ignored' as const : 'accepted' as const } : f) }
      : rec)
    setDiagnoses(next)
    await setMeta('diagnoses', next)
  }

  const masteries = useMemo(() => {
    const skills = ['reading', 'listening', 'writing', 'speaking', 'vocab', 'grammar'] as const
    return skills.map((skill) => {
      const ss = state.skillStates.find((x) => x.language === lang && x.skill === skill)
      return computeMastery(lang, skill, state.events, ss?.prior ?? 50, now)
    })
  }, [state.events, state.skillStates, lang, now])

  // 最近 14 天每天分钟数
  const dailyMinutes = useMemo(() => {
    const days: { label: string; value: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = localDateKey(d)
      const min = Math.round(state.events.filter((e) => localDateKey(new Date(e.ts)) === key).reduce((a, e) => a + e.secondsSpent, 0) / 60)
      days.push({ label: key.slice(5), value: min })
    }
    return days
  }, [state.events])

  const accuracyTrend = useMemo(() => {
    // 最近 10 次客观题事件的正确率（滚动）
    const obj = state.events.filter((e) => e.language === lang && e.correct != null).sort((a, b) => a.ts - b.ts).slice(-10)
    const cum: number[] = []
    obj.forEach((_, i) => {
      const slice = obj.slice(0, i + 1)
      cum.push((slice.filter((x) => x.correct).length / slice.length) * 100)
    })
    return cum
  }, [state.events, lang])

  const errorTags = useMemo(() => {    const m = new Map<string, number>()
    for (const e of state.events.filter((x) => x.language === lang)) {
      for (const t of e.errorTags) m.set(t, (m.get(t) ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [state.events, lang])

  const typeStats = useMemo(() => questionTypeStats(state.events, { language: lang }), [state.events, lang])
  const typeHighlights = useMemo(() => typeStatsHighlights(typeStats, 5), [typeStats])
  const hasTimed = typeStats.some((t) => t.avgSeconds != null)

  const weekStart = thisWeekStart()
  const weekEvents = state.events.filter((e) => localDateKey(new Date(e.ts)) >= weekStart)
  const report = useMemo(() => {
    const dueInWeek = state.cardStates.filter((c) => {
      if (!c.lastReviewedAt) return false
      const ts = c.lastReviewedAt
      return localDateKey(new Date(ts)) >= weekStart
    }).length
    return weeklyReport(weekStart, state.events, state.plan ? [state.plan] : [], { dueInWeek: Math.max(dueInWeek, weekEvents.filter((e) => e.exerciseType === 'vocab-card').length), reviewedInWeek: weekEvents.filter((e) => e.exerciseType === 'vocab-card').length })
  }, [state.events, state.cardStates, state.plan, weekEvents.length, weekStart])

  const hasAnyData = state.events.length > 0

  return (
    <div>
      <div className="card">
        <div className="spread">
          <h2>进步</h2>
          <Segmented value={lang} onChange={setLang} options={[{ value: 'en', label: '英语' }, { value: 'es', label: '西语' }]} />
        </div>
        {!hasAnyData ? (
          <EmptyState icon="📈" title="数据积累后才显示趋势" hint="完成几次训练后，这里会出现你的真实曲线。现在显示空状态是诚实的做法。" />
        ) : (
          <>
            <div className="section-title">最近 14 天训练量（分钟）</div>
            <MiniBars data={dailyMinutes} />
            <div className="section-title">客观题正确率趋势（滚动累计，最近 10 次）</div>
            <MiniLine points={accuracyTrend} />
          </>
        )}
      </div>

      <div className="card">
        <div className="spread">
          <h3>🩺 AI 诊断（建议每周一次）</h3>
          <button className="btn sm" onClick={() => setShowDiagPanel(!showDiagPanel)}>
            {latestDiag ? '再做一次诊断' : '做第一次诊断'}
          </button>
        </div>
        <p className="small dim">
          把学习状态摘要交给你的 AI 分析。摘要只含数字聚合（掌握度/正确率/错误标签计数），不含作文、录音或答案原文；
          每条结论必须引用摘要里的真实字段，引用不到的直接拒收（防幻觉硬校验）。
        </p>
        {showDiagPanel && (
          <AgentPacketPanel
            def={diagnosisPacket}
            ctx={diagnosisCtx}
            onApplied={async () => {
              await loadDiagnoses()
              await actions.reloadAll()
              setShowDiagPanel(false) // 收起面板，立刻露出结论列表与「变成计划约束」入口
            }}
          />
        )}
        {latestDiag && !showDiagPanel && (
          <div style={{ marginTop: 10 }}>
            <div className="small dim">
              最近一次：{new Date(latestDiag.ts).toLocaleString()} · packet v{latestDiag.promptVersion}
              {diagnoses.length > 1 && ` · 历史共 ${diagnoses.length} 次`}
            </div>
            {latestDiag.findings.map((f, i) => (
              <div key={i} className="notice small" style={{ marginTop: 6, opacity: f.status === 'ignored' ? 0.45 : 1 }}>
                <div className="spread">
                  <span><b>[{f.confidence === 'high' ? '高' : f.confidence === 'medium' ? '中' : '低'}置信]</b> {f.claim}</span>
                  <button className="btn subtle sm" onClick={() => void toggleFinding(i)}>
                    {f.status === 'accepted' ? '忽略' : '采信'}
                  </button>
                </div>
                <div className="dim" style={{ marginTop: 2 }}>
                  证据：{f.evidenceRefs.map((r) => `${r} = ${JSON.stringify(getPath(latestDiag.digest, r))}`).join('；')}
                </div>
              </div>
            ))}
            {latestDiag.focus.length > 0 && (
              <div className="small" style={{ marginTop: 6 }}>
                建议聚焦：{latestDiag.focus.map((f) => `${SKILL_LABEL[f.skill]}${f.tag ? `/${tagLabel(f.tag)}` : ''}（${f.weeks} 周）`).join('、')}
              </div>
            )}
            {latestDiag.actions.length > 0 && (
              <div className="small dim" style={{ marginTop: 4 }}>行动建议：{latestDiag.actions.join('；')}</div>
            )}
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn primary sm" disabled={acceptedFindings.length === 0} onClick={() => setShowPlanPanel(!showPlanPanel)}>
                把采信的 {acceptedFindings.length} 条结论变成计划约束
              </button>
            </div>
            {showPlanPanel && (
              <div style={{ marginTop: 8 }}>
                <AgentPacketPanel
                  def={planPacket}
                  ctx={planCtx}
                  onApplied={async () => {
                    await actions.reloadAll()
                    await actions.ensureTodayPlan(true)
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3>技能掌握度（内部指数 0–100）</h3>
        <p className="small dim">这不是 IELTS Band 或 CEFR 认证，只是基于你真实作答的内部趋势信号。样本少时会向默认值收缩并标注置信度。</p>
        {masteries.map((m) => (
          <div key={m.skill} style={{ marginBottom: 10 }}>
            <div className="spread small">
              <span><b>{SKILL_LABEL[m.skill]}</b> · {m.value}/100 <Badge tone={m.confidence === 'insufficient' ? 'warn' : m.confidence === 'high' ? 'ok' : 'default'}>{CONF_LABEL[m.confidence]}</Badge></span>
              <span className="dim">{m.sampleSize} 个样本{m.staleDays != null && m.staleDays >= 7 ? ` · ${m.staleDays} 天未练` : ''}</span>
            </div>
            <ProgressBar value={m.value} />
          </div>
        ))}
      </div>

      <div className="card">
        <h3>分题型：正确率与速度（{lang === 'en' ? '英语' : '西语'}阅读/听力）</h3>
        {typeStats.length === 0 ? (
          <p className="small dim">还没有带题型标记的作答。完成一次阅读或听力练习后，这里会按「主旨/细节/推断/同义改写…」拆开统计。</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data">
                <thead><tr><th>题型</th><th>作答</th><th>正确率</th><th>平均用时</th></tr></thead>
                <tbody>
                  {typeStats.map((t) => (
                    <tr key={t.type}>
                      <td className="small">{t.label}</td>
                      <td className="small">{t.attempts} 题</td>
                      <td className="small">
                        {Math.round(t.accuracy * 100)}%
                        <span className="dim"> （{t.correct}/{t.attempts}）</span>
                      </td>
                      <td className="small">{t.avgSeconds != null ? `${t.avgSeconds} 秒/题` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {typeHighlights.length > 0 && (
              <div className="notice info small" style={{ marginTop: 8 }}>
                {typeHighlights.map((h, i) => <div key={i}>• {h}</div>)}
              </div>
            )}
            {typeStats.some((t) => t.attempts < 5) && (
              <p className="small dim" style={{ marginTop: 6 }}>作答不足 5 题的题型仅供参考；分题型统计不含早期没有题型标记的记录。</p>
            )}
            {!hasTimed && <p className="small dim" style={{ marginTop: 4 }}>用时一栏为空：这批记录没有逐题计时。</p>}
          </>
        )}
      </div>

      <div className="card">
        <h3>错误模式（{lang === 'en' ? '英语' : '西语'}）</h3>
        {errorTags.length === 0 ? (
          <p className="small dim">暂无错题标签。做错的客观题会自动归类到这里。</p>
        ) : (
          errorTags.map(([tag, count]) => (
            <div key={tag} className="spread small" style={{ padding: '2px 0' }}>
              <span title={tag}>{tagLabel(tag)}</span><span className="dim">{count} 次</span>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>本周周报（{weekStart} 起）</h3>
        <div className="small dim">
          实际 {formatMinutes(report.actualMinutes)} / 计划 {formatMinutes(report.plannedMinutes)} · 事件 {report.eventsCount} 条
          {report.accuracy != null && <> · 正确率 {Math.round(report.accuracy * 100)}%</>}
        </div>
        {!report.dataSufficient && <div className="notice warn">样本不足（本周事件 &lt; 15 条），以下结论仅供参考。</div>}
        {report.improvements.length > 0 && (
          <>
            <div className="section-title">👍 有进步的点</div>
            {report.improvements.map((x, i) => <div key={i} className="small">• {x}</div>)}
          </>
        )}
        {report.concerns.length > 0 && (
          <>
            <div className="section-title">👀 需要关注</div>
            {report.concerns.map((x, i) => <div key={i} className="small">• {x}</div>)}
          </>
        )}
        <div className="section-title">下周建议</div>
        {report.suggestionsZh.map((x, i) => <div key={i} className="small">• {x}</div>)}
      </div>
    </div>
  )
}
