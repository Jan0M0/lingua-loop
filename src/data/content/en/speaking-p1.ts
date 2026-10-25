// IELTS Speaking Part 1 —— 原创高频主题问答（一次训练一个主题，3–4 个相关问题）
// 作者：Lingua Loop 内容组（IELTS 口语）
import type { SpeakingExercise } from '../../../types/content'

export const items: SpeakingExercise[] = [
  {
    id: 'en-sp-p1-001',
    language: 'en',
    skill: 'speaking',
    type: 'speaking-task',
    variant: 'ielts-part1',
    topic: 'urban',
    difficulty: 2,
    estimatedMinutes: 8,
    tags: ['urban', 'fluency'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Part 1: Hometown',
    prompt:
      'Let\'s talk about your hometown.\n1. Where is your hometown, and what kind of place is it?\n2. What do you like most about it?\n3. How has it changed since you were a child?\n4. Would you like to live there when you\'re older?',
    promptZh:
      '我们来聊聊你的家乡。\n1. 你的家乡在哪里？是个什么样的地方？\n2. 你最喜欢它的什么？\n3. 从你小时候到现在，它发生了哪些变化？\n4. 你以后年纪大了还想住在那里吗？',
    prepSeconds: 0,
    speakSeconds: 75,
    selfEvalDimensions: [
      {
        dimension: 'Fluency and Coherence',
        descriptors: [
          '第一问直接给信息再展开，没有从背好的 "My hometown is a beautiful city" 套句开头',
          '每个问题答 2–4 句：一句直接回应，一句解释或举例，中间没有长时间停顿',
          '用 Actually / To be honest / I\'d say 引出真实态度，听起来像聊天而不是背答案',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '描述城镇用了具体词：lively、run-down、well-connected、green spaces，而不是只有 nice、big、beautiful',
          '至少用到一组自然搭配：city centre、cost of living、public transport、rush hour',
          '程度表达有变化：really convenient、surprisingly quiet、fairly crowded，不反复说 very',
        ],
      },
      {
        dimension: 'Grammatical Range and Accuracy',
        descriptors: [
          '谈现在用现在时，回忆 childhood 用过去时，切换没有混乱',
          '至少一处定语从句或原因句（which makes it... / because...）且没有明显时态错误',
          '说错单复数或 he/she 时能马上察觉并自我修正',
        ],
      },
      {
        dimension: 'Pronunciation',
        descriptors: [
          '多音节词重音读对：familiar、convenient、facilities 没有把重音放错音节',
          '句子有轻重对比：关键名词和形容词重读，功能词轻轻带过',
          '语速可以放慢，但词尾辅音不吞音，不影响理解',
        ],
      },
    ],
    usefulPhrases: [
      'It\'s a mid-sized city — big enough to have everything you need.',
      'The best thing about it is that everything is within walking distance.',
      'It\'s changed beyond recognition in the last ten years.',
      'I used to find it boring, but I\'ve come to appreciate it.',
    ],
  },
  {
    id: 'en-sp-p1-002',
    language: 'en',
    skill: 'speaking',
    type: 'speaking-task',
    variant: 'ielts-part1',
    topic: 'work',
    difficulty: 2,
    estimatedMinutes: 8,
    tags: ['work'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Part 1: Work and Study',
    prompt:
      'Let\'s talk about what you do.\n1. Do you work, or are you a student?\n2. What does a typical day look like for you?\n3. What\'s the most enjoyable part of your work or studies?\n4. Is there anything you would change about it?',
    promptZh:
      '我们来聊聊你目前的状况。\n1. 你在工作还是在读书？\n2. 你平常的一天是怎么过的？\n3. 你的工作或学习中最有意思的部分是什么？\n4. 有没有什么你想改变的地方？',
    prepSeconds: 0,
    speakSeconds: 75,
    selfEvalDimensions: [
      {
        dimension: 'Fluency and Coherence',
        descriptors: [
          '第一句直接回答问题（I work as... / I\'m studying...），再补细节，不绕圈子',
          '每个答案围绕一个中心展开，说完一个意思再换下一个，不来回跳跃',
          '偶尔停顿没问题，但能用 well、let me think 自然过渡，而不是沉默或嗯啊不断',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '工作话题词汇具体：deadlines、team meetings、day-to-day tasks、a heavy workload，而不是只有 busy、interesting',
          '至少一处用职责或内容搭配：I\'m responsible for... / it involves... / it depends on...',
          '表达喜好不重复 like：I enjoy、what I love about it is、it can get a bit repetitive',
        ],
      },
      {
        dimension: 'Grammatical Range and Accuracy',
        descriptors: [
          '一般现在时描述日常（I usually start at nine），频率副词位置正确（usually/often 在动词前）',
          '用 would 说想改变的事（I would change... if I could）结构正确',
          '至少一处复杂句：if 条件句、which 从句或 when 时间句，无严重错误',
        ],
      },
      {
        dimension: 'Pronunciation',
        descriptors: [
          'work 与 walk、study 与 start 这类易混词发音区分清楚',
          '语调有起伏：一般疑问句用升调，特殊疑问句用降调',
          '数字与时间说得顺：nine to five、a couple of hours，不含糊',
        ],
      },
    ],
    usefulPhrases: [
      'I\'m based in the city centre, but I travel quite a bit.',
      'My day usually kicks off with a team catch-up.',
      'The part I enjoy most is that it\'s different every day.',
      'If I could change one thing, it would be the commute.',
    ],
  },
  {
    id: 'en-sp-p1-003',
    language: 'en',
    skill: 'speaking',
    type: 'speaking-task',
    variant: 'ielts-part1',
    topic: 'daily-life',
    difficulty: 2,
    estimatedMinutes: 8,
    tags: ['daily-life', 'sports'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Part 1: Hobbies',
    prompt:
      'Now let\'s talk about your free time.\n1. What do you usually do in your free time?\n2. How long have you been interested in this hobby?\n3. Do you prefer doing it alone or with other people?\n4. Did you have any hobbies as a child that you\'ve given up?',
    promptZh:
      '现在来聊聊你的空闲时间。\n1. 你空闲时间通常做什么？\n2. 你对这个爱好感兴趣多久了？\n3. 你更喜欢一个人做还是和别人一起做？\n4. 小时候有没有后来放弃的爱好？',
    prepSeconds: 0,
    speakSeconds: 75,
    selfEvalDimensions: [
      {
        dimension: 'Fluency and Coherence',
        descriptors: [
          '第一个爱好说得具体（做什么、多久一次），不是只报一个词就停',
          '时间线清楚：现在常做的事用现在时，how long 用现在完成进行时（I\'ve been doing it for...）',
          '回答"alone or with others"时给了理由，而不是只选边',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '爱好动词搭配准确：go swimming、play the guitar、take photos、do yoga，介词用对',
          '频率与程度表达多样：twice a week、now and then、pretty much every weekend',
          '用了至少一个"感受"表达：it helps me unwind、it takes my mind off work',
        ],
      },
      {
        dimension: 'Grammatical Range and Accuracy',
        descriptors: [
          '现在完成进行时 I\'ve been playing... for two years 说得自然、准确',
          'prefer / would rather / I\'m more of a... 结构使用正确，不互相拼混',
          '泛指乐器用 the（I play the piano），冠词没有系统性错误',
        ],
      },
      {
        dimension: 'Pronunciation',
        descriptors: [
          'go swimming、take photos 这类动词搭配连读自然，不逐词往外蹦',
          'interested 重音在第一音节，读得清楚',
          '讲自己喜欢的活动时语速更流畅，没有因找词而频繁卡断',
        ],
      },
    ],
    usefulPhrases: [
      'I\'m really into photography — mostly street shots.',
      'I do it on and off, depending on how busy the week is.',
      'It\'s my way of switching off after a long day.',
      'I used to collect stamps as a kid, but that fell by the wayside.',
    ],
  },
  {
    id: 'en-sp-p1-004',
    language: 'en',
    skill: 'speaking',
    type: 'speaking-task',
    variant: 'ielts-part1',
    topic: 'food',
    difficulty: 2,
    estimatedMinutes: 8,
    tags: ['food'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Part 1: Food and Cooking',
    prompt:
      'Let\'s move on to food.\n1. Do you like cooking? Why or why not?\n2. What\'s a dish you can cook well?\n3. Do you prefer eating at home or eating out?\n4. Is there any food you used to dislike but enjoy now?',
    promptZh:
      '接下来聊聊食物。\n1. 你喜欢做饭吗？为什么？\n2. 有哪道菜你做得很好？\n3. 你更喜欢在家吃还是出去吃？\n4. 有没有以前不喜欢、现在却爱吃的食物？',
    prepSeconds: 0,
    speakSeconds: 75,
    selfEvalDimensions: [
      {
        dimension: 'Fluency and Coherence',
        descriptors: [
          '每个问题先给明确态度（yes/no 或倾向），再补一句原因或例子',
          'used to 的题目里自然讲了一个小对比或小故事，不只一句 "No, not really"',
          '找词时能用 I mean、how shall I put it 过渡，而不是嗯啊或沉默',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '食物词汇具体：stir-fry、a bit spicy、home-made、a proper meal，而不是只有 delicious、yummy',
          '烹饪动词用对：chop、fry、bake、boil、season，搭配自然（boil the eggs、season it with...）',
          'taste 与 flavour、dish 与 cuisine 这类近义词至少替换使用一次',
        ],
      },
      {
        dimension: 'Grammatical Range and Accuracy',
        descriptors: [
          '频率与时态正确：I usually cook... / I rarely eat out；used to dislike 接动词原形',
          'prefer A to B / prefer doing A rather than doing B 结构没有混',
          '至少一处复杂句：when I have time... / which saves me a lot of money',
        ],
      },
      {
        dimension: 'Pronunciation',
        descriptors: [
          'dish、meal 这类短词发音清楚，复数词尾 -s 不吞',
          '表达喜好时语调自然升降，but 后的转折有转折语调',
          'recipe 重音在第一音节，没有读成 "re-SIPE"',
        ],
      },
    ],
    usefulPhrases: [
      'I wouldn\'t call myself a cook, but I get by.',
      'I make a decent pasta — nothing fancy, but it always works.',
      'Eating out is a treat; cooking at home is the routine.',
      'I\'ve grown to like olives — I couldn\'t stand them as a child.',
    ],
  },
  {
    id: 'en-sp-p1-005',
    language: 'en',
    skill: 'speaking',
    type: 'speaking-task',
    variant: 'ielts-part1',
    topic: 'travel',
    difficulty: 3,
    estimatedMinutes: 8,
    tags: ['travel'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Part 1: Travel',
    prompt:
      'Let\'s talk about travel.\n1. Do you enjoy travelling? What kind of trips do you like?\n2. What\'s the best place you\'ve ever visited?\n3. Do you prefer planning a trip in detail, or being spontaneous?\n4. How do you usually spend your time when you\'re on holiday?',
    promptZh:
      '我们来聊聊旅行。\n1. 你喜欢旅行吗？喜欢哪种类型的旅行？\n2. 你去过的最棒的地方是哪里？\n3. 你喜欢把行程计划得很细，还是随性而行？\n4. 度假时你通常怎么安排时间？',
    prepSeconds: 0,
    speakSeconds: 75,
    selfEvalDimensions: [
      {
        dimension: 'Fluency and Coherence',
        descriptors: [
          '描述一次旅行按"地点—感受—原因"的顺序展开，不想到哪说到哪',
          '最高级问题（the best place）给出明确选择并说清理由，不两边摇摆',
          '说错后能自然重来或补一句修正（or rather...），对话题不失控',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '旅行词汇具体：off the beaten track、a city break、backpacking、sightseeing，而不是只说 beautiful、famous',
          '至少一处用动词搭配：get around、book in advance、pack light',
          '形容感受的词有梯度：breathtaking、a bit overrated、well worth the trip',
        ],
      },
      {
        dimension: 'Grammatical Range and Accuracy',
        descriptors: [
          '现在完成时谈经历（I\'ve been to...）与过去时讲某次旅行（Last year I went...）区分清楚',
          '用 I tend to / would rather 表达偏好，没有 prefer than 之类的错误形式',
          '定语从句至少一处正确：a place where... / a trip which taught me...',
        ],
      },
      {
        dimension: 'Pronunciation',
        descriptors: [
          'travel 的 /æ/ 元音饱满，词尾 -vel 不吞',
          '遇到 itinerary 这类难词能改用 simpler 说法，不硬拼造成卡顿',
          '长句在从句边界有短暂换气，语调不往下塌',
        ],
      },
    ],
    usefulPhrases: [
      'I\'m more of a city-break person than a beach person.',
      'It\'s the kind of place you either love or find overrated.',
      'I usually book flights early and leave the rest open.',
      'I like to wander around without an agenda for at least a day.',
    ],
  },
  {
    id: 'en-sp-p1-006',
    language: 'en',
    skill: 'speaking',
    type: 'speaking-task',
    variant: 'ielts-part1',
    topic: 'daily-life',
    difficulty: 2,
    estimatedMinutes: 8,
    tags: ['daily-life', 'weather'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Part 1: Weather',
    prompt:
      'Let\'s talk about the weather.\n1. What\'s the weather like in your city at this time of year?\n2. Do you prefer hot weather or cold weather? Why?\n3. Does the weather ever affect your mood or your plans?\n4. Is there any extreme weather where you live?',
    promptZh:
      '我们来聊聊天气。\n1. 你的城市这个季节天气怎么样？\n2. 你更喜欢热天还是冷天？为什么？\n3. 天气会影响你的心情或安排吗？\n4. 你住的地方有没有极端天气？',
    prepSeconds: 0,
    speakSeconds: 75,
    selfEvalDimensions: [
      {
        dimension: 'Fluency and Coherence',
        descriptors: [
          '描述天气不停留在一句 It\'s sunny，会补一句它对生活的影响或应对方式',
          '偏好题给出明确选择和一个具体理由（睡眠、出行、穿衣），像真实聊天',
          '答案之间有轻微信号词衔接（That said... / Mind you...），不是孤立的句子',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '天气词准确分档：chilly、humid、drizzle、a heatwave，而不是只有 hot、cold、rain',
          '至少一处地道搭配：the forecast says、freezing cold、bucketing down',
          '影响心情的说法自然：it puts me in a good mood、grey days drain me',
        ],
      },
      {
        dimension: 'Grammatical Range and Accuracy',
        descriptors: [
          'It\'s getting colder / It\'s been raining all week 这类进行与完成结构用得准',
          '第二条件句说理想天气（If it were up to me...）结构基本正确，能自我修正即可',
          '一般现在时描述常态，过去时讲某次台风或暴雨，不混用',
        ],
      },
      {
        dimension: 'Pronunciation',
        descriptors: [
          'weather 与 whether、wet 与 vet 发音可区分（/w/ 音到位）',
          'cold 的词尾 -ld 读完整，不读成 code',
          '整体语速平稳，没有快到吞音',
        ],
      },
    ],
    usefulPhrases: [
      'It\'s that in-between season — you never know how to dress.',
      'I\'d take a freezing day over a humid one any day.',
      'A bit of rain doesn\'t bother me; it\'s the wind I can\'t stand.',
      'When it drizzles like this, I just stay in with a book.',
    ],
  },
  {
    id: 'en-sp-p1-007',
    language: 'en',
    skill: 'speaking',
    type: 'speaking-task',
    variant: 'ielts-part1',
    topic: 'culture',
    difficulty: 3,
    estimatedMinutes: 8,
    tags: ['culture', 'media'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Part 1: Reading',
    prompt:
      'Now let\'s talk about reading.\n1. Do you often read books? What kind?\n2. Did you read much as a child?\n3. Do you prefer paper books or e-books? Why?\n4. Where do you usually read?',
    promptZh:
      '现在来聊聊阅读。\n1. 你经常读书吗？读哪一类？\n2. 你小时候读书多吗？\n3. 你更喜欢纸质书还是电子书？为什么？\n4. 你通常在哪里读书？',
    prepSeconds: 0,
    speakSeconds: 75,
    selfEvalDimensions: [
      {
        dimension: 'Fluency and Coherence',
        descriptors: [
          '说书种时给出具体例子（某类书、某位作者），不只有 novels、books',
          '童年阅读题简短讲一个小画面（读了什么、谁带你读），有细节',
          '比较题（paper vs e-book）两端都提到，再落到自己的选择',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '阅读话题搭配自然：a page-turner、I\'m halfway through、finish a book、put a book down',
          '至少一处评价表达：hard to put down、a bit dry、well worth reading',
          '没有依赖 "broaden my horizons" 这类套话，讲的是自己真实的阅读习惯',
        ],
      },
      {
        dimension: 'Grammatical Range and Accuracy',
        descriptors: [
          '频率句正确：I read most evenings；手头在读的书用现在完成进行（I\'ve been reading...）',
          'used to / would 讲童年习惯（I\'d read under the covers）用法准确',
          '比较结构 as... as / compared to 至少一处无误',
        ],
      },
      {
        dimension: 'Pronunciation',
        descriptors: [
          'read 的过去式与现在式读音区分开（red / riːd）',
          'novel、article、magazine 重音正确，复数词尾清楚',
          '长句从句处语调保持，不在句中随意掉调',
        ],
      },
    ],
    usefulPhrases: [
      'I always have a book on the go.',
      'I gravitate towards non-fiction — history, mostly.',
      'Paper books for the feel; the e-reader for travelling.',
      'I was a real bookworm as a kid — I\'d read anything.',
    ],
  },
  {
    id: 'en-sp-p1-008',
    language: 'en',
    skill: 'speaking',
    type: 'speaking-task',
    variant: 'ielts-part1',
    topic: 'family',
    difficulty: 2,
    estimatedMinutes: 8,
    tags: ['family', 'friendship'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Part 1: Friends',
    prompt:
      'Let\'s talk about friendship.\n1. Do you see your friends often? What do you do together?\n2. Are your friends mostly from school, work, or somewhere else?\n3. Do you think it\'s better to have many friends or a few close ones?\n4. When did you last make a new friend?',
    promptZh:
      '我们来聊聊朋友。\n1. 你常和朋友见面吗？在一起做什么？\n2. 你的朋友多是同学、同事，还是其他渠道认识的？\n3. 你觉得朋友多好还是有几个知交更好？\n4. 你上一次结识新朋友是什么时候？',
    prepSeconds: 0,
    speakSeconds: 75,
    selfEvalDimensions: [
      {
        dimension: 'Fluency and Coherence',
        descriptors: [
          '活动说得具体（做什么、多久一次），而不是 we do many things 一句带过',
          '观点题（many vs few）给出立场并配一个真实理由或例子',
          '时间点问题（last made a friend）交代了场合，说了一个小场景',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          'friendship 搭配至少用到两处：close friends、we go way back、keep in touch、drift apart',
          '频率与时间表达多样：every couple of weeks、over the years、back in high school',
          '没有用 "share happiness and sorrow" 这类空泛表达，讲的是具体相处方式',
        ],
      },
      {
        dimension: 'Grammatical Range and Accuracy',
        descriptors: [
          '一般过去时讲认识新朋友的经历（We met at... / We hit it off），动词形式正确',
          '回答 How often do you... 时语序和频率词位置正确',
          '比较结构 a few close friends rather than dozens of acquaintances 无误',
        ],
      },
      {
        dimension: 'Pronunciation',
        descriptors: [
          'friends 的词尾 -nds 读完整，不吞成 "fren"',
          'together、colleague、acquaintance 重音读对',
          '叙述小场景时语速与情绪匹配，关键词有自然重音',
        ],
      },
    ],
    usefulPhrases: [
      'We try to catch up every couple of weeks.',
      'We go way back — primary school, actually.',
      'I\'d rather have a handful of close friends than a wide circle.',
      'We just clicked from the first conversation.',
    ],
  },
  {
    id: 'en-sp-p1-009',
    language: 'en',
    skill: 'speaking',
    type: 'speaking-task',
    variant: 'ielts-part1',
    topic: 'daily-life',
    difficulty: 2,
    estimatedMinutes: 8,
    tags: ['daily-life'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Part 1: Weekends',
    prompt:
      'Let\'s talk about your weekends.\n1. What do you usually do at the weekend?\n2. Do you think weekends are long enough?\n3. Do you prefer a busy weekend or a quiet one?\n4. Was there anything special you did last weekend?',
    promptZh:
      '我们来聊聊周末。\n1. 你周末通常做什么？\n2. 你觉得周末的时长够吗？\n3. 你喜欢忙碌的周末还是安静的周末？\n4. 上个周末你有没有做什么特别的事？',
    prepSeconds: 0,
    speakSeconds: 75,
    selfEvalDimensions: [
      {
        dimension: 'Fluency and Coherence',
        descriptors: [
          '用"周六—周日"或"上午—晚上"的时间框架组织回答，条理清楚',
          'last weekend 用连贯的叙事讲了 2–3 句，不是流水账单词',
          '每个答案收尾利落，不拖着重复的说法',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '周末活动词组具体：sleep in、run errands、catch up on sleep、meet friends for brunch',
          '至少一处习惯表达：more often than not、once in a while、every other weekend',
          '评价时长的说法自然：two days go by in a flash、by Sunday evening I\'m already thinking about Monday',
        ],
      },
      {
        dimension: 'Grammatical Range and Accuracy',
        descriptors: [
          '一般现在时讲习惯，过去时讲上个周末，边界清楚',
          '用 wish 表达"希望周末更长"结构正确（I wish weekends were a day longer）',
          '频率词组位置正确（I usually... / On Saturdays, I...）',
        ],
      },
      {
        dimension: 'Pronunciation',
        descriptors: [
          'weekend 重音在第一音节，与 weekday 的节奏一致',
          'sleep in、eat out 这类短语动词连读自然，重音落对',
          '叙事段落有节奏变化，语调不平板',
        ],
      },
    ],
    usefulPhrases: [
      'Saturdays are for errands; Sundays are for doing nothing.',
      'I try to keep at least one morning free.',
      'Two days never feel like enough.',
      'Last weekend was quiet — I finally finished that series.',
    ],
  },
  {
    id: 'en-sp-p1-010',
    language: 'en',
    skill: 'speaking',
    type: 'speaking-task',
    variant: 'ielts-part1',
    topic: 'work',
    difficulty: 3,
    estimatedMinutes: 8,
    tags: ['work', 'plans'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Part 1: Future Plans',
    prompt:
      'Let\'s talk about your plans for the future.\n1. Where do you see yourself in five years?\n2. Is there anything you\'re planning to learn or start soon?\n3. Do you usually make detailed plans, or do you take things as they come?\n4. Are you good at keeping New Year\'s resolutions?',
    promptZh:
      '我们来聊聊未来的计划。\n1. 你觉得五年后自己会是什么样？\n2. 最近有什么想学或想开始做的事吗？\n3. 你平时会做很详细的计划，还是走一步看一步？\n4. 你的新年计划能坚持下来吗？',
    prepSeconds: 0,
    speakSeconds: 75,
    selfEvalDimensions: [
      {
        dimension: 'Fluency and Coherence',
        descriptors: [
          '五年设想有一条主线（职业、城市或生活方式），不是零散愿望的堆砌',
          '每个答案 2–4 句：观点先行，再解释，不绕开场白',
          '不确定时用 hopefully、it depends 留有余地，语气从容',
        ],
      },
      {
        dimension: 'Lexical Resource',
        descriptors: [
          '计划语言多样：I\'m hoping to、my goal is to、sooner or later、in the long run，不只说 I will',
          '时间表达准确：in five years、by then、over the next couple of years',
          '没有说 "everything will be better in the future" 这类空话，计划具体可感',
        ],
      },
      {
        dimension: 'Grammatical Range and Accuracy',
        descriptors: [
          '将来形式分工正确：预测用 will，既定打算用 going to / planning to',
          'hope / wish 后的时态正确（I hope I\'ll have... / I wish I were more organised）',
          'if 条件句至少一处（If things go well, I\'ll...）无误',
        ],
      },
      {
        dimension: 'Pronunciation',
        descriptors: [
          '缩读自然：I\'ll、I\'d like to 读得顺，不逐词读 I will',
          '五到十个词的短语一口气说完，断句位置正确',
          'hopefully、probably 这类副词不吞音节',
        ],
      },
    ],
    usefulPhrases: [
      'Ideally, I\'d be doing something closer to design by then.',
      'I\'m toying with the idea of learning to sail.',
      'I take things as they come, more or less.',
      'My resolutions never survive January.',
    ],
  },
]
