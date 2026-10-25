import { describe, expect, it } from 'vitest'
import { parseFeedback, mergeTags, TAG_RULES } from '../src/engine/feedback-parser'
import { ERROR_TAGS } from '../src/types/content'

describe('feedback-parser · 规则表', () => {
  it('所有规则只映射到 ERROR_TAGS 词表内的标签', () => {
    for (const r of TAG_RULES) expect(ERROR_TAGS).toContain(r.tag)
  })

  it('每个标签至少有一个关键词，且没有空关键词', () => {
    for (const r of TAG_RULES) {
      expect(r.keywords.length).toBeGreaterThan(0)
      for (const k of r.keywords) expect(k.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('feedback-parser · 解析', () => {
  it('英文反馈：识别时态/冠词/拼写/连接词，并提取 Next time 行动项', () => {
    const r = parseFeedback(
      "Your ideas are strong, but there are several tense errors, and article use is inconsistent. Also check the spelling of 'environment'. Next time, try to use clearer connectors between paragraphs.",
      'en',
    )
    const tags = r.candidates.map((c) => c.tag)
    expect(tags).toContain('tense')
    expect(tags).toContain('article')
    expect(tags).toContain('spelling')
    expect(tags).toContain('connector')
    expect(r.actions.some((a) => /Next time/i.test(a))).toBe(true)
    expect(r.empty).toBe(false)
  })

  it('中文反馈：识别结构/主谓一致/拼写，并保留原句证据', () => {
    const r = parseFeedback('论证结构清楚，但第三段缺少例证。注意主谓一致，另外 government 拼写错了。下次试着用连接词把两段串起来。', 'en')
    const tags = r.candidates.map((c) => c.tag)
    expect(tags).toContain('structure')
    expect(tags).toContain('agreement')
    expect(tags).toContain('spelling')
    expect(tags).toContain('connector')
    const spelling = r.candidates.find((c) => c.tag === 'spelling')!
    expect(spelling.evidence.join('')).toContain('拼写')
    expect(r.actions.length).toBeGreaterThan(0)
  })

  it('西语反馈：识别虚拟式/性数/重音符号', () => {
    const r = parseFeedback('Buen nivel, pero cuidado con el subjuntivo y la concordancia de género. Deberías revisar las tildes.', 'es')
    const tags = r.candidates.map((c) => c.tag)
    expect(tags).toContain('subjunctive')
    expect(tags).toContain('gender-number')
    expect(tags).toContain('accent')
    expect(r.actions.some((a) => /Deberías/i.test(a))).toBe(true)
  })

  it('整词边界：range 不会命中 arrange', () => {
    const r = parseFeedback('Try to arrange your ideas better.', 'en')
    expect(r.candidates.map((c) => c.tag)).not.toContain('range')
  })

  it('空文本与无命中都返回空结果，不猜标签', () => {
    expect(parseFeedback('   ', 'en').empty).toBe(true)
    const r = parseFeedback('写得不错，继续加油。', 'en')
    expect(r.candidates).toHaveLength(0)
    expect(r.empty).toBe(true)
  })

  it('同一输入结果确定（两次调用完全一致）', () => {
    const text = 'Tense errors and spelling mistakes. Next time check articles.'
    expect(parseFeedback(text, 'en')).toEqual(parseFeedback(text, 'en'))
  })

  it('候选数量有上限，且按命中次数排序', () => {
    const text = '时态 时态 时态 拼写 冠词 搭配 标点 介词 代词 连接词 词义 结构 细节 推断 发音 语域 流利 词汇 条件句 变位'
    const r = parseFeedback(text, 'en')
    expect(r.candidates.length).toBeLessThanOrEqual(8)
    expect(r.candidates[0].tag).toBe('tense')
    expect(r.candidates[0].hits).toBe(3)
  })
})

describe('feedback-parser · mergeTags', () => {
  it('合并去重并保留顺序', () => {
    expect(mergeTags(['tense', 'article'], ['article', 'spelling'])).toEqual(['tense', 'article', 'spelling'])
  })

  it('过滤词表外的脏数据', () => {
    const out = mergeTags(['tense', 'not-a-tag' as never, 'spelling'], ['also-fake' as never])
    expect(out).toEqual(['tense', 'spelling'])
  })

  it('空输入返回空数组', () => {
    expect(mergeTags([], [])).toEqual([])
  })
})
