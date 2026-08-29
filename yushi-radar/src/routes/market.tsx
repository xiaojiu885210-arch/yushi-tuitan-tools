import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeed } from "@/components/use-seed";
import { getMarket } from "@/lib/server/listings";
import { formatYuan } from "@/lib/utils";

export const Route = createFileRoute("/market")({ component: MarketPage });

function MarketPage() {
  useSeed();
  const q = useQuery({
    queryKey: ["market"],
    queryFn: () => getMarket({ data: { categoryId: "software", days: 14 } }),
  });
  const s = q.data?.stats;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">行情</h1>
        <p className="mt-1 text-sm text-muted-foreground">软件工具近 14 天价格分位。</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardHeader><CardTitle>样本</CardTitle></CardHeader><CardContent className="font-display text-3xl tabular-nums">{s?.count ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle>中位价</CardTitle></CardHeader><CardContent className="font-display text-3xl tabular-nums">¥{s?.medianFen != null ? formatYuan(s.medianFen) : "—"}</CardContent></Card>
        <Card><CardHeader><CardTitle>P25 / P75</CardTitle></CardHeader><CardContent className="font-display text-2xl tabular-nums">¥{s?.p25Fen != null ? formatYuan(s.p25Fen) : "—"} · ¥{s?.p75Fen != null ? formatYuan(s.p75Fen) : "—"}</CardContent></Card>
      </div>
      <div className="space-y-2">
        {(q.data?.categories ?? []).map((c) => (
          <div key={c.categoryId} className="flex justify-between rounded-xl border border-border px-3 py-2 text-sm">
            <span>{c.categoryName}</span>
            <span className="tabular-nums text-muted-foreground">{c.count} 条 · 均 ¥{c.avgFen != null ? formatYuan(c.avgFen) : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
