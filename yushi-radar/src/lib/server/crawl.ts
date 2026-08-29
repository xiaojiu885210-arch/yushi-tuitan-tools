import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SearchPageResult } from "@/lib/xianyu/types";

const searchSchema = z.object({
  cookie: z.string(),
  keyword: z.string(),
  categoryId: z.string(),
  categoryName: z.string(),
  sort: z.enum(["default", "create", "price_asc", "price_desc"]),
  page: z.number(),
  pageSize: z.number(),
  publishDays: z.number().nullable(),
  priceMin: z.number().nullable(),
  priceMax: z.number().nullable(),
  mode: z.enum(["live", "demo"]),
});

export const searchXianyuPage = createServerFn({ method: "POST" })
  .validator(searchSchema)
  .handler(async ({ data }): Promise<SearchPageResult> => {
    const { searchPage } = await import("@/lib/xianyu/client.server");
    return searchPage(data);
  });

export const importSearchJson = createServerFn({ method: "POST" })
  .validator(
    z.object({
      raw: z.string().min(2),
      keyword: z.string(),
      categoryId: z.string(),
      categoryName: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { ingestToListings } = await import("@/lib/xianyu/ingest");
    try {
      const items = ingestToListings(data.raw, {
        keyword: data.keyword,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
      });
      return { ok: true as const, items, message: `解析到 ${items.length} 条` };
    } catch (e) {
      const message = e instanceof Error ? e.message : "JSON 无法解析";
      return { ok: false as const, items: [], message };
    }
  });

export const inspectCookie = createServerFn({ method: "POST" })
  .validator(z.object({ cookie: z.string() }))
  .handler(async ({ data }) => {
    const { parseCookieString } = await import("@/lib/xianyu/client.server");
    const jar = parseCookieString(data.cookie);
    const keys = Object.keys(jar);
    const hasTk = Boolean(jar["_m_h5_tk"]);
    const hasEnc = Boolean(jar["_m_h5_tk_enc"]);
    const token = (jar["_m_h5_tk"] ?? "").split("_")[0] ?? "";
    return {
      keyCount: keys.length,
      hasTk,
      hasEnc,
      tokenPrefix: token ? `${token.slice(0, 6)}…` : "",
      looksValid: hasTk && keys.length >= 2,
    };
  });
