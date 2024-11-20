from database.db import supabase
from fastapi import HTTPException


def create_post(user_id, course_id, post_info):
    response = (
        supabase.table("posts")
        .insert(
            {
                "course_id": course_id,
                "title": post_info.title,
                "content": post_info.content,
                "parent_id": post_info.parent_id,
                "created_by": user_id,
                "status": "active",
            }
        )
        .execute()
    )
    return response


def get_posts(course_id):
    response = (
        supabase.table("posts")
        .select("*", count="exact")
        .eq("course_id", course_id)
        .execute()
    )
    return response


def update_post(user_id, post_edit_info):
    # Find the post
    post = (
        supabase.table("posts").select("*").eq("id", post_edit_info.post_id).execute()
    )

    if not post.data:
        raise HTTPException(status_code=404, detail="Failed to find post.")

    # Edit the contents of the post
    post_info = post.data[0]
    if post_info["status"] == "deleted":
        raise HTTPException(
            status_code=404, detail="This post is deleted and can no longer be edited."
        )
    old_content = post_info["content"]

    if post_edit_info.new_content == old_content:
        raise HTTPException(status_code=400, detail="Content is duplicate")

    post_update = (
        supabase.table("posts")
        .update(
            {
                "content": post_edit_info.new_content,
            }
        )
        .eq("id", post_edit_info.post_id)
        .execute()
    )

    if not post_update.data:
        raise HTTPException(
            status_code=400, detail="There was an error updating the post."
        )

    add_post_edits = (
        supabase.table("post_edits")
        .insert(
            {
                "post_id": post_edit_info.post_id,
                "edited_by": user_id,
                "previous_content": old_content,
                "new_content": post_edit_info.new_content,
                "edit_reason": post_edit_info.edit_reason,
            }
        )
        .execute()
    )

    return {"success": True}


def delete_post():
    return None
