CREATE TABLE IF NOT EXISTS public.course_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id INT NOT NULL REFERENCES public.courses(id) ON DELETE cascade,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE cascade,
    access_role INT NOT NULL REFERENCES public.course_role(id),
    semantic_role TEXT NOT NULL,
    assigned_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, user_id)
);
ALTER TABLE public.course_user_roles ENABLE ROW LEVEL SECURITY;


CREATE TABLE IF NOT EXISTS public.role_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_user_role_id UUID NOT NULL REFERENCES public.course_user_roles(id) ON DELETE cascade,
    previous_access_role INT NOT NULL REFERENCES public.course_role(id),
    new_access_role INT NOT NULL REFERENCES public.course_role(id),
    previous_semantic_role TEXT NOT NULL,
    new_semantic_role TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.profiles(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.course_user_roles ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.course_role DROP CONSTRAINT course_role_name_key;
INSERT INTO public.course_role (id, name)
VALUES (5, 'None');

UPDATE public.course_role
SET name = CASE
    WHEN id = 1 THEN 'Admin'
    WHEN id = 2 THEN 'Maintainer'
END
WHERE id IN (1, 2);
ALTER TABLE public.course_role ADD CONSTRAINT course_role_name_key UNIQUE (name);
