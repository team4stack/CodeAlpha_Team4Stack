-- StackStore marketplace: seller applications, verified pre-made projects, escrow orders

create table if not exists public.seller_applications (
  id serial primary key,
  applicant_user_id uuid,
  name text not null,
  email text not null,
  store_name text not null,
  primary_platform text not null,
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

create index if not exists seller_applications_email_idx on public.seller_applications (lower(email));
create index if not exists seller_applications_status_idx on public.seller_applications (status, created_at desc);

alter table if exists public.sellers
  add column if not exists status text default 'approved'
    check (status in ('pending', 'approved', 'rejected'));

alter table if exists public.products
  add column if not exists seller_id uuid,
  add column if not exists platform text,
  add column if not exists github_url text,
  add column if not exists demo_url text,
  add column if not exists live_url text,
  add column if not exists verification_status text not null default 'pending'
    check (verification_status in ('pending', 'approved', 'rejected')),
  add column if not exists team4stack_verified boolean not null default false,
  add column if not exists rejection_reason text;

create index if not exists products_seller_id_idx on public.products (seller_id);
create index if not exists products_verification_idx on public.products (verification_status, active, created_at desc);

alter table if exists public.orders
  add column if not exists seller_id uuid,
  add column if not exists buyer_email text,
  add column if not exists buyer_note text,
  add column if not exists escrow_status text not null default 'pending_payment'
    check (escrow_status in (
      'pending_payment',
      'payment_received',
      'in_escrow',
      'delivery_pending',
      'completed',
      'disputed',
      'cancelled'
    )),
  add column if not exists payment_reference text,
  add column if not exists admin_note text;

create index if not exists orders_escrow_status_idx on public.orders (escrow_status, created_at desc);

alter table if exists public.seller_applications enable row level security;
revoke all privileges on table public.seller_applications from public, anon, authenticated;
