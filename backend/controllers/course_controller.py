import logging
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from controllers.tags.tag_manager import (
    build_flat_tag_array,
    build_tag_tree,
    count_all_tags,
    get_tag_association_counts
)
from models.all import (
    Course,
    Profile,
    Tag,
    user_courses,
    post_tags,
    document_tags,
)
from models.db import get_db
from models.schemas.course_schema import (
    CourseResponse,
    CourseTagInformation,
    CourseTagRequest,
    CourseTagsResponse,
    CreateCourseReq,
    CreateCourseResponse,
    UpdateCourseReq,
)
from models.schemas.user_schema import SocialLinks, UserProfile
from pydantic import ValidationError
from sqlalchemy import func

logger = logging.getLogger(__name__)


def create_course(
    user_id: str, create_course_req: CreateCourseReq
) -> CreateCourseResponse:
    with get_db() as db:
        course = Course(
            c_group=create_course_req.c_group,
            code=create_course_req.code,
            section=create_course_req.section,
            name=create_course_req.name,
            config=jsonable_encoder(create_course_req.config),
            start_date=create_course_req.start_date,
            end_date=create_course_req.end_date,
        )

        try:
            db.add(course)
            db.flush()
            course_id = UUID(str(course.id))

            stmt = user_courses.insert().values(user_id=user_id, course_id=course_id)
            db.execute(stmt)

            db.commit()
            return CreateCourseResponse(id=course_id)
        except Exception as e:
            db.rollback()
            raise e


def get_courses(user_id) -> List[CourseResponse]:
    try:
        with get_db() as db:
            courses = db.query(Course).filter(Course.users.any(id=user_id)).all()
            pydantic_courses = []

            for course in courses:
                try:
                    validated_course = CourseResponse.model_validate(course)
                    pydantic_courses.append(validated_course)
                except ValidationError as ve:
                    raise ve

            return pydantic_courses
    except Exception as e:
        print(f"Error in get_courses: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch courses: {str(e)}"
        )


def get_course(c_id: Optional[str], name: Optional[str]) -> CourseResponse:
    if c_id:
        with get_db() as db:
            course = db.query(Course).filter(Course.id == c_id).first()
            if not course:
                raise HTTPException(status_code=404, detail="Course not found")
            return CourseResponse.model_validate(course)

    if name:
        with get_db() as db:
            course = db.query(Course).filter(Course.name == name).first()
            if not course:
                raise HTTPException(status_code=404, detail="Course not found")
            return CourseResponse.model_validate(course)

    raise Exception("Either c_id or name must be provided")


def delete_course(c_id: str) -> CourseResponse:
    with get_db() as db:
        course = db.query(Course).filter(Course.id == c_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        db.delete(course)
        db.flush()
        return CourseResponse.model_validate(course)


def add_user_to_course(c_id: str, u_id: str) -> bool:
    with get_db() as db:
        c_uuid = UUID(c_id)
        u_uuid = UUID(u_id)

        course = db.query(Course).filter(Course.id == c_uuid).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        user = db.query(Profile).filter(Profile.id == u_uuid).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user in course.users:
            raise HTTPException(
                status_code=400, detail="User already registered in course"
            )

        course.users.append(user)
        db.flush()
        return True


def remove_user_from_course(c_id: str, u_id: str) -> CourseResponse:
    with get_db() as db:
        c_uuid = UUID(c_id)
        u_uuid = UUID(u_id)

        course = db.query(Course).filter(Course.id == c_uuid).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        user = db.query(Profile).filter(Profile.id == u_uuid).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user not in course.users:
            raise HTTPException(
                status_code=404, detail="User not registered in this course"
            )

        course.users.remove(user)
        db.flush()

        return CourseResponse.model_validate(course)


def get_course_members(c_id: str) -> List[UserProfile]:
    """Get all members of a course with their full profiles."""
    with get_db() as db:
        c_uuid = UUID(c_id)
        course = db.query(Course).filter(Course.id == c_uuid).first()

        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        return [
            UserProfile(
                id=UUID(str(user.id)),
                email=getattr(user, "email"),
                first_name=getattr(user, "first_name", None),
                last_name=getattr(user, "last_name", None),
                pronouns=getattr(user, "pronouns", None),
                username=getattr(user, "username", None),
                bio=getattr(user, "bio", None),
                socials=SocialLinks(**getattr(user, "socials"))
                if getattr(user, "socials")
                else None,
                timezone=getattr(user, "timezone", None),
                display_name=getattr(user, "display_name", None),
                icon_url=getattr(user, "icon_url", None),
                status=getattr(user, "status", None),
            )
            for user in course.users
        ]


def update_course(create_course_req: UpdateCourseReq, c_id: str) -> Course:
    with get_db() as db:
        try:
            c_uuid = UUID(c_id)
            course = db.query(Course).filter(Course.id == c_uuid).first()
            if not course:
                raise HTTPException(status_code=404, detail="Course not found")

            update_dict = create_course_req.model_dump(exclude_unset=True)

            if "config" in update_dict:
                update_dict["config"] = jsonable_encoder(update_dict["config"])

            for key, value in update_dict.items():
                setattr(course, key, value)

            db.commit()
            return course

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500, detail=f"Failed to update course: {str(e)}"
            )

def get_all_tags(course_id: str, nested: bool = True) -> CourseTagsResponse:
    c_uuid = UUID(course_id)
    try:
        tag_counts = count_all_tags(course_id)
        tags = build_tag_tree(c_uuid) if nested else build_flat_tag_array(c_uuid)
        tags_list = CourseTagsResponse.model_validate({
            "tags": tags,
            "count": tag_counts,
            })
        return tags_list
    except ValidationError as e:
        logger.error(f"TAGS gotten from DB does not match schema - fix ASAP {str(e)}")
        raise Exception("Could not get tags")

def get_tag(course_id: str, tag_id: str) -> CourseTagInformation:
    with get_db() as db:
        c_uuid = UUID(course_id)
        t_uuid = UUID(tag_id)
        tag = db.query(Tag).filter(Tag.course_id == c_uuid, Tag.id == t_uuid).first()
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        try:
            return CourseTagInformation.model_validate({
                "id": getattr(tag, "id"),
                "name": getattr(tag, "name"),
                "visibility": getattr(tag, "visibility"),
                "course_id": getattr(tag, "course_id"),
                "created_by": getattr(tag, "created_by"),
                "properties": getattr(tag, "properties"),
                "subtags": build_tag_tree(c_uuid, t_uuid),
                "count": get_tag_association_counts(t_uuid, all=True),
            })
        except ValidationError as e:
            logger.error(f"TAG from DB does not match schema {str(e)}")
            raise Exception("Could not get tag")

def create_tag(course_id: str, tagReq: CourseTagRequest, author_id: str) -> bool:
    with get_db() as db:
        c_uuid = UUID(course_id)
        p_uuid = UUID(str(tagReq.parent_tag_id)) if tagReq.parent_tag_id else None
        tag = Tag(
            name=getattr(tagReq, "name"),
            course_id=c_uuid,
            visibility=getattr(tagReq, "visibility"),
            parent_tag_id=p_uuid,
            created_by=UUID(author_id),
            properties=getattr(tagReq, "properties"),
        )
        try:
            db.add(tag)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500, detail=f"Failed to create tag: {str(e)}"
            )
    return True


def delete_tag(c_id: str, t_id: str) -> bool:
    with get_db() as db:
        c_uuid = UUID(c_id)
        t_uuid = UUID(t_id)
        try:
            db.query(Tag).where(Course.id == c_uuid, Tag.id == t_uuid).delete()
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500, detail=f"Failed to delete tag: {str(e)}"
            )

    return True


def update_tag(c_id: str, t_id: str, tagReq: CourseTagRequest) -> bool:
    with get_db() as db:
        try:
            c_uuid = UUID(c_id)
            t_uuid = UUID(t_id)
            tag = db.query(Tag).where(Tag.id == t_uuid, Course.id == c_uuid).first()

            if not tag:
                raise Exception("Tag not found")

            update_dict = tagReq.model_dump(exclude_unset=True)

            for key, value in update_dict.items():
                setattr(tag, key, value)

            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500, detail=f"Failed to update tag: {str(e)}"
            )
    return True
