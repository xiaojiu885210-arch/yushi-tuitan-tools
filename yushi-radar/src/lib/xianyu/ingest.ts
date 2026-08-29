import { normalizePriceFen, parseSearchItems } from "./parse";
import type { Listing } from "./types";

export type LooseItem = {
  id: string;
  title: string;
  price?: number | string;
  priceFen?: number;
  want?: number | string;
  wantCount?: number;
  area?: string;
  url?: string;
  pic?: string;
  picUrl?: string;
  seller?: string;
};

type Meta = { keyword: string; categoryId: string; categoryName: string };

function nowIso() {
  return new Date().toISOString();
}

export function looseToListing(it: LooseItem, meta: Meta): Listing | null {
  const id = String(it.id ?? "").trim();
  const title = String(it.title ?? "").trim();
  if (!id || !title) return null;
  const priceFen =
    it.priceFen != null
      ? Number(it.priceFen)
      : normalizePriceFen(it.price ?? 0);
  const want = Number(it.wantCount ?? it.want ?? 0) || 0;
  const ts = nowIso();
  return {
    id,
    title: title.slice(0, 120),
    priceFen: Number.isFinite(priceFen) ? priceFen : 0,
    wantCount: want,
    picUrl: it.picUrl || it.pic || null,
    area: it.area || null,
    sellerNick: it.seller || null,
    sellerId: null,
    categoryId: meta.categoryId || null,
    categoryName: meta.categoryName || null,
    keyword: meta.keyword || null,
    sortField: "browser",
    conditionLabel: null,
    publishedAt: ts,
    itemUrl: it.url || `https://www.goofish.com/item?id=${encodeURIComponent(id)}`,
    source: "import",
    firstSeenAt: ts,
    lastSeenAt: ts,
  };
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function fromBookmarkItems(raw: unknown, meta: Meta): Listing[] {
  if (!Array.isArray(raw)) return [];
  const out: Listing[] = [];
  for (const row of raw) {
    const r = asRecord(row);
    if (!r) continue;
    const listing = looseToListing(
      {
        id: String(r.id ?? ""),
        title: String(r.title ?? ""),
        price: (r.price as number) ?? (r.priceFen as number),
        priceFen: typeof r.priceFen === "number" ? r.priceFen : undefined,
        want: (r.want as number) ?? (r.wantCount as number),
        area: typeof r.area === "string" ? r.area : undefined,
        url: typeof r.url === "string" ? r.url : undefined,
        pic: typeof r.pic === "string" ? r.pic : typeof r.picUrl === "string" ? r.picUrl : undefined,
        seller: typeof r.seller === "string" ? r.seller : undefined,
      },
      meta,
    );
    if (listing) out.push(listing);
  }
  return out;
}

export function extractFromDocument(root: ParentNode): LooseItem[] {
  const items: LooseItem[] = [];
  const seen = new Set<string>();
  const links = root.querySelectorAll('a[href*="item"]');
  for (const a of Array.from(links)) {
    const href = (a as HTMLAnchorElement).href || a.getAttribute("href") || "";
    const id = href.match(/[?&]id=(\d{5,})/)?.[1];
    if (!id || seen.has(id)) continue;
    let node: Element = a;
    for (let i = 0; i < 6 && node.parentElement; i += 1) {
      const len = (node.textContent || "").replace(/\s+/g, " ").trim().length;
      if (len > 18 && len < 500) break;
      node = node.parentElement;
    }
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    const img = a.querySelector("img");
    let title =
      a.getAttribute("title") ||
      img?.getAttribute("alt") ||
      "";
    if (!title) {
      title = text
        .replace(/[¥￥]\s*[\d.]+.*$/, "")
        .replace(/\d+\s*人想要.*$/, "")
        .replace(/想要\s*\d+.*$/, "")
        .trim();
    }
    title = title.split(" ").filter((s) => s.length > 1).slice(0, 16).join(" ").slice(0, 80);
    if (!title || title.length < 2) continue;
    seen.add(id);
    const pm = text.match(/[¥￥]\s*([\d.]+)/);
    const wm = text.match(/(\d+)\s*人想要/) || text.match(/想要\s*(\d+)/);
    const areaM = text.match(
      /(北京|上海|广州|深圳|杭州|成都|重庆|武汉|南京|苏州|西安|长沙|天津|郑州|青岛|厦门|合肥|福州|宁波|无锡|东莞|佛山|沈阳|大连|昆明|南昌|哈尔滨)/,
    );
    items.push({
      id,
      title,
      price: pm ? Number(pm[1]) : 0,
      want: wm ? Number(wm[1]) : 0,
      area: areaM?.[1],
      url: href.startsWith("http") ? href : `https://www.goofish.com/item?id=${id}`,
      pic: img?.getAttribute("src") || undefined,
    });
  }
  return items;
}

export function extractFromHtml(html: string): LooseItem[] {
  if (typeof DOMParser === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  return extractFromDocument(doc);
}

export function ingestToListings(raw: string, meta: Meta): Listing[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed: unknown = JSON.parse(trimmed);
    const rec = asRecord(parsed);
    if (rec && (rec.source === "yushi-bookmarklet" || Array.isArray(rec.items))) {
      const list = fromBookmarkItems(rec.items, meta);
      if (list.length) return list;
    }
    if (Array.isArray(parsed)) {
      const list = fromBookmarkItems(parsed, meta);
      if (list.length) return list;
    }
    const mtop = parseSearchItems(parsed, {
      keyword: meta.keyword,
      categoryId: meta.categoryId,
      categoryName: meta.categoryName,
      sortField: "import",
      source: "import",
    });
    if (mtop.length) return mtop;
  } catch {
    /* not json */
  }

  if (trimmed.includes("<") || trimmed.includes("goofish.com") || trimmed.includes("item?id=")) {
    return extractFromHtml(trimmed)
      .map((it) => looseToListing(it, meta))
      .filter((x): x is Listing => Boolean(x));
  }
  return [];
}

export function ingestMessage(data: unknown, meta: Meta): Listing[] {
  const rec = asRecord(data);
  if (!rec) return [];
  if (rec.source !== "yushi-bookmarklet") return [];
  return fromBookmarkItems(rec.items, meta);
}
