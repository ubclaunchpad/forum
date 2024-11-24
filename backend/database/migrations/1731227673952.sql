CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    document_type VARCHAR(50) NOT NULL,
    metadata JSONB
);

CREATE TABLE chunks (
    id UUID PRIMARY KEY,
    document_id UUID REFERENCES documents(id),
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    chunk_index INTEGER NOT NULL,
    parent_chunk_id UUID REFERENCES chunks(id),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chunk_relations (
    id UUID PRIMARY KEY,
    source_chunk_id UUID REFERENCES chunks(id),
    target_chunk_id UUID REFERENCES chunks(id),
    relation_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX chunks_embedding_idx ON chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX chunks_document_id_idx ON chunks(document_id);
CREATE INDEX chunk_relations_source_idx ON chunk_relations(source_chunk_id);
CREATE INDEX chunk_relations_target_idx ON chunk_relations(target_chunk_id);
CREATE INDEX documents_status_idx ON documents(status);