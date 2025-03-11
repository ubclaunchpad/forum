CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    section TEXT,
    name TEXT NOT NULL,
    term TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    access TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (code, section, term)
);


CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    timezone TEXT,
    pronouns TEXT,
    avatar_url TEXT,
    bio TEXT,
    social_links JSONB,
    display_name TEXT,
    username TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email),
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);


CREATE TABLE course_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_members (
    course_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (course_id, user_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES course_roles(id) 
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    title TEXT NOT NULL,
    number_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'posted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE post_authors (
    post_id UUID NOT NULL,
    user_id UUID,
    comment_id UUID,
    reply_id UUID,
    pseudonym TEXT, -- optional pseudonym for the author
    visibility TEXT NOT NULL DEFAULT 'everyone', -- everyone, all_members, only_instructors, anonymous
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id),
    CHECK (user_id IS NOT NULL OR pseudonym IS NOT NULL)
);

CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    content TEXT NOT NULL,
    number_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE post_comment_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL,
    content TEXT NOT NULL,
    number_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES post_comments(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION set_sequential_id(
    table_name text,
    id_column text,
    group_column text,
    group_value uuid
) RETURNS integer 
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result integer;
    query text;
BEGIN
    query := format(
        'SELECT COALESCE(MAX(%I), 0) + 1 FROM public.%I WHERE %I = $1',
        id_column,
        table_name,
        group_column
    );
    EXECUTE query INTO result USING group_value;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- For posts (grouped by course)
CREATE OR REPLACE FUNCTION set_post_number_id() RETURNS TRIGGER AS $$
BEGIN
    NEW.number_id := set_sequential_id('posts', 'number_id', 'course_id', NEW.course_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- For comments (grouped by post)
CREATE OR REPLACE FUNCTION set_comment_number_id() RETURNS TRIGGER AS $$
BEGIN
    NEW.number_id := set_sequential_id('post_comments', 'number_id', 'post_id', NEW.post_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- For replies (grouped by comment)
CREATE OR REPLACE FUNCTION set_reply_number_id() RETURNS TRIGGER AS $$
BEGIN
    NEW.number_id := set_sequential_id('post_comment_replies', 'number_id', 'comment_id', NEW.comment_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_post_number_id 
    BEFORE INSERT ON posts
    FOR EACH ROW EXECUTE FUNCTION set_post_number_id();

CREATE TRIGGER set_comment_number_id 
    BEFORE INSERT ON post_comments
    FOR EACH ROW EXECUTE FUNCTION set_comment_number_id();

CREATE TRIGGER set_reply_number_id 
    BEFORE INSERT ON post_comment_replies
    FOR EACH ROW EXECUTE FUNCTION set_reply_number_id();



CREATE TABLE admin_users (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE
);

COMMENT ON TABLE admin_users IS 'Table to store admin users - these are users who have been granted access to the admin panel';


CREATE TABLE account_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    status TEXT NOT NULL, -- active, inactive, waiting_for_approval, approve_on_login
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL
);