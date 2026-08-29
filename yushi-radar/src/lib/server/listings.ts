import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { DEMO_CATALOG } from "@/lib/xianyu/demo-catalog";
import { CATEGORIES } from "@/lib/xianyu/categories";
import { computeStats } from "@/lib/xianyu/stats";
import type { CategoryStat, CrawlJob, Listing, MarketStats } from "@/lib/xianyu/types";

function expandCats(id: string): string {
  if (!id) return "";
  return [id, ...CATEGORIES.filter((c) => c.parentId === id).map((c) => c.id)].join(",");
}

type ListingRow = {
  id: string;
  title: string;
  price_fen: number;
  want_count: number;
  pic_url: string | null;
  area: string | null;
  seller_nick: string | null;
  seller_id: string | null;
  category_id: string | null;
  category_name: string | null;
  keyword: string | null;
  sort_field: string | null;
  condition_label: string | null;
  published_at: string | null;
  item_url: string | null;
  source: string;
  first_seen_at: string;
  last_seen_at: string;
};

function toListing(row: ListingRow): Listing {
  return {
    id: row.id,
    title: row.title,
    priceFen: Number(row.price_fen),
    wantCount: Number(row.want_count),
    picUrl: row.pic_url,
    area: row.area,
    sellerNick: row.seller_nick,
    sellerId: row.seller_id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    keyword: row.keyword,
    sortField: row.sort_field,
    conditionLabel: row.condition_label,
    publishedAt: row.published_at,
    itemUrl: row.item_url,
    source: (row.source as Listing["source"]) || "live",
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
  };
}

async function upsertMany(items: Listing[]): Promise<number> {
  if (items.length === 0) return 0;
  const sql = await getSql();
  let n = 0;
  for (const it of items) {
    await sql`
      insert into listings (
        id, title, price_fen, want_count, pic_url, area, seller_nick, seller_id,
        category_id, category_name, keyword, sort_field, condition_label,
        published_at, item_url, source, first_seen_at, last_seen_at
      ) values (
        ${it.id}, ${it.title}, ${it.priceFen}, ${it.wantCount}, ${it.picUrl},
        ${it.area}, ${it.sellerNick}, ${it.sellerId}, ${it.categoryId},
        ${it.categoryName}, ${it.keyword}, ${it.sortField}, ${it.conditionLabel},
        ${it.publishedAt}, ${it.itemUrl}, ${it.source}, ${it.firstSeenAt}, ${it.lastSeenAt}
      )
      on conflict (id) do update set
        title = excluded.title,
        price_fen = excluded.price_fen,
        want_count = excluded.want_count,
        pic_url = coalesce(excluded.pic_url, listings.pic_url),
        area = coalesce(excluded.area, listings.area),
        seller_nick = coalesce(excluded.seller_nick, listings.seller_nick),
        seller_id = coalesce(excluded.seller_id, listings.seller_id),
        category_id = coalesce(excluded.category_id, listings.category_id),
        category_name = coalesce(excluded.category_name, listings.category_name),
        keyword = coalesce(excluded.keyword, listings.keyword),
        sort_field = excluded.sort_field,
        condition_label = coalesce(excluded.condition_label, listings.condition_label),
        published_at = coalesce(excluded.published_at, listings.published_at),
        item_url = coalesce(excluded.item_url, listings.item_url),
        last_seen_at = excluded.last_seen_at
    `;
    n += 1;
  }
  return n;
}

export const ensureSeeded = createServerFn({ method: "POST" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*)::int as n from listings`;
  const n = Number(rows[0]?.n ?? 0);
  if (n > 0) return { seeded: false, count: n };
  await upsertMany(DEMO_CATALOG);
  await sql`
    insert into crawl_jobs (
      keyword, category_id, category_name, sort_label,
      pages_requested, pages_done, item_count, status, message, source
    ) values (
      ${""}, ${"software"}, ${"软件工具"}, ${"演示预置"},
      ${1}, ${1}, ${DEMO_CATALOG.length}, ${"ok"}, ${"内置演示商品库"}, ${"demo"}
    )
  `;
  return { seeded: true, count: DEMO_CATALOG.length };
});

const listingInput = z.object({
  id: z.string(),
  title: z.string(),
  priceFen: z.number(),
  wantCount: z.number(),
  picUrl: z.string().nullable(),
  area: z.string().nullable(),
  sellerNick: z.string().nullable(),
  sellerId: z.string().nullable(),
  categoryId: z.string().nullable(),
  categoryName: z.string().nullable(),
  keyword: z.string().nullable(),
  sortField: z.string().nullable(),
  conditionLabel: z.string().nullable(),
  publishedAt: z.string().nullable(),
  itemUrl: z.string().nullable(),
  source: z.enum(["live", "demo", "import"]),
  firstSeenAt: z.string(),
  lastSeenAt: z.string(),
});

export const saveListings = createServerFn({ method: "POST" })
  .validator(z.object({ items: z.array(listingInput) }))
  .handler(async ({ data }) => {
    const count = await upsertMany(data.items as Listing[]);
    return { count };
  });

export const recordJob = createServerFn({ method: "POST" })
  .validator(
    z.object({
      keyword: z.string(),
      categoryId: z.string().nullable(),
      categoryName: z.string().nullable(),
      sortLabel: z.string().nullable(),
      pagesRequested: z.number(),
      pagesDone: z.number(),
      itemCount: z.number(),
      status: z.string(),
      message: z.string().nullable(),
      source: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into crawl_jobs (
        keyword, category_id, category_name, sort_label,
        pages_requested, pages_done, item_count, status, message, source
      ) values (
        ${data.keyword}, ${data.categoryId}, ${data.categoryName}, ${data.sortLabel},
        ${data.pagesRequested}, ${data.pagesDone}, ${data.itemCount},
        ${data.status}, ${data.message}, ${data.source}
      ) returning id
    `;
    return { id: rows[0]?.id ?? 0 };
  });

const querySchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  source: z.string().optional(),
  sort: z.enum(["recent", "price_asc", "price_desc", "want", "new"]).optional(),
  days: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export const queryListings = createServerFn({ method: "POST" })
  .validator(querySchema)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const limit = Math.min(Math.max(data.limit ?? 80, 1), 300);
    const offset = Math.max(data.offset ?? 0, 0);
    const q = data.q?.trim() ?? "";
    const like = q ? `%${q}%` : "%";
    const cat = expandCats(data.categoryId ?? "");
    const source = data.source ?? "";
    const days = data.days ?? 0;
    const sort = data.sort ?? "recent";

    const order =
      sort === "price_asc"
        ? "price_fen asc, last_seen_at desc"
        : sort === "price_desc"
          ? "price_fen desc, last_seen_at desc"
          : sort === "want"
            ? "want_count desc, price_fen asc"
            : sort === "new"
              ? "published_at desc nulls last, last_seen_at desc"
              : "last_seen_at desc";

    const rows = await sql.query<ListingRow>(
      `select * from listings
       where ($1 = '%' or title ilike $1 or coalesce(seller_nick,'') ilike $1 or coalesce(keyword,'') ilike $1)
         and ($2 = '' or category_id = any(string_to_array($2, ',')))
         and ($3 = '' or source = $3)
         and ($4 = 0 or last_seen_at > now() - ($4::text || ' days')::interval or published_at > now() - ($4::text || ' days')::interval)
       order by ${order}
       limit $5 offset $6`,
      [like, cat, source, days, limit, offset],
    );

    const countRows = await sql.query<{ n: number }>(
      `select count(*)::int as n from listings
       where ($1 = '%' or title ilike $1 or coalesce(seller_nick,'') ilike $1 or coalesce(keyword,'') ilike $1)
         and ($2 = '' or category_id = any(string_to_array($2, ',')))
         and ($3 = '' or source = $3)
         and ($4 = 0 or last_seen_at > now() - ($4::text || ' days')::interval or published_at > now() - ($4::text || ' days')::interval)`,
      [like, cat, source, days],
    );

    return {
      items: rows.map(toListing),
      total: Number(countRows[0]?.n ?? 0),
    };
  });

export const getOverview = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const totals = await sql<{ n: number; want: number; avg: number | null }>`
    select count(*)::int as n,
           coalesce(sum(want_count),0)::int as want,
           avg(price_fen)::float as avg
    from listings
  `;
  const bySource = await sql<{ source: string; n: number }>`
    select source, count(*)::int as n from listings group by source
  `;
  const jobs = await sql<CrawlJobRow>`
    select * from crawl_jobs order by created_at desc limit 8
  `;
  const cats = await sql<CategoryStatRow>`
    select coalesce(category_id, 'unknown') as category_id,
           coalesce(category_name, '未分类') as category_name,
           count(*)::int as count,
           avg(price_fen)::float as avg_fen,
           min(price_fen)::int as min_fen,
           max(price_fen)::int as max_fen
    from listings
    group by 1, 2
    order by count desc
    limit 12
  `;
  const hot = await sql<ListingRow>`
    select * from listings order by want_count desc, last_seen_at desc limit 6
  `;
  const cheap = await sql<ListingRow>`
    select * from listings where price_fen > 0 order by price_fen asc limit 6
  `;
  const t = totals[0];
  return {
    count: Number(t?.n ?? 0),
    wantSum: Number(t?.want ?? 0),
    avgFen: t?.avg == null ? null : Math.round(Number(t.avg)),
    bySource: bySource.map((r) => ({ source: r.source, n: Number(r.n) })),
    jobs: jobs.map(toJob),
    categories: cats.map(
      (r): CategoryStat => ({
        categoryId: r.category_id,
        categoryName: r.category_name,
        count: Number(r.count),
        avgFen: r.avg_fen == null ? null : Math.round(Number(r.avg_fen)),
        minFen: r.min_fen == null ? null : Number(r.min_fen),
        maxFen: r.max_fen == null ? null : Number(r.max_fen),
      }),
    ),
    hot: hot.map(toListing),
    cheap: cheap.map(toListing),
  };
});

type CrawlJobRow = {
  id: number;
  keyword: string;
  category_id: string | null;
  category_name: string | null;
  sort_label: string | null;
  pages_requested: number;
  pages_done: number;
  item_count: number;
  status: string;
  message: string | null;
  source: string;
  created_at: string;
};

type CategoryStatRow = {
  category_id: string;
  category_name: string;
  count: number;
  avg_fen: number | null;
  min_fen: number | null;
  max_fen: number | null;
};

function toJob(row: CrawlJobRow): CrawlJob {
  return {
    id: Number(row.id),
    keyword: row.keyword,
    categoryId: row.category_id,
    categoryName: row.category_name,
    sortLabel: row.sort_label,
    pagesRequested: Number(row.pages_requested),
    pagesDone: Number(row.pages_done),
    itemCount: Number(row.item_count),
    status: row.status,
    message: row.message,
    source: row.source,
    createdAt: row.created_at,
  };
}

export const getMarket = createServerFn({ method: "POST" })
  .validator(
    z.object({
      categoryId: z.string().optional(),
      q: z.string().optional(),
      days: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const q = data.q?.trim() ?? "";
    const like = q ? `%${q}%` : "%";
    const cat = expandCats(data.categoryId ?? "");
    const days = data.days ?? 0;
    const rows = await sql.query<{ price_fen: number; want_count: number }>(
      `select price_fen, want_count from listings
       where ($1 = '%' or title ilike $1)
         and ($2 = '' or category_id = any(string_to_array($2, ',')))
         and ($3 = 0 or last_seen_at > now() - ($3::text || ' days')::interval or published_at > now() - ($3::text || ' days')::interval)`,
      [like, cat, days],
    );
    const prices = rows.map((r) => Number(r.price_fen));
    const wantSum = rows.reduce((a, r) => a + Number(r.want_count), 0);
    const stats: MarketStats = computeStats(prices, wantSum);
    const cats = await sql.query<CategoryStatRow>(
      `select coalesce(category_id, 'unknown') as category_id,
              coalesce(category_name, '未分类') as category_name,
              count(*)::int as count,
              avg(price_fen)::float as avg_fen,
              min(price_fen)::int as min_fen,
              max(price_fen)::int as max_fen
       from listings
       where ($1 = '%' or title ilike $1)
         and ($2 = 0 or last_seen_at > now() - ($2::text || ' days')::interval or published_at > now() - ($2::text || ' days')::interval)
       group by 1, 2
       order by count desc
       limit 16`,
      [like, days],
    );
    return {
      stats,
      prices,
      categories: cats.map(
        (r): CategoryStat => ({
          categoryId: r.category_id,
          categoryName: r.category_name,
          count: Number(r.count),
          avgFen: r.avg_fen == null ? null : Math.round(Number(r.avg_fen)),
          minFen: r.min_fen == null ? null : Number(r.min_fen),
          maxFen: r.max_fen == null ? null : Number(r.max_fen),
        }),
      ),
    };
  });

export const getRankings = createServerFn({ method: "POST" })
  .validator(
    z.object({
      categoryId: z.string().optional(),
      q: z.string().optional(),
      days: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const q = data.q?.trim() ?? "";
    const like = q ? `%${q}%` : "%";
    const cat = expandCats(data.categoryId ?? "");
    const days = data.days ?? 0;
    const where = `where ($1 = '%' or title ilike $1)
         and ($2 = '' or category_id = any(string_to_array($2, ',')))
         and ($3 = 0 or last_seen_at > now() - ($3::text || ' days')::interval or published_at > now() - ($3::text || ' days')::interval)`;
    const hot = await sql.query<ListingRow>(
      `select * from listings ${where} order by want_count desc, last_seen_at desc limit 30`,
      [like, cat, days],
    );
    const cheap = await sql.query<ListingRow>(
      `select * from listings ${where} and price_fen > 0 order by price_fen asc limit 30`,
      [like, cat, days],
    );
    const expensive = await sql.query<ListingRow>(
      `select * from listings ${where} order by price_fen desc limit 30`,
      [like, cat, days],
    );
    const fresh = await sql.query<ListingRow>(
      `select * from listings ${where} order by published_at desc nulls last, last_seen_at desc limit 30`,
      [like, cat, days],
    );
    return {
      hot: hot.map(toListing),
      cheap: cheap.map(toListing),
      expensive: expensive.map(toListing),
      fresh: fresh.map(toListing),
    };
  });
