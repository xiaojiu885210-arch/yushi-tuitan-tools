import { withHeat } from "./score";
import type { Creator, Post } from "./types";

const TS = "2026-08-28T12:00:00.000Z";

function c(p: Omit<Creator, "profileUrl" | "source" | "firstSeenAt" | "lastSeenAt" | "following"> & { following?: number }): Creator {
  return {
    ...p,
    following: p.following ?? 400,
    profileUrl: `https://x.com/${p.handle}`,
    source: "catalog",
    firstSeenAt: TS,
    lastSeenAt: TS,
  };
}

function p(row: Omit<Post, "heat" | "postUrl" | "source"> & { id: string }): Post {
  return withHeat({
    ...row,
    postUrl: `https://x.com/${row.handle}/status/${row.id}`,
    source: "catalog",
  });
}

export const CATALOG_CREATORS: Creator[] = [
  c({ handle: "IndieHackers", name: "Indie Hackers", bio: "Work for yourself and make $10k/mo, from wherever, whenever.", avatarUrl: "https://pbs.twimg.com/profile_images/1100497789153411073/y8dOlFau.png", followers: 150371, lang: "en", topics: ["indie", "saas", "money"] }),
  c({ handle: "alexabelonix", name: "Alexa | Startup founder", bio: "I quit my job at a big bank to build startups. Failed 2. Won 10+ hackathons.", avatarUrl: "https://pbs.twimg.com/profile_images/1890519392607236098/8YMc8DEk.jpg", followers: 25868, lang: "en", topics: ["startup", "indie", "growth"] }),
  c({ handle: "indiehackercase", name: "Olivert", bio: "数据分析师，分享AI自媒体搞钱副业，只做线上项目。", avatarUrl: "https://pbs.twimg.com/profile_images/1977258121816162304/1hNmA_d8.jpg", followers: 32558, lang: "zh", topics: ["indie", "ai", "money"] }),
  c({ handle: "Degen_Kerry", name: "Kerry｜AI Indie Hacker", bio: "AI独立开发者 | 美股投资人", avatarUrl: "https://pbs.twimg.com/profile_images/1966324713350959104/dbPW5pZa.jpg", followers: 7843, lang: "zh", topics: ["indie", "ai", "money"] }),
  c({ handle: "AYi_AInotes", name: "AYi", bio: "AI 实用主义，专注AI落地。KEEP BUILDING。业务出海。", avatarUrl: "https://pbs.twimg.com/profile_images/1989157446829350912/pW828UwK.jpg", followers: 18200, lang: "zh", topics: ["ai", "global", "startup"] }),
  c({ handle: "WolfMoneyNotes", name: "狼哥搞钱笔记", bio: "前大厂高级产品经理｜创业实战中。分享搞钱认知、工具、项目打法。", avatarUrl: "https://pbs.twimg.com/profile_images/1996884792454098944/fjT-3tCq.jpg", followers: 42000, lang: "zh", topics: ["money", "startup", "content"] }),
  c({ handle: "geneningz", name: "张俊林John｜AI创业笔记", bio: "Founder & CEO。打造人文科技公司。深圳｜AI Hardware｜AI Apps。", avatarUrl: "https://pbs.twimg.com/profile_images/2063540192217313280/JOBK0eAe.jpg", followers: 1251, lang: "zh", topics: ["ai", "startup", "product"] }),
  c({ handle: "Lakr233", name: "砍砍", bio: "独立开发者。工业生产软件时代，护城河在哪里。", avatarUrl: "https://pbs.twimg.com/profile_images/2074861408647602176/R4ipccSB.jpg", followers: 28000, lang: "zh", topics: ["indie", "product", "ai"] }),
  c({ handle: "guishou_56", name: "Niko", bio: "前360安全开发工程师｜现独立开发者。分享 $0 → $10000/月 产品出海之路。", avatarUrl: "https://pbs.twimg.com/profile_images/1981237534475653120/0AjGVqQ0.jpg", followers: 6400, lang: "zh", topics: ["indie", "global", "saas"] }),
  c({ handle: "pangyusio", name: "Pangyu 胖鱼", bio: "CS PhD | LLM Engineer | AI · 科技 · 社会", avatarUrl: "https://pbs.twimg.com/profile_images/1220290486516228096/TwYdOfQ7.jpg", followers: 21000, lang: "zh", topics: ["ai", "startup", "content"] }),
  c({ handle: "LabSpeculation", name: "投机实验室", bio: "SpaceX / 马斯克创业史笔记。", avatarUrl: "https://pbs.twimg.com/profile_images/1504111773183578120/Hu0TWmyW.jpg", followers: 89000, lang: "zh", topics: ["startup", "funding", "content"] }),
  c({ handle: "1024DevHub", name: "1024", bio: "Developer & Tech Creator. Sharing practical tech content.", avatarUrl: "https://pbs.twimg.com/profile_images/758615102564163584/BRWfouwv.jpg", followers: 54000, lang: "zh", topics: ["indie", "oss", "product"] }),
  c({ handle: "illyism", name: "ILIAS ISM", bio: "I help SaaS companies grow. Building products at $30k/$15k/$10k/mo.", avatarUrl: "https://pbs.twimg.com/profile_images/1688814790620196865/TGVXWLNW.jpg", followers: 41000, lang: "en", topics: ["saas", "growth", "indie"] }),
  c({ handle: "thekitze", name: "kitze", bio: "tinkerer.club. Ships products in public.", avatarUrl: "https://pbs.twimg.com/profile_images/2086828789896519680/roL3Zqe2.jpg", followers: 120000, lang: "en", topics: ["indie", "product", "saas"] }),
  c({ handle: "paolo_scales", name: "paolo trivellato", bio: "Sell in public. Scaled software to $11,011/mo in 60 days.", avatarUrl: "https://pbs.twimg.com/profile_images/2023416400904388609/5QW6dalH.jpg", followers: 8900, lang: "en", topics: ["growth", "content", "saas"] }),
  c({ handle: "sushilwtf", name: "Sushil", bio: "building @painhuntr | en route to indie hacker", avatarUrl: "https://pbs.twimg.com/profile_images/2070717382545596417/VrN6mLcM.jpg", followers: 12000, lang: "en", topics: ["indie", "growth", "product"] }),
  c({ handle: "MennelDev", name: "Mennel", bio: "Je crée des App Mobiles vite et bien | Indie Hacker", avatarUrl: "https://pbs.twimg.com/profile_images/1998739663423442944/EnS-DE6g.jpg", followers: 7600, lang: "en", topics: ["indie", "product", "ai"] }),
  c({ handle: "jenzhuscott", name: "Jen Zhu", bio: "Cofounder/CEO, Power Dynamics. Chinese entrepreneurs vs US mindset.", avatarUrl: "https://pbs.twimg.com/profile_images/1780838209074966528/sLoqyoHY.jpg", followers: 34000, lang: "en", topics: ["startup", "global", "ai"] }),
  c({ handle: "labenz", name: "Nathan Labenz", bio: "AI Scout, building text-2-video @Waymark, host of The Cognitive Revolution.", avatarUrl: "https://pbs.twimg.com/profile_images/1614103328245309441/YPi8U18v.png", followers: 98000, lang: "en", topics: ["ai", "startup", "content"] }),
  c({ handle: "GergelyOrosz", name: "Gergely Orosz", bio: "Writing @Pragmatic_Eng. Formerly Uber & Skype.", avatarUrl: "https://pbs.twimg.com/profile_images/673095429748350976/ei5eeouV.png", followers: 280000, lang: "en", topics: ["product", "growth", "indie"] }),
  c({ handle: "mityasmusin", name: "Mitya Smusin", bio: "Founder of @yellow_systems and @shoutout_io", avatarUrl: "https://pbs.twimg.com/profile_images/1636847147420196864/6qqj-hAJ.jpg", followers: 22000, lang: "en", topics: ["startup", "money", "growth"] }),
  c({ handle: "ciwbrief", name: "China Innovation Watch", bio: "Data-driven insights on China’s tech breakthroughs and market intelligence.", avatarUrl: "https://pbs.twimg.com/profile_images/1905820179877281792/iPWr_guS.jpg", followers: 18000, lang: "en", topics: ["ai", "global", "startup"] }),
  c({ handle: "louszbd", name: "Lou", bio: "Code with GLM. Ships with computer-use agents.", avatarUrl: "https://pbs.twimg.com/profile_images/2082119282847252480/0H5H4bJH.jpg", followers: 9600, lang: "zh", topics: ["ai", "indie", "product"] }),
  c({ handle: "levelsio", name: "levelsio", bio: "Nomad indie hacker. Photo AI, Remote OK, Hoodmaps. Build in public.", avatarUrl: "https://pbs.twimg.com/profile_images/1493290548063416325/ifs_bY5C.jpg", followers: 520000, lang: "en", topics: ["indie", "saas", "money"] }),
  c({ handle: "paulg", name: "Paul Graham", bio: "Y Combinator. Essays on startups.", avatarUrl: "https://pbs.twimg.com/profile_images/1824002576/pg-railsconf.jpg", followers: 1800000, lang: "en", topics: ["startup", "funding", "product"] }),
  c({ handle: "ycombinator", name: "Y Combinator", bio: "The world's startup accelerator.", avatarUrl: "https://pbs.twimg.com/profile_images/1674915648898678784/x8YhGY1l.jpg", followers: 1400000, lang: "en", topics: ["startup", "funding", "growth"] }),
  c({ handle: "marclou", name: "Marc Lou", bio: "Solo SaaS empire. Ships fast, prices in public.", avatarUrl: "https://pbs.twimg.com/profile_images/1512887589874319361/xRqyBXle.jpg", followers: 180000, lang: "en", topics: ["indie", "saas", "growth"] }),
  c({ handle: "tibo_maker", name: "Tibo", bio: "Growth playbook for indie makers.", avatarUrl: "https://pbs.twimg.com/profile_images/1641038250395156481/A2xBYpxL.jpg", followers: 95000, lang: "en", topics: ["growth", "indie", "content"] }),
  c({ handle: "DZhao63405", name: "朝朝（AI创业版）", bio: "用AI创业。企业AI落地。AI自媒体。", avatarUrl: "https://pbs.twimg.com/profile_images/2076644695250518016/pytnpj95.jpg", followers: 1231, lang: "zh", topics: ["ai", "startup", "content"] }),
  c({ handle: "lianzijie_web3", name: "链子杰丨PM·创业", bio: "前腾讯视频高级PM｜Polymarket量化套利工具创始人｜AI变现。", avatarUrl: "https://pbs.twimg.com/profile_images/1974208602136285184/6xjh701O.jpg", followers: 585, lang: "zh", topics: ["startup", "web3", "money"] }),
  c({ handle: "Canna2025", name: "0xCanna（AI创业版）", bio: "企业垂直Agent系统｜自建中转站", avatarUrl: "https://pbs.twimg.com/profile_images/1467157496708145160/AgO-I04N.jpg", followers: 1897, lang: "zh", topics: ["ai", "startup", "web3"] }),
  c({ handle: "DLKFZWilliam2", name: "独立开发者William", bio: "半路出家的退休 Dev｜全职 Comedian｜写代码。", avatarUrl: "https://pbs.twimg.com/profile_images/2092800981776130048/mIhmxeaB.jpg", followers: 4300, lang: "zh", topics: ["indie", "content", "global"] }),
  c({ handle: "jameygannon", name: "techbimbo", bio: "business stylist & ai creative director. Freelancer / solopreneur ops.", avatarUrl: "https://pbs.twimg.com/profile_images/1996721908004343808/lPnecCcQ.jpg", followers: 54000, lang: "en", topics: ["money", "indie", "content"] }),
  c({ handle: "lauradang0", name: "laura", bio: "startups @usecorgi | building genuine connections", avatarUrl: "https://pbs.twimg.com/profile_images/1942610207395188736/R0aqMDAo.jpg", followers: 7200, lang: "en", topics: ["startup", "content", "growth"] }),
  c({ handle: "nini_incrypto_", name: "nini", bio: "长期关注美股、crypto、AI。", avatarUrl: "https://pbs.twimg.com/profile_images/2035875407359262720/qVUpg1XW.jpg", followers: 16000, lang: "zh", topics: ["ai", "money", "web3"] }),
];

export const CATALOG_POSTS: Post[] = [
  p({ id: "2093361289137418622", handle: "AYi_AInotes", body: "硅谷几十年的软件创业定律，今天被 a16z 正式宣告作废了。代码不再是终极护城河，算力底座才是。创始人的基因必须从代码转向原子。", lang: "zh", likes: 81, bookmarks: 103, views: 10962, replies: 11, reposts: 16, topics: ["ai", "startup", "funding"], postedAt: "2026-08-28T15:33:18.000Z" }),
  p({ id: "2093359950693380247", handle: "nini_incrypto_", body: "把自己的各交易所资产通过 API 接到 Claude，只开只读。买房、投资、创业这类决定时，直接让它把财产状况、现金流和风险一起算清楚。", lang: "zh", likes: 80, bookmarks: 32, views: 11666, replies: 15, reposts: 6, topics: ["ai", "money", "startup"], postedAt: "2026-08-28T15:27:59.000Z" }),
  p({ id: "2093356544503226768", handle: "Lakr233", body: "害怕吗 独立开发者们 工业生产软件时代 你的护城河在哪里", lang: "zh", likes: 90, bookmarks: 89, views: 24610, replies: 13, reposts: 6, topics: ["indie", "ai", "product"], postedAt: "2026-08-28T15:14:27.000Z" }),
  p({ id: "2093022086281494531", handle: "louszbd", body: "/goal Use cua check out music app and recreate it. Test yours with cua/bua. Compare with the original and keep polish until they feel the same.", lang: "en", likes: 529, bookmarks: 342, views: 83854, replies: 20, reposts: 43, topics: ["ai", "indie", "product"], postedAt: "2026-08-27T17:05:26.000Z" }),
  p({ id: "2093353112996364648", handle: "WolfMoneyNotes", body: "摄影好啊！摄影得学。内容创业最稳的基本功之一。", lang: "zh", likes: 2286, bookmarks: 983, views: 194105, replies: 71, reposts: 80, topics: ["content", "money", "startup"], postedAt: "2026-08-28T15:00:49.000Z" }),
  p({ id: "2093288243886498239", handle: "LabSpeculation", body: "马斯克和弟弟第一次创业时做过一个叫「砰砰机」的假服务器。外面是巨大机柜，里面只有一台小电脑。Zip2 后来拿到 300 万美元投资。", lang: "zh", likes: 109, bookmarks: 49, views: 51499, replies: 31, reposts: 9, topics: ["startup", "funding"], postedAt: "2026-08-28T10:43:03.000Z" }),
  p({ id: "2093277661158429120", handle: "pangyusio", body: "人一定要跳槽。选择公司本质上和投资股票一样：寻找最有发展前景的标的，和它一起成长。", lang: "zh", likes: 184, bookmarks: 56, views: 21566, replies: 20, reposts: 15, topics: ["startup", "growth"], postedAt: "2026-08-28T10:01:00.000Z" }),
  p({ id: "2093242575448690698", handle: "guishou_56", body: "作为出海独立开发者，最搞心态的日常之一：海外 AI 工具和各种订阅。最近开了张能绑 ChatGPT Pro 的卡，外币余额还能国内花。", lang: "zh", likes: 25, bookmarks: 37, views: 2749, replies: 25, reposts: 1, topics: ["indie", "global", "saas"], postedAt: "2026-08-28T07:41:35.000Z" }),
  p({ id: "2093384931443413210", handle: "illyism", body: "If I see one more indie hacker selling ad space I'm going to LinkedIn", lang: "en", likes: 242, bookmarks: 7, views: 8442, replies: 76, reposts: 4, topics: ["indie", "saas"], postedAt: "2026-08-28T17:07:15.000Z" }),
  p({ id: "2093050825308254702", handle: "paolo_scales", body: "Building in public is the fastest way to build an audience that will never pay you. DO NOT build in public. Sell in public. I scaled software to $11,011 a month in 60 days.", lang: "en", likes: 95, bookmarks: 113, views: 7135, replies: 16, reposts: 3, topics: ["growth", "indie", "money"], postedAt: "2026-08-27T18:59:38.000Z" }),
  p({ id: "2092675452112425323", handle: "MennelDev", body: "Apple just made Foundation Model free for indie hackers on iOS (Small Business Program). Coach apps, note summarizers, no API key, zero cloud cost.", lang: "en", likes: 239, bookmarks: 398, views: 57029, replies: 20, reposts: 10, topics: ["indie", "ai", "product"], postedAt: "2026-08-26T18:08:02.000Z" }),
  p({ id: "2092485312899608706", handle: "sushilwtf", body: "the best indie hacker accounts to follow on X: @marclou @jackfriks @willbakerships @levelsio @tibo_maker @damonchen @illyism", lang: "en", likes: 331, bookmarks: 466, views: 37223, replies: 42, reposts: 24, topics: ["indie", "growth", "content"], postedAt: "2026-08-26T05:32:29.000Z" }),
  p({ id: "1750870763907760206", handle: "mityasmusin", body: "Harsh truths: Product Hunt is ego play. Selling to indie hackers means selling to people with no capital. For your first business, do not do a startup. Make $5M in a proven model.", lang: "en", likes: 1834, bookmarks: 1985, views: 415416, replies: 186, reposts: 177, topics: ["startup", "money", "indie"], postedAt: "2024-01-26T13:18:14.000Z" }),
  p({ id: "1773073720069730421", handle: "GergelyOrosz", body: "Indie hacking is viable if you have cheap distribution AND stay small enough that large players are uninterested. If #2 is not true: do NOT share your $$$ in public.", lang: "en", likes: 333, bookmarks: 148, views: 384167, replies: 10, reposts: 13, topics: ["indie", "growth", "saas"], postedAt: "2024-03-27T19:44:51.000Z" }),
  p({ id: "1903584344524152974", handle: "jenzhuscott", body: "China is a brutally competitive domestic market with entrepreneurs who have dreams and fears. Beating American counterparts is sometimes a by-product rather than the primary goal.", lang: "en", likes: 1791, bookmarks: 473, views: 262998, replies: 81, reposts: 224, topics: ["startup", "global", "ai"], postedAt: "2025-03-22T23:07:29.000Z" }),
  p({ id: "1791091299845587078", handle: "IndieHackers", body: "You build. You launch. You fail. This founder got 200+ users in the first 24 hours. Formula: an exciting product, a one-line explainer, an amazing video.", lang: "en", likes: 235, bookmarks: 397, views: 82438, replies: 6, reposts: 8, topics: ["indie", "growth", "product"], postedAt: "2024-05-16T13:00:17.000Z" }),
  p({ id: "2092148740790395299", handle: "alexabelonix", body: "indie hackers are here. BUILD IN PUBLIC. cooking a meditation app. sprint 1 finished.", lang: "en", likes: 98, bookmarks: 2, views: 2397, replies: 32, reposts: 2, topics: ["indie", "startup", "product"], postedAt: "2026-08-25T07:15:04.000Z" }),
  p({ id: "2092971182161306101", handle: "ciwbrief", body: "A 13 year old just outsold adult AI founders in Hangzhou. Her edge was not code. It was her mother's Douyin channel. Chinese AI product building has commoditized. The scarce input is the channel.", lang: "en", likes: 2, bookmarks: 0, views: 355, replies: 0, reposts: 0, topics: ["ai", "startup", "growth"], postedAt: "2026-08-27T13:43:10.000Z" }),
  p({ id: "2092712567575838960", handle: "jameygannon", body: "if you are a freelancer or solopreneur and don’t have an S-corp yet you NEED to do it. payroll taxes, solo 401k, write offs.", lang: "en", likes: 169, bookmarks: 254, views: 29755, replies: 27, reposts: 1, topics: ["indie", "money"], postedAt: "2026-08-26T20:35:31.000Z" }),
  p({ id: "2093083643317293319", handle: "lauradang0", body: "When you share your story and build in public, you take ownership of your own narrative instead of letting others driving it for you.", lang: "en", likes: 179, bookmarks: 34, views: 17870, replies: 27, reposts: 3, topics: ["content", "startup", "growth"], postedAt: "2026-08-27T21:10:02.000Z" }),
  p({ id: "2091938146736812461", handle: "labenz", body: "David Li started China's first hackerspace in Shanghai in 2010. Shanzhai and open-source hardware are twins. Now the open models are Chinese too.", lang: "en", likes: 1, bookmarks: 0, views: 582, replies: 0, reposts: 0, topics: ["oss", "ai", "global"], postedAt: "2026-08-24T17:18:15.000Z" }),
];

export function creatorByHandle(handle: string): Creator | undefined {
  const h = handle.replace(/^@/, "");
  return CATALOG_CREATORS.find((x) => x.handle.toLowerCase() === h.toLowerCase());
}
