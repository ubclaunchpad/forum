drop table if exists public.user_post_events;
create table public.user_post_events (
  id uuid default uuid_generate_v4(),
  user_id uuid not null references public.profiles,
  post_id uuid not null references public.posts,
  viewed bool,
  liked bool,
  primary key (id)
);
alter table public.user_post_events enable row level security;

CREATE MATERIALIZED VIEW post_impressions AS
SELECT
    post_id,
    COUNT(CASE WHEN liked THEN 1 END) AS like_count,
    COUNT(CASE WHEN viewed THEN 1 END) AS view_count
FROM
    public.user_post_events
GROUP BY
    post_id;


CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'refresh_post_impressions',
    '0 * * * *', -- Cron schedule: Every hour on the hour
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY post_impressions;$$
);