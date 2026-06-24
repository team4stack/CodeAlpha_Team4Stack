-- StackStore dummy seed data for local / staging testing
-- Run AFTER: 20260624010000_stackstore_marketplace.sql
-- Safe to re-run: uses fixed UUIDs with ON CONFLICT

-- Optional base tables (no-op if already exist in your project)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  store_name text not null,
  description text,
  active boolean not null default true,
  status text default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric,
  category_id uuid,
  image_url text,
  active boolean not null default true,
  stock integer default 1,
  seller_id uuid,
  platform text,
  github_url text,
  demo_url text,
  live_url text,
  verification_status text not null default 'pending',
  team4stack_verified boolean not null default false,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Demo categories
insert into public.categories (id, name, description, active)
values
  ('a1000001-0000-4000-8000-000000000001', 'MERN Stack', 'MongoDB, Express, React, Node.js projects', true),
  ('a1000001-0000-4000-8000-000000000002', 'Next.js', 'Next.js full-stack and SSR apps', true),
  ('a1000001-0000-4000-8000-000000000003', 'Mobile & APIs', 'Flutter, React Native, and REST APIs', true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  active = true,
  updated_at = now();

-- Demo sellers (user_id optional — link your real auth user later if needed)
insert into public.sellers (id, user_id, store_name, description, active, status)
values
  (
    'b1000001-0000-4000-8000-000000000001',
    null,
    'Sami Projects',
    'Full-stack MERN and Next.js templates built by Team4Stack students.',
    true,
    'approved'
  ),
  (
    'b1000001-0000-4000-8000-000000000002',
    null,
    'Hasnain UI Lab',
    'Frontend-focused React and Next.js starter kits.',
    true,
    'approved'
  )
on conflict (id) do update set
  store_name = excluded.store_name,
  description = excluded.description,
  active = true,
  status = 'approved',
  updated_at = now();

-- Verified demo products (visible on /stackstore storefront)
insert into public.products (
  id,
  name,
  description,
  price,
  category_id,
  image_url,
  active,
  stock,
  seller_id,
  platform,
  github_url,
  demo_url,
  live_url,
  verification_status,
  team4stack_verified
)
values
  (
    'd1000001-0000-4000-8000-000000000001',
    'MERN E-Commerce Store',
    'Complete online shop with admin panel, cart, checkout UI, JWT auth, and MongoDB models. Includes seed data and deployment guide.',
    14999,
    'a1000001-0000-4000-8000-000000000001',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop',
    true,
    5,
    'b1000001-0000-4000-8000-000000000001',
    'MERN Stack',
    'https://github.com/vercel/next.js',
    'https://demo.vercel.store',
    'https://demo.vercel.store',
    'approved',
    true
  ),
  (
    'd1000001-0000-4000-8000-000000000002',
    'Next.js SaaS Dashboard',
    'Multi-role dashboard with dark mode, charts, settings pages, and Supabase-ready auth hooks. Ideal for portfolio or client demos.',
    8999,
    'a1000001-0000-4000-8000-000000000002',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
    true,
    8,
    'b1000001-0000-4000-8000-000000000001',
    'Next.js',
    'https://github.com/shadcn-ui/ui',
    'https://ui.shadcn.com',
    'https://ui.shadcn.com',
    'approved',
    true
  ),
  (
    'd1000001-0000-4000-8000-000000000003',
    'React Task Manager Pro',
    'Kanban board, drag-and-drop tasks, filters, local storage sync, and responsive mobile layout. Clean component architecture.',
    4999,
    'a1000001-0000-4000-8000-000000000001',
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&auto=format&fit=crop',
    true,
    10,
    'b1000001-0000-4000-8000-000000000002',
    'React',
    'https://github.com/facebook/react',
    'https://react.dev',
    'https://react.dev',
    'approved',
    true
  ),
  (
    'd1000001-0000-4000-8000-000000000004',
    'Node.js REST API Starter',
    'Production-style Express API with validation, rate limiting, error middleware, PostgreSQL/Supabase examples, and OpenAPI notes.',
    6499,
    'a1000001-0000-4000-8000-000000000003',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
    true,
    6,
    'b1000001-0000-4000-8000-000000000001',
    'Node.js API',
    'https://github.com/expressjs/express',
    null,
    null,
    'approved',
    true
  ),
  (
    'd1000001-0000-4000-8000-000000000005',
    'Flutter Expense Tracker',
    'Cross-platform expense app with categories, charts, monthly reports, and offline-first SQLite storage. Material 3 UI.',
    11999,
    'a1000001-0000-4000-8000-000000000003',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop',
    true,
    4,
    'b1000001-0000-4000-8000-000000000002',
    'Flutter',
    'https://github.com/flutter/flutter',
    'https://flutter.dev',
    'https://flutter.dev',
    'approved',
    true
  ),
  (
    'd1000001-0000-4000-8000-000000000006',
    'Laravel Multi-Vendor Marketplace',
    'Vendor registration, product listings, order workflow, and admin moderation panel. MySQL migrations and Blade/Tailwind views included.',
    22999,
    'a1000001-0000-4000-8000-000000000001',
    'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&auto=format&fit=crop',
    true,
    3,
    'b1000001-0000-4000-8000-000000000001',
    'Laravel',
    'https://github.com/laravel/laravel',
    null,
    null,
    'approved',
    true
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category_id = excluded.category_id,
  image_url = excluded.image_url,
  active = excluded.active,
  stock = excluded.stock,
  seller_id = excluded.seller_id,
  platform = excluded.platform,
  github_url = excluded.github_url,
  demo_url = excluded.demo_url,
  live_url = excluded.live_url,
  verification_status = excluded.verification_status,
  team4stack_verified = excluded.team4stack_verified,
  updated_at = now();

-- One pending product (admin verification testing — hidden from storefront)
insert into public.products (
  id,
  name,
  description,
  price,
  category_id,
  image_url,
  active,
  stock,
  seller_id,
  platform,
  github_url,
  verification_status,
  team4stack_verified
)
values (
  'd1000001-0000-4000-8000-000000000099',
  '[Pending] Django Blog CMS',
  'This listing stays pending so you can test admin Verify/Reject on Products page.',
  7500,
  'a1000001-0000-4000-8000-000000000003',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
  false,
  1,
  'b1000001-0000-4000-8000-000000000002',
  'Django',
  'https://github.com/django/django',
  'pending',
  false
)
on conflict (id) do update set
  name = excluded.name,
  verification_status = 'pending',
  team4stack_verified = false,
  active = false,
  updated_at = now();
