-- Active: 1731224655993@@127.0.0.1@5432@postgres@public

CREATE EXTENSION IF NOT EXISTS vector;


CREATE TABLE IF NOT EXISTS documents ( 
id UUID PRIMARY KEY, 
title VARCHAR(255) NOT NULL, 
original_content TEXT NOT NULL, 
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"status" VARCHAR(50) NOT NULL DEFAULT 'active', 
document_type VARCHAR(50) NOT NULL, 
metadata JSONB 
);


CREATE TABLE IF NOT EXISTS document_versions ( 
id UUID PRIMARY KEY,
document_id UUID REFERENCES documents(id),
version_number INTEGER NOT NULL,
content_hash VARCHAR(64) NOT NULL,
changes_summary TEXT,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
metadata JSONB, 
UNIQUE(document_id, version_number) 
);


CREATE TABLE IF NOT EXISTS chunks ( 
id UUID PRIMARY KEY,
document_id UUID REFERENCES documents(id),
version_id UUID REFERENCES document_versions(id),
content TEXT NOT NULL,
embedding VECTOR(1536),
chunk_index INTEGER NOT NULL,
parent_chunk_id UUID REFERENCES chunks(id),
metadata JSONB,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS chunk_relations ( 
id UUID PRIMARY KEY,
source_chunk_id UUID REFERENCES chunks(id), 
target_chunk_id UUID REFERENCES chunks(id), 
relation_type VARCHAR(50) NOT NULL, 
metadata JSONB, 
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
);

-- For vector similarity search
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- For efficient lookups
CREATE INDEX ON chunks(document_id);
CREATE INDEX ON chunks(version_id);
CREATE INDEX ON document_versions(document_id);
CREATE INDEX ON chunk_relations(source_chunk_id);
CREATE INDEX ON chunk_relations(target_chunk_id);

-- For status lookups if you'll be querying by status
CREATE INDEX ON documents(status);