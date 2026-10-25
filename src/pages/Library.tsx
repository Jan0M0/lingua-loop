// 内容库：浏览/搜索/统计 + 导入 JSON（预览校验） + 导出
import { useMemo, useState } from 'react'
import { useActions, useAppState } from '../state/AppContext'
import { validateRawContent } from '../content/validate'
import { contentStats } from '../content/registry'
import type { Exercise } from '../types/content'
import { Badge, EmptyState, Modal, Segmented } from '../components/ui'

const TYPE_LABEL: Record<string, string> = {
  'vocab-card': '词卡', 'reading-mc': '阅读', cloze: '填空', listening: '听力',
  'writing-task': '写作', 'speaking-task': '口语', 'grammar-note': '语法', diagnostic: '诊断',
}

export function Library() {
  const state = useAppState()
  const actions = useActions()
  const [q, setQ] = useState('')
  const [langF, setLangF] = useState<'all' | 'en' | 'es'>('all')
  const [typeF, setTypeF] = useState<string>('all')
  const [importOpen, setImportOpen] = useState(false)
  const [importRaw, setImportRaw] = useState<Exercise[] | null>(null)
  const [importMsg, setImportMsg] = useState('')

  const stats = useMemo(() => contentStats(), [state.allExercises.length])

  const items = useMemo(() => {
    return state.allExercises.filter((e) => {
      if (langF !== 'all' && e.language !== langF) return false
      if (typeF !== 'all' && e.type !== typeF) return false
      if (!q.trim()) return true
      const s = q.trim().toLowerCase()
      return e.id.toLowerCase().includes(s) || e.topic.includes(s) || e.tags.join(' ').includes(s) || ('title' in e && typeof (e as { title?: string }).title === 'string' && ((e as { title: string }).title.toLowerCase().includes(s)))
    }).slice(0, 100)
  }, [state.allExercises, q, langF, typeF])

  const onFile = async (file: File) => {
    setImportMsg('')
    try {
      const parsed = JSON.parse(await file.text())
      const arr = Array.isArray(parsed) ? parsed : Array.isArray((parsed as { items?: unknown[] }).items) ? (parsed as { items: Exercise[] }).items : parsed
      const { ok, issues } = validateRawContent(arr)
      const errors = issues.filter((i) => i.level === 'error')
      if (errors.length > 0) {
        setImportMsg(`发现 ${errors.length} 个错误，已拦截（未写入）。前 5 个：\n` + errors.slice(0, 5).map((e) => `${e.id} ${e.field ?? ''} ${e.message}`).join('\n'))
        setImportRaw(null)
        return
      }
      setImportRaw(ok)
      setImportMsg(`预览：${ok.length} 条内容通过校验，${issues.filter((i) => i.level === 'warning').length} 条警告。确认后写入（已存在的 ID 会被跳过，不覆盖）。`)
    } catch (e) {
      setImportMsg('无法解析 JSON：' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const doImport = async () => {
    if (!importRaw) return
    const res = await actions.importCustomContent(importRaw)
    setImportMsg(`导入完成：写入 ${res.written} 条，跳过已存在 ${res.skipped} 条。`)
    setImportRaw(null)
  }

  const exportContent = () => {
    const blob = new Blob([JSON.stringify(state.customContent, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'lingua-loop-custom-content.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div>
      <div className="card">
        <div className="spread">
          <h2>内容库</h2>
          <div className="row">
            <button className="btn" onClick={() => setImportOpen(true)}>导入 JSON</button>
            <button className="btn" onClick={exportContent}>导出自定义内容</button>
          </div>
        </div>
        <p className="small dim">
          全部为原创内容（来源标注 original）或你导入的内容。共 {state.allExercises.length} 条（内置 {state.allExercises.length - state.customContent.length} + 自定义 {state.customContent.length}）。
          内容持续消耗是正常现象：安排任务时会自动避开近期做过的题；当某类内容用尽，今日页面会明确提示，而不是假装无限生成。
        </p>
        <div className="row">
          {Object.entries(stats).map(([k, v]) => <Badge key={k} tone="accent">{k}：{v}</Badge>)}
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ margin: '10px 0' }}>
          <input type="text" placeholder="搜索 id / 标题 / 主题 / 标签…" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
          <Segmented value={langF} onChange={setLangF} options={[{ value: 'all', label: '全部' }, { value: 'en', label: 'EN' }, { value: 'es', label: 'ES' }]} />
          <select value={typeF} onChange={(e) => setTypeF(e.target.value)} aria-label="类型过滤">
            <option value="all">全部类型</option>
            {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        {items.length === 0 ? (
          <EmptyState icon="📚" title="没有匹配的内容" />
        ) : (
          <table className="data">
            <thead><tr><th>ID</th><th>类型</th><th>技能</th><th>主题</th><th>难度</th><th>来源</th></tr></thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id}>
                  <td className="mono small">{e.id}</td>
                  <td className="small">{TYPE_LABEL[e.type]}</td>
                  <td className="small">{e.skill}</td>
                  <td className="small">{e.topic}</td>
                  <td className="small">{e.difficulty}/5 {e.cefr ? `(${e.cefr})` : ''}</td>
                  <td className="small dim">{e.source === 'original' ? '原创' : '导入'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {importOpen && (
        <Modal title="导入自定义内容" onClose={() => { setImportOpen(false); setImportRaw(null); setImportMsg('') }}>
          <p className="small dim">
            支持内容对象数组 JSON（或 {"{ items: [...] }"}）。格式参见项目 docs/CONTENT_AUTHORING.md 与 docs/DATA_SCHEMA.md。
            导入前会完整校验；<b>默认不覆盖已存在的 ID</b>。
          </p>
          <input type="file" accept=".json,application/json" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f) }} />
          {importMsg && <div className="notice info" style={{ whiteSpace: 'pre-wrap' }}>{importMsg}</div>}
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" disabled={!importRaw} onClick={doImport}>确认导入</button>
            <button className="btn subtle" onClick={() => { setImportOpen(false); setImportRaw(null); setImportMsg('') }}>取消</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
