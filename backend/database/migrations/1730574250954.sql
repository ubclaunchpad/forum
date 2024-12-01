-- Basic profiles, courses and mapping table
drop table if exists public.user_courses cascade;
drop table if exists public.posts cascade;

drop table if exists public.profiles cascade;
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  first_name text,
  last_name text,
  email text,
  role int,
  primary key (id)
);
alter table public.profiles enable row level security;


drop table if exists public.courses cascade;
create table public.courses (
  id uuid,
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


drop table if exists public.course_role cascade;
create table public.course_role (
  id serial,
  name text,
  primary key(id),
  unique(name)
);
alter table public.course_role enable row level security;

insert into public.course_role (name)
values ('Maintainer'), ('Admin'), ('Member'), ('Guest');


create table public.user_courses (
  user_id uuid not null references auth.users on delete cascade,
  course_id serial not null references public.courses on delete cascade,
  role_id serial not null references public.course_role on delete cascade,
  primary key (user_id,course_id)
);
alter table public.user_courses enable row level security;




