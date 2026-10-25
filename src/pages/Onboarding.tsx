// 极简 onboarding：可跳过非必需项；诊断混入第一天训练，不在入口一次塞几十题
import { useState } from 'react'
import { useActions } from '../state/AppContext'
import { localDateKey, addDays } from '../engine/dates'
import { navigate } from '../router'
import { Segmented } from '../components/ui'
import type { Skill } from '../types/content'

const SKILLS: { skill: Skill; label: string }[] = [
  { skill: 'reading', label: '阅读' }, { skill: 'listening', label: '听力' },
  { skill: 'writing', label: '写作' }, { skill: 'speaking', label: '口语' },
  { skill: 'vocab', label: '词汇' }, { skill: 'grammar', label: '语法' },
]

export function Onboarding() {
  const actions = useActions()
  const [step, setStep] = useState(0)
  const [examType, setExamType] = useState<'academic' | 'general'>('academic')
  const [examDate, setExamDate] = useState(addDays(localDateKey(), 182))
  const [dailyMinutes, setDailyMinutes] = useState(60)
  const [priorityEn, setPriorityEn] = useState(70)
  const [enRatings, setEnRatings] = useState<Record<string, string>>({})
  const [esRatings, setEsRatings] = useState<Record<string, string>>({})
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [recognition, setRecognition] = useState(false)

  const finish = async (skipRest = false) => {
    await actions.updateSettings({
      onboarded: true,
      startedAt: localDateKey(),
      examType,
      examDate,
      dailyMinutes: skipRest ? 60 : dailyMinutes,
      priorityEn: skipRest ? 70 : priorityEn,
      ttsEnabled,
      speechRecognitionEnabled: recognition,
      skillSelfRatings: skipRest ? {} : { en: enRatings, es: esRatings },
      seedSalt: `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    })
    await actions.ensureTodayPlan(true)
    navigate('/today')
  }

  const steps = [
    {
      title: '① 考试类型与目标日期',
      body: (
        <>
          <label className="field">
            <span>IELTS 类型</span>
            <Segmented value={examType} onChange={setExamType} options={[
              { value: 'academic', label: 'Academic（默认）' }, { value: 'general', label: 'General Training' },
            ]} />
          </label>
          <label className="field">
            <span>目标考试日期（默认 6 个月后，可随时在设置中修改）</span>
            <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          </label>
          <p className="small dim">说明：IELTS 8 与西语 B2 同时达成是高挑战目标。这里只设定方向，应用会用真实数据每两周帮你重估差距，不做任何保证。</p>
        </>
      ),
    },
    {
      title: '② 每天能投入多少时间',
      body: (
        <>
          <label className="field">
            <span>每日时间预算：{dailyMinutes} 分钟</span>
            <input type="range" min="15" max="120" step="15" value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))} style={{ width: '100%' }} />
            <div className="small dim">太忙的日子用「保底模式」5–10 分钟也能保住连续性。</div>
          </label>
        </>
      ),
    },
    {
      title: '③ 英语 / 西语优先级',
      body: (
        <>
          <label className="field">
            <span>英语 {priorityEn}% ／ 西语 {100 - priorityEn}%</span>
            <input type="range" min="10" max="90" step="10" value={priorityEn} onChange={(e) => setPriorityEn(Number(e.target.value))} style={{ width: '100%' }} />
          </label>
          <p className="small dim">默认 70/30。影响每天两类任务的配比，随时可改。</p>
        </>
      ),
    },
    {
      title: '④ 自我评估（选填，帮助起步）',
      body: (
        <>
          <h3>英语</h3>
          {SKILLS.map((s) => (
            <div key={s.skill} className="spread" style={{ padding: '4px 0' }}>
              <span>{s.label}</span>
              <Segmented value={enRatings[s.skill] ?? ''} onChange={(v) => setEnRatings({ ...enRatings, [s.skill]: v })} options={[
                { value: 'weak', label: '薄弱' }, { value: 'average', label: '一般' }, { value: 'strong', label: '较强' },
              ]} />
            </div>
          ))}
          <h3>西语</h3>
          {SKILLS.map((s) => (
            <div key={s.skill} className="spread" style={{ padding: '4px 0' }}>
              <span>{s.label}</span>
              <Segmented value={esRatings[s.skill] ?? ''} onChange={(v) => setEsRatings({ ...esRatings, [s.skill]: v })} options={[
                { value: 'weak', label: '薄弱' }, { value: 'average', label: '一般' }, { value: 'strong', label: '较强' },
              ]} />
            </div>
          ))}
          <p className="small dim">不确定就留空——第一天的微诊断会推估你的起点（西语默认按 A1 假设起步）。</p>
        </>
      ),
    },
    {
      title: '⑤ 语音权限（都可关闭）',
      body: (
        <>
          <label className="spread" style={{ padding: '8px 0' }}>
            <span>启用系统语音朗读（TTS）<div className="small dim">使用操作系统自带语音，完全离线（若系统语音本身离线可用）</div></span>
            <Segmented value={ttsEnabled ? 'on' : 'off'} onChange={(v) => setTtsEnabled(v === 'on')} options={[{ value: 'on', label: '开' }, { value: 'off', label: '关' }]} />
          </label>
          <label className="spread" style={{ padding: '8px 0' }}>
            <span>浏览器语音识别<div className="small dim">默认关闭。注意：浏览器 SpeechRecognition 可能依赖厂商在线服务（数据会发到浏览器厂商），如你介意请保持关闭；不开它不影响任何功能</div></span>
            <Segmented value={recognition ? 'on' : 'off'} onChange={(v) => setRecognition(v === 'on')} options={[{ value: 'on', label: '开' }, { value: 'off', label: '关（默认）' }]} />
          </label>
          <div className="notice info">所有数据只保存在这台设备的浏览器里。没有账号、没有云端、没有分析埋点。</div>
        </>
      ),
    },
  ]

  const s = steps[step]
  return (
    <div className="app-shell" style={{ maxWidth: 640 }}>
      <div className="card">
        <h2>{s.title} <span className="dim small">（{step + 1}/{steps.length}）</span></h2>
        {s.body}
        <div className="row" style={{ marginTop: 16 }}>
          {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>上一步</button>}
          {step < steps.length - 1
            ? <button className="btn primary" onClick={() => setStep(step + 1)}>下一步</button>
            : <button className="btn primary lg" onClick={() => finish()}>完成设置，开始学习</button>}
          <button className="btn subtle" onClick={() => finish(true)}>跳过其余，直接开始</button>
        </div>
      </div>
    </div>
  )
}
