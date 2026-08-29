import { CATEGORIES, type Category } from "./categories";
import type { Listing } from "./types";

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AREAS = ["上海", "杭州", "深圳", "北京", "广州", "成都", "武汉", "南京", "苏州", "重庆", "西安", "长沙", "厦门", "青岛"];
const CONDITIONS = ["全新", "几乎全新", "轻微使用", "使用痕迹"];

type SeedItem = {
  title: string;
  yuan: number;
  want: number;
  categoryId: string;
  daysAgo: number;
  area?: string;
  seller?: string;
};

const SOFTWARE: SeedItem[] = [
  { title: "闲鱼类目采集工具 Cookie 接入 价格排行导出", yuan: 168, want: 214, categoryId: "software", daysAgo: 0.4 },
  { title: "闲鱼店铺自动回复 + 自动发货系统 源码", yuan: 298, want: 176, categoryId: "software", daysAgo: 1.2 },
  { title: "闲鱼卡密发卡系统 支持卡券自动发货", yuan: 128, want: 143, categoryId: "software", daysAgo: 0.8 },
  { title: "闲鱼铺货搬家助手 淘宝商品一键上架", yuan: 198, want: 97, categoryId: "software", daysAgo: 2.1 },
  { title: "闲鱼关键词监控 降价提醒 本地运行", yuan: 88, want: 121, categoryId: "software", daysAgo: 0.3 },
  { title: "Excel 财务对账插件 发票明细自动汇总", yuan: 69, want: 88, categoryId: "software", daysAgo: 3.4 },
  { title: "批量去水印工具 本地处理 不上传", yuan: 39, want: 256, categoryId: "software", daysAgo: 0.6 },
  { title: "油猴脚本合集 电商辅助 可改源码", yuan: 28, want: 189, categoryId: "software", daysAgo: 1.7 },
  { title: "PDF 转 Word / Excel 桌面工具 终身", yuan: 49, want: 132, categoryId: "software", daysAgo: 4.2 },
  { title: "剪映草稿批量导出 字幕提取工具", yuan: 58, want: 74, categoryId: "software", daysAgo: 2.8 },
  { title: "闲鱼客服话术库 + 自动回复模板", yuan: 36, want: 65, categoryId: "software", daysAgo: 5.1 },
  { title: "多平台商品标题生成 类目词库", yuan: 79, want: 54, categoryId: "software", daysAgo: 1.1 },
  { title: "Windows 定时备份脚本 图形界面", yuan: 42, want: 33, categoryId: "software", daysAgo: 6.3 },
  { title: "表格转商品详情页 闲鱼主图模板", yuan: 25, want: 47, categoryId: "software", daysAgo: 0.9 },
  { title: "浏览器 Cookie 管理器 多账号隔离", yuan: 56, want: 81, categoryId: "software", daysAgo: 3.0 },
  { title: "订单导出对账 CSV 一键出表", yuan: 32, want: 29, categoryId: "software", daysAgo: 7.4 },
  { title: "采集结果清洗去重 价格分位统计", yuan: 96, want: 62, categoryId: "software", daysAgo: 1.5 },
  { title: "闲鱼类目树对照表 + 热搜词库 2026", yuan: 18, want: 203, categoryId: "software", daysAgo: 0.2 },
  { title: "自动上架定时发布 本地客户端", yuan: 158, want: 91, categoryId: "software", daysAgo: 2.4 },
  { title: "竞品价格看板 支持多关键词订阅", yuan: 188, want: 77, categoryId: "software", daysAgo: 0.7 },
  { title: "发卡网对接闲鱼 订单同步插件", yuan: 218, want: 58, categoryId: "software", daysAgo: 3.6 },
  { title: "图片压缩加水印批量处理", yuan: 22, want: 44, categoryId: "software", daysAgo: 8.1 },
  { title: "聊天记录导出归档 本地加密", yuan: 45, want: 27, categoryId: "software", daysAgo: 4.8 },
  { title: "验证码识别辅助 自用小工具", yuan: 68, want: 39, categoryId: "software", daysAgo: 2.2 },
];

const SOURCE: SeedItem[] = [
  { title: "闲鱼风格商品详情页模板 可商用", yuan: 39, want: 84, categoryId: "source", daysAgo: 1.3 },
  { title: "发卡网站源码 PHP + 管理后台", yuan: 166, want: 112, categoryId: "source", daysAgo: 2.6 },
  { title: "微信小程序二手交易模板 去中心化演示", yuan: 268, want: 73, categoryId: "source", daysAgo: 0.5 },
  { title: "React 后台仪表盘模板 图表齐全", yuan: 88, want: 51, categoryId: "source", daysAgo: 3.9 },
  { title: "个人导航站源码 书签管理", yuan: 19, want: 96, categoryId: "source", daysAgo: 5.5 },
];

const SERVICE: SeedItem[] = [
  { title: "代写 Excel 函数 / 表格自动化 按次", yuan: 30, want: 48, categoryId: "service", daysAgo: 1.0 },
  { title: "小程序上架协助 资质咨询", yuan: 120, want: 22, categoryId: "service", daysAgo: 4.0 },
  { title: "闲鱼主图设计 详情页排版 一套", yuan: 50, want: 61, categoryId: "service", daysAgo: 2.0 },
];

const OTHER_TITLES: Record<string, string[]> = {
  phone: ["iPhone 13 128G 电池89 国行", "小米 14 远山蓝 12+256", "红米 K70 游戏机 在保"],
  tablet: ["iPad Air 5 64G wifi", "华为 MatePad 11 学习机"],
  computer: ["ThinkPad X1 碳纤 i7 16G", "MacBook Air M2 8+256", "二手组装主机 3060 小机箱"],
  audio: ["索尼 WH-1000XM4 降噪", "佳能 50mm 1.8 STM", "AirPods Pro 2 有票"],
  kitchen: ["空气炸锅 5L 几乎全新", "九阳破壁机 带发票"],
  "life-app": ["石头扫地机 T7 配件齐全", "戴森吹风机 国行"],
  women: ["优衣库摇粒绒外套 M", "连衣裙 夏季 几乎没穿"],
  men: ["优衣库 圆领卫衣 L 黑色", "休闲西裤 32 码"],
  shoes: ["NB 530 42.5 九成新", "耐克 Dunk Low 41"],
  bag: ["北极狐双肩包 20L", "公文皮包 通勤"],
  skincare: ["兰蔻粉水 125ml 剩大半", "修丽可 CE 精华"],
  makeup: ["NARS 口红 尖沙咀", "TF 眼影盘 用过两次"],
  furniture: ["实木书桌 1.2 米 自提", "人体工学椅 网面"],
  decor: ["台灯 无极调光", "收纳柜 抽屉五层"],
  fitness: ["哑铃一对 10kg", "瑜伽垫 加厚 8mm"],
  outdoor: ["骆驼帐篷 三人", "登山杖 一对"],
  textbook: ["考研数学 李永乐 全套", "公考行测真题 近五年"],
  hobby: ["民谣吉他 41 寸 初学", "手办 未开封"],
  toy: ["乐高城市组 缺件说明", "盲盒 一整端盒"],
  auto: ["行车记录仪 前后双录", "车载无线充"],
  pet: ["猫爬架 大号 自提", "狗粮 未拆 10kg"],
  food: ["蛋白粉 2磅 开封少量", "茶叶 岩茶 自饮"],
  console: ["Switch OLED 国行 续航版", "PS5 光驱版 双手柄"],
  "game-acc": ["Steam 库存整理 游戏钥匙", "主机会员 自用转让咨询"],
  card: ["视频会员月卡 正规渠道", "网盘会员 年卡"],
};

function toListing(item: SeedItem, idx: number, rand: () => number): Listing {
  const cat = CATEGORIES.find((c) => c.id === item.categoryId) as Category;
  const published = new Date(Date.now() - item.daysAgo * 86400000);
  const id = `demo-${item.categoryId}-${idx}`;
  return {
    id,
    title: item.title,
    priceFen: Math.round(item.yuan * 100),
    wantCount: item.want,
    picUrl: null,
    area: item.area ?? AREAS[Math.floor(rand() * AREAS.length)]!,
    sellerNick: item.seller ?? `店家${1000 + idx}`,
    sellerId: `s${20000 + idx}`,
    categoryId: cat.id,
    categoryName: cat.name,
    keyword: cat.name,
    sortField: "demo",
    conditionLabel: CONDITIONS[Math.floor(rand() * CONDITIONS.length)]!,
    publishedAt: published.toISOString(),
    itemUrl: `https://www.goofish.com/item?id=${id}`,
    source: "demo",
    firstSeenAt: published.toISOString(),
    lastSeenAt: new Date().toISOString(),
  };
}

export function buildDemoCatalog(): Listing[] {
  const rand = mulberry32(20260829);
  const out: Listing[] = [];
  let i = 0;
  for (const row of [...SOFTWARE, ...SOURCE, ...SERVICE]) {
    out.push(toListing(row, i++, rand));
  }
  for (const cat of CATEGORIES) {
    const titles = OTHER_TITLES[cat.id];
    if (!titles) continue;
    titles.forEach((title, k) => {
      const yuanBase =
        cat.id === "phone" ? 1800 :
        cat.id === "computer" ? 3200 :
        cat.id === "console" ? 1400 :
        cat.id === "tablet" ? 1600 :
        40 + Math.round(rand() * 260);
      const jitter = 0.85 + rand() * 0.35;
      out.push(
        toListing(
          {
            title,
            yuan: Math.round(yuanBase * jitter),
            want: 8 + Math.round(rand() * 180),
            categoryId: cat.id,
            daysAgo: rand() * 12,
          },
          i++,
          rand,
        ),
      );
      void k;
    });
  }
  return out;
}

export function keywordMatch(blobRaw: string, keyword: string): boolean {
  const blob = blobRaw.toLowerCase();
  const t = keyword.trim().toLowerCase();
  if (!t) return true;
  if (blob.includes(t)) return true;
  const spaced = t.split(/\s+/).filter(Boolean);
  if (spaced.length > 1 && spaced.every((p) => blob.includes(p))) return true;
  if (/^[\u4e00-\u9fff]+$/.test(t) && t.length >= 4) {
    const parts: string[] = [];
    for (let i = 0; i < t.length; i += 2) {
      const p = t.slice(i, i + 2);
      if (p.length === 2) parts.push(p);
    }
    if (parts.length && parts.every((p) => blob.includes(p))) return true;
  }
  return false;
}

export function filterDemo(
  items: Listing[],
  opts: {
    keyword: string;
    categoryId: string;
    sort: "default" | "create" | "price_asc" | "price_desc";
    publishDays: number | null;
    priceMin: number | null;
    priceMax: number | null;
  },
): Listing[] {
  const kw = opts.keyword.trim().toLowerCase();
  let rows = items.filter((it) => {
    if (opts.categoryId) {
      if (it.categoryId !== opts.categoryId) {
        const cat = CATEGORIES.find((c) => c.id === opts.categoryId);
        const childIds = CATEGORIES.filter((c) => c.parentId === opts.categoryId).map((c) => c.id);
        if (it.categoryId !== cat?.id && !childIds.includes(it.categoryId ?? "")) return false;
      }
    }
    if (kw) {
      const blob = `${it.title} ${it.categoryName} ${it.keyword}`;
      if (!keywordMatch(blob, opts.keyword)) return false;
    }
    if (opts.publishDays && it.publishedAt) {
      const age = Date.now() - new Date(it.publishedAt).getTime();
      if (age > opts.publishDays * 86400000) return false;
    }
    const yuan = it.priceFen / 100;
    if (opts.priceMin != null && yuan < opts.priceMin) return false;
    if (opts.priceMax != null && yuan > opts.priceMax) return false;
    return true;
  });
  if (opts.sort === "create") {
    rows = [...rows].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  } else if (opts.sort === "price_asc") {
    rows = [...rows].sort((a, b) => a.priceFen - b.priceFen);
  } else if (opts.sort === "price_desc") {
    rows = [...rows].sort((a, b) => b.priceFen - a.priceFen);
  } else {
    rows = [...rows].sort((a, b) => b.wantCount - a.wantCount);
  }
  return rows;
}

export const DEMO_CATALOG = buildDemoCatalog();
