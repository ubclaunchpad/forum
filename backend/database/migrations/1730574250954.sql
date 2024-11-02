-- Basic profiles, courses and mappings
drop table if exists public.user_courses;
drop table if exists public.profiles;
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  first_name text,
  last_name text,
  email text,
  role int,
  primary key (id)
);
alter table public.profiles enable row level security;

drop table if exists public.courses;
create table public.courses (
  id uuid not null,
  c_group text,
  c_code text,
  term text,
  last_name text,
  primary key (id),
  unique(c_group,c_code,term)
);
alter table public.courses enable row level security;

create table public.user_courses (
  user_id uuid not null references public.profiles on delete cascade,
  course_id uuid not null references public.courses on delete cascade,
  primary key (user_id,course_id)
);
alter table public.courses enable row level security;




