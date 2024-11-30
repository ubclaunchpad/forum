-- Create courses_documents table
CREATE TABLE course_documents (
    course_id UUID NOT NULL,
    document_id UUID NOT NULL,
    PRIMARY KEY (course_id, document_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
