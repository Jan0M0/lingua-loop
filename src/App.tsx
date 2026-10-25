import { useRoute, navigate } from './router'
import { useAppState } from './state/AppContext'
import { Onboarding } from './pages/Onboarding'
import { Today } from './pages/Today'
import { Train } from './pages/Train'
import { Review } from './pages/Review'
import { Curriculum } from './pages/Curriculum'
import { Progress } from './pages/Progress'
import { Records } from './pages/Records'
import { Library } from './pages/Library'
import { Settings } from './pages/Settings'

const NAV = [
  { path: '/today', label: '今日' },
  { path: '/review', label: '复习' },
  { path: '/train', label: '训练' },
  { path: '/curriculum', label: '课程' },
  { path: '/progress', label: '进步' },
  { path: '/records', label: '记录' },
  { path: '/library', label: '内容库' },
  { path: '/settings', label: '设置' },
]

function Nav({ current }: { current: string }) {
  return (
    <nav className="topnav" aria-label="主导航">
      {NAV.map((n) => (
        <a key={n.path} href={`#${n.path}`} className={current === n.path ? 'active' : ''} aria-current={current === n.path ? 'page' : undefined}>{n.label}</a>
      ))}
    </nav>
  )
}

export function App() {
  const route = useRoute()
  const state = useAppState()

  if (!state.ready) {
    return <div className="app-shell"><div className="empty">正在打开本地数据…</div></div>
  }

  if (state.dbError) {
    return (
      <div className="app-shell">
        <div className="card">
          <h2>本地数据库打开失败</h2>
          <p className="dim">{state.dbError}</p>
          <p className="small dim">可能原因：浏览器隐私模式不支持 IndexedDB，或存储空间不足。请尝试普通窗口或清理空间后刷新。</p>
        </div>
      </div>
    )
  }

  if (!state.settings.onboarded && route.path !== '/onboarding') {
    return <Onboarding />
  }

  let page
  switch (route.path) {
    case '/onboarding': page = <Onboarding />; break
    case '/today': page = <Today />; break
    case '/train': page = <Train />; break
    case '/review': page = <Review />; break
    case '/curriculum': page = <Curriculum />; break
    case '/progress': page = <Progress />; break
    case '/records': page = <Records />; break
    case '/library': page = <Library />; break
    case '/settings': page = <Settings />; break
    default: page = <Today />
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" onClick={() => navigate('/today')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') navigate('/today') }}>
          <img src="/icons/icon.svg" alt="" className="logo" />
          {state.settings.appName}
        </div>
        <Nav current={route.path} />
      </header>
      <main className="fadein" key={route.path}>{page}</main>
      <footer className="small dim" style={{ textAlign: 'center', marginTop: 24 }}>
        本地优先 · 离线可用 · 无 LLM API · 数据只在本设备
      </footer>
    </div>
  )
}
