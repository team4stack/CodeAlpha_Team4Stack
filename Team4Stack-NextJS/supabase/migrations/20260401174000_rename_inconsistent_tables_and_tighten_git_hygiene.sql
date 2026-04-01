-- Normalize a couple of inconsistent public table names while preserving old names
-- as compatibility views so existing deployments do not break during rollout.

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'admission_form' and table_type = 'BASE TABLE'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'admission_forms' and table_type = 'BASE TABLE'
  ) then
    alter table public.admission_form rename to admission_forms;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'mentor_profile' and table_type = 'BASE TABLE'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'mentor_profiles' and table_type = 'BASE TABLE'
  ) then
    alter table public.mentor_profile rename to mentor_profiles;
  end if;
end $$;

drop view if exists public.admission_form;
create view public.admission_form
with (security_invoker = true)
as
select *
from public.admission_forms;

drop view if exists public.mentor_profile;
create view public.mentor_profile
with (security_invoker = true)
as
select *
from public.mentor_profiles;

comment on table public.admission_forms is 'Canonical plural name for student admissions.';
comment on table public.mentor_profiles is 'Canonical plural name for mentor profiles.';

revoke all privileges on table public.admin_users from public, anon, authenticated;
revoke all privileges on table public.deleted_accounts from public, anon, authenticated;
revoke all privileges on table public.admission_forms from public, anon, authenticated;
revoke all privileges on table public.mentor_profiles from public, anon, authenticated;
revoke all privileges on table public.admission_form from public, anon, authenticated;
revoke all privileges on table public.mentor_profile from public, anon, authenticated;

alter table if exists public.admin_users enable row level security;
alter table if exists public.deleted_accounts enable row level security;
alter table if exists public.admission_forms enable row level security;
alter table if exists public.mentor_profiles enable row level security;
