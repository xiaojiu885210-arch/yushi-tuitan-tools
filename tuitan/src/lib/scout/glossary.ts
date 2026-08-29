/** 创业向中英对照。X 对中文检索弱，每条都会同时扩出英文车道。 */

export type Topic = {
  id: string;
  name: string;
  zh: string[];
  en: string[];
  tags: string[];
};

export const TOPICS: Topic[] = [
  {
    id: "startup",
    name: "创业",
    zh: ["创业", "创业者", "创始人", "搞事情", "从0到1", "创业公司"],
    en: ["startup", "founder", "entrepreneur", "founders", "venture"],
    tags: ["#startup", "#Founder", "#创业"],
  },
  {
    id: "indie",
    name: "独立开发",
    zh: ["独立开发", "独立开发者", "一人公司", "个人开发", "独立产品"],
    en: ["indie hacker", "indiehackers", "solopreneur", "build in public", "solo founder"],
    tags: ["#IndieHackers", "#buildinpublic", "#独立开发"],
  },
  {
    id: "global",
    name: "出海",
    zh: ["出海", "出海产品", "产品出海", "海外市场", "国际化"],
    en: ["go global", "international", "overseas", "global market", "export product"],
    tags: ["#出海", "#global"],
  },
  {
    id: "ai",
    name: "AI",
    zh: ["人工智能", "大模型", "智能体", "AI 产品", "AI 创业"],
    en: ["AI", "LLM", "agent", "artificial intelligence", "AI startup"],
    tags: ["#AI", "#LLM", "#BuildInPublic"],
  },
  {
    id: "saas",
    name: "SaaS",
    zh: ["订阅", "工具产品", "B端", "软件服务"],
    en: ["SaaS", "B2B", "subscription", "software as a service", "MRR"],
    tags: ["#SaaS", "#MRR"],
  },
  {
    id: "money",
    name: "搞钱",
    zh: ["搞钱", "变现", "赚钱", "副业", "被动收入", "现金流"],
    en: ["make money", "monetize", "revenue", "side hustle", "cashflow", "profit"],
    tags: ["#搞钱", "#SideHustle"],
  },
  {
    id: "growth",
    name: "增长",
    zh: ["增长", "获客", "分发", "投放", "用户增长", "流量"],
    en: ["growth", "distribution", "acquisition", "marketing", "SEO", "content"],
    tags: ["#growth", "#SEO"],
  },
  {
    id: "funding",
    name: "融资",
    zh: ["融资", "投资人", "风险投资", "种子轮", "估值"],
    en: ["funding", "venture capital", "seed round", "investor", "YC", "raise"],
    tags: ["#funding", "#YC"],
  },
  {
    id: "content",
    name: "内容",
    zh: ["内容创业", "自媒体", "短视频", "写公开", "个人品牌"],
    en: ["content", "creator", "personal brand", "newsletter", "audience"],
    tags: ["#Creator", "#Content"],
  },
  {
    id: "oss",
    name: "开源",
    zh: ["开源", "开源项目", "黑客松", "开发者工具"],
    en: ["open source", "hackathon", "devtools", "github"],
    tags: ["#opensource", "#hackathon"],
  },
  {
    id: "product",
    name: "产品",
    zh: ["产品", "打磨", "上线", "需求", "PMF"],
    en: ["product", "ship", "PMF", "launch", "MVP"],
    tags: ["#build", "#ship"],
  },
  {
    id: "web3",
    name: "Web3",
    zh: ["加密", "链上", "Web3", "区块链"],
    en: ["crypto", "web3", "onchain", "blockchain"],
    tags: ["#crypto", "#web3"],
  },
];

export const EXTRA_PAIRS: [string, string[]][] = [
  ["播放", ["views", "impressions"]],
  ["点赞", ["likes", "faves"]],
  ["收藏", ["bookmarks", "saves"]],
  ["博主", ["creator", "account", "influencer"]],
  ["账号", ["account", "profile"]],
  ["工具", ["tool", "utility", "app"]],
  ["源码", ["source code", "github"]],
  ["小程序", ["mini app", "wechat mini program"]],
  ["油猴", ["userscript", "tampermonkey"]],
  ["自动化", ["automation", "workflow"]],
  ["采集", ["scrape", "crawler", "harvest"]],
  ["闲鱼", ["Xianyu", "goofish", "secondhand"]],
];

export function hasCjk(s: string): boolean {
  return /[\u3400-\u9fff]/.test(s);
}

export function tokenize(q: string): string[] {
  const out: string[] = [];
  const cleaned = q.trim().toLowerCase();
  if (!cleaned) return out;
  for (const part of cleaned.split(/[\s,，、|/]+/)) {
    if (!part) continue;
    out.push(part);
    if (hasCjk(part) && part.length >= 4) {
      for (let i = 0; i < part.length - 1; i += 1) out.push(part.slice(i, i + 2));
    }
  }
  return [...new Set(out)];
}

export function expandTerms(q: string): { zh: string[]; en: string[]; tags: string[]; topics: string[] } {
  const tokens = tokenize(q);
  const zh = new Set<string>();
  const en = new Set<string>();
  const tags = new Set<string>();
  const topics = new Set<string>();
  if (q.trim()) {
    if (hasCjk(q)) zh.add(q.trim());
    else en.add(q.trim());
  }
  for (const t of TOPICS) {
    const hit =
      tokens.some((tok) => t.zh.some((z) => z.includes(tok) || tok.includes(z))) ||
      tokens.some((tok) => t.en.some((e) => e.toLowerCase().includes(tok) || tok.includes(e.toLowerCase())));
    if (hit || !q.trim()) {
      if (hit) {
        t.zh.forEach((z) => zh.add(z));
        t.en.forEach((e) => en.add(e));
        t.tags.forEach((g) => tags.add(g));
        topics.add(t.id);
      }
    }
  }
  for (const [z, ens] of EXTRA_PAIRS) {
    if (tokens.some((tok) => z.includes(tok) || tok.includes(z))) {
      zh.add(z);
      ens.forEach((e) => en.add(e));
    }
  }
  if (!topics.size && q.trim()) {
    // 默认按创业圈全面铺开，避免只命中字面
    for (const t of TOPICS.slice(0, 6)) {
      t.zh.forEach((z) => zh.add(z));
      t.en.forEach((e) => en.add(e));
      t.tags.forEach((g) => tags.add(g));
      topics.add(t.id);
    }
    if (hasCjk(q)) zh.add(q.trim());
    else en.add(q.trim());
  }
  const NEIGHBORS: Record<string, string[]> = {
    startup: ["indie", "global", "ai", "funding", "money"],
    indie: ["saas", "growth", "money", "startup", "product"],
    global: ["startup", "indie", "saas", "ai"],
    ai: ["startup", "indie", "product", "oss"],
    saas: ["indie", "growth", "money"],
    money: ["indie", "startup", "content"],
    growth: ["content", "saas", "indie"],
    funding: ["startup", "ai"],
    content: ["growth", "money"],
    oss: ["ai", "product"],
    product: ["indie", "saas"],
    web3: ["startup", "money"],
  };

  const extraIds = new Set<string>();
  for (const id of topics) {
    for (const n of NEIGHBORS[id] ?? []) extraIds.add(n);
  }
  for (const id of extraIds) {
    const t = TOPICS.find((x) => x.id === id);
    if (!t) continue;
    t.en.forEach((e) => en.add(e));
    t.tags.forEach((g) => tags.add(g));
    topics.add(t.id);
  }
  return {
    zh: [...zh].slice(0, 16),
    en: [...en].slice(0, 16),
    tags: [...tags].slice(0, 12),
    topics: [...topics],
  };
}
