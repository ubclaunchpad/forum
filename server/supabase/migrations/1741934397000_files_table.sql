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


CREATE OR REPLACE FUNCTION delete_document_file()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM files WHERE id = OLD.file_id;
    RETURN OLD;
END;
$$;

CREATE TRIGGER documents_on_delete
AFTER DELETE ON documents
FOR EACH ROW
EXECUTE FUNCTION delete_document_file();


create trigger create_embeddings_on_documents_insert
after insert on documents
for each row
execute procedure util.queue_embeddings('documents', 'document', 'file_id');
