// 错误标签的中文展示名。标签本身是稳定 ID（进存储/备份），展示层统一走这里，避免各页面各写一套。
import type { ErrorTag } from '../types/content'

export const ERROR_TAG_LABEL: Record<ErrorTag, string> = {
  // 通用
  spelling: '拼写',
  register: '语域（正式/非正式）',
  fluency: '流利度',
  coherence: '连贯与衔接',
  vocabulary: '词汇资源',
  structure: '结构与论证',
  // 阅读/听力
  'main-idea': '主旨',
  detail: '细节',
  inference: '推断',
  'writer-attitude': '作者态度',
  paraphrase: '同义改写',
  'paragraph-matching': '段落匹配',
  synonym: '近义词辨析',
  // 语法
  tense: '时态',
  agreement: '主谓一致',
  'word-form': '词形/词性',
  article: '冠词',
  preposition: '介词',
  pronoun: '代词',
  connector: '连接词',
  punctuation: '标点',
  'relative-clause': '定语从句',
  conditional: '条件句',
  // 词汇使用
  collocation: '搭配',
  'word-choice': '选词',
  meaning: '词义',
  // 西语
  'ser-estar': 'ser / estar',
  'gender-number': '性数一致',
  conjugation: '动词变位',
  subjunctive: '虚拟式',
  accent: '重音/重音符号',
  // 口语
  pronunciation: '发音',
  'self-correction': '自我纠正/犹豫',
  range: '句式变化',
}

/** 标签展示：中文名 + 原始 ID（原始 ID 用于和内容/备份对齐） */
export function tagLabel(tag: string): string {
  return (ERROR_TAG_LABEL as Record<string, string>)[tag] ?? tag
}
