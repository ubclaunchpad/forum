from typing import Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from models.all import Course, Profile, user_courses
from models.db import get_db
from models.schemas.course_schema import (
    CourseResponse,
    CreateCourseReq,
    CreateCourseResponse,
)
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
            # Add course first
            db.add(course)
            db.flush()
            course_id = UUID(str(course.id))
            # Insert into user_courses association table
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


def get_course_members(c_id: str) -> List[Dict[str, str]]:
    with get_db() as db:
        c_uuid = UUID(c_id)
        course = db.query(Course).filter(Course.id == c_uuid).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        members = []
        users: List[Profile] = course.users
        for user in course.users:
            members.append(
                {"id": str(user.id), "name": user.first_name + " " + user.last_name}
            )
        return members
