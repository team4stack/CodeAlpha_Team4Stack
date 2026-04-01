-- seo_metadata is not used directly by the application.
-- Remove permissive policies/grants so it is backend-only unless we later
-- introduce a reviewed access path.

do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'seo_metadata'
  loop
    execute format('drop policy if exists %I on public.seo_metadata', r.policyname);
  end loop;
end $$;

revoke all privileges on table public.seo_metadata from public, anon, authenticated;
