import { Heart, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatYuan, relativeTime } from "@/lib/utils";
import type { Listing } from "@/lib/xianyu/types";

export function ListingCard({ item, rank }: { item: Listing; rank?: number }) {
  const letter = (item.categoryName ?? item.title).slice(0, 1);
  return (
    <a
      href={item.itemUrl ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="group flex gap-3 rounded-2xl bg-card p-3 shadow-[0_0_0_1px_rgba(28,27,24,0.06)] transition-colors hover:bg-muted/60"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-primary text-primary-foreground">
        {item.picUrl ? (
          <img src={item.picUrl} alt="" className="size-full object-cover outline outline-1 -outline-offset-1 outline-foreground/10" />
        ) : (
          <div className="flex size-full items-center justify-center font-display text-xl">{letter}</div>
        )}
        {rank != null ? (
          <span className="absolute top-1 left-1 rounded bg-primary/80 px-1 text-[10px] tabular-nums">{rank}</span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm leading-snug">{item.title}</p>
          <p className="shrink-0 font-medium tabular-nums text-primary">¥{formatYuan(item.priceFen)}</p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {item.categoryName ? <Badge variant="muted">{item.categoryName}</Badge> : null}
          {item.area ? (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="size-3" />
              {item.area}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-0.5 tabular-nums">
            <Heart className="size-3" />
            {item.wantCount}
          </span>
          <span>{relativeTime(item.publishedAt ?? item.lastSeenAt)}</span>
        </div>
      </div>
    </a>
  );
}
