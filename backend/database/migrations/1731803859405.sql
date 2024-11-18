drop table if exists public.posts;
create table public.posts (
  id uuid not null default uuid_generate_v4(),
  title text,
  description text,
  user_id uuid not null references public.profiles on delete cascade,
  course_id int not null references public.courses on delete cascade,
  primary key (id)

);
alter table public.profiles enable row level security;