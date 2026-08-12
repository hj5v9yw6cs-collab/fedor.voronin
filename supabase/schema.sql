-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run).
-- See README.md "Личный кабинет" section for the full setup walkthrough.

-- One row per person who can log in (student or teacher). Created
-- automatically whenever a new user is added in Authentication → Users,
-- so you never have to insert into this table by hand.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,                 -- copied from auth.users at creation, so the
                               -- teacher can tell students apart before
                               -- bothering to set a display name
  contact text,               -- telegram / instagram of the student
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles: read own row"
  on profiles for select
  using (auth.uid() = id);

-- Whether the signed-in user is a teacher. This runs `security definer`
-- (as the function's owner, not the caller), which is what lets it read
-- `profiles` without re-triggering that table's own RLS policies —
-- a policy that queries `profiles` directly from inside itself sends
-- Postgres into "infinite recursion detected in policy for relation
-- profiles". Routing that lookup through this function is the standard
-- Supabase fix.
create or replace function is_teacher()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'teacher'
  );
$$;

create policy "profiles: teacher reads everyone"
  on profiles for select
  using (is_teacher());

create policy "profiles: teacher updates everyone"
  on profiles for update
  using (is_teacher())
  with check (is_teacher());

-- Private notes about a student, visible only to the teacher (never
-- shown in the student's own view).
alter table profiles add column if not exists teacher_notes text;

-- Auto-create the profile row the moment a new auth user is added.
-- Every new user starts as a student — promote yourself to 'teacher'
-- with the one-off SQL command in the README after your own first login.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- One row per scheduled/held lesson.
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  scheduled_at timestamptz not null,
  meeting_url text,           -- link to the Яндекс Телемост room
  topic text,
  materials jsonb not null default '[]', -- [{ "title": "...", "url": "..." }]
  homework text,
  teacher_comment text,
  paid boolean not null default false,
  homework_done boolean not null default false,
  student_message text,       -- a question the student left for the teacher
  reminder_sent_at timestamptz, -- set by the send-reminders Edge Function
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table lessons enable row level security;
-- Older projects created before these columns existed need this too —
-- harmless no-op if the table was just created above.
alter table lessons add column if not exists paid boolean not null default false;
alter table lessons add column if not exists homework_done boolean not null default false;
alter table lessons add column if not exists student_message text;
alter table lessons add column if not exists reminder_sent_at timestamptz;

create policy "lessons: student reads own"
  on lessons for select
  using (auth.uid() = student_id);

create policy "lessons: teacher reads all"
  on lessons for select
  using (is_teacher());

create policy "lessons: teacher writes all"
  on lessons for all
  using (is_teacher())
  with check (is_teacher());

-- Students can update their own lessons too — the UI only ever lets
-- them touch homework_done/student_message, but RLS itself can't
-- restrict to specific columns, so this is a deliberate, small trust
-- extension: a student could in principle edit other fields on their
-- own lesson via the API. Acceptable for a small personal site.
create policy "lessons: student updates own"
  on lessons for update
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- One row per test submission (from the public placement test, before
-- anyone has an account) — lets a student see their own past attempts
-- once they do get a cabinet login, matched by email.
create table if not exists test_results (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact text not null,      -- email the test-taker left
  score int not null,
  total int not null,
  level_code text not null,
  level_label text not null,
  answers jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table test_results enable row level security;

create policy "test_results: anyone can insert"
  on test_results for insert
  with check (true);

create policy "test_results: teacher reads all"
  on test_results for select
  using (is_teacher());

create policy "test_results: student reads own by email"
  on test_results for select
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.email = test_results.contact
  ));

-- Requests for cabinet access from people who don't have a login yet —
-- filled in from a small public form, approved by the teacher (which
-- actually creates the login — see supabase/functions/approve-application).
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact_email text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table applications enable row level security;

create policy "applications: anyone can insert"
  on applications for insert
  with check (true);

create policy "applications: teacher reads all"
  on applications for select
  using (is_teacher());

create policy "applications: teacher updates all"
  on applications for update
  using (is_teacher())
  with check (is_teacher());

-- Automatic reminder emails, ~5 hours before each lesson. Requires the
-- pg_cron and pg_net extensions (Database → Extensions → enable both),
-- then run this once — it schedules a call to the send-reminders Edge
-- Function every 15 minutes; that function does the actual filtering
-- (lessons starting in ~5h that haven't been reminded yet) and sending.
-- Replace <PROJECT_REF> with your project's ref (the subdomain in your
-- Supabase URL, e.g. lceazbnmpjxbnswxpddu).
--
-- select cron.schedule(
--   'send-lesson-reminders',
--   '*/15 * * * *',
--   $$
--   select net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-reminders',
--     headers := jsonb_build_object('Content-Type', 'application/json')
--   );
--   $$
-- );
