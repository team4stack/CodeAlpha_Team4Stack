-- Run in Supabase SQL editor if admission_form lacks date_of_birth (optional text / date column).
-- Age is still required for existing rows; new applications compute age from DOB in the API.
alter table public.admission_form
  add column if not exists date_of_birth text;

comment on column public.admission_form.date_of_birth is 'Applicant DOB as YYYY-MM-DD from the web form';
