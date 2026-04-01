create extension if not exists pgcrypto;

create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null,
  session_id uuid,
  user_id uuid,
  user_email text,
  consent_level text not null default 'functional' check (consent_level in ('functional')),
  event_type text not null default 'page_view' check (event_type in ('page_view')),
  page_path text not null,
  page_url text,
  page_title text,
  referrer text,
  browser_name text,
  browser_version text,
  os_name text,
  device_type text,
  device_label text,
  platform text,
  language text,
  languages text[] not null default '{}',
  timezone text,
  screen_width integer,
  screen_height integer,
  viewport_width integer,
  viewport_height integer,
  color_scheme text,
  cookie_enabled boolean,
  touch_points integer,
  hardware_concurrency integer,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists visitor_events_created_at_idx
  on public.visitor_events (created_at desc);

create index if not exists visitor_events_visitor_id_idx
  on public.visitor_events (visitor_id, created_at desc);

create index if not exists visitor_events_user_id_idx
  on public.visitor_events (user_id, created_at desc);

alter table public.visitor_events enable row level security;

revoke all privileges on table public.visitor_events from public, anon, authenticated;
