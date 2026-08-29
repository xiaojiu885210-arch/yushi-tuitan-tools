import { Badge } from "@/components/ui/badge";
import { fmtZh } from "@/lib/scout/score";
import { TOPICS } from "@/lib/scout/glossary";
import type { Creator } from "@/lib/scout/types";

export function CreatorCard({ creator }: { creator: Creator }) {
  const names = creator.topics
    .map((id) => TOPICS.find((t) => t.id === id)?.name)
    .filter(Boolean);
  return (
    <a
      href={creator.profileUrl}
      target="_blank"
      rel="noreferrer"
      className="flex gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      {creator.avatarUrl ? (
        <img
          src={creator.avatarUrl}
          alt=""
          className="size-12 shrink-0 rounded-full bg-muted object-cover"
        />
      ) : (
        <div className="size-12 shrink-0 rounded-full bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="truncate font-medium">{creator.name}</p>
          <p className="truncate text-sm text-muted-foreground">@{creator.handle}</p>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{creator.bio}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">{fmtZh(creator.followers)} 粉</Badge>
          <Badge variant="muted">{creator.lang === "zh" ? "中文" : "EN"}</Badge>
          {names.slice(0, 3).map((n) => (
            <Badge key={n} variant="muted">
              {n}
            </Badge>
          ))}
        </div>
      </div>
    </a>
  );
}
