// 生成 PWA 图标 PNG（纯 Node zlib 实现，无外部依赖）：蓝色圆角方块 + 白色圆环 + 绿点
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

function crc32(buf) {
  let table = crc32.table
  if (!table) {
    table = crc32.table = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[n] = c
    }
  }
  let crc = -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
  return (crc ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crc])
}

function png(size) {
  const px = Buffer.alloc(size * size * 4)
  const r = size * 0.22 // 圆角半径
  const cx = size / 2
  const cy = size / 2
  const ringOuter = size * 0.3
  const ringInner = size * 0.17
  const dotCx = size * 0.76, dotCy = size * 0.27, dotR = size * 0.09
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      // 圆角判定
      const dx = Math.min(x, size - 1 - x)
      const dy = Math.min(y, size - 1 - y)
      const inside = dx >= 0 && dy >= 0 && (dx * dx + dy * dy >= r * r ? withinRounded(x, y, size, r) : true)
      if (!inside) {
        px[i + 3] = 0
        continue
      }
      const d = Math.hypot(x - cx, y - cy)
      const inDot = Math.hypot(x - dotCx, y - dotCy) <= dotR
      if ((d <= ringOuter && d >= ringInner) || inDot) {
        px[i] = 255; px[i + 1] = 255; px[i + 2] = 255; px[i + 3] = 255
      } else {
        // 蓝色渐变（左上深 → 右下浅）
        const t = (x + y) / (2 * size)
        px[i] = Math.round(26 + t * 60)
        px[i + 1] = Math.round(86 + t * 50)
        px[i + 2] = Math.round(219 - t * 60)
        px[i + 3] = 255
      }
    }
  }
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter none
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function withinRounded(x, y, size, r) {
  // 判断点是否在圆角矩形内
  const rx0 = r, ry0 = r, rx1 = size - r, ry1 = size - r
  const nx = x < rx0 ? rx0 : x > rx1 ? rx1 : x
  const ny = y < ry0 ? ry0 : y > ry1 ? ry1 : y
  return Math.hypot(x - nx, y - ny) <= r
}

for (const size of [192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), png(size))
  console.log(`icon-${size}.png written`)
}
