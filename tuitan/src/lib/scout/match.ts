import { hasCjk, tokenize } from "./glossary";
import { heatOf } from "./score";
import type { Creator, Post, QueryPlan, SortKey } from "./types";

function hay(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function scoreMatch(text: string, tokens: string[], translated: string[]): number {
  if (!tokens.length && !translated.length) return 1;
  const t = text.toLowerCase();
  let s = 0;
  for (const tok of tokens) {
    if (tok.length < 2) continue;
    if (t.includes(tok.toLowerCase())) s += tok.length >= 4 ? 3 : 2;
  }
  for (const tok of translated) {
    if (t.includes(tok.toLowerCase())) s += 2;
  }
  return s;
}

export type Filters = {
  minLikes: number;
  minBookmarks: number;
  minViews: number;
  minFollowers: number;
  lang: "all" | "zh" | "en";
  topics: string[];
};

export function filterPosts(posts: Post[], f: Filters): Post[] {
  return posts.filter((p) => {
    if (p.likes < f.minLikes) return false;
    if (p.bookmarks < f.minBookmarks) return false;
    if (p.views < f.minViews) return false;
    if (f.lang !== "all" && p.lang !== f.lang) return false;
    if (f.topics.length && !p.topics.some((t) => f.topics.includes(t))) return false;
    return true;
  });
}

export function filterCreators(rows: Creator[], f: Filters): Creator[] {
  return rows.filter((c) => {
    if (c.followers < f.minFollowers) return false;
    if (f.lang !== "all" && c.lang !== f.lang) return false;
    if (f.topics.length && !c.topics.some((t) => f.topics.includes(t))) return false;
    return true;
  });
}

export function searchCatalog(
  creators: Creator[],
  posts: Post[],
  plan: QueryPlan,
  filters: Filters,
): { creators: Creator[]; posts: Post[] } {
  const tokens = plan.tokens.length ? plan.tokens : tokenize(plan.original);
  const translated = plan.translated;
  const broad = !plan.original || plan.original === "创业";

  const scoredPosts = filterPosts(posts, filters)
    .map((p) => ({
      post: p,
      s: scoreMatch(hay([p.body, p.handle, p.topics.join(" ")]), tokens, translated),
    }))
    .filter((x) => (broad ? true : x.s > 0));

  const postHits = scoredPosts.sort((a, b) => b.s - a.s || b.post.heat - a.post.heat).map((x) => x.post);

  const scoredCreators = filterCreators(creators, filters)
    .map((c) => ({
      creator: c,
      s: scoreMatch(hay([c.name, c.handle, c.bio, c.topics.join(" ")]), tokens, translated),
    }))
    .filter((x) => (broad ? true : x.s > 0));

  // 帖子作者自动并入博主结果
  const byHandle = new Map(scoredCreators.map((x) => [x.creator.handle, x]));
  for (const p of postHits) {
    const existing = creators.find((c) => c.handle === p.handle);
    if (existing && !byHandle.has(p.handle)) {
      if (existing.followers >= filters.minFollowers) {
        byHandle.set(p.handle, { creator: existing, s: 1 });
      }
    }
  }

  const creatorHits = [...byHandle.values()]
    .sort((a, b) => b.s - a.s || b.creator.followers - a.creator.followers)
    .map((x) => x.creator);

  return { creators: creatorHits, posts: postHits };
}

export function sortPosts(posts: Post[], sort: SortKey): Post[] {
  const copy = [...posts];
  if (sort === "views") copy.sort((a, b) => b.views - a.views);
  else if (sort === "likes") copy.sort((a, b) => b.likes - a.likes);
  else if (sort === "bookmarks") copy.sort((a, b) => b.bookmarks - a.bookmarks);
  else if (sort === "new") copy.sort((a, b) => (b.postedAt ?? "").localeCompare(a.postedAt ?? ""));
  else copy.sort((a, b) => b.heat - a.heat || heatOf(b) - heatOf(a));
  return copy;
}

export function sortCreators(rows: Creator[], posts: Post[], sort: SortKey): Creator[] {
  const heatBy = new Map<string, number>();
  for (const p of posts) heatBy.set(p.handle, (heatBy.get(p.handle) ?? 0) + p.heat);
  const copy = [...rows];
  if (sort === "followers") copy.sort((a, b) => b.followers - a.followers);
  else if (sort === "views") {
    const views = new Map<string, number>();
    for (const p of posts) views.set(p.handle, (views.get(p.handle) ?? 0) + p.views);
    copy.sort((a, b) => (views.get(b.handle) ?? 0) - (views.get(a.handle) ?? 0));
  } else copy.sort((a, b) => (heatBy.get(b.handle) ?? 0) - (heatBy.get(a.handle) ?? 0) || b.followers - a.followers);
  return copy;
}

export function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export { hasCjk };
