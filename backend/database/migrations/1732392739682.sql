drop table if exists public.user_courses cascade;
drop table if exists public.courses cascade;

create table public.courses (
  id uuid default uuid_generate_v4(),
  c_group text not null,
  code text not null,
  section text not null,
  name text,
  config jsonb,
  start_date date default current_date,
  end_date date,
  primary key (id),
  unique(c_group,code,section)
);
alter table public.courses enable row level security;

create table public.user_courses (
  user_id uuid not null references auth.users on delete cascade,
  course_id uuid not null references public.courses on delete cascade,
  role_id serial not null references public.course_role on delete cascade,
  primary key (user_id,course_id)
);
alter table public.user_courses enable row level security;