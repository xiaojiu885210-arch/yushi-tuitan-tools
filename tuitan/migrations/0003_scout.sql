-- X creator / post library (unowned; tokens never stored)

create table if not exists creators (
  handle         text primary key,
  name           text not null,
  bio            text not null default '',
  avatar_url     text,
  followers      integer not null default 0,
  following      integer not null default 0,
  lang           text not null default 'en',
  topics         text not null default '',
  profile_url    text,
  source         text not null default 'catalog',
  first_seen_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now()
);

create index if not exists creators_followers_idx on creators (followers desc);
create index if not exists creators_lang_idx on creators (lang);
create index if not exists creators_source_idx on creators (source);

create table if not exists posts (
  id             text primary key,
  handle         text not null,
  body           text not null,
  lang           text not null default 'en',
  likes          integer not null default 0,
  bookmarks      integer not null default 0,
  views          integer not null default 0,
  replies        integer not null default 0,
  reposts        integer not null default 0,
  topics         text not null default '',
  post_url       text,
  posted_at      timestamptz,
  source         text not null default 'catalog',
  first_seen_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now()
);

create index if not exists posts_handle_idx on posts (handle);
create index if not exists posts_likes_idx on posts (likes desc);
create index if not exists posts_bookmarks_idx on posts (bookmarks desc);
create index if not exists posts_views_idx on posts (views desc);
create index if not exists posts_posted_idx on posts (posted_at desc);
create index if not exists posts_source_idx on posts (source);

create table if not exists search_jobs (
  id              serial primary key,
  query           text not null default '',
  lanes           text,
  post_count      integer not null default 0,
  creator_count   integer not null default 0,
  status          text not null,
  message         text,
  source          text not null,
  created_at      timestamptz not null default now()
);

create index if not exists search_jobs_created_idx on search_jobs (created_at desc);
