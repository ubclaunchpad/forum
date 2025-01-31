from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy import desc
from models.all import Tag, Course, Profile, user_courses
from models.db import get_db
from models.schemas.course_schema import (
    BasicCourseRoleInformation,
    CourseResponse,
    CreateCourseReq,
    CreateCourseResponse,
    CourseTagRequest,
    UpdateCourseReq,
    CreateCourseRoleRequest,
    CourseTagsResponse
)
from models.schemas.user_schema import SocialLinks, UserProfile
from pydantic import ValidationError


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

'''
def get_course_roles_for_user(c_id: str, u_id: str) -> List[BasicCourseRoleInformation]:
    with get_db() as db:
        c_uuid = UUID(c_id)
        u_uuid = UUID(u_id)
        roles = db.query(CourseRole).join(CourseUserRole, CourseRole.id == CourseUserRole.course_role_id).filter(CourseUserRole.user_id == u_uuid, CourseRole.course_id == c_uuid).all()
        basic_roles = []
        for role in roles:
            basic_role = BasicCourseRoleInformation(
                role_id=str(role.id),
                name=str(role.name),
                description=str(role.description)
            )
            basic_roles.append(basic_role)
    return basic_roles

def get_basic_course_roles(c_id: str) -> List[BasicCourseRoleInformation]:
    with get_db() as db:
        c_uuid = UUID(c_id)
        roles: List[CourseRole] = db.query(CourseRole).filter(CourseRole.course_id == c_uuid).all()
        basic_roles = []
        for role in roles:
            basic_role = BasicCourseRoleInformation(
                role_id=str(role.id),
                name=str(role.name),
                description=str(role.description)
            basic_roles.append(basic_role)
    return basic_roles

def get_course_role(c_id: str, r_id: str) -> CourseRole:
    with get_db() as db:
        course_role = db.query(CourseRole).filter(CourseRole.course_id == UUID(c_id), CourseRole.id == UUID(r_id)).first()
        if not course_role:
            raise HTTPException(status_code=404, detail="Course role not found")
        return course_role
def create_course_role(c_id: str, req: CreateCourseRoleRequest, u_id: str) -> bool:
    with get_db() as db:
        course_role = CourseRole(
            course_id=UUID(c_id),
            name=req.name,
            description=req.description,
            visibility=req.visibility,
            # created_by=UUID(u_id),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        try:
            db.add(course_role)
            db.commit()
        except Exception as e:
            db.rollback()
            raise e
    return True
def assign_user_course_role(u_id: str, r_id: str, a_id: str) -> bool:
    with get_db() as db:
        course_user_role = CourseUserRole(
            course_role_id=UUID(r_id),
            user_id=UUID(u_id),
            # assigned_by=UUID(a_id),
            created_at=datetime.now()
        )
        try:
            db.add(course_user_role)
            db.commit()
        except Exception as e:
            db.rollback()
            raise e
    return True

def unassign_user_course_role(u_id: str, r_id: str) -> bool:
    with get_db() as db:
        try:
            db.query(CourseUserRole).filter(CourseUserRole.course_role_id == r_id, CourseUserRole.user_id == u_id).delete()
            db.commit()
        except Exception as e:
            db.rollback()
            raise e
    return True
'''

def get_all_tags(course_id: str) -> CourseTagsResponse:
    with get_db() as db:
        c_uuid = UUID(course_id)
        tags: CourseTagsResponse = (db.query(Tag)
                                     .with_entities(Tag.id,
                                                    Tag.name, 
                                                    Tag.visibility, 
                                                    Tag.course_id, 
                                                    Tag.parent_tag_id, 
                                                    Tag.created_by,
                                                    Tag.properties).filter(Tag.course_id == c_uuid).all())
    return tags

def create_tag(course_id: str, tagReq: CourseTagRequest, author_id: str) -> bool:
    with get_db() as db:
        c_uuid = UUID(course_id)
        p_uuid = UUID(tagReq.parent_tag_id) if tagReq.parent_tag_id else None
        tag = Tag(
            name=tagReq.name,
            course_id=c_uuid,
            visibility=tagReq.visibility,
            parent_tag_id=p_uuid,
            # created_by=UUID(author_id),
            properties=tagReq.properties
        )
        try:
            db.add(tag)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500, detail="Failed to create tag"
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
                status_code=500, detail="Failed to delete tag"
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
            
            tag.name = tagReq.name if tagReq.name else tag.name
            tag.visibility = tagReq.visibility if tagReq.visibility else tag.visibility
            tag.parent_tag_id = tagReq.parent_tag_id if tagReq.parent_tag_id else tag.parent_tag_id
            tag.properties = tagReq.properties if tagReq.properties else tag.properties

            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500, detail="Failed to update tag"
            )
    return True