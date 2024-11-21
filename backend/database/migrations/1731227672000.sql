CREATE TABLE documents ( 
id UUID PRIMARY KEY, 
title VARCHAR(255) NOT NULL, 
original_content TEXT NOT NULL, 
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"status" VARCHAR(50) NOT NULL DEFAULT 'active', 
document_type VARCHAR(255) NOT NULL, 
metadata JSONB 
);


CREATE TABLE files (
    id UUID PRIMARY KEY,
    file_key VARCHAR(255) NOT NULL,
    file_type VARCHAR(127) NOT NULL,
    file_size BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    doc_id UUID NOT NULL,
    FOREIGN KEY (doc_id) REFERENCES documents(id)
);