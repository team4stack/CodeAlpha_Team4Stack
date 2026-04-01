-- The application now uses canonical plural relation names directly.
-- Remove temporary compatibility views so Supabase only shows the real tables in use.

drop view if exists public.admission_form;
drop view if exists public.mentor_profile;
