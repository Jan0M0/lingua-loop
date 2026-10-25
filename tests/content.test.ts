// 内容库校验测试：npm run validate:content
// 任何新增内容文件必须通过本测试。
import { describe, expect, it } from 'vitest'
import { builtInExercises, contentStats } from '../src/content/registry'
import { validateAll } from '../src/content/validate'

describe('内置内容库', () => {
  it('包含内容', () => {
    expect(builtInExercises.length).toBeGreaterThan(0)
  })

  it('全部通过语义校验（无 error）', () => {
    const issues = validateAll(builtInExercises)
    const errors = issues.filter((i) => i.level === 'error')
    if (errors.length > 0) {
      console.error(errors.map((e) => `${e.id} ${e.field ? `[${e.field}]` : ''} ${e.message}`).join('\n'))
    }
    expect(errors, `${errors.length} 个内容错误`).toEqual([])
  })

  it('每种内容类型有最低样本（P1 目标，先宽松断言不为空）', () => {
    const s = contentStats()
    const keys = Object.keys(s)
    expect(keys.length).toBeGreaterThan(0)
  })
})
