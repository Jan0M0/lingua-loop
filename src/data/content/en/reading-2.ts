// 英语阅读理解（reading-mc）—— 原创说明文/议论文/报道体 6 篇（en-read-007 ~ en-read-012）
// 主题：culture / science / media / society / travel / finance；难度 3→3→4→4→4→5
// 作者：Lingua Loop 内容组（英语阅读）
import type { ReadingExercise } from '../../../types/content'

export const items: ReadingExercise[] = [
  {
    id: 'en-read-007',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'culture',
    difficulty: 3,
    cefr: 'B2',
    estimatedMinutes: 7,
    tags: ['culture', 'inference'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Museums and the Question of Return',
    titleZh: '博物馆与文物归还之争',
    passage: `For two centuries the great museums of Europe and North America have displayed objects collected — critics would say looted — from other parts of the world. The Benin Bronzes, taken by British forces from present-day Nigeria in 1897, are the best-known example. Today dozens of these metal sculptures sit in museums from Berlin to London, while Nigerian artists often study them only through photographs.

Attitudes are shifting. In 2022, Germany signed an agreement transferring ownership of more than a thousand Benin Bronzes to Nigeria, although some pieces remain in German museums on loan. Other institutions have moved more slowly, citing legal barriers: national laws frequently prevent museum boards from giving away objects in their collections, however they were acquired.

Supporters of restitution argue that culture is not property like any other: a ceremonial mask has a meaning in the community that created it which no display case can reproduce. Opponents worry about a different principle — if everything taken in an unequal age must return, will the world\u2019s encyclopedic museums be emptied? They also raise practical questions of conservation and security in some destination countries, an argument that critics dismiss as patronising.

What both sides increasingly accept is the value of cooperation. Joint exhibitions, shared research and long-term loans have allowed objects to travel home temporarily while permanent questions are settled. The bronzes themselves were made to record a kingdom\u2019s history — a purpose arguably best served where that history began.`,
    questions: [
      {
        id: 'en-read-007-q1',
        stem: 'What did the 2022 agreement between Germany and Nigeria involve?',
        options: [
          'The immediate return of every bronze, without conditions.',
          'The transfer of ownership of over a thousand bronzes, with some pieces remaining on loan.',
          'The sale of the bronzes to private collectors.',
          'A permanent ban on displaying the bronzes.',
        ],
        answerIndex: 1,
        explanation:
          '第二段 "transferring ownership of more than a thousand Benin Bronzes to Nigeria, although some pieces remain in German museums on loan"：所有权移交，部分仍以借展形式留在德国。A 忽略了 on loan 的限定，"without conditions" 过度；C 出售给私人藏家未提；D 与借展继续陈列的事实矛盾。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
      {
        id: 'en-read-007-q2',
        stem: 'Why have some institutions moved slowly on restitution, according to the passage?',
        options: [
          'Their staff lack interest in foreign cultures.',
          'National laws limit their freedom to give away collection items.',
          'Nigeria has refused to receive the objects.',
          'The objects are too fragile to be transported.',
        ],
        answerIndex: 1,
        explanation:
          '第二段 "Other institutions have moved more slowly, citing legal barriers: national laws frequently prevent museum boards from giving away objects" 指明法律障碍是主因。A 员工兴趣原文未提；C 与德国已签署协议的事实矛盾；D 运输脆弱性未作为拖延原因出现（conservation 是另一争议点）。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-007-q3',
        stem: 'How does the writer present the two sides in the third paragraph?',
        options: [
          'By strongly favouring the supporters of restitution.',
          'By giving both positions space while noting critics\u2019 view of one opposing argument.',
          'By openly supporting the encyclopedic museums.',
          'By refusing to describe either side\u2019s reasoning.',
        ],
        answerIndex: 1,
        explanation:
          '第三段先完整转述 supporters 的"文化非一般财产"论，再转述 opponents 的"博物馆将被清空"论，末尾补充 "an argument that critics dismiss as patronising" 点出批评者对"保护与安全"论的态度：两面并陈、附一处评注。A/C 各偏一面；D 与段内充分展开双方论证矛盾。',
        errorTags: ['writer-attitude'],
        questionType: 'attitude',
      },
      {
        id: 'en-read-007-q4',
        stem: "The word 'patronising' in paragraph 3 is closest in meaning to ______.",
        options: [
          'sensible and practical',
          'treating others as if they were inferior',
          'required by law',
          'generous and welcoming',
        ],
        answerIndex: 1,
        explanation:
          'patronising 意为"居高临下的、把对方当低人一等看待的"；语境中批评者认为以"保护与安全"为由继续扣留文物，暗含对来源国管理能力的不信任。A/D 均为褒义，与 dismiss（驳斥）的语气不符；C 与 legal 无关，且该词描述的是态度而非法律性质。',
        errorTags: ['paraphrase'],
        questionType: 'paraphrase',
      },
    ],
  },
  {
    id: 'en-read-008',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'science',
    difficulty: 3,
    cefr: 'B2',
    estimatedMinutes: 7,
    tags: ['science', 'detail'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'How Animals Find Their Way',
    titleZh: '动物如何认路',
    passage: `Each autumn, bar-tailed godwits fly from Alaska to New Zealand without stopping, a journey of some eleven thousand kilometres. How animals achieve such feats of navigation has puzzled scientists for generations, but the picture is gradually becoming clearer.

One long-standing explanation is a 'map and compass' system. The compass part is relatively well understood: birds can read the Earth\u2019s magnetic field and also use the position of the sun and stars. The map part — knowing where they are on the globe — has proved harder to explain. Recent experiments with ospreys fitted with tiny tracking devices suggest that young birds on their first migration memorise landmarks below them, effectively building a mental map as they travel.

Smaller creatures use stranger methods. In one remarkable study, desert ants were moved far from their nest and still walked in the correct homeward direction. Researchers concluded that the ants count their steps and track their turns, constantly updating their position — a form of navigation mathematically similar to the inertial systems once used in ships and aircraft.

Questions remain. Tracking devices are still too heavy for the smallest insects, and magnetic sensing depends on light in ways nobody fully understands. What is no longer in doubt is that animal navigation is not a single skill but a toolkit of methods, combined and weighted differently by each species. Understanding how they interact may eventually guide the design of robots that, like a godwit, must find their way across a featureless ocean.`,
    questions: [
      {
        id: 'en-read-008-q1',
        stem: "According to the passage, what serves as the 'compass' for migrating birds?",
        options: [
          'The Earth\u2019s magnetic field together with the sun and stars.',
          'Radio signals from other birds.',
          'The calls of desert ants.',
          'The temperature of ocean currents.',
        ],
        answerIndex: 0,
        explanation:
          '第二段 "The compass part is relatively well understood: birds can read the Earth\u2019s magnetic field and also use the position of the sun and stars"。B 无线电信号、C 蚂蚁叫声、D 洋流温度在原文中均不存在。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
      {
        id: 'en-read-008-q2',
        stem: 'What did the desert ant experiment suggest about the ants?',
        options: [
          'They recognise the smell of their own nest.',
          'They keep track of position by counting steps and turns.',
          'They follow older ants back home.',
          'They navigate by the stars at night.',
        ],
        answerIndex: 1,
        explanation:
          '第三段 "the ants count their steps and track their turns, constantly updating their position" 是实验结论。A 嗅觉未提；C 实验中被人为移走、单独测试，不可能跟随同类；D 夜间星导航未提（星辰导航是鸟类机制）。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-008-q3',
        stem: "The phrase 'a toolkit of methods' in the final paragraph suggests that navigation is ______.",
        options: [
          'a single inherited ability shared by all species',
          'a combination of several different techniques',
          'a skill found only in birds',
          'a technology directly copied from ships and aircraft',
        ],
        answerIndex: 1,
        explanation:
          '末段原句 "not a single skill but a toolkit of methods, combined and weighted differently by each species" 已把 toolkit 与"多种方法组合"画上等号。A 与 "not a single skill" 直接矛盾；C 蚂蚁也是例证；D 原文只说数学上"similar to"惯导系统，是类比而非抄袭技术。',
        errorTags: ['paraphrase'],
        questionType: 'paraphrase',
      },
      {
        id: 'en-read-008-q4',
        stem: 'The writer suggests that future research in this field may ______.',
        options: [
          'guide the design of navigation systems for robots',
          'replace field studies with the building of ships',
          'prove that magnetic sensing is impossible',
          'make tracking devices even heavier',
        ],
        answerIndex: 0,
        explanation:
          '末句 "Understanding how they interact may eventually guide the design of robots that ... must find their way across a featureless ocean" 指向机器人导航设计。B 偷换关系，船舶只是数学类比对象；C 与 "nobody fully understands" 的开放态度不符；D 与 "still too heavy for the smallest insects" 表达的技术难点方向相反。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
    ],
  },
  {
    id: 'en-read-009',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'media',
    difficulty: 4,
    cefr: 'C1',
    estimatedMinutes: 7,
    tags: ['media', 'main-idea'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'The Quiet Cost of Losing Local News',
    titleZh: '地方新闻消失的隐性代价',
    passage: `The decline of local newspapers is usually told as a business story: advertising moved to search engines and social platforms, revenues collapsed, and newsrooms emptied. Between 2005 and 2023 the United States lost roughly a third of its newspapers; Britain and parts of Europe record similar trends. Yet describing the change purely in commercial terms misses what is quietly being lost along with the closures.

Local reporters, research suggests, perform unglamorous but essential work. They attend council meetings that nobody else monitors, request documents that officials would prefer to forget, and notice — early — the small irregularities that national journalists discover only once they have grown into scandals. Studies comparing American counties before and after a paper closure found that municipal borrowing costs rose afterwards, a pattern economists read as evidence that lenders price in weaker scrutiny. Corruption, in other words, is not merely reported by local journalism; it is restrained by the fear of being reported.

Into the vacuum have stepped alternatives of uneven quality. 'Pink-slime' websites copy newspaper names and layouts while publishing little more than press releases, and social media groups spread rumour faster than any retired editor ever spread fact. Residents of such 'news deserts', studies of emergency information suggest, learn later about floods, school closures and public health warnings.

None of this argues for nostalgia. The economics that once supported hundreds of profitable local titles will not return, and charitable funding, public subsidies and nonprofit models each carry risks — not least the danger that whoever pays for news eventually seeks influence over it. But treating the outcome as an inevitable consequence of technology obscures a choice. Societies that regard independent local information as a public good, comparable to clean water, may yet decide it is worth paying for deliberately.`,
    questions: [
      {
        id: 'en-read-009-q1',
        stem: "Which of the following best captures the writer\u2019s central argument?",
        options: [
          'Local newspapers closed because their journalists lost their skills.',
          'The closures have civic costs that a purely business-focused account fails to see.',
          'Social media has made emergency information faster and more reliable.',
          'News organisations should refuse charitable funding altogether.',
        ],
        answerIndex: 1,
        explanation:
          '首段末句 "describing the change purely in commercial terms misses what is quietly being lost" 即全文论点：只讲商业逻辑会漏掉市民社会层面的代价，后文以借贷成本、"news deserts" 展开论证。A 原文未归咎于记者技能；C 与第三段"谣言更快、知情更晚"相反；D 作者只提示资助有风险，并未主张一律拒绝。',
        errorTags: ['main-idea'],
        questionType: 'main-idea',
      },
      {
        id: 'en-read-009-q2',
        stem: 'What did the studies of American counties find after a newspaper closed?',
        options: [
          'Municipal borrowing costs rose.',
          'Local tax revenues doubled.',
          'Council meetings were cancelled.',
          'National newspapers hired local reporters.',
        ],
        answerIndex: 0,
        explanation:
          '第二段 "municipal borrowing costs rose afterwards, a pattern economists read as evidence that lenders price in weaker scrutiny"。B 税收翻倍、C 议会会议取消、D 全国性报纸雇本地记者均未提及。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
      {
        id: 'en-read-009-q3',
        stem: "The writer implies that 'pink-slime' websites ______.",
        options: [
          'deliver trustworthy local journalism',
          'imitate the appearance of newspapers while offering little real reporting',
          'receive funding from local councils',
          'have replaced social media groups in many towns',
        ],
        answerIndex: 1,
        explanation:
          '第三段 "copy newspaper names and layouts while publishing little more than press releases"：徒有报纸外观，内容多为新闻稿，缺乏真正报道。A 与定位描述相反；C 议会资助未提；D 原文中两者并存、共同填补真空，并非取代关系。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-009-q4',
        stem: 'The tone of the final paragraph is best described as ______.',
        options: [
          'nostalgic, longing for the profitable local papers of the past',
          'clear-eyed, rejecting nostalgia while arguing for a deliberate public choice',
          'indifferent, refusing to evaluate any funding model',
          'triumphant, celebrating the victory of technology',
        ],
        answerIndex: 1,
        explanation:
          '末段首句 "None of this argues for nostalgia" 明确拒绝怀旧，中间逐一评价资助模式的风险，末句 "may yet decide it is worth paying for deliberately" 呼吁主动的公共选择：清醒而建设性。A 与首句相反；C 段内明确评估了各模式的利弊；D 全段无庆祝语气。',
        errorTags: ['writer-attitude'],
        questionType: 'attitude',
      },
    ],
  },
  {
    id: 'en-read-010',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'society',
    difficulty: 4,
    cefr: 'C1',
    estimatedMinutes: 7,
    tags: ['society', 'inference'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'The Invisible Workforce',
    titleZh: '看不见的劳动大军',
    passage: `Every national economy depends on a workforce that appears in no employment statistics. Unpaid carers — most of them women — cook, clean, administer medicine and provide company for children, elderly parents and disabled relatives. When statisticians occasionally attach a value to this labour, the figures are startling: estimates commonly place it between ten and twenty per cent of GDP, exceeding the output of manufacturing.

Despite its scale, unpaid care is treated as a private matter, and its costs are shared unequally. A parent who leaves employment to care for a relative typically suffers a double penalty: lost wages today and a smaller pension tomorrow, because contribution-based systems record only paid work. Researchers describe a 'career scarring' effect, with earnings still measurably lower years after caring responsibilities end.

Policy responses differ sharply. Some countries offer carer\u2019s allowances, pension credits that keep records intact, or rights to request flexible hours. Others, notably in parts of East Asia facing rapid ageing, have introduced long-term care insurance, which spreads the cost across the whole population through contributions. Each model answers a contested question differently: is caring for relatives an obligation of love, a duty of the state, or a shared social risk?

Demography gives the debate urgency. As populations age, the ratio of potential carers to those needing care is shrinking; in several countries it will roughly halve by 2050. Economists warn that relying on family goodwill alone is not a plan but a hope. Whatever balance societies choose, the era of treating unpaid care as free — in budgets, in pensions and in statistics — is drawing to a close.`,
    questions: [
      {
        id: 'en-read-010-q1',
        stem: "According to the passage, the 'double penalty' suffered by carers who leave work consists of ______.",
        options: [
          'lost wages and a reduced pension',
          'higher taxes and longer working hours',
          'poorer health and social isolation',
          'fewer job offers and rising rents',
        ],
        answerIndex: 0,
        explanation:
          '第二段 "a double penalty: lost wages today and a smaller pension tomorrow, because contribution-based systems record only paid work"。B/C/D 三组搭配均非原文列举的内容。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
      {
        id: 'en-read-010-q2',
        stem: 'The statistics in the first paragraph are used to show that unpaid care ______.',
        options: [
          'is impossible to measure accurately',
          'is economically significant even though it is invisible in official figures',
          'contributes less than manufacturing to GDP',
          'has been shrinking in recent decades',
        ],
        answerIndex: 1,
        explanation:
          '首段 "appears in no employment statistics"（隐形）与 "estimates ... exceeding the output of manufacturing"（体量超过制造业）形成对照，论点正是"不体现在官方统计中但经济意义重大"。A 与 "attach a value" 的成功估算矛盾；C 与 exceeding 相反；D 未提长期下降趋势。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-010-q3',
        stem: 'Under the long-term care insurance model described in paragraph 3, ______.',
        options: [
          'only close family members may claim benefits',
          'the whole population shares the cost through contributions',
          'employers alone pay the contributions',
          'charities pay carers a weekly wage',
        ],
        answerIndex: 1,
        explanation:
          '第三段 "long-term care insurance, which spreads the cost across the whole population through contributions"：全民缴费、共担成本。A 未限定仅亲属受益；C "employers alone" 与 whole population 矛盾；D 慈善机构付薪未提。',
        errorTags: ['paragraph-matching'],
        questionType: 'matching',
      },
      {
        id: 'en-read-010-q4',
        stem: "The statement 'relying on family goodwill alone is not a plan but a hope' is closest in meaning to ______.",
        options: [
          'families should be legally required to provide care',
          'depending on willingness alone does not amount to a serious policy',
          'families are no longer willing to help their relatives',
          'hope is the most reliable instrument of policy',
        ],
        answerIndex: 1,
        explanation:
          '"not a plan but a hope" 用对比强调：仅凭家人自愿，没有制度安排，就不算可依赖的政策。A 是具体的政策主张，超出该句含义；C 原文并未否定家属的意愿本身，否定的是"只靠意愿"；D 字面曲解，hope 在原句中是反讽用法。',
        errorTags: ['paraphrase'],
        questionType: 'paraphrase',
      },
    ],
  },
  {
    id: 'en-read-011',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'travel',
    difficulty: 4,
    cefr: 'C1',
    estimatedMinutes: 7,
    tags: ['travel', 'main-idea'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Overtourism: Too Much of a Good Thing',
    titleZh: '过度旅游：好事过了头',
    passage: `Venice now charges day-trippers an entry fee. Amsterdam has stopped approving new hotels. Barcelona residents have sprayed water at tourists eating in the streets. Images like these have made 'overtourism' one of the most discussed words in urban politics — yet the word conceals as much as it reveals.

The numbers behind the protests are dramatic. Before the pandemic, international arrivals had grown for a decade, and certain destinations absorbed visitor numbers many times their resident population. Crucially, the pressure is unevenly spread: roughly four-fifths of travellers cluster in a small minority of destinations, leaving much of the world\u2019s tourism capacity underused. Concentration, not travel itself, is the heart of the problem.

City responses fall into two philosophies. The first manages demand: entry fees, caps on cruise ships, limits on short-term rental licences, taxes earmarked for maintenance. Critics object that such measures turn cities into gated attractions and price out younger and poorer travellers, leaving only those who can pay. The second philosophy redistributes demand, marketing alternative destinations and spreading visitors across seasons. Its weakness is that tourists, unlike water in pipes, choose their own direction; a campaign for a lesser-known region may simply fail — or succeed so well that it creates the next overcrowded spot.

Underneath both approaches lies an uncomfortable observation. Many of the places now protesting mass tourism spent decades, and substantial public money, marketing themselves as destinations, competing directly for the arrivals they can no longer absorb. Managing tourism in the 2020s may therefore require something harder than slogans: an honest conversation about how many visitors a place can host before it stops being the place people came to see.`,
    questions: [
      {
        id: 'en-read-011-q1',
        stem: 'Which statement best expresses the main point of the second paragraph?',
        options: [
          'Tourism has declined steadily since the pandemic.',
          'The core problem is the concentration of visitors in a few places rather than travel itself.',
          'Most destinations receive too few tourists to survive.',
          'Visitor numbers are no longer relevant to city politics.',
        ],
        answerIndex: 1,
        explanation:
          '第二段末句 "Concentration, not travel itself, is the heart of the problem" 点明段旨：问题在游客过度集中（four-fifths cluster in a small minority of destinations），而非旅行本身。A 与 "arrivals had grown for a decade" 不符；C "too few to survive" 过度推断，原文只说大量容量未充分利用；D 与抗议进入城市政治议程的背景矛盾。',
        errorTags: ['main-idea'],
        questionType: 'main-idea',
      },
      {
        id: 'en-read-011-q2',
        stem: "Which of the following measures belongs to the 'demand management' philosophy?",
        options: [
          'Marketing lesser-known destinations.',
          'Encouraging travel in the off-season.',
          'Placing caps on cruise ships.',
          'Opening new hotels outside the centre.',
        ],
        answerIndex: 2,
        explanation:
          '第三段 "The first manages demand: entry fees, caps on cruise ships, limits on short-term rental licences" 明确把游轮限额归入需求管理。A 与 B 属于第二种思路（redistributes demand）；D 新建酒店原文未提，且阿姆斯特丹反而停批新酒店。',
        errorTags: ['detail'],
        questionType: 'detail',
      },
      {
        id: 'en-read-011-q3',
        stem: 'The writer implies that redistribution campaigns may ______.',
        options: [
          'reliably solve overcrowding everywhere',
          'fail, or recreate the same problem somewhere else',
          'be illegal in most European countries',
          'sharply reduce the total number of travellers',
        ],
        answerIndex: 1,
        explanation:
          '第三段末 "a campaign for a lesser-known region may simply fail — or succeed so well that it creates the next overcrowded spot"：或者失败，或者成功到制造下一个热点。A "reliably ... everywhere" 过度；C 合法性问题未提；D 原文谈的是分流而非减少旅行总量。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-011-q4',
        stem: 'The tone of the final paragraph towards destinations that now protest overtourism is best described as ______.',
        options: [
          'amused by residents\u2019 street protests',
          'critical, pointing out the irony in their earlier self-promotion',
          'entirely neutral, offering no evaluation',
          'enthusiastic about future marketing campaigns',
        ],
        answerIndex: 1,
        explanation:
          '末段 "an uncomfortable observation ... spent decades, and substantial public money, marketing themselves as destinations, competing directly for the arrivals they can no longer absorb" 直指反讽：当年花钱自我推销，如今抗议自己招来的客流，属批评性笔调。A 段内并非取笑居民抗议本身；C "uncomfortable" 表明作者有明确评价；D 与 "harder than slogans" 的立场相反。',
        errorTags: ['writer-attitude'],
        questionType: 'attitude',
      },
    ],
  },
  {
    id: 'en-read-012',
    language: 'en',
    skill: 'reading',
    type: 'reading-mc',
    topic: 'finance',
    difficulty: 5,
    cefr: 'C2',
    estimatedMinutes: 7,
    tags: ['finance', 'inference'],
    createdAt: '2026-10-25',
    contentVersion: 1,
    source: 'original',
    title: 'Digital Money and the Question of Power',
    titleZh: '数字货币与权力之问',
    passage: `Money, economists like to observe, is a social technology: its value rests not on any note or coin but on a collective belief that others will accept it. The debate over central bank digital currencies (CBDCs) is therefore not merely technical. It is an argument about who should operate the payment system on which that collective belief runs.

Advocates, including several central banks running pilots, advance three claims. Digitally issued sovereign money would give households a form of payment that, unlike commercial bank deposits, carries no risk of institutional failure. It could sharpen policy, since transfers to citizens could be executed within hours rather than through slow fiscal channels. And it might discipline private providers, whose payment fees are widely judged to exceed their true cost.

Sceptics reply with a mirror image of each claim. A safe digital currency, they argue, could drain deposits from banks during crises — precisely when credit is most needed — thereby amplifying the instability it was designed to remove. Privacy is the sharper objection. Cash is anonymous; a CBDC, by design, leaves a trail. Whatever safeguards are legislated today, critics observe, future governments inherit the machinery, and the question of who may observe, freeze or program the money in a citizen\u2019s wallet is a constitutional matter disguised as an engineering one.

Two quieter considerations deserve more attention than they receive. The first is an asymmetry of competence: the private sector, whatever its faults, iterates quickly, while public payment infrastructure tends to ossify. The second is the fate of the unbanked, for whom dollar bills and existing mobile-money systems already supply services that official talk of innovation conspicuously fails to specify. Whether CBDCs succeed may depend less on technical elegance than on whether institutions can promise — credibly, and over decades — that programmable money will remain the servant of its holder rather than an instrument of whoever mints it.`,
    questions: [
      {
        id: 'en-read-012-q1',
        stem: "What is the writer\u2019s central claim in the opening paragraph?",
        options: [
          'The CBDC debate is at heart about who should run the payment system underlying money.',
          'CBDCs are simply a technical upgrade of existing banknotes.',
          'Public belief in money depends on the printing of paper notes.',
          'Central bank pilots will settle the debate within a few years.',
        ],
        answerIndex: 0,
        explanation:
          '首段末句 "It is an argument about who should operate the payment system on which that collective belief runs" 点明论点：争论的实质是支付系统的运营权，而非技术细节。B 与 "not merely technical" 直接矛盾；C 与 "rests not on any note or coin" 相反；D 原文未给辩论设定时间表。',
        errorTags: ['main-idea'],
        questionType: 'main-idea',
      },
      {
        id: 'en-read-012-q2',
        stem: "The 'drain deposits' argument in paragraph 3 implies that a CBDC could ______.",
        options: [
          'stabilise commercial banks during a crisis',
          'worsen a crisis as depositors flee to safer state money',
          'replace governments\u2019 fiscal channels entirely',
          'lower the fees charged by private payment firms',
        ],
        answerIndex: 1,
        explanation:
          '第三段 "drain deposits from banks during crises — precisely when credit is most needed — thereby amplifying the instability it was designed to remove"：危时挤兑至更安全的国家货币，反而放大动荡。A 与 "amplifying the instability" 相反；C fiscal channels 是第二段支持方的论据，且 "sharpen" 不等于取代；D 降低私人费用也是第二段支持方的第三条理由。',
        errorTags: ['inference'],
        questionType: 'inference',
      },
      {
        id: 'en-read-012-q3',
        stem: "The phrase 'a constitutional matter disguised as an engineering one' suggests that the privacy question is ______.",
        options: [
          'a problem that better code can fully solve',
          'a deep question of political power and citizens\u2019 rights',
          'an issue concerning only fragile states',
          'a matter best left to engineers alone',
        ],
        answerIndex: 1,
        explanation:
          'constitutional 指"关乎权力与公民权利的根本安排"，disguised as engineering 意为被技术外表遮蔽：谁可监视、冻结、编程公民钱包里的钱，本质是宪政问题。A/D 恰是被作者否定的"工程化"错觉；C fragile states 是另一话题（第四段），与本句无关。',
        errorTags: ['paraphrase'],
        questionType: 'paraphrase',
      },
      {
        id: 'en-read-012-q4',
        stem: "The writer\u2019s overall stance towards CBDCs is best described as ______.",
        options: [
          'enthusiastic support for rapid official adoption',
          'conditional, linking success to credible long-term institutional restraint',
          'outright rejection of all digital payment systems',
          'indifference to the situation of the unbanked',
        ],
        answerIndex: 1,
        explanation:
          '末句把成败系于 "whether institutions can promise — credibly, and over decades — that programmable money will remain the servant of its holder"，即有条件支持：取决于制度能否长期可信地自我约束。A 作者对支持方论点逐一列出质疑，无热情背书；C 作者未否定数字支付本身，只质疑权力安排；D 第四段专门为 unbanked 发声，恰非冷漠。',
        errorTags: ['writer-attitude'],
        questionType: 'attitude',
      },
    ],
  },
]
