-- Create post and post_edit tables and post_status enum

-- Will need to manually delete enum in Supabase dashboard if running migration again
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
  created_by uuid not null references public.profiles,
  status post_status,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  primary key (id)
);
alter table public.posts enable row level security;

create table public.post_edits (
  id uuid default uuid_generate_v4(),
  post_id uuid not null references public.posts on delete cascade,
  edited_by uuid not null references public.profiles,
  previous_content text,
  new_content text,
  edit_reason text,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  primary key (id)
);
alter table public.post_edits enable row level security;