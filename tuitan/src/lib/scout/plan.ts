import { expandTerms, hasCjk, tokenize, TOPICS } from "./glossary";
import type { QueryPlan, SearchLane } from "./types";

export function detectLang(q: string): QueryPlan["detected"] {
  const cjk = hasCjk(q);
  const latin = /[a-zA-Z]{2,}/.test(q);
  if (cjk && latin) return "mixed";
  if (cjk) return "zh";
  return "en";
}

function orGroup(terms: string[], n = 6): string {
  const uniq = [...new Set(terms.map((t) => t.trim()).filter(Boolean))].slice(0, n);
  if (!uniq.length) return "";
  return uniq.length === 1 ? uniq[0]! : `(${uniq.map((t) => (t.includes(" ") ? `"${t}"` : t)).join(" OR ")})`;
}

export function planQuery(q: string, minLikes = 0): QueryPlan {
  const original = q.trim();
  const detected = detectLang(original);
  const tokens = tokenize(original);
  const exp = expandTerms(original || "创业");
  const lanes: SearchLane[] = [];

  const zhQ = orGroup(exp.zh, 5);
  if (zhQ) {
    lanes.push({
      id: "zh",
      label: "中文关键词",
      kind: "zh",
      query: minLikes ? `${zhQ} min_faves:${minLikes}` : zhQ,
    });
  }
  const enQ = orGroup(exp.en, 6);
  if (enQ) {
    lanes.push({
      id: "en",
      label: "英文对照",
      kind: "en",
      query: minLikes ? `${enQ} min_faves:${minLikes}` : enQ,
    });
  }
  if (exp.tags.length) {
    lanes.push({
      id: "tag",
      label: "话题标签",
      kind: "tag",
      query: exp.tags.slice(0, 5).join(" OR "),
    });
  }
  const userQ = orGroup([...exp.zh.slice(0, 2), ...exp.en.slice(0, 3)], 5);
  if (userQ) {
    lanes.push({
      id: "user",
      label: "搜账号",
      kind: "user",
      query: userQ,
    });
  }
  for (const id of exp.topics.slice(0, 4)) {
    const t = TOPICS.find((x) => x.id === id);
    if (!t) continue;
    lanes.push({
      id: `topic-${t.id}`,
      label: t.name,
      kind: "topic",
      query: `${t.zh[0]} / ${t.en[0]}`,
    });
  }

  return {
    original: original || "创业",
    detected,
    tokens,
    translated: exp.en,
    lanes,
    related: exp.topics,
  };
}
