import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { Label } from "@/components/ui/label";
import { useSeed } from "@/components/use-seed";
import { getRankings } from "@/lib/server/listings";

export const Route = createFileRoute("/rankings")({ component: RankingsPage });

function RankingsPage() {
  useSeed();
  const [days, setDays] = useState(7);
  const q = useQuery({
    queryKey: ["rankings", days],
    queryFn: () => getRankings({ data: { days, categoryId: "software" } }),
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">近期排行</h1>
        <p className="mt-1 text-sm text-muted-foreground">默认看软件工具类目。可换时间窗。</p>
      </div>
      <div>
        <Label>时间窗</Label>
        <select className="mt-1 h-10 rounded-lg border border-input bg-card px-3 text-sm" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={1}>近 1 天</option>
          <option value={3}>近 3 天</option>
          <option value={7}>近 7 天</option>
          <option value={14}>近 14 天</option>
          <option value={0}>不限</option>
        </select>
      </div>
      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-medium">想要最多</h2>
          <div className="grid gap-2">
            {(q.data?.hot ?? []).map((it, i) => <ListingCard key={it.id} item={it} rank={i + 1} />)}
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-medium">价格最低</h2>
          <div className="grid gap-2">
            {(q.data?.cheap ?? []).map((it, i) => <ListingCard key={it.id} item={it} rank={i + 1} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
