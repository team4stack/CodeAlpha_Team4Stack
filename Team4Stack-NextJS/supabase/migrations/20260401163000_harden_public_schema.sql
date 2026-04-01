-- Harden exposed public relations and repair legacy admin password RPCs.
-- The backend uses the service-role key, so enabling RLS and revoking anon/authenticated
-- access here does not break server-side CRUD while it closes public PostgREST exposure.

create extension if not exists pgcrypto with schema extensions;

alter view if exists public.quiz_results_view set (security_invoker = true);

revoke all privileges on table public.quiz_results_view from public, anon, authenticated;

revoke all privileges on table public.audit_logs from public, anon, authenticated;
revoke all privileges on table public.course_assignment_submissions from public, anon, authenticated;
revoke all privileges on table public.course_assignments from public, anon, authenticated;
revoke all privileges on table public.course_certificate_applications from public, anon, authenticated;
revoke all privileges on table public.orders from public, anon, authenticated;
revoke all privileges on table public.products from public, anon, authenticated;
revoke all privileges on table public.progress_records from public, anon, authenticated;
revoke all privileges on table public.student_course_notifications from public, anon, authenticated;
revoke all privileges on table public.videos from public, anon, authenticated;

alter table if exists public.audit_logs enable row level security;
alter table if exists public.course_assignment_submissions enable row level security;
alter table if exists public.course_assignments enable row level security;
alter table if exists public.course_certificate_applications enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.products enable row level security;
alter table if exists public.progress_records enable row level security;
alter table if exists public.student_course_notifications enable row level security;
alter table if exists public.videos enable row level security;

create or replace function public.hash_admin_password(p_password text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return extensions.crypt(p_password, extensions.gen_salt('bf', 12));
end;
$$;

create or replace function public.add_admin_user(p_email text, p_password text, p_role text default 'admin'::text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(p_email));
  v_password_hash text;
  v_admin_id uuid;
begin
  if v_email = '' or coalesce(trim(p_password), '') = '' then
    return json_build_object(
      'success', false,
      'error', 'Email and password are required'
    );
  end if;

  v_password_hash := extensions.crypt(p_password, extensions.gen_salt('bf', 12));

  insert into public.admin_users (email, password_hash, role)
  values (v_email, v_password_hash, coalesce(nullif(trim(p_role), ''), 'admin'))
  returning id into v_admin_id;

  return json_build_object(
    'success', true,
    'message', 'Admin user created successfully',
    'id', v_admin_id,
    'email', v_email
  );
exception
  when unique_violation then
    return json_build_object(
      'success', false,
      'error', 'Email already exists'
    );
  when others then
    return json_build_object(
      'success', false,
      'error', sqlerrm
    );
end;
$$;

create or replace function public.add_admin_user(user_email text, admin_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return public.add_admin_user(user_email, admin_password, 'admin');
end;
$$;

create or replace function public.verify_admin_password(p_email text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user public.admin_users%rowtype;
  v_valid boolean;
begin
  select *
  into v_user
  from public.admin_users
  where email = lower(trim(p_email));

  if not found then
    return json_build_object('valid', false, 'error', 'Invalid email or password');
  end if;

  v_valid := (v_user.password_hash = extensions.crypt(p_password, v_user.password_hash));

  if v_valid then
    return json_build_object('valid', true, 'message', 'Password verified');
  end if;

  return json_build_object('valid', false, 'error', 'Invalid email or password');
exception
  when others then
    return json_build_object('valid', false, 'error', 'An error occurred during verification');
end;
$$;
