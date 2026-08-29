import type { MarketStats } from "./types";

export function computeStats(pricesFen: number[], wantSum = 0): MarketStats {
  if (pricesFen.length === 0) {
    return {
      count: 0,
      minFen: null,
      maxFen: null,
      avgFen: null,
      medianFen: null,
      p25Fen: null,
      p75Fen: null,
      wantSum,
    };
  }
  const sorted = [...pricesFen].sort((a, b) => a - b);
  const pick = (p: number) => {
    const i = (sorted.length - 1) * p;
    const lo = Math.floor(i);
    const hi = Math.ceil(i);
    if (lo === hi) return sorted[lo]!;
    return Math.round(sorted[lo]! * (hi - i) + sorted[hi]! * (i - lo));
  };
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    count: sorted.length,
    minFen: sorted[0]!,
    maxFen: sorted[sorted.length - 1]!,
    avgFen: Math.round(sum / sorted.length),
    medianFen: pick(0.5),
    p25Fen: pick(0.25),
    p75Fen: pick(0.75),
    wantSum,
  };
}

export function histogram(pricesFen: number[], buckets = 8): { label: string; count: number; from: number; to: number }[] {
  if (pricesFen.length === 0) return [];
  const min = Math.min(...pricesFen);
  const max = Math.max(...pricesFen);
  if (min === max) {
    return [{ label: `${Math.round(min / 100)}`, count: pricesFen.length, from: min, to: max }];
  }
  const width = (max - min) / buckets;
  const bars = Array.from({ length: buckets }, (_, i) => {
    const from = min + i * width;
    const to = i === buckets - 1 ? max : min + (i + 1) * width;
    return {
      label: `${Math.round(from / 100)}`,
      count: 0,
      from: Math.round(from),
      to: Math.round(to),
    };
  });
  for (const p of pricesFen) {
    let idx = Math.floor((p - min) / width);
    if (idx >= buckets) idx = buckets - 1;
    if (idx < 0) idx = 0;
    bars[idx]!.count += 1;
  }
  return bars;
}
