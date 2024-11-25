from database.db import supabase
from fastapi import HTTPException


def create_post(user_id, course_id, post_info):
    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")


def get_posts(course_id, params):
    try:
        desc = True if params["sort"] == "newest" else False

        if "creator_id" not in params:
            response = (
                supabase.table("posts")
                .select("*", count="exact")
                .eq("course_id", course_id)
                .order("applied_at", desc=desc)
                .execute()
            )

            return response

        response = (
            supabase.table("posts")
            .select("*", count="exact")
            .eq("course_id", course_id)
            .eq("created_by", params["creator_id"])
            .order("applied_at", desc=desc)
            .execute()
        )

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get posts: {str(e)}")


def update_post(user_id, post_id, post_edit_info):
    try:
        post_info = get_post(post_id).data[0]

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
        raise HTTPException(status_code=500, detail=f"Failed to update post: {str(e)}")


def delete_post(user_id, post_id):
    try:
        deleted_post = supabase.table("posts").delete().eq("id", post_id).execute()

        if not deleted_post.data:
            raise HTTPException(status_code=404, detail="Failed to find post.")

        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete post: {str(e)}")


def get_post(post_id):
    post = (
        supabase.table("posts").select("*", count="exact").eq("id", post_id).execute()
    )

    if not post.data:
        raise HTTPException(status_code=404, detail="Failed to find post.")

    return post
