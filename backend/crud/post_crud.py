from database.db import supabase

def create_post(course_id, post_info):
    response = (
        supabase.table("posts")
        .insert({"course_id": course_id, "title": post_info.title, 
                 "content" : post_info.content, "parent_id" : post_info.parent_id,  
                 "status" : "active"})
        .execute()
    )
    return response

def get_posts():
    return None

def update_post():
    return None

def delete_post():
    return None