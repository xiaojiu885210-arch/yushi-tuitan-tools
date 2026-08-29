import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSeed } from "@/components/use-seed";
import { queryListings } from "@/lib/server/listings";
import { downloadText, toCsv } from "@/lib/utils";

export const Route = createFileRoute("/library")({ component: LibraryPage });

function LibraryPage() {
  useSeed();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"recent" | "want" | "price_asc" | "new">("recent");
  const data = useQuery({
    queryKey: ["library", q, sort],
    queryFn: () => queryListings({ data: { q, sort, limit: 120 } }),
  });
  const items = data.data?.items ?? [];

  function exportCsv() {
    if (!items.length) return;
    const csv = toCsv(
      items.map((it) => ({
        id: it.id,
        title: it.title,
        price_yuan: (it.priceFen / 100).toFixed(2),
        want: it.wantCount,
        area: it.area,
        seller: it.sellerNick,
        category: it.categoryName,
        keyword: it.keyword,
        published_at: it.publishedAt,
        url: it.itemUrl,
        source: it.source,
      })),
    );
    downloadText("yushi-listings.csv", `\uFEFF${csv}`, "text/csv;charset=utf-8");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">商品库</h1>
          <p className="mt-1 text-sm text-muted-foreground">已入库 {data.data?.total ?? 0} 条。</p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!items.length}>
          导出 CSV
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>搜索</Label>
          <Input className="mt-1" value={q} onChange={(e) => setQ(e.target.value)} placeholder="标题 / 卖家 / 关键词" />
        </div>
        <div>
          <Label>排序</Label>
          <select className="mt-1 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="recent">最近见到</option>
            <option value="want">想要最多</option>
            <option value="price_asc">价格低到高</option>
            <option value="new">最新上架</option>
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        {items.map((it) => <ListingCard key={it.id} item={it} />)}
      </div>
    </div>
  );
}
