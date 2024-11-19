create type post_status as enum (
  'active',
  'deleted'
);

drop table if exists public.posts;
drop table if exists public.post_edits;
create table public.posts (
  id uuid default uuid_generate_v4(),
  course_id uuid,
  title text,
  content text,
  parent_id uuid,
  created_by uuid,
  status post_status,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  primary key (id)
);
alter table public.posts enable row level security;

create table public.post_edits (
  id uuid default uuid_generate_v4(),
  post_id uuid,
  edited_by uuid,
  previous_content text,
  new_content text,
  edit_reason text,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  primary key (id)
);
alter table public.post_edits enable row level security;