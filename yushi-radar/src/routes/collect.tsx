import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CategoryTree } from "@/components/category-tree";
import { ListingCard } from "@/components/listing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSeed } from "@/components/use-seed";
import { useCookieStore } from "@/lib/cookie-store";
import { importSearchJson, searchXianyuPage } from "@/lib/server/crawl";
import { recordJob, saveListings } from "@/lib/server/listings";
import { bookmarkletHref, BOOKMARKLET_SOURCE, buildGoofishSearchUrl } from "@/lib/xianyu/bookmarklet";
import { findCategory, KEYWORD_PRESETS } from "@/lib/xianyu/categories";
import { ingestMessage, ingestToListings } from "@/lib/xianyu/ingest";
import type { Listing, SortKey } from "@/lib/xianyu/types";

export const Route = createFileRoute("/collect")({ component: CollectPage });

type Mode = "browser" | "demo" | "live";

function CollectPage() {
  useSeed();
  const qc = useQueryClient();
  const cookie = useCookieStore((s) => s.cookie);
  const setCookie = useCookieStore((s) => s.setCookie);
  const setTest = useCookieStore((s) => s.setTest);
  const [keyword, setKeyword] = useState("闲鱼采集");
  const [categoryId, setCategoryId] = useState("software");
  const [categoryName, setCategoryName] = useState("软件工具");
  const [sort, setSort] = useState<SortKey>("default");
  const [pages, setPages] = useState(2);
  const [publishDays, setPublishDays] = useState<number | null>(7);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [mode, setMode] = useState<Mode>("browser");
  const [importRaw, setImportRaw] = useState("");
  const [running, setRunning] = useState(false);
  const [items, setItems] = useState<Listing[]>([]);
  const metaRef = useRef({ keyword, categoryId, categoryName });
  metaRef.current = { keyword, categoryId, categoryName };
  const commitRef = useRef<(rows: Listing[], source: string, message: string) => Promise<void>>(async () => {});

  const saveMut = useMutation({
    mutationFn: (rows: Listing[]) => saveListings({ data: { items: rows } }),
  });

  async function commitItems(rows: Listing[], source: string, message: string) {
    if (!rows.length) {
      toast.error("没有解析到商品。");
      return;
    }
    setItems(rows);
    await saveMut.mutateAsync(rows);
    await recordJob({
      data: {
        keyword: metaRef.current.keyword,
        categoryId: metaRef.current.categoryId,
        categoryName: metaRef.current.categoryName,
        sortLabel: source,
        pagesRequested: 1,
        pagesDone: 1,
        itemCount: rows.length,
        status: "ok",
        message,
        source,
      },
    });
    await qc.invalidateQueries();
    toast.success(message);
  }
  commitRef.current = commitItems;

  useEffect(() => {
    function onMsg(ev: MessageEvent) {
      const rows = ingestMessage(ev.data, metaRef.current);
      if (!rows.length) return;
      void commitRef.current(rows, "browser", `本机闲鱼回传 ${rows.length} 条`);
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  async function runCrawl() {
    if (mode === "browser") {
      const cat = findCategory(categoryId);
      const url = buildGoofishSearchUrl({
        keyword: keyword.trim() || categoryName || "闲置",
        categoryGoofishId: cat?.goofishId || undefined,
      });
      const w = window.open(url, "yushi-goofish");
      if (!w) toast.error("弹窗被拦截。允许弹窗后再试。");
      else toast.message("闲鱼已打开。结果出来后点书签「鱼市回传」。");
      return;
    }
    setRunning(true);
    setItems([]);
    const collected: Listing[] = [];
    try {
      for (let page = 1; page <= pages; page += 1) {
        const res = await searchXianyuPage({
          data: {
            cookie,
            keyword,
            categoryId,
            categoryName,
            sort,
            page,
            pageSize: 30,
            publishDays,
            priceMin: priceMin ? Number(priceMin) : null,
            priceMax: priceMax ? Number(priceMax) : null,
            mode: mode === "live" ? "live" : "demo",
          },
        });
        if (res.refreshedCookie && mode === "live") setCookie(res.refreshedCookie);
        if (!res.ok) {
          setTest(false, res.message);
          toast.error(res.message);
          break;
        }
        if (mode === "live") setTest(true, res.message);
        collected.push(...res.items);
        setItems([...collected]);
        if (res.items.length) await saveMut.mutateAsync(res.items);
        if (!res.hasMore) break;
      }
      if (collected.length) {
        await recordJob({
          data: {
            keyword,
            categoryId,
            categoryName,
            sortLabel: sort,
            pagesRequested: pages,
            pagesDone: pages,
            itemCount: collected.length,
            status: "ok",
            message: "",
            source: mode,
          },
        });
        await qc.invalidateQueries();
        toast.success(`已入库 ${collected.length} 条`);
      }
    } finally {
      setRunning(false);
    }
  }

  async function runImport() {
    const local = ingestToListings(importRaw, metaRef.current);
    if (local.length) {
      await commitItems(local, "import", `解析到 ${local.length} 条`);
      return;
    }
    const res = await importSearchJson({ data: { raw: importRaw, keyword, categoryId, categoryName } });
    if (!res.ok || !res.items.length) {
      toast.error(res.message || "没有解析到商品。");
      return;
    }
    await commitItems(res.items, "import", res.message);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">采集工作台</h1>
        <p className="mt-1 text-sm text-muted-foreground">选类目、关键词。完整实搜走本机闲鱼页回传。</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <Card className="hidden lg:block">
          <CardHeader><CardTitle>类目</CardTitle></CardHeader>
          <CardContent>
            <CategoryTree value={categoryId} onChange={(id, name) => { setCategoryId(id); setCategoryName(name); }} />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <Label htmlFor="kw">关键词</Label>
                <Input id="kw" className="mt-1" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {KEYWORD_PRESETS.map((p) => (
                    <button key={p.label} type="button" className="rounded-full bg-muted px-2.5 py-1 text-xs" onClick={() => { setKeyword(p.keyword); setCategoryId(p.categoryId); setCategoryName(p.label); }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>排序</Label>
                  <select className="mt-1 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                    <option value="default">综合</option>
                    <option value="create">最新</option>
                    <option value="price_asc">价格升</option>
                    <option value="price_desc">价格降</option>
                  </select>
                </div>
                <div>
                  <Label>时间窗</Label>
                  <select className="mt-1 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm" value={publishDays ?? 0} onChange={(e) => setPublishDays(Number(e.target.value) || null)}>
                    <option value={0}>不限</option>
                    <option value={1}>近 1 天</option>
                    <option value={3}>近 3 天</option>
                    <option value={7}>近 7 天</option>
                    <option value={14}>近 14 天</option>
                  </select>
                </div>
                <div>
                  <Label>最低价</Label>
                  <Input className="mt-1" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                </div>
                <div>
                  <Label>最高价</Label>
                  <Input className="mt-1" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
                </div>
                {mode !== "browser" ? (
                  <div>
                    <Label>页数</Label>
                    <Input className="mt-1" type="number" min={1} max={15} value={pages} onChange={(e) => setPages(Math.min(15, Math.max(1, Number(e.target.value) || 1)))} />
                  </div>
                ) : null}
                <div className="sm:col-span-2">
                  <Label>数据源</Label>
                  <div className="mt-1 flex h-10 gap-1 rounded-lg bg-muted p-1">
                    {([["browser", "本机闲鱼"], ["demo", "演示库"], ["live", "Cookie 接口"]] as const).map(([m, label]) => (
                      <button key={m} type="button" onClick={() => setMode(m)} className={`flex-1 rounded-md text-sm ${mode === m ? "bg-card" : "text-muted-foreground"}`}>{label}</button>
                    ))}
                  </div>
                </div>
              </div>
              {mode === "live" && !cookie ? <p className="text-sm text-warn">还没贴 Cookie。去 <Link to="/connect" className="underline">接入</Link>。</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void runCrawl()} disabled={running}>{mode === "browser" ? "打开闲鱼搜索" : running ? "采集中…" : "开始采集并入库"}</Button>
                {mode === "browser" ? (
                  <>
                    <a href={bookmarkletHref()} onClick={(e) => e.preventDefault()} draggable className="inline-flex h-10 items-center rounded-lg border px-4 text-sm">鱼市回传</a>
                    <Button variant="outline" onClick={() => void navigator.clipboard.writeText(BOOKMARKLET_SOURCE).then(() => toast.success("已复制脚本"))}>复制回传脚本</Button>
                  </>
                ) : null}
                <Badge variant="muted">{categoryName}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>粘贴导入</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea id="import-json" value={importRaw} onChange={(e) => setImportRaw(e.target.value)} className="font-mono text-xs" placeholder='{"source":"yushi-bookmarklet","items":[...]}' />
              <Button variant="outline" onClick={() => void runImport()} disabled={importRaw.trim().length < 2}>解析并入库</Button>
            </CardContent>
          </Card>
          <div className="grid gap-2">
            {items.map((it) => <ListingCard key={it.id} item={it} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
