// IELTS General Training Writing Task 1 —— 原创书信任务（投诉 / 请求 / 致歉 / 邀请）
// 作者：Lingua Loop 内容组（IELTS 写作）
import type { WritingExercise } from '../../../types/content'

export const items: WritingExercise[] = [
  {
    id: 'en-w-t1g-001',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-general',
    topic: 'shopping',
    difficulty: 2,
    estimatedMinutes: 20,
    tags: ['shopping', 'letter'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Complaint: A Faulty Laptop',
    prompt:
      'You recently bought a laptop from a large electronics store in your city, but after two weeks it has developed a serious fault. Write a letter to the store manager.\n\nIn your letter:\n- describe the laptop you bought and the fault it has developed\n- explain what happened when you contacted the shop\'s customer service desk\n- say what you would like the store to do to solve the problem\n\nWrite at least 150 words. You do not need to write any postal addresses.',
    promptZh:
      '你最近在本市一家大型电器商店购买了一台笔记本电脑，但两周后它出现了严重故障。请给商店经理写一封信。信中需：描述你所购的笔记本电脑以及它出现的故障；说明你联系该店客服台时的经过；提出你希望商店如何解决这一问题。请至少写 150 词。无需写信封地址。',
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '三个要点全部覆盖，每点至少两三句展开，而不是各写一句了事',
          '语气坚定但礼貌：不满有事实支撑，没有威胁、讽刺或过激措辞',
          '开头点明写信目的，结尾提出明确、合理的要求（维修、换新或退款）',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '每段对应一个要点，段落功能一目了然',
          '指代与衔接自然：this fault、the reply I received、as a result',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '投诉场景词汇准确：a serious fault、still under guarantee、a replacement or a full refund',
          '礼貌句式得体：I would be grateful if you could...、I look forward to your prompt reply',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '正式信函避免缩略与口语表达（写 do not 而非 don\'t）',
          '时态分工正确：购买与故障经过用过去时，提出要求用现在时',
        ],
      },
    ],
    outlineHints: [
      '开头：Dear Sir or Madam / Dear Manager + 一句自我说明（何时何地购买了什么）与来意',
      '第 2 段：故障细节——何时出现、具体表现（如频繁死机、电池续航骤降）、对学习或工作的影响',
      '第 3 段：客服经过——去了哪次、对方怎么说、为何答复不能令人满意',
      '第 4 段：提出要求（更换新机或全额退款）+ 保留购物凭证的说明 + 礼貌收尾（Yours faithfully）',
    ],
  },
  {
    id: 'en-w-t1g-002',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-general',
    topic: 'urban',
    difficulty: 3,
    estimatedMinutes: 20,
    tags: ['urban', 'letter'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Request: A Safer Crossing',
    prompt:
      'The road between your home and a local primary school is busy, and children cross it at rush hour every day. Write a letter to your local council to request a safer crossing.\n\nIn your letter:\n- describe the road and the specific dangers you have observed\n- explain who crosses the road and when the risk is greatest\n- suggest one or two measures the council could take, and say which you would prefer\n\nWrite at least 150 words. You do not need to write any postal addresses.',
    promptZh:
      '你家与本地一所小学之间的道路车流繁忙，孩子们每天高峰时段都要过这条马路。请给你所在的地方议会写一封信，请求设置更安全的过街设施。信中需：描述该道路及你观察到的具体危险；说明哪些人过马路、何时风险最大；建议议会可采取的一两项措施，并表明你更倾向于哪一项。请至少写 150 词。无需写信封地址。',
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '情境具体可信：写出是哪条路、危险如何体现，而不是笼统说"很危险"',
          '建议可操作（信号灯斑马线、减速带、限速），并明确表达个人倾向',
          '写给官方机构，语气正式，称呼与落款得体，结尾请求回应或行动',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '按"现状—影响—建议"推进，段与段之间因果衔接清楚',
          '两个建议之间用 first / alternatively 等标记，让倾向一目了然',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '正式请求句式准确：I am writing to request...、I would urge the council to consider...',
          '道路安全词汇准确：pedestrian crossing、zebra crossing、traffic lights、rush hour',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '正式语域贯穿全信：无缩略、无口语词，情态动词得体（could、would）',
          '时态分工正确：描述常态危险用一般现在时，回忆目击事件用过去时',
        ],
      },
    ],
    outlineHints: [
      '开头：自报身份（附近居民/学生家长）+ 来意（请求改善过街安全）',
      '第 2 段：道路现状与危险——车速快、没有人行横道、曾目击险情',
      '第 3 段：受影响人群（学童、接送家长、老人）与最危险时段（上学放学高峰）',
      '第 4 段：两个建议（如信号灯斑马线与减速带）+ 个人倾向与理由 + 期待回复（Yours faithfully）',
    ],
  },
  {
    id: 'en-w-t1g-003',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-general',
    topic: 'daily-life',
    difficulty: 3,
    estimatedMinutes: 20,
    tags: ['daily-life', 'letter'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Apology: A Damaged Bicycle',
    prompt:
      'Last week your neighbour kindly lent you her bicycle while her car was being repaired, and you accidentally damaged it. Write a letter to your neighbour.\n\nIn your letter:\n- apologise for the damage to the bicycle\n- explain exactly what happened and how serious the damage is\n- offer to pay for the repair or to replace the bicycle, and suggest a time to talk about the matter\n\nWrite at least 150 words. You do not need to write any postal addresses.',
    promptZh:
      '上周邻居好意把自行车借给你（当时她的车正在维修），你不小心把车弄坏了。请给邻居写一封信。信中需：为自行车受损道歉；如实说明事情经过与损坏程度；提出支付修理费或更换车辆，并建议一个方便商谈此事的时间。请至少写 150 词。无需写信封地址。',
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '道歉真诚且具体：明确承认责任，不为损坏找借口或归咎他人',
          '三个要点完整：道歉、经过与损坏程度、补救方案与商谈时间',
          '半正式语气拿捏得当：对方是熟识邻居，比写给朋友的信更有条理，但不生硬',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '叙事顺序清楚：何时借车、事故何时何地发生、损坏情况、如何补救',
          '补救部分用商量语气衔接：I would be happy to...、would it be convenient to...?',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '道歉表达自然有分寸：I am terribly sorry、it was entirely my fault、I fully understand',
          '损坏描述具体（the front wheel was bent、the gears stopped working），而不是笼统一词 damaged',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '叙事时态准确：借车与事故用过去时，描述现在的损坏状态用现在时',
          '提议句式多样且正确：I would be happy to pay for...、Shall we...?',
        ],
      },
    ],
    outlineHints: [
      '开头：Dear Mrs/Mr + 姓氏 + 直接点明来意（为借车期间的损坏郑重道歉）',
      '第 2 段：事故经过——时间、地点、发生了什么（如避让行人摔倒），损坏部位与程度',
      '第 3 段：补救方案——去车行维修并承担全部费用，或视情况换新；先向邻居致歉再提方案',
      '结尾：建议当面商量的时间（如周末）、再次致歉并感谢她的好意（Yours sincerely）',
    ],
  },
  {
    id: 'en-w-t1g-004',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t1-general',
    topic: 'culture',
    difficulty: 2,
    estimatedMinutes: 20,
    tags: ['culture', 'letter'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Invitation: A Local Festival',
    prompt:
      'A friend you studied with at university now lives in another country. A well-known festival will take place in your city in two months, and you would like your friend to come and stay with you for it. Write a letter to your friend.\n\nIn your letter:\n- explain when the festival takes place and what happens at it\n- give reasons why you think your friend would enjoy the event\n- describe some of the things you could do together during the visit\n\nWrite at least 150 words. You do not need to write any postal addresses.',
    promptZh:
      '一位大学同窗好友如今住在另一个国家。两个月后你的城市将举办一个著名的节庆活动，你希望朋友届时来做客并住在你家。请给这位朋友写一封信。信中需：说明节庆举办的时间与活动内容；给出你认为朋友会喜欢这个活动的理由；描述来访期间你们可以一起做的一些事情。请至少写 150 词。无需写信封地址。',
    targetWords: [150, 190],
    suggestedMinutes: 20,
    checklist: [
      {
        dimension: 'Task Achievement',
        descriptors: [
          '邀请要素齐全：节庆时间、活动内容、住在你家的安排都交代清楚',
          '三个要点均衡展开，节庆描写有具体细节（活动、食物、氛围），不空洞',
          '语气亲切自然（informal），读起来像写给真正的朋友，而不是官方通知',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '非正式衔接使用自然：Anyway、By the way、So，但不堆砌',
          '结尾给出明确的下一步（请对方告知能否成行、大致日期）',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '非正式信函用语地道：Hope you\'re well、It\'d be great if...、Can\'t wait to see you',
          '节庆词汇具体多样（parade、street food、fireworks、live music），避免通篇 great / nice',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '非正式语境可用缩略（I\'m、it\'s）与省略句（Hope this finds you well），与正式信区分开',
          '计划表达分级准确：will（已定）、could（可选）、was thinking of（设想）',
        ],
      },
    ],
    outlineHints: [
      '开头：一两句寒暄（好久不见、近况）+ 发出邀请：什么节庆、大约什么时候、来住我家',
      '第 2 段：节庆内容——持续几天、有什么活动、最值得看的环节',
      '第 3 段：朋友会喜欢的理由（喜欢热闹/美食/摄影等，结合你对他的了解）+ 顺带安排（接机、逛老城）',
      '结尾：请对方查查机票、告知能否成行，表达期待（Best wishes / Take care 落款）',
    ],
  },
]
