// 设置与备份：目标、预算、比例、兴趣、语音、导出/恢复、导出审计、清空
import { useEffect, useRef, useState } from 'react'
import { useActions, useAppState } from '../state/AppContext'
import { applyRestore, downloadBackupFile, exportBackup, previewRestore, wipeEverything } from '../storage/backup'
import { getEgressLog } from '../storage/egress'
import type { EgressLogEntry } from '../engine/packets/types'
import { Badge, Segmented } from '../components/ui'
import { INTEREST_TOPICS } from '../types/content'
import { topicLabel } from '../engine/recommend'
import { usePwaInstall } from '../hooks/usePwaInstall'

const MOTIVATION_LABELS: Record<string, string> = {
  travel: '旅行', 'study-work': '学习/工作', friends: '交朋友', culture: '文化',
  express: '表达自己', exam: '考试', moving: '移居',
}

export function Settings() {
  const state = useAppState()
  const actions = useActions()
  const s = state.settings
  const pwa = usePwaInstall()
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const pendingRestore = useRef<Awaited<ReturnType<typeof exportBackup>> | null>(null)
  const [restoreMode, setRestoreMode] = useState<'skip' | 'overwrite'>('skip')
  const [includeRec, setIncludeRec] = useState(false)
  const [egress, setEgress] = useState<EgressLogEntry[]>([])

  // P5.2 导出审计：哪些字段离开过设备（只记字段名与大小，不记内容）
  useEffect(() => {
    void getEgressLog().then(setEgress).catch(() => undefined)
  }, [])

  const doExport = async () => {
    const backup = await exportBackup({ includeRecordings: includeRec })
    downloadBackupFile(backup)
    setMsg(`备份已下载（${includeRec ? '含录音，文件可能较大' : '不含录音'}）。请妥善保管：其中包含你的学习数据${includeRec ? '与录音' : ''}。`)
  }

  const onRestoreFile = async (file: File) => {
    setMsg('')
    try {
      const raw = JSON.parse(await file.text())
      const existing = {
        events: state.events, cardStates: state.cardStates, drafts: state.drafts,
        customContent: state.customContent, settings: s,
      }
      const { preview, file: backupFile, error } = previewRestore(raw, existing)
      if (error || !preview || !backupFile) {
        setMsg('恢复失败：' + (error ?? '未知错误'))
        return
      }
      pendingRestore.current = backupFile
      const conflictNote = preview.conflicts.length
        ? `发现 ${preview.conflicts.length} 处 ID 冲突（同 ID 已存在）。当前策略：${restoreMode === 'skip' ? '跳过冲突项' : '覆盖已有项'}。`
        : '没有发现 ID 冲突。'
      setMsg(`备份预览：事件 ${preview.counts.events}、卡片状态 ${preview.counts.cardStates}、计划 ${preview.counts.plans}、草稿 ${preview.counts.drafts}、自定义内容 ${preview.counts.customContent}、录音 ${preview.counts.recordings}。${conflictNote} 点击下方"确认恢复"执行。`)
    } catch (e) {
      setMsg('无法解析备份文件：' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const doRestore = async () => {
    if (!pendingRestore.current) return
    const res = await applyRestore(pendingRestore.current, restoreMode, { replaceSettings: true, restoreRecordings: includeRec })
    setMsg(`恢复完成：导入 ${res.imported} 条，跳过 ${res.skipped} 条。刷新页面以查看全部数据。`)
    pendingRestore.current = null
  }

  return (
    <div>
      <div className="card">
        <h2>安装为桌面应用</h2>
        {pwa.installed ? (
          <p className="small dim">✅ 已安装。双击桌面/开始菜单里的「Lingua Loop」图标即可打开：独立窗口、完全离线，不再需要 start.cmd、命令行或任何本地服务。数据与本页面共用，仅保存在这台设备。</p>
        ) : pwa.canInstall ? (
          <div>
            <p className="small dim">装一次，以后双击桌面图标就能离线使用——不用再保留任何命令行窗口，也不用先跑 start.cmd。</p>
            <button className="btn primary" onClick={() => void pwa.install()}>安装到桌面</button>
          </div>
        ) : (
          <p className="small dim">当前浏览器没有提供一键安装。桌面版 Chrome/Edge：点地址栏右侧的「安装」图标；iPhone/iPad 的 Safari：分享 → 添加到主屏幕。装好后双击图标即可离线使用，无需命令行。</p>
        )}
      </div>

      <div className="card">
        <h2>目标与节奏</h2>
        <label className="field">
          <span>考试类型</span>
          <Segmented value={s.examType} onChange={(v) => void actions.updateSettings({ examType: v })} options={[
            { value: 'academic', label: 'IELTS Academic' }, { value: 'general', label: 'General Training' },
          ]} />
        </label>
        <label className="field">
          <span>目标考试日期（当前还剩 {s.examDate ? Math.max(0, Math.ceil((new Date(s.examDate).getTime() - Date.now()) / 86400000)) : '?'} 天）</span>
          <input type="date" value={s.examDate} onChange={(e) => void actions.updateSettings({ examDate: e.target.value })} />
        </label>
        <label className="field">
          <span>每日时间预算：{s.dailyMinutes} 分钟</span>
          <input type="range" min="15" max="120" step="15" value={s.dailyMinutes} onChange={(e) => void actions.updateSettings({ dailyMinutes: Number(e.target.value) })} style={{ width: '100%' }} />
        </label>
        <label className="field">
          <span>
            英语 / 西语配比：{s.priorityEn}% / {100 - s.priorityEn}%
            {s.priorityEn >= 100 && <> · <b>只学英语（西语已停用）</b></>}
            {s.priorityEn <= 0 && <> · <b>只学西语（英语已停用）</b></>}
          </span>
          <input type="range" min="0" max="100" step="10" value={s.priorityEn} onChange={(e) => void actions.updateSettings({ priorityEn: Number(e.target.value) })} style={{ width: '100%' }} />
          <div className="small dim">拉到 <b>100%</b> = 完全不学西语（排题、复习、探索全部跳过西语，数据保留，随时改回）；0% 反之。</div>
        </label>
        <label className="field">
          <span>应用名称</span>
          <input type="text" value={s.appName} onChange={(e) => void actions.updateSettings({ appName: e.target.value })} />
        </label>
      </div>

      <div className="card">
        <h2>兴趣与动机</h2>
        <p className="small dim">首页"给我一个有意思的东西"按这些主题推荐；点选可随时增减，不影响其他功能。</p>
        <div className="row">
          {INTEREST_TOPICS.map((t) => (
            <button key={t} className={`chip ${s.interests.includes(t) ? 'on' : ''}`} onClick={() =>
              void actions.updateSettings({
                interests: s.interests.includes(t) ? s.interests.filter((x) => x !== t) : [...s.interests, t],
              })
            }>{topicLabel(t)}</button>
          ))}
        </div>
        {s.motivations.length > 0 && (
          <p className="small dim" style={{ marginTop: 8 }}>你当初的动机：{s.motivations.map((m) => MOTIVATION_LABELS[m] ?? m).join('、')}（记录于引导，供你自己回顾）</p>
        )}
      </div>

      <div className="card">
        <h2>语音与隐私</h2>
        <label className="spread" style={{ padding: '8px 0' }}>
          <span>系统语音朗读（TTS）<div className="small dim">使用操作系统语音；没有可用语音时训练自动切换为文本模式</div></span>
          <Segmented value={s.ttsEnabled ? 'on' : 'off'} onChange={(v) => void actions.updateSettings({ ttsEnabled: v === 'on' })} options={[{ value: 'on', label: '开' }, { value: 'off', label: '关' }]} />
        </label>
        <label className="spread" style={{ padding: '8px 0' }}>
          <span>浏览器语音识别<div className="small dim">默认关闭。开启意味着浏览器可能把音频发给其厂商的在线服务处理——介意请保持关闭。本应用核心功能完全不依赖它。</div></span>
          <Segmented value={s.speechRecognitionEnabled ? 'on' : 'off'} onChange={(v) => void actions.updateSettings({ speechRecognitionEnabled: v === 'on' })} options={[{ value: 'off', label: '关（默认）' }, { value: 'on', label: '开' }]} />
        </label>
        <div className="notice info">
          🔒 本应用无账号、无云端、无埋点分析、无任何 LLM API 调用。全部数据（学习记录/错题/词卡进度/作文/录音）仅存于这台设备的浏览器 IndexedDB。首次加载后可断网使用全部核心功能。
        </div>
      </div>

      <div className="card">
        <h2>导出审计</h2>
        <p className="small dim">
          每次你把交接包指令复制给外部 agent 时，这里记一笔：时间、包类型、带出了哪些字段、多大。
          <b>只记字段名与大小，不记内容本身</b>。保留最近 200 条。
        </p>
        {egress.length === 0 ? (
          <p className="small dim">还没有任何数据离开过设备的记录。</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data">
              <thead><tr><th>时间</th><th>类型</th><th>走了什么</th><th>大小</th></tr></thead>
              <tbody>
                {egress.slice(0, 30).map((e, i) => (
                  <tr key={`${e.ts}-${i}`}>
                    <td className="small">{new Date(e.ts).toLocaleString()}</td>
                    <td className="small">{e.kind === 'review' ? '批改' : e.kind === 'content' ? '出题' : e.kind === 'diagnosis' ? '诊断' : '计划约束'} <span className="dim mono">v{e.promptVersion}</span></td>
                    <td className="small mono">{e.fields.join(', ')}</td>
                    <td className="small">{(e.bytes / 1024).toFixed(1)} KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {egress.length > 30 && <p className="small dim">仅显示最近 30 条（共 {egress.length} 条）。</p>}
          </div>
        )}
      </div>

      <div className="card">
        <h2>备份与恢复</h2>
        <p className="small dim">导出为 JSON 文件。注意：备份包含你的个人学习内容{includeRec ? '与录音' : ''}，请保存在安全位置。恢复前会校验并报告冲突，默认不覆盖已有数据。</p>
        <label className="row small" style={{ margin: '8px 0' }}>
          <input type="checkbox" checked={includeRec} onChange={(e) => setIncludeRec(e.target.checked)} />
          <span>导出/恢复时包含录音（文件显著变大）</span>
        </label>
        <div className="row">
          <button className="btn primary" onClick={doExport}>导出备份</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>选择备份文件恢复…</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) void onRestoreFile(f) }} />
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <span className="small dim">冲突策略：</span>
          <Segmented value={restoreMode} onChange={setRestoreMode} options={[{ value: 'skip', label: '跳过冲突项（默认）' }, { value: 'overwrite', label: '覆盖已有项' }]} />
        </div>
        {msg && <div className="notice info" style={{ whiteSpace: 'pre-wrap' }}>{msg}</div>}
        {pendingRestore.current && (
          <button className="btn primary" style={{ marginTop: 8 }} onClick={doRestore}>确认恢复</button>
        )}
      </div>

      <div className="card">
        <h2>危险区</h2>
        <p className="small dim">清空所有本地数据（学习记录、卡片进度、计划、草稿、录音、自定义内容、设置）。此操作不可撤销，请先导出备份。</p>
        <button className="btn danger" onClick={async () => {
          const c1 = confirm('确定清空全部数据吗？强烈建议先导出备份。')
          if (!c1) return
          const c2 = prompt('请输入"删除"以确认：')
          if (c2 !== '删除') return
          await wipeEverything()
          location.hash = '#/today'
          location.reload()
        }}>清空全部数据</button>
      </div>

      <div className="card">
        <h2>关于</h2>
        <div className="small dim">
          {s.appName} v0.1 · 本地优先语言训练应用 <Badge tone="ok">0 Token 设计</Badge>
          <div style={{ marginTop: 6 }}>目标：IELTS Overall 8.0 + 西语 CEFR B2（分项追踪、可调整）。应用不承诺考试结果；显示的掌握度为内部趋势指标，不构成 Band/CEFR 预测。</div>
          <div style={{ marginTop: 6 }}>官方参考：<a href="https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail" target="_blank" rel="noreferrer">IELTS 评分</a> · <a href="https://examenes.cervantes.es/es/dele/examenes/b2" target="_blank" rel="noreferrer">DELE B2</a> · <a href="https://www.coe.int/en/web/common-european-framework-reference-languages" target="_blank" rel="noreferrer">CEFR</a></div>
        </div>
      </div>
    </div>
  )
}
