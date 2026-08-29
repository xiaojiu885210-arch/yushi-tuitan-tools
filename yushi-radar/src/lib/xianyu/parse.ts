import type { Listing, ListingSource } from "./types";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function str(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** 闲鱼价格可能是元、分、或带小数的字符串。统一存「分」。 */
export function normalizePriceFen(raw: unknown): number {
  if (raw == null) return 0;
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw < 0) return 0;
    if (Number.isInteger(raw) && raw >= 1000 && raw % 10 === 0 && raw < 1e8) {
      // 常见：19900 = 199 元（分）
      return raw;
    }
    if (raw < 1e6) return Math.round(raw * 100);
    return Math.round(raw);
  }
  const s = String(raw).replace(/[,¥￥元]/g, "").trim();
  if (!s) return 0;
  if (s.includes(".")) return Math.round(Number(s) * 100) || 0;
  const n = Number(s);
  if (!Number.isFinite(n)) return 0;
  if (n >= 1000 && n % 10 === 0) return n;
  return Math.round(n * 100);
}

function pick(obj: Record<string, unknown> | null, keys: string[]): unknown {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

function deepFindItem(row: unknown): Record<string, unknown> | null {
  const rec = asRecord(row);
  if (!rec) return null;
  const data = asRecord(rec.data) ?? rec;
  const item = asRecord(data.item) ?? data;
  return item;
}

export function parseSearchItems(
  payload: unknown,
  meta: {
    keyword: string;
    categoryId: string;
    categoryName: string;
    sortField: string;
    source: ListingSource;
  },
): Listing[] {
  const root = asRecord(payload);
  if (!root) return [];
  let data: unknown = root.data ?? root;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = {};
    }
  }
  const dataRec = asRecord(data) ?? {};
  const resultList =
    asArray(dataRec.resultList) ||
    asArray(dataRec.items) ||
    asArray(dataRec.itemList) ||
    asArray(root.resultList) ||
    (Array.isArray(payload) ? payload : []);

  const now = new Date().toISOString();
  const out: Listing[] = [];

  for (const row of resultList) {
    const item = deepFindItem(row);
    if (!item) continue;
    const main = asRecord(item.main) ?? item;
    const ex = asRecord(main.exContent) ?? asRecord(item.exContent) ?? main;
    const click = asRecord(main.clickParam) ?? asRecord(item.clickParam);
    const args = asRecord(click?.args) ?? {};
    const id =
      str(pick(args, ["id", "itemId"])) ||
      str(pick(item, ["id", "itemId"])) ||
      str(pick(ex, ["itemId", "id"]));
    const title =
      str(pick(ex, ["title", "detailTitle"])) ||
      str(pick(args, ["title"])) ||
      str(pick(item, ["title"]));
    if (!id || !title) continue;

    const priceFen = normalizePriceFen(
      pick(ex, ["price", "soldPrice", "nowPrice"]) ??
        pick(args, ["price"]) ??
        pick(item, ["price"]),
    );
    const want =
      num(pick(ex, ["wantNum", "want", "favNum", "collectNum"])) ??
      num(pick(args, ["want"])) ??
      0;
    const pic =
      str(pick(ex, ["picUrl", "pic", "image", "mainPic"])) ||
      str(pick(item, ["picUrl"]));
    const area = str(pick(ex, ["area", "location", "city"])) || str(pick(args, ["area"]));
    const seller =
      str(pick(ex, ["userNickName", "nick", "sellerNick"])) ||
      str(pick(args, ["sellerNick"]));
    const sellerId = str(pick(ex, ["userId", "sellerId"])) || str(pick(args, ["sellerId"]));
    const publishedRaw =
      pick(ex, ["publishTime", "gmtCreate", "onlineTime"]) ??
      pick(args, ["publishTime"]);
    let publishedAt: string | null = null;
    const pn = num(publishedRaw);
    if (pn && pn > 1e11) publishedAt = new Date(pn).toISOString();
    else if (pn && pn > 1e9) publishedAt = new Date(pn * 1000).toISOString();
    else if (typeof publishedRaw === "string" && publishedRaw) {
      const d = new Date(publishedRaw);
      if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
    }

    out.push({
      id,
      title,
      priceFen,
      wantCount: want,
      picUrl: pic,
      area,
      sellerNick: seller,
      sellerId,
      categoryId: meta.categoryId || null,
      categoryName: meta.categoryName || str(pick(ex, ["fishTags", "categoryName"])),
      keyword: meta.keyword || null,
      sortField: meta.sortField || null,
      conditionLabel: str(pick(ex, ["stuffStatus", "condition", "tagList"])),
      publishedAt,
      itemUrl: `https://www.goofish.com/item?id=${encodeURIComponent(id)}`,
      source: meta.source,
      firstSeenAt: now,
      lastSeenAt: now,
    });
  }
  return out;
}

export function retCodes(payload: unknown): string[] {
  const root = asRecord(payload);
  const ret = root?.ret;
  if (Array.isArray(ret)) return ret.map((x) => String(x));
  if (typeof ret === "string") return [ret];
  return [];
}

export function isSuccessRet(codes: string[]): boolean {
  return codes.some((c) => c.startsWith("SUCCESS"));
}
