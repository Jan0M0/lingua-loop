/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        // IIFE 经典脚本（而非 ES module）：部分环境离线时 module 脚本请求（cors 模式）
        // 不经过 Service Worker 缓存导致白屏；classic 脚本（no-cors）可靠命中缓存。
        // 本应用为单 chunk、无动态 import，IIFE 完全兼容。
        // 保留默认哈希文件名：新构建 = 新 URL，避免 SW cache-first 永远命中旧缓存。
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    globals: false
  }
})
