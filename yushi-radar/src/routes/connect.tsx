import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { inspectCookie, searchXianyuPage } from "@/lib/server/crawl";
import { useCookieStore } from "@/lib/cookie-store";

export const Route = createFileRoute("/connect")({ component: ConnectPage });

function ConnectPage() {
  const cookie = useCookieStore((s) => s.cookie);
  const setCookie = useCookieStore((s) => s.setCookie);
  const lastOk = useCookieStore((s) => s.lastTestOk);
  const lastMsg = useCookieStore((s) => s.lastTestMsg);
  const lastAt = useCookieStore((s) => s.lastTestAt);
  const setTest = useCookieStore((s) => s.setTest);
  const clear = useCookieStore((s) => s.clear);
  const [draft, setDraft] = useState(cookie);
  const [busy, setBusy] = useState(false);

  async function saveAndCheck() {
    setBusy(true);
    try {
      setCookie(draft);
      const info = await inspectCookie({ data: { cookie: draft } });
      if (!info.looksValid) {
        setTest(false, "Cookie 里看不到 _m_h5_tk。");
        toast.error("缺少 _m_h5_tk");
        return;
      }
      const res = await searchXianyuPage({
        data: {
          cookie: draft,
          keyword: "闲鱼采集",
          categoryId: "software",
          categoryName: "软件工具",
          sort: "default",
          page: 1,
          pageSize: 10,
          publishDays: 7,
          priceMin: null,
          priceMax: null,
          mode: "live",
        },
      });
      if (res.refreshedCookie) setCookie(res.refreshedCookie);
      setTest(res.ok, res.message);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">接入 Cookie</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cookie 只存在这台浏览器。机房接口常被滑块拦，完整实搜请用采集页「本机闲鱼」。</p>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>粘贴 Cookie</CardTitle>
          <Badge variant={lastOk ? "ok" : lastOk === false ? "warn" : "muted"}>
            {lastOk ? "最近一次实搜成功" : lastOk === false ? "最近一次失败" : "未测试"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>打开 www.goofish.com 并登录。</li>
            <li>F12 → Application → Cookies → 复制全部。</li>
            <li>至少包含 _m_h5_tk。</li>
          </ol>
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-40 font-mono text-xs" spellCheck={false} />
          <div className="flex gap-2">
            <Button onClick={() => void saveAndCheck()} disabled={busy || !draft.trim()}>{busy ? "测试中…" : "保存并试搜"}</Button>
            <Button variant="outline" onClick={() => { clear(); setDraft(""); }}>从本机清除</Button>
          </div>
          {lastMsg ? <p className="text-sm text-muted-foreground">{lastAt ? new Date(lastAt).toLocaleString("zh-CN") : ""} {lastMsg}</p> : null}
          <p className="text-sm text-muted-foreground">采集走 <Link to="/collect" className="underline">本机闲鱼</Link> 更稳。</p>
        </CardContent>
      </Card>
    </div>
  );
}
