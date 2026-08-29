import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CreatorCard } from "@/components/creator-card";
import { PostCard } from "@/components/post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSeed } from "@/components/use-seed";
import { csvEscape } from "@/lib/scout/match";
import { TOPICS } from "@/lib/scout/glossary";
import { runSearch } from "@/lib/server/scout";
import { useTokenStore } from "@/lib/token-store";
import type { Creator, Post, QueryPlan, SortKey } from "@/lib/scout/types";

export const Route = createFileRoute("/search")({ component: SearchPage });

const PRESETS = ["创业", "独立开发", "出海", "AI 创业", "SaaS MRR", "搞钱", "build in public", "indie hacker"];

function SearchPage() {
  useSeed();
  const qc = useQueryClient();
  const token = useTokenStore((s) => s.token);
  const [q, setQ] = useState("创业");
  const [minLikes, setMinLikes] = useState("20");
  const [minBookmarks, setMinBookmarks] = useState("0");
  const [minViews, setMinViews] = useState("0");
  const [minFollowers, setMinFollowers] = useState("0");
  const [lang, setLang] = useState<"all" | "zh" | "en">("all");
  const [topics, setTopics] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("heat");
  const [mode, setMode] = useState<"catalog" | "live">(token ? "live" : "catalog");
  const [tab, setTab] = useState<"creators" | "posts">("creators");
  const [plan, setPlan] = useState<QueryPlan | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      runSearch({
        data: {
          q,
          minLikes: Number(minLikes) || 0,
          minBookmarks: Number(minBookmarks) || 0,
          minViews: Number(minViews) || 0,
          minFollowers: Number(minFollowers) || 0,
          lang,
          topics,
          sort,
          mode,
          token,
        },
      }),
    onSuccess: (res) => {
      setPlan(res.plan);
      setCreators(res.creators);
      setPosts(res.posts);
      setMessage(res.message);
      void qc.invalidateQueries();
      toast.success(res.message);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "搜索失败"),
  });

  function toggleTopic(id: string) {
    setTopics((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function exportCsv() {
    const header = "handle,name,followers,lang,bio,url";
    const lines = creators.map((c) =>
      [c.handle, csvEscape(c.name), c.followers, c.lang, csvEscape(c.bio), c.profileUrl].join(","),
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tuitan-creators.csv";
    a.click();
  }

  const empty = !mut.isPending && !creators.length && !posts.length && !message;

  const laneChips = useMemo(() => plan?.lanes ?? [], [plan]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">全面搜索</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          输入中文即可。系统会自动扩出英文对照、标签和账号车道；结果按播放、点赞、收藏排序。
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <Label htmlFor="q">关键词</Label>
            <Input
              id="q"
              className="mt-1"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="创业 / 独立开发 / 出海"
              onKeyDown={(e) => {
                if (e.key === "Enter") mut.mutate();
              }}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-accent"
                  onClick={() => setQ(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>话题（可多选，叠在关键词上）</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TOPICS.map((t) => {
                const on = topics.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTopic(t.id)}
                    className={`rounded-full px-2.5 py-1 text-xs ${on ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"}`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="likes">最低点赞</Label>
              <Input id="likes" className="mt-1" inputMode="numeric" value={minLikes} onChange={(e) => setMinLikes(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bm">最低收藏</Label>
              <Input id="bm" className="mt-1" inputMode="numeric" value={minBookmarks} onChange={(e) => setMinBookmarks(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="views">最低播放</Label>
              <Input id="views" className="mt-1" inputMode="numeric" value={minViews} onChange={(e) => setMinViews(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="fo">最低粉丝</Label>
              <Input id="fo" className="mt-1" inputMode="numeric" value={minFollowers} onChange={(e) => setMinFollowers(e.target.value)} />
            </div>
            <div>
              <Label>语言</Label>
              <select
                className="mt-1 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                value={lang}
                onChange={(e) => setLang(e.target.value as "all" | "zh" | "en")}
              >
                <option value="all">中英都要</option>
                <option value="zh">只要中文</option>
                <option value="en">只要英文</option>
              </select>
            </div>
            <div>
              <Label>排序</Label>
              <select
                className="mt-1 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="heat">综合热度</option>
                <option value="views">播放高</option>
                <option value="likes">点赞高</option>
                <option value="bookmarks">收藏高</option>
                <option value="followers">粉丝高</option>
                <option value="new">最新</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>数据源</Label>
              <div className="mt-1 flex h-10 gap-1 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setMode("catalog")}
                  className={`flex-1 rounded-md text-sm ${mode === "catalog" ? "bg-card" : "text-muted-foreground"}`}
                >
                  全面资料库
                </button>
                <button
                  type="button"
                  onClick={() => setMode("live")}
                  className={`flex-1 rounded-md text-sm ${mode === "live" ? "bg-card" : "text-muted-foreground"}`}
                >
                  X 实搜
                </button>
              </div>
            </div>
          </div>

          {mode === "live" && !token ? (
            <p className="text-sm text-warn">还没贴 Token。可先跑资料库，或去接入页。</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
              {mut.isPending ? "检索中…" : "开始全面搜索"}
            </Button>
            {creators.length ? (
              <Button variant="outline" onClick={exportCsv}>
                导出博主 CSV
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {laneChips.length ? (
        <div className="flex flex-wrap gap-1.5">
          {laneChips.map((l) => (
            <Badge key={l.id} variant="outline" title={l.query}>
              {l.label}
            </Badge>
          ))}
        </div>
      ) : null}

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <div className="flex h-10 max-w-xs gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setTab("creators")}
          className={`flex-1 rounded-md text-sm ${tab === "creators" ? "bg-card" : "text-muted-foreground"}`}
        >
          博主 {creators.length}
        </button>
        <button
          type="button"
          onClick={() => setTab("posts")}
          className={`flex-1 rounded-md text-sm ${tab === "posts" ? "bg-card" : "text-muted-foreground"}`}
        >
          帖子 {posts.length}
        </button>
      </div>

      {empty ? (
        <p className="text-sm text-muted-foreground">选好话题和门槛，点开始。默认会中英一起搜。</p>
      ) : tab === "creators" ? (
        <div className="grid gap-2 md:grid-cols-2">
          {creators.map((c) => (
            <CreatorCard key={c.handle} creator={c} />
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
