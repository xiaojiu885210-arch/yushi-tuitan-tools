import { withHeat } from "./score";
import type { Creator, Post, SearchLane } from "./types";

type ApiTweet = {
  id: string;
  text: string;
  lang?: string;
  created_at?: string;
  author_id?: string;
  public_metrics?: {
    like_count?: number;
    bookmark_count?: number;
    impression_count?: number;
    reply_count?: number;
    retweet_count?: number;
  };
};

type ApiUser = {
  id: string;
  name: string;
  username: string;
  description?: string;
  profile_image_url?: string;
  public_metrics?: { followers_count?: number; following_count?: number };
};

function detectPostLang(text: string, lang?: string): string {
  if (lang && lang !== "und") return lang.startsWith("zh") ? "zh" : lang === "en" ? "en" : lang;
  return /[\u3400-\u9fff]/.test(text) ? "zh" : "en";
}

function mapUser(u: ApiUser, source: Post["source"]): Creator {
  const handle = u.username;
  return {
    handle,
    name: u.name,
    bio: u.description ?? "",
    avatarUrl: u.profile_image_url ?? null,
    followers: u.public_metrics?.followers_count ?? 0,
    following: u.public_metrics?.following_count ?? 0,
    lang: detectPostLang(u.description ?? "", undefined),
    topics: [],
    profileUrl: `https://x.com/${handle}`,
    source,
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };
}

function mapTweet(t: ApiTweet, handle: string, source: Post["source"]): Post {
  const m = t.public_metrics ?? {};
  return withHeat({
    id: t.id,
    handle,
    body: t.text,
    lang: detectPostLang(t.text, t.lang),
    likes: m.like_count ?? 0,
    bookmarks: m.bookmark_count ?? 0,
    views: m.impression_count ?? 0,
    replies: m.reply_count ?? 0,
    reposts: m.retweet_count ?? 0,
    topics: [],
    postUrl: `https://x.com/${handle}/status/${t.id}`,
    postedAt: t.created_at ?? null,
    source,
  });
}

async function xGet(path: string, token: string): Promise<{ ok: boolean; status: number; json: unknown; error?: string }> {
  const url = path.startsWith("http") ? path : `https://api.x.com/2${path}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "User-Agent": "TuiTan/1.0" },
    });
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const rec = json && typeof json === "object" ? (json as { detail?: string; title?: string }) : {};
      return { ok: false, status: res.status, json, error: rec.detail || rec.title || `HTTP ${res.status}` };
    }
    return { ok: true, status: res.status, json };
  } catch (e) {
    return { ok: false, status: 0, json: null, error: e instanceof Error ? e.message : "网络失败" };
  }
}

export async function liveSearch(opts: {
  token: string;
  lanes: SearchLane[];
  minLikes: number;
}): Promise<{ creators: Creator[]; posts: Post[]; message: string; ok: boolean }> {
  const token = opts.token.trim().replace(/^Bearer\s+/i, "");
  if (!token) return { creators: [], posts: [], message: "没有 Token", ok: false };

  const creators = new Map<string, Creator>();
  const posts: Post[] = [];
  const notes: string[] = [];
  let anyOk = false;

  const tweetLanes = opts.lanes.filter((l) => l.kind === "zh" || l.kind === "en" || l.kind === "tag").slice(0, 3);
  for (const lane of tweetLanes) {
    const q = encodeURIComponent(lane.query);
    const path =
      `/tweets/search/recent?query=${q}&max_results=50` +
      `&tweet.fields=public_metrics,created_at,lang,author_id` +
      `&expansions=author_id&user.fields=public_metrics,description,profile_image_url,username,name`;
    const res = await xGet(path, token);
    if (!res.ok) {
      notes.push(`${lane.label}：${res.error}`);
      continue;
    }
    anyOk = true;
    const body = res.json as { data?: ApiTweet[]; includes?: { users?: ApiUser[] } };
    const users = new Map((body.includes?.users ?? []).map((u) => [u.id, u]));
    for (const t of body.data ?? []) {
      const u = t.author_id ? users.get(t.author_id) : undefined;
      if (u) creators.set(u.username, mapUser(u, "live"));
      const handle = u?.username ?? "unknown";
      const post = mapTweet(t, handle, "live");
      if (post.likes >= opts.minLikes) posts.push(post);
    }
  }

  const userLane = opts.lanes.find((l) => l.kind === "user");
  if (userLane) {
    const path = `/users/search?query=${encodeURIComponent(userLane.query)}&max_results=10&user.fields=public_metrics,description,profile_image_url`;
    const res = await xGet(path, token);
    if (res.ok) {
      anyOk = true;
      const body = res.json as { data?: ApiUser[] };
      for (const u of body.data ?? []) creators.set(u.username, mapUser(u, "live"));
    } else {
      notes.push(`搜账号：${res.error}`);
    }
  }

  if (!anyOk) {
    return {
      creators: [],
      posts: [],
      message: notes[0] || "X 接口不可用。Basic 套餐才有 recent search。已回退资料库。",
      ok: false,
    };
  }
  return {
    creators: [...creators.values()],
    posts,
    message: `实搜 ${posts.length} 帖 / ${creators.size} 账号${notes.length ? "；部分车道：" + notes.join("；") : ""}`,
    ok: true,
  };
}

export async function inspectToken(token: string): Promise<{ ok: boolean; message: string }> {
  const t = token.trim().replace(/^Bearer\s+/i, "");
  if (t.length < 20) return { ok: false, message: "Token 太短，请贴 Bearer Token（X API v2）。" };
  const res = await xGet("/tweets/search/recent?query=startup&max_results=10", t);
  if (res.ok) return { ok: true, message: "连通，recent search 可用。" };
  if (res.status === 401 || res.status === 403) {
    return { ok: false, message: `鉴权失败（${res.status}）。需要 X API Bearer，且套餐含 recent search。` };
  }
  return { ok: false, message: res.error || `HTTP ${res.status}` };
}
