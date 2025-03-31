CREATE TABLE IF NOT EXISTS public.embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, --"post", "document", ...
    entity_id UUID NOT NULL,
    content TEXT NOT NULL,
    chunk_index INTEGER,
    chunk_type VARCHAR(50),
    chunk_metadata JSONB,
    parent_chunk_id UUID,
    supplementary_content TEXT DEFAULT '',
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    embedding vector(384),
    fts tsvector generated always as (to_tsvector('english', content || ' ' || supplementary_content)) stored,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS embeddings_vector_search ON public.embeddings USING HNSW (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS embeddings_fts_search ON public.embeddings USING GIN (fts);

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
  service_role_key text;
  job_api text;
begin
  -- Get jobs from queue and batch them
  with numbered_jobs as (
    select
      message || jsonb_build_object('jobId', msg_id) as job_info,
      (row_number() over ()) / batch_size as batch_num
    from pgmq.read('embedding_jobs', timeout_milliseconds / 1000, max_requests * batch_size)
  ),
  batched_jobs as (
    select
      jsonb_agg(job_info) as batch_array,
      batch_num
    from numbered_jobs
    group by batch_num
  )
  select array_agg(batch_array)
  from batched_jobs
  into job_batches;

  -- Exit if no jobs found
  if job_batches is null then
    return;
  end if;

  -- Get secrets
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'service_role_key';

  SELECT decrypted_secret INTO job_api 
  FROM vault.decrypted_secrets 
  WHERE name = 'job_api';

  -- Process batches
  foreach batch in array job_batches loop
    perform net.http_post(
      url => job_api || '/jobs/embed',
      body => batch,
      headers => jsonb_build_object('Authorization', 'Bearer ' || service_role_key),
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

create extension if not exists pg_net
with
  schema extensions;

create or replace function delete_file_from_storage()
returns trigger as $$
declare 
    request_id BIGINT;
    file_path TEXT;
    bucket TEXT;
    service_role_key TEXT;
    request_url TEXT;
    request_headers JSONB;
begin 
    file_path := OLD.path;
    bucket := OLD.bucket;
    
    -- Fetch service role key
    -- requires service_role_key to be added to vault, didn't add here to avoid leaking key through github
    SELECT decrypted_secret INTO service_role_key 
    FROM vault.decrypted_secrets 
    WHERE name = 'service_role_key';

    -- Construct request URL
    request_url := util.project_url() || '/storage/v1/object/' || file_path;
    -- Construct header
    request_headers := jsonb_build_object('Authorization', 'Bearer ' || service_role_key);

    perform net.http_delete(
        request_url,
        '{}'::jsonb,  -- No query params
        request_headers,
        5000  -- Timeout in ms
    );

    return OLD;
end;
$$ language plpgsql;


CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT,
    bucket TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TRIGGER on_file_delete
AFTER DELETE ON files
FOR EACH ROW EXECUTE FUNCTION delete_file_from_storage();


CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL DEFAULT '',
    file_id UUID NOT NULL REFERENCES files(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

COMMENT ON TABLE documents IS 'Documents are files that are uploaded to a course. They are associated with a course.';
COMMENT ON COLUMN documents.file_id IS 'The file that is associated with the document';

CREATE OR REPLACE FUNCTION delete_document_file_and_embeddings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM files WHERE id = OLD.file_id;
    DELETE FROM embeddings WHERE entity_id = OLD.id AND entity_type = 'document';
    RETURN OLD;
END;
$$;

CREATE TRIGGER documents_on_delete
AFTER DELETE ON documents
FOR EACH ROW
EXECUTE FUNCTION delete_document_file_and_embeddings();


create trigger create_embeddings_on_documents_insert
after insert on documents
for each row
execute procedure util.queue_embeddings('documents', 'document', 'file_id');


create trigger create_embeddings_on_posts_insert_or_update
after insert or update on posts
for each row
execute procedure util.queue_embeddings('posts', 'post', 'content');

CREATE TABLE IF NOT EXISTS search_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    meta JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES search_threads(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    answer TEXT NOT NULL,
    sources JSONB NOT NULL,
    meta JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX search_history_thread_id_idx ON search_history (thread_id);



CREATE TABLE IF NOT EXISTS search_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    overview TEXT NOT NULL,
    insights JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX search_analysis_course_id_idx ON search_analysis (course_id);


-- Function to process search analysis jobs from the queue
create or replace function util.process_search_analysis()
returns void
language plpgsql
as $$
declare
    request_url TEXT;
    request_headers JSONB;
    service_role_key TEXT;

begin
    -- Fetch service role key
    SELECT decrypted_secret INTO service_role_key 
    FROM vault.decrypted_secrets 
    WHERE name = 'service_role_key';

    -- Call an edge function to get the search analysis
    request_url := util.project_url() || '/analytics/search';
    -- Construct header
    request_headers := jsonb_build_object('Authorization', 'Bearer ' || service_role_key);

    perform util.invoke_edge_function(
      name => 'analytics',
      body => '{}'::jsonb,
      timeout_milliseconds => 5000
    );
end;
$$;

-- Schedule the search analysis processing
select
  cron.schedule(
    'process-search-analysis',
    '0 1 * * *',
    $$
    select util.process_search_analysis();
    $$
  );

