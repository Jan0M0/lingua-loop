// 课程路线：24 周地图 + 当前进度 + 30 天配方说明
import { useState } from 'react'
import { useAppState } from '../state/AppContext'
import { currentWeekPlan } from '../engine/scheduler'
import { dayNumber, localDateKey } from '../engine/dates'
import { dayRecipes, weeklyPatterns } from '../data/curriculum/recipes'
import { enWeeks } from '../data/curriculum/en-weeks'
import { esWeeks } from '../data/curriculum/es-weeks'
import { Badge, Segmented } from '../components/ui'

export function Curriculum() {
  const state = useAppState()
  const [lang, setLang] = useState<'en' | 'es'>('en')
  const today = localDateKey()
  const day = dayNumber(state.settings.startedAt || today, today)
  const weeks = lang === 'en' ? enWeeks : esWeeks
  const current = currentWeekPlan(lang, day)
  const [expanded, setExpanded] = useState<number | null>(current.week)

  return (
    <div>
      <div className="card">
        <div className="spread">
          <h2>课程路线</h2>
          <Segmented value={lang} onChange={setLang} options={[{ value: 'en', label: '英语 · IELTS' }, { value: 'es', label: '西语 · B2' }]} />
        </div>
        <p className="small dim">
          学习第 {day} 天 · 当前第 <b>{current.week}</b> 周「{current.theme}」。
          {day <= 30 ? '前 30 天按每日配方编排；' : '第 31 天起由课程地图 + 内容库 + 你的复习状态自动继续编排，'}
          每周目标与检查点如下。
        </p>
        <div className="notice info" style={{ marginTop: 8 }}>
          <b>本周检查点：</b>{current.checkpoint}
          <div className="small">本周重点技能：{current.focusSkills.join(' / ')} · 建议投入约 {current.recommendedMinutes} 分钟</div>
        </div>
      </div>

      {weeks.map((w) => (
        <div key={w.week} className="task-item" style={{ borderColor: w.week === current.week ? 'var(--accent)' : undefined }}>
          <div className="spread" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === w.week ? null : w.week)} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setExpanded(expanded === w.week ? null : w.week) }}>
            <div className="row">
              <Badge tone={w.week === current.week ? 'accent' : 'default'}>第 {w.week} 周</Badge>
              <b>{w.theme}</b>
            </div>
            <span className="small dim">{w.week < current.week ? '已完成区间' : w.week === current.week ? '← 当前' : ''} {expanded === w.week ? '▾' : '▸'}</span>
          </div>
          {expanded === w.week && (
            <div className="fadein" style={{ marginTop: 8 }}>
              <ul className="small" style={{ margin: '4px 0' }}>
                {w.goalsZh.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
              <div className="small dim">检查点：{w.checkpoint}</div>
              {w.errorFocus && <div>{w.errorFocus.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
            </div>
          )}
        </div>
      ))}

      <div className="card">
        <h3>每日配方是怎么来的？</h3>
        <p className="small dim">
          前 30 天：每天的具体训练组合预写在配方里（词汇/阅读/听力/写作/口语轮换，两天不完全相同）。
          第 31 天后：按星期几的模式 + 当周主题，结合你的掌握度与到期复习动态选材，不会"到 30 天就没有下一步"。
        </p>
        <details>
          <summary className="small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>查看前 30 天配方概览</summary>
          <table className="data">
            <thead><tr><th>天</th><th>内容</th></tr></thead>
            <tbody>
              {dayRecipes.map((d) => (
                <tr key={d.day}><td>{d.day}</td><td className="small">{d.slots.map((s) => `${s.language === 'en' ? 'EN' : 'ES'}·${s.labelZh}(${s.minutes}')`).join('；')}</td></tr>
              ))}
            </tbody>
          </table>
        </details>
        <details style={{ marginTop: 8 }}>
          <summary className="small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>第 31 天后的周模式</summary>
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((name, i) => (
            <div key={i} className="small" style={{ marginBottom: 4 }}>
              <b>{name}：</b>{weeklyPatterns.find((p) => p.weekday === i)?.slots.map((s) => `${s.language === 'en' ? 'EN' : 'ES'}·${s.labelZh}`).join('；')}
            </div>
          ))}
        </details>
      </div>
    </div>
  )
}
