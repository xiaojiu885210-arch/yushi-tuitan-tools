-- Xianyu market listings and crawl history (unowned; cookies never stored)

create table if not exists listings (
  id               text primary key,
  title            text not null,
  price_fen        integer not null,
  want_count       integer not null default 0,
  pic_url          text,
  area             text,
  seller_nick      text,
  seller_id        text,
  category_id      text,
  category_name    text,
  keyword          text,
  sort_field       text,
  condition_label  text,
  published_at     timestamptz,
  item_url         text,
  source           text not null default 'live',
  first_seen_at    timestamptz not null default now(),
  last_seen_at     timestamptz not null default now()
);

create index if not exists listings_category_idx on listings (category_id);
create index if not exists listings_price_idx on listings (price_fen);
create index if not exists listings_want_idx on listings (want_count desc);
create index if not exists listings_last_seen_idx on listings (last_seen_at desc);
create index if not exists listings_published_idx on listings (published_at desc);
create index if not exists listings_source_idx on listings (source);

create table if not exists crawl_jobs (
  id                serial primary key,
  keyword           text not null default '',
  category_id       text,
  category_name     text,
  sort_label        text,
  pages_requested   integer not null default 1,
  pages_done        integer not null default 0,
  item_count        integer not null default 0,
  status            text not null,
  message           text,
  source            text not null,
  created_at        timestamptz not null default now()
);

create index if not exists crawl_jobs_created_idx on crawl_jobs (created_at desc);
