-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run).
-- See README.md "Личный кабинет" section for the full setup walkthrough.

-- One row per person who can log in (student or teacher). Created
-- automatically whenever a new user is added in Authentication → Users,
-- so you never have to insert into this table by hand.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  contact text,               -- telegram / instagram of the student
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles: read own row"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: teacher reads everyone"
  on profiles for select
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'teacher'
  ));

-- Auto-create the profile row the moment a new auth user is added.
-- Every new user starts as a student — promote yourself to 'teacher'
-- with the one-off SQL command in the README after your own first login.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table lessons enable row level security;

create policy "lessons: student reads own"
  on lessons for select
  using (auth.uid() = student_id);

create policy "lessons: teacher reads all"
  on lessons for select
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'teacher'
  ));

create policy "lessons: teacher writes all"
  on lessons for all
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'teacher'
  ))
  with check (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'teacher'
  ));
