CREATE TABLE document_tags (
    document_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (document_id, tag_id),
    CONSTRAINT fk_document_id FOREIGN KEY (document_id) REFERENCES documents(id),
    CONSTRAINT fk_tag_id FOREIGN KEY (tag_id) REFERENCES course_tags(id)
);