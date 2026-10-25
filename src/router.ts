// 极简 hash 路由：#/path?key=value
import { useEffect, useState } from 'react'

export interface Route {
  path: string
  params: URLSearchParams
}

function parse(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/today'
  const [path, query] = raw.split('?')
  return { path: path || '/today', params: new URLSearchParams(query ?? '') }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse)
  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function navigate(path: string, params?: Record<string, string>): void {
  const q = params ? '?' + new URLSearchParams(params).toString() : ''
  window.location.hash = `#${path}${q}`
}
