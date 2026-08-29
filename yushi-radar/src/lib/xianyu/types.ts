export type ListingSource = "live" | "demo" | "import";

export type Listing = {
  id: string;
  title: string;
  priceFen: number;
  wantCount: number;
  picUrl: string | null;
  area: string | null;
  sellerNick: string | null;
  sellerId: string | null;
  categoryId: string | null;
  categoryName: string | null;
  keyword: string | null;
  sortField: string | null;
  conditionLabel: string | null;
  publishedAt: string | null;
  itemUrl: string | null;
  source: ListingSource;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type CrawlJob = {
  id: number;
  keyword: string;
  categoryId: string | null;
  categoryName: string | null;
  sortLabel: string | null;
  pagesRequested: number;
  pagesDone: number;
  itemCount: number;
  status: string;
  message: string | null;
  source: string;
  createdAt: string;
};

export type SortKey = "default" | "create" | "price_asc" | "price_desc";

export type SearchPageInput = {
  cookie: string;
  keyword: string;
  categoryId: string;
  categoryName: string;
  sort: SortKey;
  page: number;
  pageSize: number;
  publishDays: number | null;
  priceMin: number | null;
  priceMax: number | null;
  mode: "live" | "demo";
};

export type SearchPageResult = {
  ok: boolean;
  blocked: boolean;
  code: string;
  message: string;
  page: number;
  hasMore: boolean;
  items: Listing[];
  refreshedCookie: string | null;
};

export type MarketStats = {
  count: number;
  minFen: number | null;
  maxFen: number | null;
  avgFen: number | null;
  medianFen: number | null;
  p25Fen: number | null;
  p75Fen: number | null;
  wantSum: number;
};

export type CategoryStat = {
  categoryId: string;
  categoryName: string;
  count: number;
  avgFen: number | null;
  minFen: number | null;
  maxFen: number | null;
};
