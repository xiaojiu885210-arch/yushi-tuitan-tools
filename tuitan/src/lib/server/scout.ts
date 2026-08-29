import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { CATALOG_CREATORS, CATALOG_POSTS } from "@/lib/scout/catalog";
import { TOPICS } from "@/lib/scout/glossary";
import { filterCreators, filterPosts, searchCatalog, sortCreators, sortPosts } from "@/lib/scout/match";
import { planQuery } from "@/lib/scout/plan";
import { heatOf } from "@/lib/scout/score";
import type { Creator, Post, QueryPlan, SearchHit, SortKey, TopicStat } from "@/lib/scout/types";

const filterSchema = z.object({
  q: z.string(),
  minLikes: z.number(),
  minBookmarks: z.number(),
  minViews: z.number(),
  minFollowers: z.number(),
  lang: z.enum(["all", "zh", "en"]),
  topics: z.array(z.string()),
  sort: z.enum(["heat", "views", "likes", "bookmarks", "followers", "new"]),
  mode: z.enum(["catalog", "live"]),
  token: z.string(),
});

type CreatorRow = {
  handle: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  followers: number;
  following: number;
  lang: string;
  topics: string;
  profile_url: string | null;
  source: string;
  first_seen_at: string;
  last_seen_at: string;
};

type PostRow = {
  id: string;
  handle: string;
  body: string;
  lang: string;
  likes: number;
  bookmarks: number;
  views: number;
  replies: number;
  reposts: number;
  topics: string;
  post_url: string | null;
  posted_at: string | null;
  source: string;
};

function splitTopics(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function toCreator(r: CreatorRow): Creator {
  return {
    handle: r.handle,
    name: r.name,
    bio: r.bio,
    avatarUrl: r.avatar_url,
    followers: Number(r.followers),
    following: Number(r.following),
    lang: r.lang,
    topics: splitTopics(r.topics),
    profileUrl: r.profile_url || `https://x.com/${r.handle}`,
    source: (r.source as Creator["source"]) || "catalog",
    firstSeenAt: r.first_seen_at,
    lastSeenAt: r.last_seen_at,
  };
}

function toPost(r: PostRow): Post {
  const likes = Number(r.likes);
  const bookmarks = Number(r.bookmarks);
  const views = Number(r.views);
  const replies = Number(r.replies);
  const reposts = Number(r.reposts);
  return {
    id: r.id,
    handle: r.handle,
    body: r.body,
    lang: r.lang,
    likes,
    bookmarks,
    views,
    replies,
    reposts,
    topics: splitTopics(r.topics),
    postUrl: r.post_url || `https://x.com/${r.handle}/status/${r.id}`,
    postedAt: r.posted_at,
    source: (r.source as Post["source"]) || "catalog",
    heat: heatOf({ likes, bookmarks, views, replies, reposts }),
  };
}

async function upsertCreators(rows: Creator[]) {
  if (!rows.length) return;
  const sql = await getSql();
  for (const c of rows) {
    await sql`
      insert into creators (
        handle, name, bio, avatar_url, followers, following, lang, topics, profile_url, source, first_seen_at, last_seen_at
      ) values (
        ${c.handle}, ${c.name}, ${c.bio}, ${c.avatarUrl}, ${c.followers}, ${c.following},
        ${c.lang}, ${c.topics.join(",")}, ${c.profileUrl}, ${c.source}, ${c.firstSeenAt}, ${c.lastSeenAt}
      )
      on conflict (handle) do update set
        name = excluded.name,
        bio = excluded.bio,
        avatar_url = coalesce(excluded.avatar_url, creators.avatar_url),
        followers = excluded.followers,
        following = excluded.following,
        lang = excluded.lang,
        topics = excluded.topics,
        profile_url = excluded.profile_url,
        last_seen_at = excluded.last_seen_at
    `;
  }
}

async function upsertPosts(rows: Post[]) {
  if (!rows.length) return;
  const sql = await getSql();
  for (const p of rows) {
    await sql`
      insert into posts (
        id, handle, body, lang, likes, bookmarks, views, replies, reposts, topics, post_url, posted_at, source, last_seen_at
      ) values (
        ${p.id}, ${p.handle}, ${p.body}, ${p.lang}, ${p.likes}, ${p.bookmarks}, ${p.views},
        ${p.replies}, ${p.reposts}, ${p.topics.join(",")}, ${p.postUrl}, ${p.postedAt}, ${p.source}, now()
      )
      on conflict (id) do update set
        body = excluded.body,
        likes = excluded.likes,
        bookmarks = excluded.bookmarks,
        views = excluded.views,
        replies = excluded.replies,
        reposts = excluded.reposts,
        topics = excluded.topics,
        last_seen_at = now()
    `;
  }
}

async function seedIfEmpty() {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*)::int as n from creators`;
  if (Number(rows[0]?.n ?? 0) === 0) {
    await upsertCreators(CATALOG_CREATORS);
    await upsertPosts(CATALOG_POSTS);
  }
}

export const ensureSeeded = createServerFn({ method: "POST" }).handler(async () => {
  await seedIfEmpty();
  const sql = await getSql();
  const c = await sql<{ n: number }>`select count(*)::int as n from creators`;
  const p = await sql<{ n: number }>`select count(*)::int as n from posts`;
  return { creators: Number(c[0]?.n ?? 0), posts: Number(p[0]?.n ?? 0) };
});

async function loadAll(): Promise<{ creators: Creator[]; posts: Post[] }> {
  const sql = await getSql();
  const cr = await sql<CreatorRow>`select * from creators`;
  const pr = await sql<PostRow>`select * from posts`;
  return { creators: cr.map(toCreator), posts: pr.map(toPost) };
}

function mergeCreators(a: Creator[], b: Creator[]): Creator[] {
  const m = new Map<string, Creator>();
  for (const x of a) m.set(x.handle, x);
  for (const x of b) m.set(x.handle, x);
  return [...m.values()];
}

function mergePosts(a: Post[], b: Post[]): Post[] {
  const m = new Map<string, Post>();
  for (const x of a) m.set(x.id, x);
  for (const x of b) m.set(x.id, x);
  return [...m.values()];
}

export const runSearch = createServerFn({ method: "POST" })
  .validator(filterSchema)
  .handler(async ({ data }): Promise<SearchHit> => {
    await seedIfEmpty();
    const plan: QueryPlan = planQuery(data.q, data.minLikes);
    const filters = {
      minLikes: data.minLikes,
      minBookmarks: data.minBookmarks,
      minViews: data.minViews,
      minFollowers: data.minFollowers,
      lang: data.lang,
      topics: data.topics,
    };
    const db = await loadAll();
    const catalogHits = searchCatalog(db.creators, db.posts, plan, filters);

    let liveCreators: Creator[] = [];
    let livePosts: Post[] = [];
    let liveMsg = "";
    let liveOk = false;
    if (data.mode === "live" && data.token.trim()) {
      const { liveSearch } = await import("@/lib/scout/x-api.server");
      const live = await liveSearch({ token: data.token, lanes: plan.lanes, minLikes: data.minLikes });
      liveCreators = live.creators;
      livePosts = live.posts;
      liveMsg = live.message;
      liveOk = live.ok;
      if (live.ok) {
        await upsertCreators(live.creators);
        await upsertPosts(live.posts);
      }
    }

    const creators = sortCreators(
      mergeCreators(catalogHits.creators, filterCreators(liveCreators, filters)),
      mergePosts(catalogHits.posts, livePosts),
      data.sort,
    );
    const posts = sortPosts(mergePosts(catalogHits.posts, filterPosts(livePosts, filters)), data.sort);

    const sql = await getSql();
    await sql`
      insert into search_jobs (query, lanes, post_count, creator_count, status, message, source)
      values (
        ${plan.original},
        ${plan.lanes.map((l) => l.label).join(",")},
        ${posts.length},
        ${creators.length},
        ${data.mode === "live" && !liveOk ? "partial" : "ok"},
        ${liveMsg || `资料库命中 ${posts.length} 帖 / ${creators.length} 账号`},
        ${data.mode}
      )
    `;

    const message = data.mode === "live"
      ? liveOk
        ? `${liveMsg}。合并资料库后 ${posts.length} 帖 / ${creators.length} 账号。`
        : `${liveMsg || "实搜失败"}。已用中英对照资料库：${posts.length} 帖 / ${creators.length} 账号。`
      : `全面检索 ${plan.lanes.length} 条车道（中文/英文/标签/账号）。命中 ${posts.length} 帖 / ${creators.length} 账号。`;

    return {
      creators,
      posts,
      plan,
      source: data.mode === "live" && liveOk ? "live" : "catalog",
      message,
    };
  });

export const inspectToken = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    const { inspectToken: inspect } = await import("@/lib/scout/x-api.server");
    return inspect(data.token);
  });

export const listLibrary = createServerFn({ method: "GET" })
  .validator(
    z.object({
      sort: z.enum(["heat", "views", "likes", "bookmarks", "followers", "new"]).optional(),
      topic: z.string().optional(),
      lang: z.enum(["all", "zh", "en"]).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await seedIfEmpty();
    const db = await loadAll();
    const filters = {
      minLikes: 0,
      minBookmarks: 0,
      minViews: 0,
      minFollowers: 0,
      lang: data.lang ?? "all",
      topics: data.topic ? [data.topic] : [],
    };
    const creators = sortCreators(filterCreators(db.creators, filters), db.posts, data.sort ?? "followers");
    const posts = sortPosts(filterPosts(db.posts, filters), data.sort ?? "heat");
    return { creators, posts };
  });

export const topicStats = createServerFn({ method: "GET" }).handler(async (): Promise<TopicStat[]> => {
  await seedIfEmpty();
  const db = await loadAll();
  return TOPICS.map((t) => {
    const creators = db.creators.filter((c) => c.topics.includes(t.id));
    const posts = db.posts.filter((p) => p.topics.includes(t.id));
    return {
      id: t.id,
      name: t.name,
      creatorCount: creators.length,
      postCount: posts.length,
      views: posts.reduce((s, p) => s + p.views, 0),
      likes: posts.reduce((s, p) => s + p.likes, 0),
      bookmarks: posts.reduce((s, p) => s + p.bookmarks, 0),
    };
  });
});

export const overview = createServerFn({ method: "GET" }).handler(async () => {
  await seedIfEmpty();
  const sql = await getSql();
  const c = await sql<{ n: number }>`select count(*)::int as n from creators`;
  const p = await sql<{ n: number }>`select count(*)::int as n from posts`;
  const jobs = await sql<{
    id: number;
    query: string;
    post_count: number;
    creator_count: number;
    status: string;
    message: string | null;
    source: string;
    created_at: string;
  }>`select id, query, post_count, creator_count, status, message, source, created_at from search_jobs order by created_at desc limit 8`;
  const top = await sql<{ handle: string; name: string; followers: number; avatar_url: string | null; bio: string }>`
    select handle, name, followers, avatar_url, bio from creators order by followers desc limit 6
  `;
  const hot = await sql<PostRow>`select * from posts order by bookmarks desc limit 5`;
  return {
    creatorCount: Number(c[0]?.n ?? 0),
    postCount: Number(p[0]?.n ?? 0),
    jobs,
    top: top.map((r) => ({
      handle: r.handle,
      name: r.name,
      followers: Number(r.followers),
      avatarUrl: r.avatar_url,
      bio: r.bio,
    })),
    hot: hot.map(toPost),
  };
});

export const saveHits = createServerFn({ method: "POST" })
  .validator(
    z.object({
      creators: z.array(z.custom<Creator>()),
      posts: z.array(z.custom<Post>()),
    }),
  )
  .handler(async ({ data }) => {
    await upsertCreators(data.creators);
    await upsertPosts(data.posts);
    return { ok: true, creators: data.creators.length, posts: data.posts.length };
  });
