-- Phase 2: milestones, deliverables, notifications

create table if not exists public.workspace_milestones (
  id serial primary key,
  project_id integer not null references public.workspace_projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'client_review', 'approved', 'rejected')),
  sort_order integer not null default 0,
  approved_at timestamptz,
  approved_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_deliverables (
  id serial primary key,
  project_id integer not null references public.workspace_projects(id) on delete cascade,
  milestone_id integer references public.workspace_milestones(id) on delete set null,
  title text not null,
  description text,
  file_url text,
  staging_url text,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'approved', 'revision_requested')),
  visible_to_client boolean not null default false,
  submitted_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_notifications (
  id serial primary key,
  recipient_email text not null,
  recipient_user_id uuid,
  project_id integer references public.workspace_projects(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link_path text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists workspace_milestones_project_idx on public.workspace_milestones (project_id, sort_order);
create index if not exists workspace_deliverables_project_idx on public.workspace_deliverables (project_id, created_at desc);
create index if not exists workspace_notifications_recipient_idx on public.workspace_notifications (lower(recipient_email), created_at desc);

alter table public.workspace_milestones enable row level security;
alter table public.workspace_deliverables enable row level security;
alter table public.workspace_notifications enable row level security;

revoke all privileges on table public.workspace_milestones from public, anon, authenticated;
revoke all privileges on table public.workspace_deliverables from public, anon, authenticated;
revoke all privileges on table public.workspace_notifications from public, anon, authenticated;
