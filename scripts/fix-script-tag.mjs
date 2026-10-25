// 构建后处理：把 index.html 里的 <script type="module" crossorigin> 改为经典 script。
// 原因：rollup IIFE 产物本身已是经典脚本，但 Vite 的 HTML 生成固定写 type="module"；
// 部分环境（如内嵌浏览器）离线时 module 脚本请求不经过 Service Worker 缓存，导致离线白屏。
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const file = join(dist, 'index.html')
let html = readFileSync(file, 'utf8')
const before = html
html = html.replace(
  /<script type="module" crossorigin src="([^"]+)"><\/script>/g,
  // defer 必不可少：Vite 把脚本放在 <head>，module 自带 defer 语义，
  // 换成经典脚本后必须显式 defer，否则会在 <body> 解析前执行导致 #root 不存在。
  '<script defer src="$1"></script>'
)
if (html === before) {
  console.warn('未发现 module script 标签（可能 Vite 版本行为变化），文件未修改')
} else {
  writeFileSync(file, html)
  console.log('index.html script 标签已改为经典脚本（离线 SW 缓存兼容）')
}
