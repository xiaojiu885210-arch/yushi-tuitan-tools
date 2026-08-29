import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreatorCard } from "@/components/creator-card";
import { Label } from "@/components/ui/label";
import { useSeed } from "@/components/use-seed";
import { TOPICS } from "@/lib/scout/glossary";
import { listLibrary } from "@/lib/server/scout";
import type { SortKey } from "@/lib/scout/types";

export const Route = createFileRoute("/creators")({ component: CreatorsPage });

function CreatorsPage() {
  useSeed();
  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState<"all" | "zh" | "en">("all");
  const [sort, setSort] = useState<SortKey>("followers");
  const q = useQuery({
    queryKey: ["library", topic, lang, sort],
    queryFn: () => listLibrary({ data: { topic: topic || undefined, lang, sort } }),
  });
  const rows = q.data?.creators ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">博主库</h1>
        <p className="mt-1 text-sm text-muted-foreground">按粉丝、语言、话题筛选已入库账号。</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>话题</Label>
          <select className="mt-1 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm" value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">全部</option>
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>语言</Label>
          <select className="mt-1 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm" value={lang} onChange={(e) => setLang(e.target.value as "all" | "zh" | "en")}>
            <option value="all">中英</option>
            <option value="zh">中文</option>
            <option value="en">英文</option>
          </select>
        </div>
        <div>
          <Label>排序</Label>
          <select className="mt-1 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="followers">粉丝高</option>
            <option value="heat">热度</option>
            <option value="views">播放</option>
          </select>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{rows.length} 人</p>
      <div className="grid gap-2 md:grid-cols-2">
        {rows.map((c) => (
          <CreatorCard key={c.handle} creator={c} />
        ))}
      </div>
    </div>
  );
}
