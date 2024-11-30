-- Add index for updated_at for efficient sorting
CREATE INDEX idx_documents_updated_at ON documents(updated_at);

-- Add constraint for document_type
ALTER TABLE documents
ADD CONSTRAINT valid_document_type 
CHECK (document_type IN ('application/pdf', 'text/plain', 'text/markdown', 'image/png', 'image/jpeg'));

-- Add metadata validation
ALTER TABLE documents
ADD CONSTRAINT valid_metadata
CHECK (jsonb_typeof(metadata) = 'object');

-- Add cascade delete option for related chunks
ALTER TABLE chunks
ADD FOREIGN KEY (document_id) 
REFERENCES documents(id) 
ON DELETE CASCADE;