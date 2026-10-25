// 英语阅读理解（reading-mc）—— 原创说明文/议论文/报道体 6 篇（en-read-001 ~ en-read-006）
// 主题：education / technology / environment / work / urban / health
// 作者：Lingua Loop 内容组（英语阅读）
import type { ReadingExercise } from '../../../types/content'

export const items: ReadingExercise[] = [
  {
    id: 'en-read-001',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'education',
    difficulty: 2,
    cefr: 'B1',
    estimatedMinutes: 7,
    tags: ['education', 'main-idea'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Starting Languages Early',
    titleZh: '提早开始学外语',
    passage: `In many countries, children now begin learning a foreign language in primary school rather than waiting until secondary school. Supporters of this change point to several advantages. Young children are generally less afraid of making mistakes, so they speak more freely in class. They also seem to remember new words more easily than older learners, partly because they enjoy songs, games and simple stories that repeat the same language again and again.

However, early language learning is not without problems. Many primary schools do not have enough trained language teachers, so some classes are taught by teachers whose own language level is limited. In addition, primary school timetables are already full, and adding a new subject may reduce the time available for mathematics or reading in the mother tongue.

Most researchers agree on one point: the age at which learning starts matters less than the quality of teaching. A well-trained teacher, interesting materials and regular practice can produce excellent results at any age. For this reason, several governments now prefer to spend money on teacher training rather than simply starting lessons earlier.`,
    questions: [
      {
        id: 'en-read-001-q1',
        stem: 'What is the main idea of the passage?',
        options: [
          'Young children are always faster language learners than adults.',
          'The quality of teaching matters more for success than the age at which language learning starts.',
          'Primary schools should stop teaching foreign languages.',
          'Governments should reduce spending on primary schools.',
        ],
        answerIndex: 1,
        explanation:
          '第三段 "the age at which learning starts matters less than the quality of teaching" 直接给出全文主旨。A 过度绝对化，原文只说孩子 "seem to remember new words more easily"，并非"always faster"；C 与全文方向相反，文章讨论的是如何教好而非取消；D 曲解原意，政府恰恰 "prefer to spend money on teacher training"，是调整用途而非削减开支。',
        errorTags: ['main-idea'],
        questionType: 'main-idea',
      },
      {
        id: 'en-read-001-q2',
        stem: 'According to the first paragraph, why do young children speak more freely in class?',
        options: [
          'They are taught in smaller groups.',
          'They are generally less afraid of making mistakes.',
          'They use more interesting textbooks.',
          'Their parents practise with them at home.',
        ],
        answerIndex: 1,
        explanation:
          '首段原句 "less afraid of making mistakes, so they speak more freely in class" 构成因果。A 小班教学、C 教材、D 家长陪练在首段均未提及，属于无中生有。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
      {
        id: 'en-read-001-q3',
        stem: 'What can be inferred about the problems mentioned in the second paragraph?',
        options: [
          'They mainly concern teacher quality and crowded timetables.',
          'They are caused by children who lack interest.',
          'They have already been solved by governments.',
          'They relate to the cost of building new schools.',
        ],
        answerIndex: 0,
        explanation:
          '第二段列举 "do not have enough trained language teachers" 与 "timetables are already full"，归纳即师资与课时两类问题。B 原文没有把责任归于学生；C 时态不符，政府 "now prefer" 表明调整仍在进行；D 全段未提建校成本。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-001-q4',
        stem: "The phrase 'not without problems' (paragraph 2) is closest in meaning to ______.",
        options: [
          'completely free of difficulty',
          'a total disaster',
          'having some disadvantages',
          'creating legal difficulties',
        ],
        answerIndex: 2,
        explanation:
          '"not without problems" 是双重否定，等于 "having some (certain) problems/disadvantages"。A 与否定含义完全相反；B 程度夸大，下文只是师资和课时两类具体不足；D "legal" 无中生有，原文不涉及法律问题。',
        errorTags: ['paraphrase'],
        questionType: 'paraphrase',
      },
    ],
  },
  {
    id: 'en-read-002',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'technology',
    difficulty: 2,
    cefr: 'B1',
    estimatedMinutes: 7,
    tags: ['technology', 'inference'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'When Your Fridge Talks to You',
    titleZh: '当冰箱开口说话',
    passage: `Twenty years ago, few people imagined that a refrigerator could order milk, or that a lamp could be controlled from a phone. Today such devices are everywhere, part of what engineers call the 'Internet of Things' — everyday objects connected to the internet.

Supporters say smart devices save time and energy. A smart heating system, for example, can learn a family's daily routine and warm the house only when somebody is at home. Studies in several European cities suggest that such systems can cut heating bills by around ten per cent.

Critics, however, warn about two issues. The first is privacy: smart devices collect large amounts of information about our habits, and it is not always clear who can see this data. The second is waste. Smart devices often stop receiving software updates after only a few years, so users must throw them away and buy new ones, which adds to electronic waste.

For now, sales of smart devices continue to rise. Whether they make life genuinely better, or simply more complicated, remains an open question.`,
    questions: [
      {
        id: 'en-read-002-q1',
        stem: 'According to the passage, how can a smart heating system save energy?',
        options: [
          'It switches off the family\u2019s phones automatically.',
          'It warms the house only when somebody is at home.',
          'It produces electricity from sunlight.',
          'It is cheaper to install than ordinary heaters.',
        ],
        answerIndex: 1,
        explanation:
          '第二段 "warm the house only when somebody is at home" 是原句证据。A 关闭手机、C 太阳能发电、D 安装费用比较在原文中都没有出现，均为凭常识编造的干扰项。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
      {
        id: 'en-read-002-q2',
        stem: 'What is the main purpose of the third paragraph?',
        options: [
          'To advertise the latest smart devices.',
          'To explain how the Internet of Things works.',
          'To present two concerns raised by critics.',
          'To compare European and Asian heating bills.',
        ],
        answerIndex: 2,
        explanation:
          '第三段首句 "Critics, however, warn about two issues" 总领隐私（privacy）与电子垃圾（waste）两点，段意即呈现批评者的两大担忧。A 段内无推销语气；B 解释概念的是第一段；D 原文只提到欧洲的节能数据，没有洲际比较。',
        errorTags: ['main-idea'],
        questionType: 'main-idea',
      },
      {
        id: 'en-read-002-q3',
        stem: 'What can be inferred about smart devices and electronic waste?',
        options: [
          'Manufacturers usually repair old devices for free.',
          'Devices may become useless to users once updates stop.',
          'Electronic waste has fallen in European cities.',
          'Users are forbidden from keeping old devices.',
        ],
        answerIndex: 1,
        explanation:
          '"stop receiving software updates after only a few years, so users must throw them away and buy new ones"：既然用户"必须扔掉换新"，可推知停止更新后设备实际上不能再用。A 免费维修与"throw them away"矛盾；C 方向相反，原文说电子垃圾在增加（adds to electronic waste）；D "forbidden" 无中生有，用户是被现实所迫而非被禁止。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-002-q4',
        stem: "What is the writer's attitude towards smart devices?",
        options: [
          'Strongly promotional.',
          'Balanced, presenting both benefits and concerns.',
          'Entirely negative.',
          'Openly indifferent.',
        ],
        answerIndex: 1,
        explanation:
          '全文结构是 Supporters 的节能证据与 Critics 的两点担忧并陈，结尾 "remains an open question" 未下定论，属于平衡呈现。A 和 C 各只取文中一面；D 与作者详细展开正反论据的写法矛盾，漠不关心者不会逐点分析。',
        errorTags: ['writer-attitude'],
        questionType: 'attitude',
      },
    ],
  },
  {
    id: 'en-read-003',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'environment',
    difficulty: 2,
    cefr: 'B1',
    estimatedMinutes: 7,
    tags: ['environment', 'detail'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'A Second Life for Plastic Bottles',
    titleZh: '塑料瓶的第二生命',
    passage: `Every minute, roughly one million plastic bottles are sold around the world. In many countries fewer than half of these bottles are collected for recycling, and a large proportion ends up in rivers and oceans, where they can take hundreds of years to break down.

Governments have tried several solutions. Some, such as Ireland, have placed a small charge on single-use bags and bottles, which quickly reduced their use. Others, like Germany, operate deposit systems: customers pay a little extra when they buy a drink and get the money back when they return the bottle. Return rates in such systems often exceed ninety per cent.

Companies are also experimenting with new materials. One growing area is bottles made from plants, which decompose far faster than ordinary plastic. However, these materials remain expensive, and some scientists question whether growing crops for packaging is a wise use of farmland.

Most experts agree that no single measure is enough. Deposit systems, public education and better collection services, they argue, must work together if the tide of plastic waste is to be slowed.`,
    questions: [
      {
        id: 'en-read-003-q1',
        stem: 'How does the German deposit system work, according to the passage?',
        options: [
          'Customers get a discount on their next drink.',
          'Customers pay extra and receive the money back when they return the bottle.',
          'Shops collect empty bottles from homes every week.',
          'Drinks can only be bought in large multi-packs.',
        ],
        answerIndex: 1,
        explanation:
          '第二段 "customers pay a little extra when they buy a drink and get the money back when they return the bottle" 完整对应押金制的运作方式。A 折扣与返还押金是两种不同机制；C 上门回收原文未提；D 包装销售限制无中生有。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
      {
        id: 'en-read-003-q2',
        stem: 'What can be inferred about plant-based bottles?',
        options: [
          'They are cheaper to produce than ordinary plastic.',
          'Their production raises concerns about the use of farmland.',
          'They decompose more slowly than ordinary plastic.',
          'They have been banned in Germany.',
        ],
        answerIndex: 1,
        explanation:
          '第三段 "some scientists question whether growing crops for packaging is a wise use of farmland" 表明种植原料占用农田引发担忧。A 与 "these materials remain expensive" 矛盾；C 与 "decompose far faster" 矛盾；D 原文说德国实行押金制，并未禁售植物瓶。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-003-q3',
        stem: 'Which statement best expresses the main idea of the final paragraph?',
        options: [
          'Deposit systems have failed in most countries.',
          'A combination of measures is needed to reduce plastic waste.',
          'Public education is the only effective solution.',
          'Experts disagree about the dangers of plastic.',
        ],
        answerIndex: 1,
        explanation:
          '末段 "no single measure is enough ... must work together" 说明需要押金制、公众教育、回收服务多管齐下。A 与押金制 "return rates ... exceed ninety per cent" 的高成功率矛盾；C "only" 过于绝对，原文三项措施并列；D 曲解原意，段首是 "Most experts agree"。',
        errorTags: ['main-idea'],
        questionType: 'main-idea',
      },
      {
        id: 'en-read-003-q4',
        stem: "The phrase 'the tide of plastic waste' in the last paragraph is closest in meaning to ______.",
        options: [
          'the rising price of plastic materials',
          'the large and continuing flow of plastic rubbish',
          'the cleaning of beaches by volunteers',
          'the rules that govern recycling factories',
        ],
        answerIndex: 1,
        explanation:
          'tide（潮水）在此为比喻，指不断涌来、数量巨大的垃圾流，与首段 "every minute ... one million plastic bottles" 呼应；slowed（减缓）也只能搭配"流量"。A 是价格概念，与数量无关；C 志愿者清滩原文未提；D 是法规概念，与 waste flow 不符。',
        errorTags: ['paraphrase'],
        questionType: 'paraphrase',
      },
    ],
  },
  {
    id: 'en-read-004',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'work',
    difficulty: 3,
    cefr: 'B2',
    estimatedMinutes: 7,
    tags: ['work', 'inference'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'What the Four-Day Week Revealed',
    titleZh: '四天工作制揭示了什么',
    passage: `When a British organisation trialled a four-day working week in 2022, many managers predicted chaos. In fact, of the sixty-one companies that took part, fifty-six kept the shorter week after the trial ended.

The logic behind the scheme is simple: employees work one day less but are expected to produce the same results. To achieve this, companies cut unnecessary meetings, shortened email chains and gave staff clearer priorities. Many participants reported that they could concentrate better because they were less tired — a well-rested worker, supporters argue, wastes less time correcting avoidable mistakes.

The results were striking. Staff turnover fell by more than half, sick days dropped, and average revenue rose slightly during the trial period. Workers described spending the extra day on family, exercise or study rather than on housework alone, which may explain the improvement in reported mental health.

Critics, however, warn against simple conclusions. The companies that volunteered were mostly small firms in knowledge industries, where output is easy to measure. A hospital or a factory cannot simply close for a day, and trials in public services have produced mixed results. There is also a risk that a 'compressed' schedule hides the same workload behind fewer days, leaving employees more exhausted in the long run.

Still, the experiment has changed the conversation. Flexibility, once treated as a favour, is increasingly discussed as a matter of productivity.`,
    questions: [
      {
        id: 'en-read-004-q1',
        stem: 'What happened to most participating companies when the British trial ended?',
        options: [
          'They returned to a five-day week.',
          'They kept the four-day week.',
          'They reduced their employees\u2019 pay.',
          'They moved their offices abroad.',
        ],
        answerIndex: 1,
        explanation:
          '首段 "of the sixty-one companies that took part, fifty-six kept the shorter week after the trial ended"：56/61 即绝大多数保留了四天工作制。A 与数字相反；C 减薪、D 迁址均未提及。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
      {
        id: 'en-read-004-q2',
        stem: 'According to the passage, why did many workers perform better during the trial?',
        options: [
          'They received extra training courses.',
          'Fewer meetings and less tiredness improved their concentration.',
          'Managers checked their progress more often.',
          'They were allowed to work from home.',
        ],
        answerIndex: 1,
        explanation:
          '第二段 "cut unnecessary meetings, shortened email chains ... could concentrate better because they were less tired" 直接说明少开会加精力足带来更高专注度。A 额外培训、C 加强监督、D 居家办公原文均未提及。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-004-q3',
        stem: "How does the writer treat the critics\u2019 arguments in the fourth paragraph?",
        options: [
          'As outdated views that deserve no attention.',
          'As reasonable points about the limits of the evidence.',
          'As proof that the scheme has completely failed.',
          'As a reason to ban shorter weeks by law.',
        ],
        answerIndex: 1,
        explanation:
          '第四段以 "Critics, however, warn against simple conclusions" 引出样本偏小公司、公共部门结果不一、压缩工时或致疲惫等具体顾虑，作者客观转述、未加反驳，属"指出证据局限的合理观点"。A 作者并未贬低批评者；C 与第三段的积极数据和末段 "changed the conversation" 不符；D 未提立法禁止。',
        errorTags: ['writer-attitude'],
        questionType: 'attitude',
      },
      {
        id: 'en-read-004-q4',
        stem: 'Which heading best fits the third paragraph?',
        options: [
          'Why Small Firms Volunteer',
          'Measurable Gains for Companies and Staff',
          'The True Cost of Long Meetings',
          'A Permanent Change in Every Industry',
        ],
        answerIndex: 1,
        explanation:
          '第三段罗列 turnover 下降过半、病假减少、收入微升、心理健康改善，均为"可测量的收益"，且同时覆盖公司（revenue）与员工（sick days, mental health）。A 内容对应第四段（样本多为小公司）；C 只是第二段的细节；D 与第四段 "trials in public services have produced mixed results" 矛盾。',
        errorTags: ['paragraph-matching'],
        questionType: 'matching',
      },
    ],
  },
  {
    id: 'en-read-005',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'urban',
    difficulty: 3,
    cefr: 'B2',
    estimatedMinutes: 7,
    tags: ['urban', 'matching'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'The Fifteen-Minute City',
    titleZh: '十五分钟城市',
    passage: `Imagine reaching everything you need — school, doctor, shop, park — within a fifteen-minute walk or cycle from your front door. This is the idea of the 'fifteen-minute city', developed by Professor Carlos Moreno and adopted with enthusiasm in Paris and several other cities.

The proposal answers decades of urban planning built around the car. In many modern cities, homes, offices and services sit in separate zones, forcing residents into long daily journeys. Proximity planning, by contrast, spreads workplaces, schools and clinics evenly through residential areas, so that daily life happens close to home.

Supporters list several benefits: local shops gain customers, streets become safer because more people use them, and traffic, noise and air pollution fall. During the Covid-19 pandemic, cities that already had walkable neighbourhoods adapted to restrictions more easily, which strengthened the case further.

The idea also attracts criticism. Some urban economists argue that most well-paid jobs will stay concentrated in city centres whatever planners do, so shorter commutes may become a luxury for the rich rather than a benefit for all. Others point out that spreading services thinly may reduce quality: a small local clinic cannot offer what a large hospital does.

Moreno\u2019s answer is practical rather than ideological. The fifteen-minute city, he insists, is not a plan to trap people in their neighbourhoods, but a way to give them the choice of living, working and thriving without a car.`,
    questions: [
      {
        id: 'en-read-005-q1',
        stem: 'According to the passage, what forces many city residents into long daily journeys?',
        options: [
          'Cities lack car parks near residential areas.',
          'Homes, offices and services are placed in separate zones.',
          'Public transport tickets are too expensive.',
          'Cities have removed most cycle lanes.',
        ],
        answerIndex: 1,
        explanation:
          '第二段 "homes, offices and services sit in separate zones, forcing residents into long daily journeys" 点明功能分区是长途通勤的根源。A 停车位不足、C 票价、D 拆除自行车道原文均未提及。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
      {
        id: 'en-read-005-q2',
        stem: 'What can be inferred from the mention of the Covid-19 pandemic?',
        options: [
          'Walkable neighbourhoods coped with restrictions more easily.',
          'The pandemic ended car use in Paris.',
          'Most residents moved to the countryside.',
          'Local shops closed during lockdowns.',
        ],
        answerIndex: 0,
        explanation:
          '第三段 "cities that already had walkable neighbourhoods adapted to restrictions more easily, which strengthened the case" 表明步行友好型社区应对限制更从容，也强化了该理念的说服力。B "ended car use" 绝对化无据；C 迁居农村未提；D 与本段 "local shops gain customers" 的语境相反。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-005-q3',
        stem: 'Which statement matches the view of the urban economists in paragraph 4?',
        options: [
          'Careful planning can spread high-quality jobs across the whole city.',
          'Well-paid jobs will remain central, so short commutes may favour the wealthy.',
          'Small clinics generally perform better than large hospitals.',
          'Cars should be completely banned from city centres.',
        ],
        answerIndex: 1,
        explanation:
          '第四段 "most well-paid jobs will stay concentrated in city centres whatever planners do, so shorter commutes may become a luxury for the rich" 正是这些经济学家的观点。A 与他们的判断相反（"whatever planners do"）；C 是另一批评者的担忧，且原文本意是小诊所替代不了大医院；D 全面禁车原文未提。',
        errorTags: ['paragraph-matching'],
        questionType: 'matching',
      },
      {
        id: 'en-read-005-q4',
        stem: "In the final paragraph, Moreno\u2019s attitude towards the criticism is best described as ______.",
        options: [
          'dismissive, refusing to answer objections',
          'practical, clarifying what the concept actually aims to do',
          'apologetic, admitting the idea has failed',
          'uncertain, delaying decisions about the future',
        ],
        answerIndex: 1,
        explanation:
          '末段 "practical rather than ideological ... is not a plan to trap people in their neighbourhoods, but a way to give them the choice"：Moreno 直接回应批评，澄清概念的真实目标是"提供选择"。A 与他正面回应矛盾；C 他并未承认失败；D 段内没有犹豫拖延的表述。',
        errorTags: ['writer-attitude'],
        questionType: 'attitude',
      },
    ],
  },
  {
    id: 'en-read-006',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'health',
    difficulty: 3,
    cefr: 'B2',
    estimatedMinutes: 7,
    tags: ['health', 'paraphrase'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Sleep: The Overlooked Pillar of Health',
    titleZh: '睡眠：被忽视的健康支柱',
    passage: `For much of the twentieth century, doctors treated sleep as a passive gap between the important business of the day. That view has been overturned. Sleep is now understood as an active process during which the brain files memories, clears waste products and rebalances the hormones that control appetite and mood.

The consequences of ignoring sleep are well documented. Adults who regularly sleep fewer than six hours a night show a higher risk of heart disease, and their immune systems respond more weakly to vaccination. In studies of students, even a single shortened night measurably reduced performance in problem-solving tasks the next day.

Public health campaigns, however, still concentrate on diet and exercise. Sleep researchers argue that this imbalance is costly. Unlike advice to eat more vegetables, they point out, sleep advice often collides with economic incentives: employers reward early starts, transport timetables are built around shift work, and streaming services profit from late evenings.

Change may come from an unexpected direction. A growing number of schools have pushed their start times later after studies showed that teenagers\u2019 body clocks run roughly two hours behind those of adults. Where the change has been introduced, attendance has improved and reported accidents among student drivers have fallen. Sleep, it seems, is easier to improve by redesigning schedules than by telling individuals to try harder.`,
    questions: [
      {
        id: 'en-read-006-q1',
        stem: 'According to the passage, what does the brain do during sleep?',
        options: [
          'It rests completely, with no activity.',
          'It files memories and clears waste products.',
          'It stores fat for the following day.',
          'It stops producing hormones entirely.',
        ],
        answerIndex: 1,
        explanation:
          '第一段 "the brain files memories, clears waste products and rebalances the hormones" 明确列出睡眠中的大脑活动。A 与 "an active process" 直接矛盾；C 储存脂肪未提；D 与 "rebalances the hormones" 矛盾，是调节而非停止分泌。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
      {
        id: 'en-read-006-q2',
        stem: 'What can be inferred about sleep advice, compared with diet advice?',
        options: [
          'It is easier to follow because it needs no effort.',
          'It is harder to act on because it conflicts with economic interests.',
          'It is usually given by employers to their workers.',
          'It has replaced diet advice in public campaigns.',
        ],
        answerIndex: 1,
        explanation:
          '第三段 "sleep advice often collides with economic incentives: employers reward early starts, transport timetables ... streaming services profit"，即睡眠建议与雇主、交通、流媒体的经济利益相冲突，因此更难落实。A 与原意相反；C 雇主恰是阻力而非建议者；D 原文说运动与饮食 "still concentrate"，并未被取代。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-006-q3',
        stem: "The phrase 'this imbalance' in paragraph 3 refers to ______.",
        options: [
          'the gap between teenagers\u2019 and adults\u2019 body clocks',
          'the heavy focus on diet and exercise while sleep is neglected',
          'the difference between vegetables and sleep quality',
          'the unequal funding of hospitals and schools',
        ],
        answerIndex: 1,
        explanation:
          '"this imbalance" 紧承上句 "Public health campaigns, however, still concentrate on diet and exercise"，指"只重饮食运动、忽视睡眠"的结构性失衡。A 出现在第四段，指代错位；C 把 vegetables 与 sleep 生硬拼凑；D 医疗与教育经费差异原文未提。',
        errorTags: ['paraphrase'],
        questionType: 'paraphrase',
      },
      {
        id: 'en-read-006-q4',
        stem: 'What was observed in schools that introduced later start times?',
        options: [
          'Students slept two hours less each night.',
          'Attendance improved and student drivers reported fewer accidents.',
          'Teachers shortened the total school day.',
          'Students stopped using streaming services.',
        ],
        answerIndex: 1,
        explanation:
          '第四段 "attendance has improved and reported accidents among student drivers have fallen" 是直接证据。A 曲解了 "two hours"（那是青少年生物钟与成人的差异，不是睡眠减少量）；C 缩短教学日、D 弃用流媒体均未提及。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
    ],
  },
]
