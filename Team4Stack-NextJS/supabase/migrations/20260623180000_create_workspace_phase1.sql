-- Phase 1: client projects, tasks, messages, activity (backend service-role only)

create table if not exists public.workspace_projects (
  id serial primary key,
  title text not null,
  description text,
  status text not null default 'scoped'
    check (status in ('scoped', 'in_progress', 'client_review', 'completed', 'archived')),
  client_user_id uuid,
  client_email text,
  client_name text,
  created_by_admin text,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_project_staff (
  id serial primary key,
  project_id integer not null references public.workspace_projects(id) on delete cascade,
  staff_email text not null,
  staff_name text,
  staff_user_id uuid,
  role text not null default 'developer'
    check (role in ('developer', 'qa', 'pm')),
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_tasks (
  id serial primary key,
  project_id integer not null references public.workspace_projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'blocked', 'in_review', 'done')),
  assignee_email text,
  assignee_user_id uuid,
  due_date date,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_messages (
  id serial primary key,
  project_id integer not null references public.workspace_projects(id) on delete cascade,
  sender_kind text not null check (sender_kind in ('user', 'admin')),
  sender_email text not null,
  sender_user_id uuid,
  body text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_activity (
  id serial primary key,
  project_id integer not null references public.workspace_projects(id) on delete cascade,
  actor_email text not null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workspace_projects_client_user_idx on public.workspace_projects (client_user_id);
create index if not exists workspace_projects_client_email_idx on public.workspace_projects (lower(client_email));
create index if not exists workspace_project_staff_project_idx on public.workspace_project_staff (project_id);
create index if not exists workspace_tasks_project_idx on public.workspace_tasks (project_id);
create index if not exists workspace_messages_project_idx on public.workspace_messages (project_id, created_at desc);
create index if not exists workspace_activity_project_idx on public.workspace_activity (project_id, created_at desc);

alter table public.workspace_projects enable row level security;
alter table public.workspace_project_staff enable row level security;
alter table public.workspace_tasks enable row level security;
alter table public.workspace_messages enable row level security;
alter table public.workspace_activity enable row level security;

revoke all privileges on table public.workspace_projects from public, anon, authenticated;
revoke all privileges on table public.workspace_project_staff from public, anon, authenticated;
revoke all privileges on table public.workspace_tasks from public, anon, authenticated;
revoke all privileges on table public.workspace_messages from public, anon, authenticated;
revoke all privileges on table public.workspace_activity from public, anon, authenticated;
