-- Reduce Security Advisor warnings by:
-- 1) removing overly-permissive public RLS policies on backend-only tables,
-- 2) keeping only a minimal self-service policy set on public.users,
-- 3) fixing mutable search_path findings on legacy functions.

do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'admin_users',
        'admission_forms',
        'courses',
        'deleted_accounts',
        'mentor_profiles',
        'projects',
        'quiz_attempt_answers',
        'quiz_attempts',
        'quiz_options',
        'quiz_questions',
        'quizzes',
        'reviews',
        'services',
        'site_settings',
        'support_requests',
        'team_members',
        'users'
      )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

revoke all privileges on table public.admin_users from public, anon, authenticated;
revoke all privileges on table public.admission_forms from public, anon, authenticated;
revoke all privileges on table public.courses from public, anon, authenticated;
revoke all privileges on table public.deleted_accounts from public, anon, authenticated;
revoke all privileges on table public.mentor_profiles from public, anon, authenticated;
revoke all privileges on table public.projects from public, anon, authenticated;
revoke all privileges on table public.quiz_attempt_answers from public, anon, authenticated;
revoke all privileges on table public.quiz_attempts from public, anon, authenticated;
revoke all privileges on table public.quiz_options from public, anon, authenticated;
revoke all privileges on table public.quiz_questions from public, anon, authenticated;
revoke all privileges on table public.quizzes from public, anon, authenticated;
revoke all privileges on table public.reviews from public, anon, authenticated;
revoke all privileges on table public.services from public, anon, authenticated;
revoke all privileges on table public.site_settings from public, anon, authenticated;
revoke all privileges on table public.support_requests from public, anon, authenticated;
revoke all privileges on table public.team_members from public, anon, authenticated;
revoke all privileges on table public.users from public, anon, authenticated;

grant select, insert, update on table public.users to authenticated;

create policy users_select_self
on public.users
for select
to authenticated
using (auth.uid() = id);

create policy users_insert_self
on public.users
for insert
to authenticated
with check (auth.uid() = id);

create policy users_update_self
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.can_retake_quiz(p_quiz_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allow_retake boolean;
  v_max_attempts integer;
  v_current_attempts integer;
begin
  select q.allow_retake, q.max_attempts
  into v_allow_retake, v_max_attempts
  from public.quizzes q
  where q.id = p_quiz_id;

  if not coalesce(v_allow_retake, false) then
    return false;
  end if;

  select count(*)
  into v_current_attempts
  from public.quiz_attempts qa
  where qa.quiz_id = p_quiz_id
    and qa.user_id = p_user_id;

  if coalesce(v_max_attempts, 0) > 0 and v_current_attempts >= v_max_attempts then
    return false;
  end if;

  return true;
end;
$$;

create or replace function public.get_next_attempt_number(p_quiz_id uuid, p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_attempt integer;
begin
  select coalesce(max(qa.attempt_number), 0) + 1
  into v_max_attempt
  from public.quiz_attempts qa
  where qa.quiz_id = p_quiz_id
    and qa.user_id = p_user_id;

  return v_max_attempt;
end;
$$;

create or replace function public.sync_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, lower(new.email), 'user')
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

create or replace function public.update_admin_users_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.update_support_requests_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
