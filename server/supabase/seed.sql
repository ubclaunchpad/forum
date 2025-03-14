


INSERT INTO account_roles (name, description, default_permissions)
VALUES
    ('instructor', 'Administrator role', 
        '{
            "can_delete_course": true,
            "can_invite": {
                "instructor": true,
                "staff": true,
                "student": true
            },
            "can_remove": {
                "instructor": true,
                "staff": true,
                "student": true
            },
            "can_change_course_visibility": true,
            "can_create_tags": true,
            "can_edit_tags": true,
            "can_create_post": true,
            "can_view_posts": {
                "public": true,
                "private": true
            },
            "can_change_post_visibility": {
                "own": true,
                "others": true
            },
            "can_edit_post": {
                "own": true,
                "others": true
            },
            "can_delete_posts": {
                "own": true,
                "others": true
            },
            "can_tag_posts": {
                "own": true,
                "others": true
            }
        }'
    ),
    ('staff', 'Instructor role',
        '{
            "can_delete_course": false,
            "can_invite": {
                "instructor": false,
                "staff": true,
                "student": true
            },
            "can_remove": {
                "instructor": false,
                "staff": false,
                "student": true
            },
            "can_change_course_visibility": false,
            "can_create_tags": true,
            "can_edit_tags": true,
            "can_create_post": true,
            "can_view_posts": {
                "public": true,
                "private": true
            },
            "can_change_post_visibility": {
                "own": true,
                "others": true
            },
            "can_edit_post": {
                "own": true,
                "others": true
            },
            "can_delete_posts": {
                "own": true,
                "others": true
            },
            "can_tag_posts": {
                "own": true,
                "others": true
            }
        }'
    ),
    ('student', 'Student role',  
        '{
            "can_delete_course": false,
            "can_invite": {
                "instructor": false,
                "staff": false,
                "student": false
            },
            "can_remove": {
                "instructor": false,
                "staff": false,
                "student": false
            },
            "can_change_course_visibility": false,
            "can_create_tags": false,
            "can_edit_tags": false,
            "can_create_post": true,
            "can_view_posts": {
                "public": true,
                "private": false
            },
            "can_change_post_visibility": {
                "own": true,
                "others": false
            },
            "can_edit_post": {
                "own": true,
                "others": false
            },
            "can_delete_posts": {
                "own": true,
                "others": false
            },
            "can_tag_posts": {
                "own": true,
                "others": false
            }
        }'
    );
