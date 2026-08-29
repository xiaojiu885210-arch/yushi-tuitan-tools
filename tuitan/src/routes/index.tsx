import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CreatorCard } from "@/components/creator-card";
import { PostCard } from "@/components/post-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeed } from "@/components/use-seed";
import { overview } from "@/lib/server/scout";
import { fmtZh } from "@/lib/scout/score";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const seed = useSeed();
  const q = useQuery({
    queryKey: ["overview", seed.data?.creators],
    queryFn: () => overview(),
    enabled: Boolean(seed.data),
  });
  const data = q.data;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs tracking-[0.2em] text-muted-foreground">X CREATOR SCOUT</p>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">把中文问题，搜成能跟的博主。</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          X 对中文不友好。推探会同时跑中文、英文对照、话题标签和账号四条车道，再按播放、点赞、收藏排序。资料库开箱即用；贴上自己的 Bearer Token 就能实搜。
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to="/search" className={cn(buttonVariants())}>
            全面搜索
          </Link>
          <Link to="/connect" className={cn(buttonVariants({ variant: "outline" }))}>
            接入 X 账号
          </Link>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>博主</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl tabular-nums">{fmtZh(data?.creatorCount ?? seed.data?.creators ?? 0)}</p>
            <p className="mt-1 text-xs text-muted-foreground">已入库账号</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>帖子</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl tabular-nums">{fmtZh(data?.postCount ?? seed.data?.posts ?? 0)}</p>
            <p className="mt-1 text-xs text-muted-foreground">含播放 / 点赞 / 收藏</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>车道</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl tabular-nums">4</p>
            <p className="mt-1 text-xs text-muted-foreground">中文 · 英文 · 标签 · 账号</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">高粉博主</h2>
          <Link to="/creators" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            全部 <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {(data?.top ?? []).map((c) => (
            <CreatorCard
              key={c.handle}
              creator={{
                handle: c.handle,
                name: c.name,
                bio: c.bio,
                avatarUrl: c.avatarUrl,
                followers: c.followers,
                following: 0,
                lang: "en",
                topics: [],
                profileUrl: `https://x.com/${c.handle}`,
                source: "catalog",
                firstSeenAt: "",
                lastSeenAt: "",
              }}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">高收藏帖</h2>
          <Link to="/posts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            全部 <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-2">
          {(data?.hot ?? []).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>

      {data?.jobs?.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">最近检索</h2>
          <div className="space-y-1.5">
            {data.jobs.map((j) => (
              <div key={j.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                <span className="font-medium">{j.query}</span>
                <Badge variant="muted">{j.source === "live" ? "实搜" : "资料库"}</Badge>
                <span className="text-muted-foreground">
                  {j.creator_count} 账号 · {j.post_count} 帖
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
