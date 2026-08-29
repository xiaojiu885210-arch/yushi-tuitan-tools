import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeed } from "@/components/use-seed";
import { topicStats } from "@/lib/server/scout";
import { fmtZh } from "@/lib/scout/score";

export const Route = createFileRoute("/topics")({ component: TopicsPage });

function TopicsPage() {
  useSeed();
  const q = useQuery({ queryKey: ["topics"], queryFn: () => topicStats() });
  const rows = q.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">话题雷达</h1>
        <p className="mt-1 text-sm text-muted-foreground">创业圈被拆成 12 个车道，中英词库绑在一起。</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((t) => (
          <Link key={t.id} to="/search">
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <CardTitle>{t.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {t.creatorCount} 账号 · {t.postCount} 帖
                </p>
                <p className="tabular-nums">
                  播放 {fmtZh(t.views)} · 赞 {fmtZh(t.likes)} · 藏 {fmtZh(t.bookmarks)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
