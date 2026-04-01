alter table public.visitor_events
  add column if not exists first_seen_at timestamptz not null default now(),
  add column if not exists last_seen_at timestamptz not null default now(),
  add column if not exists visit_count integer not null default 1,
  add column if not exists page_history text[] not null default '{}';

with session_rollups as (
  select
    session_id,
    min(coalesce(first_seen_at, created_at, now())) as first_seen_at,
    max(coalesce(last_seen_at, created_at, now())) as last_seen_at,
    greatest(sum(greatest(coalesce(visit_count, 1), 1)), 1) as visit_count,
    array_remove(
      array_agg(distinct left(page_path, 512)) filter (where page_path is not null and btrim(page_path) <> ''),
      null
    ) as page_history
  from public.visitor_events
  where session_id is not null
  group by session_id
)
update public.visitor_events
set
  first_seen_at = coalesce(session_rollups.first_seen_at, public.visitor_events.first_seen_at, created_at, now()),
  last_seen_at = coalesce(session_rollups.last_seen_at, public.visitor_events.last_seen_at, created_at, now()),
  visit_count = coalesce(session_rollups.visit_count, greatest(coalesce(visit_count, 1), 1)),
  page_history = case
    when coalesce(array_length(session_rollups.page_history, 1), 0) > 0 then session_rollups.page_history
    when coalesce(array_length(page_history, 1), 0) > 0 then page_history
    when page_path is not null then array[page_path]
    else '{}'::text[]
  end
from session_rollups
where public.visitor_events.session_id = session_rollups.session_id;

delete from public.visitor_events a
using public.visitor_events b
where a.id < b.id
  and a.session_id = b.session_id;

delete from public.visitor_events
where session_id is null;

alter table public.visitor_events
  alter column session_id set not null;

create unique index if not exists visitor_events_session_id_key
  on public.visitor_events (session_id);

drop index if exists visitor_events_created_at_idx;

create index if not exists visitor_events_last_seen_at_idx
  on public.visitor_events (last_seen_at desc);

create index if not exists visitor_events_visitor_id_last_seen_idx
  on public.visitor_events (visitor_id, last_seen_at desc);

create index if not exists visitor_events_user_id_last_seen_idx
  on public.visitor_events (user_id, last_seen_at desc);
