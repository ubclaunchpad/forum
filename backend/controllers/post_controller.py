from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from models.all import Post, PostEdit, Profile
from models.db import get_db
from models.schemas.general_schema import GeneralResponse
from models.schemas.post_schema import (
    CreatePostEditRequest,
    CreatePostRequest,
    PostEditResponse,
)


def create_post(user_id: str, c_id: str, post_info: CreatePostRequest) -> Post:
    with get_db() as db:
        post = Post(
            title=post_info.title,
            course_id=c_id,
            content=post_info.content,
            created_by=user_id,
        )
        try:
            db.add(post)
            db.flush()
            return post
        except Exception as e:
            raise e


def get_posts(c_id: str) -> List[Post]:
    try:
        with get_db() as db:
            posts = db.query(Post).filter(Post.course_id == c_id).all()
            return posts
    except Exception as e:
        print(f"Error in get_posts: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")


def get_post(c_id: str, p_id: str) -> Post:
    try:
        with get_db() as db:
            post = (
                db.query(Post).filter(Post.course_id == c_id, Post.id == p_id).first()
            )
            # Get post edits
            # Get post user-events
            return post
    except Exception as e:
        print(f"Error in get_post: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")


def update_post(post_edit_info: CreatePostEditRequest, c_id: str) -> PostEditResponse:
    try:
        with get_db() as db:
            p_id = post_edit_info.post_id
            post = (
                db.query(Post).filter(Post.course_id == c_id, Post.id == p_id).first()
            )

            if not post:
                raise HTTPException(status_code=404, detail="Post not found")

            old_content = post.content

            if post_edit_info.new_content == old_content:
                raise HTTPException(status_code=400, detail="Content is duplicate")

            # Type error, needs fix
            post.content = post_edit_info.new_content

            post_edit = PostEdit(
                post_id=post_edit_info.post_id,
                edited_by=post_edit_info.edited_by,
                previous_content=post_edit_info.previous_content,
                new_content=post_edit_info.new_content,
                edit_reason=post_edit_info.edit_reason,
            )

            db.add(post_edit)
            db.flush()
            id = UUID(str(post_edit.id))
            return PostEditResponse(
                id=id,
                post_id=post_edit_info.post_id,
                edited_by=post_edit_info.edited_by,
                previous_content=post_edit_info.previous_content,
                new_content=post_edit_info.new_content,
                edit_reason=post_edit_info.edit_reason,
            )

    except Exception as e:
        print(f"Error in update_post: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")


def delete_post(user_id, c_id, p_id):
    try:
        with get_db() as db:
            post = (
                db.query(Post).filter(Post.course_id == c_id, Post.id == p_id).first()
            )
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")

            db.delete(post)
            db.commit()
            return post
    except Exception as e:
        print(f"Error in get_post: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")
