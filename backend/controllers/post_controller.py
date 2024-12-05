from typing import Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from models.all import Post, Profile
from models.db import get_db
from models.schemas.post_schema import CreatePostRequest


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
            print(posts)
            print(type(posts))
            return posts
    except Exception as e:
        print(f"Error in get_posts: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")
