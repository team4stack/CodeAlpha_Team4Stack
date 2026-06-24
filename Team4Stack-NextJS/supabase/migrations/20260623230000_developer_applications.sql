-- Developer applications (apply from /team) + ensure developer_profiles exists

create table if not exists public.developer_profiles (
  id serial primary key,
  slug text not null unique,
  user_id uuid,
  user_email text,
  name text not null,
  role text,
  bio text,
  long_bio text,
  skills text[] not null default '{}',
  image_url text,
  portfolio_url text,
  github_url text,
  availability text not null default 'available'
    check (availability in ('available', 'busy', 'limited')),
  is_published boolean not null default true,
  assigned_by_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_conversations (
  id serial primary key,
  developer_profile_id integer not null references public.developer_profiles(id) on delete cascade,
  client_user_id uuid,
  client_email text not null,
  client_name text,
  subject text,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_messages (
  id serial primary key,
  conversation_id integer not null references public.profile_conversations(id) on delete cascade,
  sender_kind text not null check (sender_kind in ('client', 'developer')),
  sender_user_id uuid,
  sender_email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.developer_applications (
  id serial primary key,
  applicant_user_id uuid,
  name text not null,
  email text not null,
  role text,
  skills text[] not null default '{}',
  portfolio_url text,
  github_url text,
  bio text not null,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by_admin text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists developer_profiles_slug_idx on public.developer_profiles (slug);
create index if not exists developer_applications_email_idx on public.developer_applications (lower(email));
create index if not exists developer_applications_status_idx on public.developer_applications (status, created_at desc);

alter table public.developer_profiles enable row level security;
alter table public.profile_conversations enable row level security;
alter table public.profile_messages enable row level security;
alter table public.developer_applications enable row level security;

revoke all privileges on table public.developer_profiles from public, anon, authenticated;
revoke all privileges on table public.profile_conversations from public, anon, authenticated;
revoke all privileges on table public.profile_messages from public, anon, authenticated;
revoke all privileges on table public.developer_applications from public, anon, authenticated;

insert into public.developer_profiles (slug, name, role, bio, long_bio, skills, image_url, availability, is_published)
values
  ('sami', 'M. Sami Ullah Khan', 'Full Stack Developer — Team Lead',
   'Leads client projects from planning through delivery and keeps timelines on track.',
   'I specialize in MERN stack architecture, client communication, and end-to-end delivery.',
   array['MERN', 'Architecture', 'Project Management'],
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
   'available', true),
  ('aftab', 'Aftab Alam', 'Backend Developer',
   'Builds secure APIs, database design, and server-side logic for production apps.',
   'Backend-focused engineer with experience in Node.js, PostgreSQL, and REST API design.',
   array['Node.js', 'PostgreSQL', 'REST APIs'],
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
   'available', true),
  ('hasnain', 'Hasnain Ali', 'Frontend Developer',
   'Crafts responsive interfaces, animations, and pixel-perfect user experiences.',
   'Frontend specialist in React and Next.js.',
   array['React', 'Next.js', 'UI/UX'],
   'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
   'limited', true),
  ('fiaz', 'Fiaz Ahmed', 'Full Stack Developer',
   'Ships full features end-to-end and connects third-party services when needed.',
   'Full stack developer comfortable across the MERN stack and DevOps basics.',
   array['MERN', 'DevOps', 'Integrations'],
   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
   'available', true)
on conflict (slug) do nothing;
