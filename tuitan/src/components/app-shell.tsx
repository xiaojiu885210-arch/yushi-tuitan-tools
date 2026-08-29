import { Link, useRouterState } from "@tanstack/react-router";
import { Hash, LayoutDashboard, Menu, Search, Settings2, UserRound, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTokenStore } from "@/lib/token-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "总览", icon: LayoutDashboard },
  { to: "/search", label: "搜索", icon: Search },
  { to: "/creators", label: "博主", icon: UserRound },
  { to: "/posts", label: "帖子", icon: Newspaper },
  { to: "/topics", label: "话题", icon: Hash },
  { to: "/connect", label: "接入", icon: Settings2 },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex h-10 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const token = useTokenStore((s) => s.token);
  const lastOk = useTokenStore((s) => s.lastTestOk);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const connected = ready && Boolean(token.trim());

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="打开菜单">
            <Menu className="size-5" />
          </Button>
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl tracking-tight">TUITAN</span>
            <span className="text-sm text-muted-foreground">推探</span>
          </Link>
          <nav className="ml-6 hidden items-center gap-1 md:flex">
            <NavLinks />
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={connected ? (lastOk === false ? "warn" : "ok") : "muted"}>
              {connected ? (lastOk === false ? "Token 待验证" : "已接入 X") : "资料库模式"}
            </Badge>
          </div>
        </div>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="pt-12">
          <p className="mb-4 font-display text-lg">推探</p>
          <div className="flex flex-col gap-1">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
