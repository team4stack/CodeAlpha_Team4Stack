-- Run in Supabase SQL editor (or migrate) so admin-sent course notifications persist.
create table if not exists public.student_course_notifications (
  id bigserial primary key,
  student_email text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  created_by_email text
);

create index if not exists idx_student_course_notifications_email_created
  on public.student_course_notifications (student_email, created_at desc);

comment on table public.student_course_notifications is 'In-app notifications for approved course students; created by courses admin.';
