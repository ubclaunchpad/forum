CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    parent_id UUID,
    name TEXT NOT NULL,
    permissions JSONB NOT NULL,
    can_use_tag JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES tags(id) DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (course_id, name)
);

-- Update parent of tag 1 level up if parent is deleted
CREATE OR REPLACE FUNCTION update_child_parent_on_delete()
RETURNS trigger AS $$
BEGIN
  UPDATE tags
  SET parent_id = OLD.parent_id
  WHERE parent_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_child_parent_trigger
    AFTER DELETE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_child_parent_on_delete();

-- retrieve the tag with its parents nested
CREATE OR REPLACE FUNCTION get_tag_with_nested_parents(tag_id UUID)
RETURNS JSONB AS $$
DECLARE
  tag_rec RECORD;
  nested_parent JSONB;
BEGIN
  -- Retrieve the tag record
  SELECT *
  INTO tag_rec
  FROM tags
  WHERE id = tag_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tag with id % not found', tag_id; -- should never be triggered, enforced by db
  END IF;

  -- If the tag has a parent, recursively get the parent's JSON
  IF tag_rec.parent_id IS NOT NULL THEN
    nested_parent := get_tag_with_nested_parents(tag_rec.parent_id);
  ELSE
    nested_parent := NULL;
  END IF;

  -- Build and return a JSONB object with the tag data and nested parent
  RETURN jsonb_build_object(
    'id', tag_rec.id,
    'course_id', tag_rec.course_id,
    'parent_id', tag_rec.parent_id,
    'name', tag_rec.name,
    'permissions', tag_rec.permissions,
    'can_use_tag', tag_rec.can_use_tag,
    'created_at', tag_rec.created_at,
    'updated_at', tag_rec.updated_at,
    'parent', nested_parent
  );
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);