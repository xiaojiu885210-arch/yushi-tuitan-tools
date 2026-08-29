import type { Post } from "./types";

export function heatOf(p: {
  likes: number;
  bookmarks: number;
  views: number;
  replies: number;
  reposts: number;
}): number {
  return Math.round(
    p.likes + p.bookmarks * 3 + p.views / 80 + p.replies * 2 + p.reposts * 2,
  );
}

export function withHeat<T extends Omit<Post, "heat"> & { heat?: number }>(p: T): T & { heat: number } {
  return { ...p, heat: heatOf(p) };
}

export function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}万`.replace("万", "M");
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function fmtZh(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(n >= 100_000 ? 0 : 1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
