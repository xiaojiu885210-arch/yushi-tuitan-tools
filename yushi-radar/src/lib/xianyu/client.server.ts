import { createHash } from "node:crypto";
import { DEMO_CATALOG, filterDemo } from "./demo-catalog";
import { findCategory } from "./categories";
import { isSuccessRet, parseSearchItems, retCodes } from "./parse";
import type { Listing, SearchPageInput, SearchPageResult, SortKey } from "./types";

const APP_KEY = "34839810";
const API = "mtop.taobao.idlemtopsearch.pc.search";
const VERSION = "1.0";
const ENDPOINT = `https://h5api.m.goofish.com/h5/${API}/${VERSION}/`;

function md5(s: string): string {
  return createHash("md5").update(s, "utf8").digest("hex");
}

export function parseCookieString(input: string): Record<string, string> {
  const out: Record<string, string> = {};
  const trimmed = input.trim();
  if (!trimmed) return out;
  if (trimmed.startsWith("{")) {
    try {
      const obj = JSON.parse(trimmed) as Record<string, unknown>;
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string") out[k] = v;
      }
      return out;
    } catch {
      /* fall through */
    }
  }
  for (const part of trimmed.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    if (key) out[key] = val;
  }
  return out;
}

export function serializeCookies(jar: Record<string, string>): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function tokenFrom(jar: Record<string, string>): string {
  return (jar["_m_h5_tk"] ?? "").split("_")[0] ?? "";
}

function mergeSetCookie(jar: Record<string, string>, lines: string[]) {
  for (const line of lines) {
    const nv = line.split(";")[0] ?? "";
    const eq = nv.indexOf("=");
    if (eq > 0) jar[nv.slice(0, eq).trim()] = nv.slice(eq + 1).trim();
  }
}

function sortPair(sort: SortKey): { sortField: string; sortValue: string; label: string } {
  if (sort === "create") return { sortField: "create", sortValue: "", label: "最新" };
  if (sort === "price_asc") return { sortField: "price", sortValue: "asc", label: "价格升序" };
  if (sort === "price_desc") return { sortField: "price", sortValue: "desc", label: "价格降序" };
  return { sortField: "", sortValue: "", label: "综合" };
}

function buildData(input: SearchPageInput): string {
  const pair = sortPair(input.sort);
  const cat = findCategory(input.categoryId);
  const goofishId = cat?.goofishId ?? "";
  const filters: string[] = [];
  if (goofishId) filters.push(`cateId:${goofishId}`);
  if (input.publishDays) filters.push(`publishDays:${input.publishDays}`);
  if (input.priceMin != null || input.priceMax != null) {
    const a = input.priceMin ?? 0;
    const b = input.priceMax ?? 999999;
    filters.push(`priceRange:${a},${b}`);
  }
  const keyword =
    input.keyword.trim() ||
    input.categoryName.trim() ||
    cat?.name ||
    "";
  const payload = {
    pageNumber: input.page,
    keyword,
    fromFilter: filters.length > 0,
    rowsPerPage: Math.min(Math.max(input.pageSize || 30, 1), 30),
    sortValue: pair.sortValue,
    sortField: pair.sortField,
    customDistance: "",
    gps: "",
    propValueStr: { searchFilter: filters.length ? `${filters.join(";")};` : "" },
    customGps: "",
    searchReqFromPage: "pcSearch",
    extraFilterValue: "{}",
    userPositionJson: "{}",
  };
  return JSON.stringify(payload);
}

function classifyError(codes: string[]): { blocked: boolean; code: string; message: string } {
  const joined = codes.join(" | ");
  if (codes.some((c) => c.includes("RGV587") || c.includes("SM::"))) {
    return {
      blocked: true,
      code: "BAXIA",
      message:
        "闲鱼风控拦截了这次请求（滑块验证）。Cookie 需来自刚登录的电脑网页版闲鱼，且服务器出口 IP 未被拉黑。可改用「导入 JSON」把浏览器网络面板里的搜索结果贴进来。",
    };
  }
  if (codes.some((c) => c.includes("TOKEN") || c.includes("SESSION") || c.includes("FAIL_SYS_SESSIONEXPIRED"))) {
    return {
      blocked: true,
      code: "TOKEN",
      message: "登录态失效。请重新打开 goofish.com，登录后再复制完整 Cookie。",
    };
  }
  if (codes.some((c) => c.includes("ILEGEL_SIGN") || c.includes("ILLEGAL_SIGN") || c.includes("SIGN"))) {
    return {
      blocked: true,
      code: "SIGN",
      message: "签名失败，多半是 _m_h5_tk 缺失或过期。请确保 Cookie 里包含 _m_h5_tk 与 _m_h5_tk_enc。",
    };
  }
  return {
    blocked: true,
    code: "API",
    message: joined || "闲鱼接口返回异常。",
  };
}

async function mtopOnce(
  jar: Record<string, string>,
  dataStr: string,
): Promise<{ json: unknown; jar: Record<string, string> }> {
  const t = String(Date.now());
  const token = tokenFrom(jar);
  const sign = md5(`${token}&${t}&${APP_KEY}&${dataStr}`);
  const params = new URLSearchParams({
    jsv: "2.7.2",
    appKey: APP_KEY,
    t,
    sign,
    v: VERSION,
    type: "originaljson",
    accountSite: "xianyu",
    dataType: "json",
    timeout: "20000",
    api: API,
    sessionOption: "AutoLoginOnly",
    spm_cnt: "a21ybx.search.0.0",
    data: dataStr,
  });
  const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Referer: "https://www.goofish.com/",
      Origin: "https://www.goofish.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Cookie: serializeCookies(jar),
    },
  });
  const setCookie =
    typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  mergeSetCookie(jar, setCookie);
  const json: unknown = await res.json();
  return { json, jar };
}

function paginate<T>(items: T[], page: number, pageSize: number): { slice: T[]; hasMore: boolean } {
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { slice, hasMore: start + pageSize < items.length };
}

export async function searchPage(input: SearchPageInput): Promise<SearchPageResult> {
  const pair = sortPair(input.sort);
  const meta = {
    keyword: input.keyword,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    sortField: pair.sortField || pair.label,
    source: input.mode === "demo" ? ("demo" as const) : ("live" as const),
  };

  if (input.mode === "demo") {
    const filtered = filterDemo(DEMO_CATALOG, {
      keyword: input.keyword,
      categoryId: input.categoryId,
      sort: input.sort,
      publishDays: input.publishDays,
      priceMin: input.priceMin,
      priceMax: input.priceMax,
    });
    const { slice, hasMore } = paginate(filtered, input.page, input.pageSize || 30);
    return {
      ok: true,
      blocked: false,
      code: "DEMO",
      message: `演示库命中 ${filtered.length} 条`,
      page: input.page,
      hasMore,
      items: slice,
      refreshedCookie: null,
    };
  }

  const cookie = input.cookie.trim();
  if (!cookie) {
    return {
      ok: false,
      blocked: true,
      code: "NO_COOKIE",
      message: "还没有接入 Cookie。请先到「接入」页粘贴，或改用演示采集。",
      page: input.page,
      hasMore: false,
      items: [],
      refreshedCookie: null,
    };
  }

  const jar = parseCookieString(cookie);
  const dataStr = buildData(input);

  try {
    let { json, jar: nextJar } = await mtopOnce({ ...jar }, dataStr);
    let codes = retCodes(json);

    const needRetry =
      codes.some((c) => c.includes("TOKEN") || c.includes("SIGN") || c.includes("FAIL_SYS")) &&
      tokenFrom(nextJar) &&
      tokenFrom(nextJar) !== tokenFrom(jar);

    if (needRetry) {
      const again = await mtopOnce(nextJar, dataStr);
      json = again.json;
      nextJar = again.jar;
      codes = retCodes(json);
    }

    if (!isSuccessRet(codes)) {
      const err = classifyError(codes);
      return {
        ok: false,
        blocked: err.blocked,
        code: err.code,
        message: err.message,
        page: input.page,
        hasMore: false,
        items: [],
        refreshedCookie: serializeCookies(nextJar),
      };
    }

    const items: Listing[] = parseSearchItems(json, { ...meta, source: "live" });
    return {
      ok: true,
      blocked: false,
      code: "SUCCESS",
      message: `第 ${input.page} 页 ${items.length} 条`,
      page: input.page,
      hasMore: items.length >= (input.pageSize || 30),
      items,
      refreshedCookie: serializeCookies(nextJar),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "网络错误";
    return {
      ok: false,
      blocked: true,
      code: "NETWORK",
      message: `请求闲鱼失败：${msg}`,
      page: input.page,
      hasMore: false,
      items: [],
      refreshedCookie: null,
    };
  }
}

export function parseImportedJson(
  raw: string,
  meta: { keyword: string; categoryId: string; categoryName: string },
): Listing[] {
  let parsed: unknown = JSON.parse(raw);
  if (typeof parsed === "string") parsed = JSON.parse(parsed);
  return parseSearchItems(parsed, {
    keyword: meta.keyword,
    categoryId: meta.categoryId,
    categoryName: meta.categoryName,
    sortField: "import",
    source: "import",
  });
}
