import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSeed } from "@/components/use-seed";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getOverview } from "@/lib/server/listings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const seed = useSeed();
  const q = useQuery({
    queryKey: ["overview", seed.data?.count],
    queryFn: () => getOverview(),
    enabled: Boolean(seed.data),
  });
  const d = q.data;
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs tracking-[0.2em] text-muted-foreground">XIANYU MARKET RADAR</p>
        <h1 className="font-display text-4xl tracking-tight">选类目，看近期排行和价格带。</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          演示库开箱即用。实搜可贴闲鱼网页 Cookie，或用本机书签把搜索结果回传入库。
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to="/collect" className={cn(buttonVariants())}>开始采集</Link>
          <Link to="/connect" className={cn(buttonVariants({ variant: "outline" }))}>接入 Cookie</Link>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>商品</CardTitle></CardHeader>
          <CardContent>
            <p className="font-display text-3xl tabular-nums">{d?.count ?? seed.data?.count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>中位价</CardTitle></CardHeader>
          <CardContent>
            <p className="font-display text-3xl tabular-nums">¥{d?.avgFen != null ? (d.avgFen / 100).toFixed(0) : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>想要</CardTitle></CardHeader>
          <CardContent>
            <p className="font-display text-3xl tabular-nums">{d?.wantSum ?? 0}</p>
          </CardContent>
        </Card>
      </div>
      {d?.jobs?.length ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium">最近采集</h2>
          {d.jobs.map((j) => (
            <div key={j.id} className="flex flex-wrap gap-2 rounded-xl border border-border px-3 py-2 text-sm">
              <span>{j.keyword || j.categoryName}</span>
              <Badge variant="muted">{j.source}</Badge>
              <span className="text-muted-foreground">{j.itemCount} 条</span>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
