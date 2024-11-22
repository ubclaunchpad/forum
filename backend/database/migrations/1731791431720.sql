CREATE TABLE IF NOT EXISTS course_tags (
    id UUID PRIMARY KEY, 
    course_id UUID NOT NULL, 
    name TEXT NOT NULL,
    colour TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    parent_id UUID,
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES course_tags(id),
    UNIQUE (course_id, name)
);
