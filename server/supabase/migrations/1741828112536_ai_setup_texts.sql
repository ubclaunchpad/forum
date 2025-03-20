CREATE TABLE IF NOT EXISTS public.embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, --"post", "document", ...
    entity_id UUID NOT NULL,
    content TEXT NOT NULL,
    chunk_index INTEGER,
    chunk_type VARCHAR(50),
    chunk_metadata JSONB,
    parent_chunk_id UUID,
    embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- todo: add composite constraint on entity_type, entity_id to match to the correct tables

);

CREATE INDEX IF NOT EXISTS embeddings_vector_search ON public.embeddings USING HNSW (embedding vector_cosine_ops);

create table if not exists public.texts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


select vault.create_secret('http://api.supabase.internal:8000', 'project_url');

GRANT USAGE ON SCHEMA pgmq TO postgres, authenticated, anon, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA pgmq TO postgres, service_role;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA pgmq TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA pgmq TO postgres, authenticated, anon, service_role;


-- Generic trigger function to queue embedding jobs
create or replace function util.queue_embeddings()
returns trigger
language plpgsql
as $$
declare
-- for example if a post is created, the source table is "posts", the entity id is the post id (id), the entity type is "post", the content columns are "title", "content"
  source_table text = TG_ARGV[0];
  entity_type text = TG_ARGV[1];
  content_columns text = TG_ARGV[2];
begin
  perform pgmq.send(
    queue_name => 'embedding_jobs',
    msg => jsonb_build_object(
      'schema', 'public',
      'sourceTable', source_table,
      'contentColumns', content_columns,
	  'entityId', NEW.id,
	  'entityType', entity_type
    )
  );
  return NEW;
end;
$$;

ALTER FUNCTION util.queue_embeddings() SECURITY DEFINER;



-- Function to process embedding jobs from the queue
create or replace function util.process_embeddings(
  batch_size int = 10,
  max_requests int = 10,
  timeout_milliseconds int = 5 * 60 * 1000 -- default 5 minute timeout
)
returns void
language plpgsql
as $$
declare
  job_batches jsonb[];
  batch jsonb;
begin
  with
    -- First get jobs and assign batch numbers
    numbered_jobs as (
      select
        message || jsonb_build_object('jobId', msg_id) as job_info,
        (row_number() over (order by 1) - 1) / batch_size as batch_num
      from pgmq.read(
        queue_name => 'embedding_jobs',
        vt => timeout_milliseconds / 1000,
        qty => max_requests * batch_size
      )
    ),

    -- Then group jobs into batches
    batched_jobs as (
      select
        jsonb_agg(job_info) as batch_array,
        batch_num
      from numbered_jobs
      group by batch_num
    )
    
  -- Finally aggregate all batches into array
  select array_agg(batch_array)
  from batched_jobs
  into job_batches;

  if job_batches is null then
    return;
  end if;

  -- Process batches only if we have them
  foreach batch in array job_batches loop
    perform util.invoke_edge_function(
      name => 'embed',
      body => batch,
      timeout_milliseconds => timeout_milliseconds
    );
  end loop;
end;
$$;

-- Schedule the embedding processing
select
  cron.schedule(
    'process-embeddings',
    '30 seconds',
    $$
    select util.process_embeddings();
    $$
  );



create trigger embed_texts_on_insert
after insert on texts
for each row
execute procedure util.queue_embeddings('texts', 'texts', 'content');
