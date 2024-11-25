from database.db import supabase
from fastapi import HTTPException


# Create a post
def create_post(user_id, course_id, post_info):
    try:
        post = (
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
        return post.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")


# Get a post through post ID
def get_post(post_id):
    try:
        post = find_post(post_id)
        if not post.data:
            raise HTTPException(status_code=404, detail="Failed to find post.")
        return post.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{str(e)}")


# Get all posts in course with filter
def get_posts(course_id, params):
    try:
        desc = True if params["sort"] == "newest" else False

        query = (
            supabase.table("posts")
            .select("*", count="exact")
            .eq("course_id", course_id)
            .order("applied_at", desc=desc)
        )

        if "creator_id" in params:
            query = query.eq("created_by", params["creator_id"])

        posts = query.execute()

        return posts.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{str(e)}")


# Updates posts and uploads edit to post_edit table
def update_post(user_id, post_id, post_edit_info):
    try:
        post_info = find_post(post_id).data[0]

        if post_info["status"] == "deleted":
            raise HTTPException(
                status_code=404,
                detail="This post is deleted and can no longer be edited.",
            )
        old_content = post_info["content"]

        if post_edit_info.new_content == old_content:
            raise HTTPException(status_code=400, detail="Content is duplicate")

        post_update_res = (
            supabase.table("posts")
            .update(
                {
                    "content": post_edit_info.new_content,
                }
            )
            .eq("id", post_id)
            .execute()
        )

        if not post_update_res.data:
            raise HTTPException(
                status_code=400, detail="There was an error updating the post."
            )

        supabase.table("post_edits").insert(
            {
                "post_id": post_id,
                "edited_by": user_id,
                "previous_content": old_content,
                "new_content": post_edit_info.new_content,
                "edit_reason": post_edit_info.edit_reason,
            }
        ).execute()

        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{str(e)}")


# Deletes post (Hard Deletion)
def delete_post(user_id, post_id):
    try:
        deleted_post = supabase.table("posts").delete().eq("id", post_id).execute()

        if not deleted_post.data:
            raise HTTPException(status_code=404, detail="Failed to find post.")

        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{str(e)}")


def find_post(post_id):
    post = (
        supabase.table("posts").select("*", count="exact").eq("id", post_id).execute()
    )
    return post
