export type ScoutSource = "catalog" | "live" | "import";

export type Creator = {
  handle: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  followers: number;
  following: number;
  lang: string;
  topics: string[];
  profileUrl: string;
  source: ScoutSource;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type Post = {
  id: string;
  handle: string;
  body: string;
  lang: string;
  likes: number;
  bookmarks: number;
  views: number;
  replies: number;
  reposts: number;
  topics: string[];
  postUrl: string;
  postedAt: string | null;
  source: ScoutSource;
  heat: number;
};

export type SearchLane = {
  id: string;
  label: string;
  kind: "zh" | "en" | "user" | "tag" | "topic";
  query: string;
};

export type QueryPlan = {
  original: string;
  detected: "zh" | "en" | "mixed";
  tokens: string[];
  translated: string[];
  lanes: SearchLane[];
  related: string[];
};

export type SearchHit = {
  creators: Creator[];
  posts: Post[];
  plan: QueryPlan;
  source: ScoutSource;
  message: string;
};

export type TopicStat = {
  id: string;
  name: string;
  creatorCount: number;
  postCount: number;
  views: number;
  likes: number;
  bookmarks: number;
};

export type SortKey = "heat" | "views" | "likes" | "bookmarks" | "followers" | "new";
