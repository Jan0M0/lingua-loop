// IELTS Writing Task 2 —— 原创议论文任务（12 大主题，指令类型轮换）
// 作者：Lingua Loop 内容组（IELTS 写作）
import type { WritingExercise } from '../../../types/content'

export const items: WritingExercise[] = [
  {
    id: 'en-w-t2-001',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'education',
    difficulty: 3,
    estimatedMinutes: 30,
    tags: ['education', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Homework for Young Children',
    prompt:
      'Some educationalists believe that children in the first years of primary school should not be given any homework. To what extent do you agree or disagree with this view? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '一些教育工作者认为，小学最初几年不应给孩子布置任何家庭作业。你在多大程度上同意或不同意这一观点？请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '引言明确回应"多大程度同意"：亮出立场（完全同意 / 部分同意），并贯穿全文不摇摆',
          '两个主体段各围绕一个理由展开，配解释或例子，而不是只罗列观点不展开',
          '若写让步段，说明了让步理由为何不改变总体立场',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '四段功能清晰：引言—论证一—论证二—结论，一段只做一件事',
          '论证内部层层推进：because、this means that、in other words 用在关键处',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '教育话题词汇准确：young learners、after-school activities、consolidate what they learn in class',
          '观点表达有变化：I believe、in my view、it seems clear that，不每句都是 I think',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '文中含若干复杂句：条件句、定语从句、让步从句（although）各至少出现一处且无误',
          '时态分工清楚：一般论述用现在时，举个人经历时切换到过去时',
        ],
      },
    ],
    outlineHints: [
      '引言：一句背景（低龄教育的争论）+ 改写题目观点 + 明确立场',
      '主体段 1：若倾向同意，从低龄儿童注意力与游戏学习的关系切入解释',
      '主体段 2：从家庭时间与教育公平切入（家长辅导能力差异带来的差距）',
      '让步选择：可承认少量亲子阅读类任务无害，但正式作业应推迟',
      '结论：换一种说法重申立场，一句总结收束，不引入新论点',
    ],
  },
  {
    id: 'en-w-t2-002',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'technology',
    difficulty: 3,
    estimatedMinutes: 30,
    tags: ['technology', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Artificial Intelligence and Jobs',
    prompt:
      'Some people believe that new developments in artificial intelligence will mainly benefit workers, while others fear that these technologies will destroy far more jobs than they create. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '有人认为人工智能的新发展将主要让劳动者受益；也有人担心这些技术摧毁的岗位将远多于其创造的岗位。请讨论这两种观点并给出你自己的看法。请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '两个观点各占一段、得到实质讨论（有论据支撑），而不是一句带过就谈己见',
          '自己的观点清晰呈现，并在讨论双方之后自然引出，与前文论述不矛盾',
          '例证取自可知领域（自动化客服、医疗影像、翻译等），不空泛断言',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '观点段之间用清晰的信号衔接（While some argue...、Others point to...），读者随时知道在读谁的观点',
          '自己的观点段与前文有呼应（Having considered both sides...）',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '科技与就业词汇准确：automation、replace routine tasks、job displacement、retraining',
          '避免反复用 people 指劳动者：employees、the workforce、workers 交替使用',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '转述他人观点的句式多样：It is argued that...、Critics claim...、According to some, ...',
          '让步结构正确：although + 从句、despite + 名词短语各至少用对一处',
        ],
      },
    ],
    outlineHints: [
      '引言：背景（AI 正快速进入工作场所）+ 概括两种观点 + 预告将讨论并给出己见',
      '主体段 1：受益方论据——提高效率、创造新岗位、把危险或重复的工作交给机器',
      '主体段 2：担忧方论据——重复性岗位被替代、转岗速度跟不上、收益向少数人集中',
      '主体段 3：己见——如"短期阵痛、长期净受益，前提是社会提供再培训"',
      '结论：各用一句概括双方 + 重申自己的立场',
    ],
  },
  {
    id: 'en-w-t2-003',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'environment',
    difficulty: 3,
    estimatedMinutes: 30,
    tags: ['environment', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Plastic Waste in Rivers and on Beaches',
    prompt:
      'In many countries, plastic waste can be found along rivers and on beaches, even in areas far from any large city. What are the main causes of this problem, and what measures could governments and individuals take to reduce it? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '在许多国家，河流沿岸和海滩上都能见到塑料垃圾，即使在没有大城市的地区也是如此。造成这一问题的主要原因是什么？政府和个人可以采取哪些措施来减少塑料垃圾？请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '两问都充分回答：原因与对策的篇幅大体相当，不偏废任何一问',
          '原因解释到机制层面（垃圾如何产生并到达河流与海滩），不停留在"人们乱扔垃圾"',
          '对策分层面给出：政府（法规、回收体系）与个人（消费选择），且与原因呼应',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '原因段的层次标记清楚（firstly / secondly 或更自然的方式均可）',
          '原因与对策之间用 therefore、as a result 呼应，使全文成为整体而非两篇短文',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '环保词汇准确：single-use plastics、waste management、litter、disposable packaging',
          '因果表达多样：stem from、be driven by、as a consequence of',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '对策句式正确使用情态与条件：could introduce、if consumers refused plastic bags, ...',
          '被动与主动的因果句都写对了：is caused by / results from',
        ],
      },
    ],
    outlineHints: [
      '引言：现象描述（远离城市也有塑料垃圾）+ 表明文章将分析原因并提出对策',
      '主体段 1：原因一——一次性包装泛滥、回收率低、随手丢弃',
      '主体段 2：原因二——河流把内陆垃圾输送到下游、旅游业在偏远海岸留下垃圾（解释"远离城市也有"）',
      '主体段 3：对策——政府限塑立法与押金回收制；个人少用一次性用品、参与清理活动',
      '结论：一两句总结，强调双层面同时行动',
    ],
  },
  {
    id: 'en-w-t2-004',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'work',
    difficulty: 4,
    estimatedMinutes: 30,
    tags: ['work', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Changing Careers',
    prompt:
      'In the past, most people stayed in the same profession for their whole working lives. Today, many people change careers two or three times before they retire. Why is this happening? Do you think this is a positive development? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '过去，大多数人整个职业生涯都从事同一种职业。如今，许多人在退休前会换两三次职业。为什么会出现这种现象？你认为这是积极的发展吗？请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '第一问给出两个以上可信解释（技术变革、就业市场、价值观变化等）',
          '第二问给出明确判断（整体积极 / 消极 / 有条件的积极），不含糊骑墙',
          '两问先后有序：先解释原因、再作评价，不把评价混进原因段',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '两问之间有明显过渡（Having looked at the causes...、As for whether this is positive...）',
          '每段首句点题，段落内部不引入新的问题',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '工作话题词汇准确：job security、transferable skills、retrain、career paths',
          '评价语言有分寸：largely positive、not without drawbacks、a double-edged development',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '时间对比句式正确：现在完成时（The job market has changed）与一般过去时（In the past, most people stayed...）各得其所',
          '评价句避免绝对化：用 tends to、can be argued that 等留有分寸的表达',
        ],
      },
    ],
    outlineHints: [
      '引言：对比过去与现在 + 点出文章将回答的两个问题',
      '主体段 1：原因一——技术淘汰旧岗位、新行业不断涌现',
      '主体段 2：原因二——就业观念变化（重视兴趣与灵活）与终身雇佣减少',
      '主体段 3：表态段——权衡利弊（技能多元、个人成长 vs 收入不稳、资历难积累）后给出判断',
      '结论：用一句话分别回应"为什么"与"是否积极"两问',
    ],
  },
  {
    id: 'en-w-t2-005',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'society',
    difficulty: 4,
    estimatedMinutes: 30,
    tags: ['society', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'The Wealthy and Charity',
    prompt:
      'Some people believe that the wealthiest members of society have a moral duty to give away a large part of their fortune to help others. To what extent do you agree or disagree with this opinion? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '有人认为，社会中最富有的成员负有一种道义责任，应捐出其财富的很大一部分来帮助他人。你在多大程度上同意或不同意这一观点？请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '立场清晰且前后一致（如"有道义责任但不应强制"），全文围绕该立场展开',
          '论证区分"道德责任"与"法律义务"两个概念，不偷换',
          '例子具体可信（捐赠基金、公益项目等），不泛泛断言"很多富人不愿捐"',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '让步段的位置服务于立场：先让步再反驳，或先立论再让步收束，结构意图明确',
          '抽象讨论中指代清晰：such a duty、this argument、these obligations',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '公益与责任词汇准确：philanthropy、give back to society、a moral obligation versus a legal duty',
          '避免反复用 rich：the wealthy、the most affluent、billionaires 交替',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '情态动词区分道义与强制：should / ought to（道义）与 must be forced to（强制）用得准确',
          '抽象名词作主语的句子结构正确：Such generosity can address...、This duty rests on...',
        ],
      },
    ],
    outlineHints: [
      '引言：贫富差距背景 + 改写观点 + 亮明立场',
      '主体段 1：支持方理由——财富的积累依赖社会条件；巨额财富的边际效用低',
      '主体段 2：反方或限制条件——财产权应受保护；慈善效率存疑；制度（税收）比道德呼吁更可靠',
      '主体段 3（可选）：折中立场——鼓励捐赠 + 用基金会透明化等制度设计引导',
      '结论：重申立场，并直接回应题目中 "moral duty" 的措辞',
    ],
  },
  {
    id: 'en-w-t2-006',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'culture',
    difficulty: 4,
    estimatedMinutes: 30,
    tags: ['culture', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Tourism and Local Traditions',
    prompt:
      'In a number of countries, traditional ceremonies, dances and crafts are now performed mainly for visitors, and local traditions are changing as a result. Do you think the advantages of this development for local cultures outweigh the disadvantages? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '在一些国家，传统仪式、舞蹈与手工艺如今主要为游客而表演，当地传统也因此发生变化。你认为这一发展给当地文化带来的利是否大于弊？请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '直接回答"利是否大于弊"，给出明确裁决，不能只罗列利弊不下结论',
          '利与弊都有实质展开（收入与传承机会 vs 商业化与失真），而非一句话带过',
          '结论与正文论证方向一致，结尾不突然转向',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '利弊结构二选一并坚持：利一段、弊一段，或逐点对照，不中途换框架',
          '权衡语言服务于裁决：however、this benefit comes at a cost、on balance outweigh',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '文化词汇准确：cultural heritage、commercialise、craftsmanship、cultural identity',
          '权衡表达丰富：preserve、dilute、generate income for communities',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '描述表演与制品时被动语态使用得当（are performed for tourists、are handmade）',
          '利弊比较句写法正确：more beneficial than、less damaging than it might appear',
        ],
      },
    ],
    outlineHints: [
      '引言：现象（传统活动日益面向游客）+ 明确表态（利大于弊或弊大于利）',
      '主体段 1：利——旅游收入让年轻人愿意留乡学艺，传统获得资金与可见度',
      '主体段 2：弊——仪式脱离原有意义、为迎合游客而改编甚至同质化',
      '主体段 3：权衡段——结果取决于收入是否回流社区、传承人是否掌握主导权',
      '结论：重申判断 + 一句条件性建议（如社区参与分成与内容把关）',
    ],
  },
  {
    id: 'en-w-t2-007',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'government',
    difficulty: 4,
    estimatedMinutes: 30,
    tags: ['government', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Should Public Transport Be Free?',
    prompt:
      'Some people think that public transport should be free for everyone, with governments covering all the costs through taxation. Others believe that passengers should pay at least part of the cost. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '有人认为公共交通应对所有人免费，全部成本由政府通过税收承担；也有人认为乘客至少应当承担部分费用。请讨论这两种观点并给出你自己的看法。请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '双方论点都有实质展开：免费方（公平、减排、治堵）对付费方（财政可持续、服务质量）',
          '己见明确且可辩护，最好提出权衡条件（如高峰收费、低收入者减免）',
          '回应了"税收承担成本"这一细节，体现出对资金来源的考虑',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '讨论双方时段落归属清楚，读者不需要猜测当前在讨论谁的观点',
          '己见段与前文自然衔接：Having considered both sides, ...',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '政策词汇准确：fare-free transport、subsidies、congestion、operating costs',
          '程度与频率表达支撑论证：far more passengers、significantly higher costs',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '条件句使用正确：If fares were abolished, ...（虚拟语气或真实条件均可，但形式要对）',
          '主动与被动选择得当：costs would be covered by taxation / taxpayers would cover',
        ],
      },
    ],
    outlineHints: [
      '引言：交通政策之争的背景 + 概括两种观点 + 预告己见',
      '主体段 1：免费方论据——出行公平、私家车减少带来的环保与治堵收益',
      '主体段 2：付费方论据——财政压力大、维护扩容需要稳定资金、完全免费可能被滥用',
      '主体段 3：己见——折中方案（低票价 / 分时段免费 / 定向减免）并说明为何更可行',
      '结论：一句总括两种极端立场 + 重申折中立场',
    ],
  },
  {
    id: 'en-w-t2-008',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'health',
    difficulty: 4,
    estimatedMinutes: 30,
    tags: ['health', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Making Unhealthy Food More Expensive',
    prompt:
      'Some people believe that making unhealthy food and drinks more expensive is the most effective way for governments to improve public health. To what extent do you agree or disagree with this opinion? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '有人认为，提高不健康食品和饮料的价格是政府改善公众健康最有效的方式。你在多大程度上同意或不同意这一观点？请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '直接回应题目中的最高级措辞"最有效"：要么维护它，要么指出更有效或必须并行的措施',
          '若不同意，替代方案具体（营养标签、饮食教育、广告限制）并解释为何更有效',
          '可引用熟悉的政策方向（如对含糖饮料征税），但不编造精确数字',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '让步与反驳结构清楚：先承认涨价有一定作用，再指出其局限',
          '多个替代措施之间有排序：in addition、more importantly',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '健康与政策词汇准确：sugary drinks、a tax on、obesity rates、deter consumption',
          '有效性表达有层次：helpful but insufficient、a more decisive factor',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '比较级与最高级使用准确：more effective than pricing alone、the single most effective measure',
          '因果句式多样：lead to、result in、encourage somebody to do something',
        ],
      },
    ],
    outlineHints: [
      '引言：公众健康压力的背景 + 改写观点 + 亮明立场（如"有用，但谈不上最有效"）',
      '主体段 1：让步——价格确实影响购买选择，尤其是对价格敏感的年轻消费者',
      '主体段 2：反驳——高糖高脂食品需求刚性；企业可转嫁或缩量不减糖；消费者缺营养知识',
      '主体段 3：替代或并行措施——清晰标签、学校饮食教育、面向儿童的广告限制',
      '结论：定价是工具之一，"最有效"言过其实',
    ],
  },
  {
    id: 'en-w-t2-009',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'crime',
    difficulty: 4,
    estimatedMinutes: 30,
    tags: ['crime', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Young People and Minor Crime',
    prompt:
      'In many cities, the number of young people involved in minor crimes such as shoplifting and vandalism is rising. What are the causes of this trend, and what steps could be taken to reduce it? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '在许多城市，涉入商店偷窃、故意破坏等轻微犯罪的年轻人数量正在上升。造成这一趋势的原因是什么？可以采取哪些措施来减少它？请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '原因与对策两问都充分回答，且对策直接针对前文分析过的原因',
          '原因分析多层面（家庭、学校、同伴、经济机会），不做单一归因',
          '对策区分实施主体（学校、社区、警方、政府），不停留在"加强教育"一句话',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '原因段内部层次分明，对策段与原因一一呼应（问题—分析—应对的整体框架感）',
          '提出的措施之间有逻辑关系：预防、干预、事后帮扶各归其位',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '犯罪词汇准确且不煽情：minor offences、first-time offenders、community service、reoffend',
          '上升趋势表达多样：a growing number of、is on the rise、has been climbing',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '建议句式多样：could set up、one option is to、schools might introduce',
          '定语从句使用正确：young people who lack qualifications、areas where jobs are scarce',
        ],
      },
    ],
    outlineHints: [
      '引言：现象（轻微涉罪青年增多）+ 点明文章将先析因、后献策',
      '主体段 1：原因一——缺乏教育出路与就业机会（无所事事、经济压力）',
      '主体段 2：原因二——家庭监管薄弱与同伴压力的相互强化',
      '主体段 3：对策——青年活动中心与就业培训；社区警务与早期干预项目',
      '结论：一句收束（早期干预比重罚更有效）+ 一句展望',
    ],
  },
  {
    id: 'en-w-t2-010',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'media',
    difficulty: 5,
    estimatedMinutes: 30,
    tags: ['media', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Getting the News from Social Media',
    prompt:
      'More and more people now receive most of their news from social media platforms rather than from newspapers or television. Do you think the advantages of this change outweigh the disadvantages? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '如今越来越多的人主要通过社交媒体平台而非报纸或电视获取新闻。你认为这一变化的利是否大于弊？请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '对"利是否大于弊"给出明确裁决，不在结尾含糊其辞',
          '利弊均来自真实机制（速度与来源多元 vs 算法茧房、信息失真），不是空泛的"方便/不好"',
          '论证注意到利弊因人群而异等细微差别，并把它纳入结论的条件',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '利弊段之间用权衡型衔接：Admittedly...、Even so...、On balance...',
          '每段只承载一个论点，长论证不把两三个论点挤进一段',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '媒体词汇准确：algorithms、echo chambers、misinformation、breaking news、verify sources',
          '语域保持正式：用 unverified content、misinformation 等表达，不混入口语化说法',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '复杂句结构准确：嵌套从句、分词状语（Having spread rapidly, the story...）使用不多但正确',
          '复数主语与抽象主语的一致性无误：these platforms encourage、this trend reduces',
        ],
      },
    ],
    outlineHints: [
      '引言：描述变化 + 明确表态（利大于弊或弊大于利）',
      '主体段 1：利——即时获取、来源多元、普通人也能参与报道与评论',
      '主体段 2：弊——算法投喂造成偏见强化、缺乏核实、情绪化传播',
      '主体段 3：权衡段——弊更具结构性（侵蚀公共判断），故弊大于利（或论证相反）',
      '结论：重申裁决 + 一句对策性建议（如媒体素养教育）',
    ],
  },
  {
    id: 'en-w-t2-011',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'family',
    difficulty: 5,
    estimatedMinutes: 30,
    tags: ['family', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Choosing Smaller Families',
    prompt:
      'In many countries, people are choosing to have fewer children, or none at all, than in previous generations. Why is this happening? Do you think governments should try to encourage people to have more children? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '在许多国家，人们生育的孩子数量比上一代更少，甚至选择完全不生育。为什么会出现这种现象？你认为政府是否应当设法鼓励人们多生孩子？请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '第一问给出两个以上原因（经济压力、女性教育与职业、生活方式与观念）',
          '第二问立场明确，并界定"鼓励"的方式与边界（减轻负担的支持 vs 劝说式干预）',
          '注意到两问并不等价：解释了少生原因不等于支持政府干预，二者分开论证',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '两问之间用清晰的过渡句切分，段落归属不言自明',
          '己见论证与前文原因呼应（如"既然成本是主因，补贴是否有效"）',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '人口与家庭词汇准确：fertility rates、childcare costs、parental leave、work-life balance',
          '正式表达稳定：financial pressure 而非口语化的 money problems',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '因果与目的句式准确：due to、in order to、so that 各用对至少一处',
          '动名词与不定式作主语处理正确：Having children is...、To encourage families, the state could...',
        ],
      },
    ],
    outlineHints: [
      '引言：现象（生育率下降、少子化）+ 列出两个问题',
      '主体段 1：原因一——住房、教育与育儿的经济成本高企',
      '主体段 2：原因二——职业发展（尤其对女性）与个人生活方式的选择',
      '主体段 3：立场段——可主张"减轻负担型支持（托育、育儿假）可以，劝说式干预不宜"',
      '结论：分别用一句话回应"为什么"与"政府该不该鼓励"两问',
    ],
  },
  {
    id: 'en-w-t2-012',
    language: 'en',
    skill: 'writing',
    type: 'writing-task',
    variant: 'ielts-t2',
    topic: 'urban',
    difficulty: 5,
    estimatedMinutes: 30,
    tags: ['urban', 'essay'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Cars Out of the City Centre?',
    prompt:
      'Some city planners argue that private cars should be completely banned from city centres in order to reduce congestion and pollution. To what extent do you agree or disagree with this view? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    promptZh:
      '一些城市规划者认为，为了缓解拥堵和污染，应当全面禁止私家车进入市中心。你在多大程度上同意或不同意这一观点？请给出理由，并结合你自己的知识或经验举出相关例子。请至少写 250 词。',
    targetWords: [250, 290],
    suggestedMinutes: 30,
    checklist: [
      {
        dimension: 'Task Response',
        descriptors: [
          '回应措辞中的"完全禁止"这一绝对化表述：支持、反对或提出前提条件均可，但要说清',
          '论证同时覆盖目标（治堵减污）与代价（商户、通勤者、行动不便者的出行需求）',
          '可引用了解的无车区或拥堵收费的城市案例，但不编造精确数据',
        ],
      },
      {
        dimension: 'Coherence & Cohesion',
        descriptors: [
          '让步段或反驳段的位置安排合理，突出核心论点而非平均用力',
          '结尾回应引言中提出的立场或条件，形成首尾呼应',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '城市词汇准确：pedestrianised zones、congestion charges、public transport capacity、air quality',
          '程度与频率表达精确：in most cases、for short trips、largely ineffective unless...',
        ],
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        descriptors: [
          '条件句与被动搭配得当：could be banned、unless alternatives are provided',
          '长句内部标点正确，避免连续并列短句造成的单调',
        ],
      },
    ],
    outlineHints: [
      '引言：城市拥堵与空气污染背景 + 亮明立场（如"方向正确，但完全禁止需要前提"）',
      '主体段 1：支持方理由——减排、步行与骑行安全、无车街区商业活力案例',
      '主体段 2：担忧——公交承载力不足时的出行困境、商户货运、特殊人群需求',
      '主体段 3：条件化立场——分阶段实施、先扩公交、对必要车辆发许可',
      '结论：重申立场 + 一句落实建议',
    ],
  },
]
