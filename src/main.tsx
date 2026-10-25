import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { AppProvider } from './state/AppContext'
import './global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
)

// 仅生产构建注册 service worker（开发模式不干扰）
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(async () => {
        // SW 在 load 之后才注册：本次页面已经加载的哈希资源不会经过 fetch 拦截器。
        // 这里从页面侧把当前构建声明的资源显式写入缓存，否则首次离线会白屏。
        if (!('caches' in window)) return
        try {
          const cache = await caches.open('lingua-loop-v1')
          const urls = new Set<string>(['/', '/index.html', '/manifest.webmanifest', '/sw.js'])
          document
            .querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src], link[rel="stylesheet"], link[rel="manifest"], link[rel="icon"]')
            .forEach((el) => {
              const u = (el as HTMLScriptElement).src ?? (el as HTMLLinkElement).href
              if (u && u.startsWith(self.location.origin)) urls.add(new URL(u).pathname)
            })
          await cache.addAll([...urls])
        } catch (err) {
          console.warn('离线资源缓存写入失败（在线功能不受影响）：', err)
        }
      })
      .catch((err) => {
        console.warn('Service Worker 注册失败（不影响功能，仅离线缓存不可用）：', err)
      })
  })
}
