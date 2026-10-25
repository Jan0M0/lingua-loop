// 护栏测试（完成标准第 5 条）：grep -r "api.openai|anthropic|generativelanguage" src/ 必须返回空。
// 「零 token」迟早会在某次"顺手加个自动批改"里被破掉——这条测试就是防止那一刻的锁。
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const FORBIDDEN = ['api.openai', 'anthropic', 'generativelanguage'] as const

function walk(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}

describe('0 Token 护栏：源码里没有任何 AI API 端点', () => {
  // 与完成标准第 5 条完全一致的大小写敏感 grep。
  // 不做大小写折叠：阅读语料里的英文单词 "philanthropic"（慈善的）包含子串 anthropic，属合法内容而非端点。
  it('src/ 全目录不含 api.openai / anthropic / generativelanguage', () => {
    const files = walk(join(__dirname, '..', 'src'))
    expect(files.length).toBeGreaterThan(50)
    const hits: string[] = []
    for (const f of files) {
      const content = readFileSync(f, 'utf8')
      for (const needle of FORBIDDEN) {
        if (content.includes(needle)) hits.push(`${f}: ${needle}`)
      }
    }
    expect(hits).toEqual([])
  })

  it('运行时依赖只有 react / react-dom / idb（无任何 SDK）', async () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'))
    expect(Object.keys(pkg.dependencies).sort()).toEqual(['idb', 'react', 'react-dom'])
  })
})
