import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { inspectToken } from "@/lib/server/scout";
import { useTokenStore } from "@/lib/token-store";

export const Route = createFileRoute("/connect")({ component: ConnectPage });

function ConnectPage() {
  const token = useTokenStore((s) => s.token);
  const setToken = useTokenStore((s) => s.setToken);
  const lastOk = useTokenStore((s) => s.lastTestOk);
  const lastMsg = useTokenStore((s) => s.lastTestMsg);
  const lastAt = useTokenStore((s) => s.lastTestAt);
  const setTest = useTokenStore((s) => s.setTest);
  const clear = useTokenStore((s) => s.clear);
  const [draft, setDraft] = useState(token);
  const [busy, setBusy] = useState(false);

  async function saveAndCheck() {
    setBusy(true);
    try {
      setToken(draft);
      const res = await inspectToken({ data: { token: draft } });
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
        <h1 className="font-display text-3xl tracking-tight">接入 X</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Token 只存在这台浏览器，不会写入博主库。没有 Token 也能用全面资料库搜中英创业账号。
        </p>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Bearer Token</CardTitle>
          <Badge variant={lastOk ? "ok" : lastOk === false ? "warn" : "muted"}>
            {lastOk ? "最近一次连通" : lastOk === false ? "最近一次失败" : "未测试"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>打开 developer.x.com，用自己的 X 账号登录。</li>
            <li>建一个 App，开通 User authentication 和 Read。</li>
            <li>复制 Bearer Token（不要 Access Secret）。</li>
            <li>贴到下方并试搜。套餐需要带 tweets/search/recent。</li>
          </ol>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="AAAAA…（Bearer Token）"
            className="min-h-32 font-mono text-xs"
            spellCheck={false}
            autoComplete="off"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void saveAndCheck()} disabled={busy || !draft.trim()}>
              {busy ? "测试中…" : "保存并试搜"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clear();
                setDraft("");
              }}
            >
              从本机清除
            </Button>
          </div>
          {lastMsg ? (
            <p className="text-sm text-muted-foreground">
              {lastAt ? new Date(lastAt).toLocaleString("zh-CN") : ""} {lastMsg}
            </p>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            中文在 X 上经常搜不准。推探会把「创业 / 独立开发 / 出海」扩成 startup、indie hacker、build in public 等多条车道一起跑。
          </p>
          <p>
            没开 API 时，用内置中英资料库就能看高播放、高点赞、高收藏。实搜成功后会自动合并入库。
          </p>
          <p>
            去 <Link to="/search" className="underline">搜索</Link> 直接开跑。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
