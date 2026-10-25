// IELTS Academic Writing Task 1 —— 原创图表作文（表格 / 文字数据）
// 作者：Lingua Loop 内容组（IELTS 写作）
import type { WritingExercise } from '../../../types/content'

export const items: WritingExercise[] = [
  {
    id: 'en-w-t1a-001',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-academic',
    topic: 'finance',
    difficulty: 3,
    estimatedMinutes: 20,
    tags: ['finance', 'data-table'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Weekly Household Spending in Riverport',
    prompt:
      'The table below shows the average amount of money that households in the city of Riverport spent each week in 2010, 2015 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    promptZh:
      '下表显示了里弗波特市家庭在 2010 年、2015 年和 2020 年平均每周的支出金额。请选取并报告主要特征来概括这些信息，并在相关之处进行比较。请至少写 150 词。',
    visualData: {
      kind: 'table',
      markdown: `| Weekly spending per household | 2010 | 2015 | 2020 |
| --- | --- | --- | --- |
| Housing | $120 | $165 | $210 |
| Food | $85 | $92 | $98 |
| Transport | $60 | $58 | $45 |
| Leisure | $45 | $60 | $75 |
| Other items | $40 | $43 | $47 |
| **Total** | **$350** | **$418** | **$475** |`,
    },
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '开头段用自己的话改写表格主题（对象、地点、年份），不整句照抄题目',
          '概述段（overview）点出两条主线：周支出总额持续上升；住房始终是最大项且增幅最大',
          '正文引用具体金额支撑每个比较，数字、货币符号与表格完全一致，不自行推算新数值',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '正文分两段，各聚焦一个比较重点（如"上涨的类别"与"下降或停滞的类别"），不把五类挤进一段',
          '比较关系用 while、by contrast、similarly 等衔接，指代清晰（this figure、the latter）',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '上升/下降的表达有变化（rise、grow、climb、fall、drop），不反复使用同一个动词',
          '趋势修饰搭配正确：a steady rise in、the largest share of weekly spending',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '比较结构准确：higher than、nearly doubled、the biggest increase of all categories',
          '时态与年份匹配：描述 2010-2020 的数据用过去时，引出表格内容用现在时',
        ],
      },
    ],
    outlineHints: [
      '第 1 段：一句改写题目 + 一句概述（总额 $350→$475 持续上升，住房与休闲变化最突出）',
      '第 2 段：持续上涨的类别（住房、食物、休闲），用 2010 与 2020 的金额对比',
      '第 3 段：下降或停滞的类别（交通 $60→$45），可点出住房十年间几乎翻倍、涨幅居首',
      '检查：所有数字都来自表格，没有编造或平均推算的数据',
    ],
  },
  {
    id: 'en-w-t1a-002',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-academic',
    topic: 'education',
    difficulty: 3,
    estimatedMinutes: 20,
    tags: ['education', 'data-table'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'International Students at Aldervale University',
    prompt:
      'The table below shows the number of international students from five world regions who enrolled at Aldervale University in 2015, 2019 and 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    promptZh:
      '下表显示了 2015 年、2019 年和 2023 年来自世界五个地区的国际学生在奥尔德维尔大学注册入学的人数。请选取并报告主要特征来概括这些信息，并在相关之处进行比较。请至少写 150 词。',
    visualData: {
      kind: 'table',
      markdown: `| Region of origin | 2015 | 2019 | 2023 |
| --- | --- | --- | --- |
| East Asia | 1,240 | 1,860 | 2,540 |
| South Asia | 640 | 980 | 1,720 |
| Middle East and North Africa | 410 | 520 | 760 |
| Europe | 380 | 450 | 610 |
| The Americas | 290 | 310 | 340 |`,
    },
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '概述段点明两条主线：所有地区入学人数均上升；East Asia 规模最大、South Asia 增长最快',
          '正文用具体人数、增量或倍数支撑比较（如 South Asia 增至近三倍），不逐行罗列表格',
          '对规模小、变化小的地区（如 The Americas）一笔带过，体现"选取主要特征"的能力',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '按"规模大增速快 / 规模小增速慢"分组写两段，段落推进逻辑读者能跟上',
          '衔接手段自然分布在句中，不是每句开头都放连接词',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '同义替换到位：enrol → take up places / register；increase → grow / rise',
          '数量表达准确：nearly three times as many... as、almost doubled',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '倍数与分数结构正确（twice as many as、roughly half the figure for...）',
          '复杂句中有从句（while、which）且主谓一致无误',
        ],
      },
    ],
    outlineHints: [
      '开头：改写题目 + 概述（入学人数全面上升，两个亚洲地区占主导）',
      '主体段 1：East Asia 与 South Asia（规模大、增长快），用 2015 与 2023 的数字对比',
      '主体段 2：其余三个地区（规模较小、增长平稳），点出 The Americas 几乎没有变化',
      '可用一句段间对比收束：亚洲地区贡献了大部分新增人数',
    ],
  },
  {
    id: 'en-w-t1a-003',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-academic',
    topic: 'transport',
    difficulty: 4,
    estimatedMinutes: 20,
    tags: ['transport', 'data-table'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'How Riverside City Commutes',
    prompt:
      'The table below gives information about the main means of transport used by commuters in the city of Riverside in 2004, 2014 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    promptZh:
      '下表提供了 2004 年、2014 年和 2024 年里弗赛德市通勤者主要使用的交通方式信息。请选取并报告主要特征来概括这些信息，并在相关之处进行比较。请至少写 150 词。',
    visualData: {
      kind: 'table',
      markdown: `| Main means of transport | 2004 | 2014 | 2024 |
| --- | --- | --- | --- |
| Private car | 52% | 44% | 35% |
| Bus | 18% | 22% | 24% |
| Tram | 8% | 14% | 18% |
| Bicycle | 11% | 12% | 16% |
| On foot | 11% | 8% | 7% |
| **Total** | **100%** | **100%** | **100%** |`,
    },
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '概述段指出核心转变：私家车占比大幅下降，公交、有轨电车与骑行占比上升',
          '所有比较都基于百分比，不把"占比下降"误写成"人数减少"',
          '主要特征均有数据支撑，占比一直最低的步行可简略处理',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '趋势相反的两类信息（下降 vs 上升）分段呈现，用转折衔接标明对比',
          '概述放在开头或结尾，正文不再整段重复概述内容',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '占比表达多样：the share / proportion of commuters、accounted for',
          '动词搭配准确：declined steadily、overtook walking、remained the least common choice',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '百分比比较结构正确：a lower percentage... than、dropped from 52% to 35%',
          '跨度 20 年的数据可用过去时与现在完成时交替（has fallen by...），全篇保持一致',
        ],
      },
    ],
    outlineHints: [
      '开头：改写题目 + 概述（从"以私家车为主"转向更均衡、更绿色的出行结构）',
      '主体段 1：下降项——私家车 52%→35%，步行 11%→7%',
      '主体段 2：上升项——公交 24%、有轨电车 18%（增至两倍多）、骑行 16%；可指出公交 2024 年稳居第二',
      '收尾用一句对比 2004 与 2024 的整体格局，不再引入新数据',
    ],
  },
  {
    id: 'en-w-t1a-004',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-academic',
    topic: 'environment',
    difficulty: 4,
    estimatedMinutes: 20,
    tags: ['environment', 'data-table'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Electricity Sources in Norland',
    prompt:
      'The table below shows the sources used to generate electricity in the country of Norland in 2005, 2015 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    promptZh:
      '下表显示了诺兰国 2005 年、2015 年和 2025 年用于发电的各类能源。请选取并报告主要特征来概括这些信息，并在相关之处进行比较。请至少写 150 词。',
    visualData: {
      kind: 'table',
      markdown: `| Source of electricity | 2005 | 2015 | 2025 |
| --- | --- | --- | --- |
| Coal | 48% | 30% | 12% |
| Natural gas | 24% | 28% | 22% |
| Nuclear | 16% | 18% | 20% |
| Wind | 4% | 14% | 28% |
| Solar | 1% | 4% | 11% |
| Hydro | 7% | 6% | 7% |
| **Total** | **100%** | **100%** | **100%** |`,
    },
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '概述段点出能源结构转型：煤从近半降到 12%，风能与太阳能快速上升，2025 年风能成为第一大来源',
          '对变化方向不同的能源分组描述（化石燃料下降 / 清洁能源上升），不逐行平铺',
          '天然气"先升后微降"的波动曲线没有被简化成单调趋势',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '按"下降的传统能源 / 上升的新能源"组织两段，段落界线清晰',
          '用 whereas、meanwhile、in contrast 区分相反或不同步的趋势',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '能源话题词汇准确：generate electricity、fossil fuels、renewable sources',
          '程度副词与趋势搭配得当：fell dramatically、grew rapidly、remained stable',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '被动语态使用得当（electricity was generated mainly from coal）',
          '三个时间点的时态与年份一一对应，2025 年的数据可用过去时或现在完成时并保持统一',
        ],
      },
    ],
    outlineHints: [
      '开头：改写题目；概述"从化石燃料向可再生能源转型，风能后来居上"',
      '主体段 1：煤 48%→12% 的陡降；天然气 24%→28%→22% 先升后降；水电基本持平（7%）',
      '主体段 2：风 4%→28% 增至七倍并于 2025 年登顶；太阳能 1%→11%；核电小幅升至 20%',
      '结尾不添加个人建议或评价——题目只要求描述数据',
    ],
  },
  {
    id: 'en-w-t1a-005',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-academic',
    topic: 'work',
    difficulty: 3,
    estimatedMinutes: 20,
    tags: ['work', 'data-table'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Employment by Sector in Four Countries',
    prompt:
      'The table below shows the percentage of the working population employed in agriculture, industry and services in four countries in 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    promptZh:
      '下表显示了 2024 年四个国家从事农业、工业和服务业的劳动人口比例。请选取并报告主要特征来概括这些信息，并在相关之处进行比较。请至少写 150 词。',
    visualData: {
      kind: 'table',
      markdown: `| Country | Agriculture | Industry | Services |
| --- | --- | --- | --- |
| Harvania | 6% | 32% | 62% |
| Brelt | 2% | 26% | 72% |
| Ostmark | 18% | 44% | 38% |
| Sandor | 31% | 24% | 45% |`,
    },
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '概述段提炼分组规律：Brelt 与 Harvania 以服务业为主，Sandor 农业占比突出，Ostmark 是唯一以工业为主的国家',
          '比较跨国家横向展开（同一部门在不同国家的差异），而不是逐国罗列三行数字',
          '突出极端值：Sandor 农业就业 31% 为最高，Brelt 仅 2% 为最低',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '按部门（服务业 / 工业与农业）组织两到三段，避免把十二个数字全部塞进一段',
          '国家名多次出现时用 these countries、the latter 等指代，避免行文重复',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '就业表达准确：be employed in、the workforce、jobs were concentrated in',
          '比较词汇有变化：by far the largest、roughly twice the proportion、a distant second',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '倍数与分数表达正确（twice as high as、nearly one in three workers）',
          '同一国家多个数据合并进从句时句式不错乱（..., where services employed 72% of workers）',
        ],
      },
    ],
    outlineHints: [
      '开头：改写题目；概述——服务业在多数国家占主导，但各国结构差异明显',
      '主体段 1：服务业对比（Brelt 72% 最高 → Ostmark 38% 最低）',
      '主体段 2：工业与农业（Ostmark 工业 44% 居首；Sandor 农业 31% 远高于 Brelt 的 2%）',
      '检查：表中只有百分比，全文不要出现绝对人数的推断',
    ],
  },
  {
    id: 'en-w-t1a-006',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-academic',
    topic: 'travel',
    difficulty: 3,
    estimatedMinutes: 20,
    tags: ['travel', 'trend-data'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Museum Visitor Numbers, 2012-2023',
    prompt:
      'The text below describes the number of people who visited a museum called the Coastal Heritage Museum in each year from 2012 to 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    promptZh:
      '下面的文字描述了 2012 年至 2023 年间"海岸遗产博物馆"每年的参观人数。请选取并报告主要特征来概括这些信息，并在相关之处进行比较。请至少写 150 词。',
    visualData: {
      kind: 'data-description',
      markdown: `The Coastal Heritage Museum records its visitor numbers every year.

In 2012 the museum welcomed 190,000 visitors, and this figure grew steadily to 310,000 by 2016. The museum then closed for six months in 2017 for rebuilding work, and attendance fell to 150,000 that year. Numbers recovered to 285,000 in 2019, but travel restrictions in 2020 reduced attendance to 95,000, the lowest figure in the museum's records.

Attendance then rose every year: 160,000 in 2021, 240,000 in 2022 and a record 330,000 in 2023.`,
    },
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '概述段抓住主线：十二年间总体上升，但经历 2017 闭馆与 2020 限制两次大跌，2023 年创新高',
          '正文把长期上升趋势与两次下跌分开呈现，转折年份都点到',
          '所有数字、年份与文字材料一致，不遗漏"人次"这一数量含义',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '按时间顺序组织，2017、2020 两个转折用衔接词明确标示',
          '不写"流水账"：把逐年缓升的年份合并描述，而不是一年一句',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '波动表达准确：fell to、recovered to、reached a record high',
          '避免反复使用 visitors：用 attendance、the figure、visitor numbers 交替',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '时间状语衔接自然（following the reopening、after the closure of six months）',
          '数量主语与谓语一致：the number of visitors was... / visitor numbers were...',
        ],
      },
    ],
    outlineHints: [
      '开头：改写题目 + 概述（总体上升，两次明显下滑后均恢复）',
      '主体段 1：2012-2019——19 万稳步升至 31 万，2017 闭馆跌至 15 万，2019 恢复到 28.5 万',
      '主体段 2：2020 跌至 9.5 万最低点，此后逐年回升，2023 年达 33 万的历史新高',
      '收尾一句对比首尾：2023 年约为 2012 年的 1.7 倍',
    ],
  },
  {
    id: 'en-w-t1a-007',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-academic',
    topic: 'media',
    difficulty: 4,
    estimatedMinutes: 20,
    tags: ['media', 'trend-data'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Book Sales at Pagefield Books',
    prompt:
      'The following text gives information about the number of printed books, e-books and audiobooks sold by one national bookstore chain, Pagefield Books, from 2010 to 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    promptZh:
      '以下文字提供了全国性连锁书店"佩吉菲尔德书店"2010 年至 2024 年间纸质书、电子书与有声书的销量信息。请选取并报告主要特征来概括这些信息，并在相关之处进行比较。请至少写 150 词。',
    visualData: {
      kind: 'data-description',
      markdown: `In 2010, Pagefield Books sold 4.2 million printed books but only 0.6 million e-books.

Printed book sales then fell in almost every year, dropping to 1.1 million by 2024. E-book sales grew rapidly over the same period, and the two formats recorded equal sales of 2.4 million each in 2016. From 2017 onwards, e-books outsold printed copies every year, reaching 3.8 million in 2024.

The chain began recording audiobook sales separately in 2018, when they stood at 0.3 million; by 2024 this figure had risen to 1.5 million.`,
    },
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '概述段点出交叉点这一关键特征：2016 年电子书追平纸质书，此后反超并保持领先',
          '三种载体都覆盖，但详略分明：纸质书与电子书为主线，有声书为次要信息',
          '数据引用准确（单位 million），不编造材料中没有给出的年份或数字',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '按"下降的纸质书 / 上升的电子书与有声书"切分主体段，2016 年交叉点作为两段之间的枢纽',
          '衔接服务于对比逻辑：over the same period、by contrast、meanwhile',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '销售表达地道：sales fell、outsold printed copies、recorded equal sales',
          '三种格式名称前后一致（printed books、e-books、audiobooks），不中途换说法',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          'by 2024 / by the end of the period 与过去完成时搭配使用正确（had risen to 1.5 million）',
          '数量单位表达一致：1.1 million 而非 1.1 millions',
        ],
      },
    ],
    outlineHints: [
      '开头：改写题目；概述——纸质书持续下滑，电子书后来居上，有声书从 2018 年起稳步上升',
      '主体段 1：纸质书 4.2m → 1.1m 的长期下降',
      '主体段 2：电子书 0.6m → 3.8m；2016 年两种格式各售 2.4m 打平，此后电子书年年领先',
      '主体段末尾带一句有声书：2018 年 0.3m → 2024 年 1.5m',
      '收尾可对比终点：2024 年电子书销量超过纸质书的三倍',
    ],
  },
  {
    id: 'en-w-t1a-008',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-academic',
    topic: 'urban',
    difficulty: 4,
    estimatedMinutes: 20,
    tags: ['urban', 'trend-data'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Recycling Rates in Greenfield',
    prompt:
      'The text below describes the proportion of household waste that was recycled in the city of Greenfield in 2008 and 2023, for four different materials. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    promptZh:
      '下面的文字描述了 2008 年和 2023 年格林菲尔德市四类家庭垃圾的回收比例。请选取并报告主要特征来概括这些信息，并在相关之处进行比较。请至少写 150 词。',
    visualData: {
      kind: 'data-description',
      markdown: `Greenfield City Council publishes recycling figures for four types of household waste.

In 2008, paper had the highest recycling rate, at 32%, followed by organic waste at 22%. Glass was recycled at a much lower rate of 12%, and plastic lower still, at only 5%.

By 2023 the picture had changed considerably. The recycling rate for paper had more than doubled, reaching 71%, while organic waste had risen to 64%, the second-highest rate of the four. Glass recorded one of the largest improvements, climbing from 12% to 58%. Plastic remained the least recycled material in both years, although its rate did rise from 5% to 29%.`,
    },
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '概述段强调两点：四类材料回收率全部上升；纸张始终最高、塑料始终最低',
          '两年对比有重点——玻璃升幅最大（46 个百分点）应成为亮点，而非四类平均用力',
          '明确这是两个时间点的对比，不写成逐年变化过程',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '结构二选一并坚持到底：按年份对照（2008 一段 / 2023 一段）或按材料分组',
          '对比衔接到位：by 2023、in contrast、whereas',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '比率表达准确：a recycling rate of 32%、climbing from... to...、the least recycled material',
          '倍数与差值表达正确：more than doubled、a 46-percentage-point rise',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '"到 2023 年为止"的变化用过去完成时（had risen to 64%），全篇使用一致',
          '百分比比较级写法正确：higher than in 2008、remained the lowest of the four',
        ],
      },
    ],
    outlineHints: [
      '开头：改写题目；概述——回收率全面提升，纸张领先、塑料垫底',
      '主体段 1：2008 年格局——纸 32% 最高，玻璃 12%、塑料 5% 明显落后',
      '主体段 2：2023 年格局与增幅——纸 71%（翻倍以上）、有机垃圾 64%、玻璃 58%（升幅最大）、塑料 29%',
      '可补一句差距变化：纸与塑料的差距从 27 个百分点扩大到 42 个百分点',
    ],
  },
]
