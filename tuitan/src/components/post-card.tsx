import { Bookmark, Eye, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fmtZh } from "@/lib/scout/score";
import type { Post } from "@/lib/scout/types";

function Stat({ icon: Icon, n, label }: { icon: typeof Heart; n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
      <Icon className="size-3.5" />
      <span>{fmtZh(n)}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <a
      href={post.postUrl}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">@{post.handle}</p>
        <div className="flex gap-1">
          <Badge variant="muted">{post.lang === "zh" ? "中文" : "EN"}</Badge>
          <Badge variant="outline">热度 {fmtZh(post.heat)}</Badge>
        </div>
      </div>
      <p className="mt-2 line-clamp-5 text-sm leading-relaxed">{post.body}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Stat icon={Eye} n={post.views} label="播放" />
        <Stat icon={Heart} n={post.likes} label="点赞" />
        <Stat icon={Bookmark} n={post.bookmarks} label="收藏" />
        <Stat icon={Repeat2} n={post.reposts} label="转发" />
        <Stat icon={MessageCircle} n={post.replies} label="回复" />
      </div>
    </a>
  );
}
