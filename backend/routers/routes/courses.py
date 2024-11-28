from typing import List, Optional

from core.pipelines.doc_query_engine import DocumentQueryEngine
from crud import course_crud
from crud.course_crud import NoPermissionException, UserNotEnrolledException
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, validator
from routers.req.courses_req import CreateCourseReq, UpdateCourseReq

course_router = APIRouter()
# Maximum number of chunks to retrieve from the document, hard-coded for now
MAX_CHUNKS = 5
ADMIN_REQUEST = False

# Initialize DocumentQueryEngine
try:
    query_engine = DocumentQueryEngine(max_chunks=MAX_CHUNKS)
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Error initializing query engine: {e}")

# @course_router.post(course_router_endpoint)
# async def register_course(create_course_req: RegisterUserReq):
#     profile = course_crud.register_course(create_course_req)
#     if not profile:
#         raise HTTPException(status_code=404, detail="Failed to create course.")
#     return profile


class CourseQueryRequest(BaseModel):
    question: str = Field(..., min_length=5)
    template_name: Optional[str] = None
    max_chunks: Optional[int] = Field(default=5, ge=1)

    @validator("question")
    def question_length(cls, v):
        if len(v.strip()) < 5:
            raise ValueError("Question must be at least 5 characters long")
        return v


# Response model
class Source(BaseModel):
    document_title: str
    content: str
    similarity: float
    metadata: dict


class CourseQueryResponse(BaseModel):
    answer: str
    sources: List[Source]


def user_has_access_to_course(user_id: Optional[str], course_id: str) -> bool:
    # Implement your logic to check if the user has access to the course
    # For example, check if user is enrolled in the course
    # Return True if they have access, False otherwise
    # For now, we'll assume all users have access (replace with real logic)
    return True


@course_router.post("/courses/{course_id}/query", response_model=CourseQueryResponse)
async def query_course_content(
    course_id: str, query_request: CourseQueryRequest, request: Request
):
    """
    Endpoint for querying course content using RAG.
    """
    user_id = request.state.user_id

    if not user_has_access_to_course(user_id, course_id):
        raise HTTPException(status_code=403, detail="Access denied to this course")

    # Perform query
    try:
        result = query_engine.query(
            question=query_request.question,
            template_name=query_request.template_name,
        )
    except KeyError as error:
        # Template not found
        raise HTTPException(status_code=400, detail=f"Template not found: {error}")
    except ValueError as error:
        # Other validation errors
        raise HTTPException(status_code=400, detail=str(error))
    except Exception as error:
        # General error handling
        raise HTTPException(status_code=500, detail=f"Error during query: {error}")

    # Return the response
    return CourseQueryResponse(
        answer=result["answer"],
        sources=[
            Source(
                document_title=src["document_title"],
                content=src["content"],
                similarity=src["similarity"],
                metadata=src["metadata"],
            )
            for src in result["sources"]
        ],
    )


@course_router.get("")
async def get_courses(request: Request):
    user_id = request.state.user_id
    courses = course_crud.get_courses(user_id)
    if not courses:
        raise HTTPException(status_code=404, detail="Failed to fetch courses.")
    return courses


# get course by id
@course_router.get("/{c_id}")
async def get_courses_by_id(c_id: str, request: Request):
    try:
        user_id = request.state.user_id
        courses = course_crud.get_course_by_id(c_id, user_id)
        if not courses:
            raise HTTPException(status_code=404, detail="Failed to fetch course.")
        return courses
    except UserNotEnrolledException:
        raise HTTPException(
            status_code=404, detail="User is not enrolled in this course"
        )


@course_router.post("")
async def create_course(create_course_req: CreateCourseReq, request: Request):
    user_id = request.state.user_id
    course = course_crud.create_course(create_course_req)
    if not course:
        raise HTTPException(status_code=404, detail="Failed to create course.")
    # gets Admin Enum
    admin_enum = course_crud.get_role_key("Admin")
    if not admin_enum:
        raise HTTPException(status_code=404, detail="Failed to find Admin role")
    try:
        course_id = course.data[0]["id"]
        admin_id = admin_enum.data[0]["id"]
    except ValueError:
        raise HTTPException(status_code=404, detail="Value Error")
    # Adds user as admin to the added course
    add_user = course_crud.add_user_to_course(course_id, user_id, admin_id)
    if not add_user:
        raise HTTPException(
            status_code=404, detail="Failed to add user as admin to course."
        )
    return course


@course_router.delete("/{c_id}")
async def delete_course(c_id: str, request: Request):
    try:
        user_id = request.state.user_id
        admin_enum = course_crud.get_role_key("Admin")
        if not admin_enum:
            raise HTTPException(status_code=404, detail="Failed to find Admin role")
        admin_id = admin_enum.data[0]["id"]
        response = course_crud.delete_course(c_id, user_id, admin_id)
        if not response:
            raise HTTPException(status_code=404, detail="Failed to delete course.")
        return response
    except NoPermissionException:
        raise HTTPException(
            status_code=404, detail="User has no permission to delete role"
        )
    except ValueError:
        raise HTTPException(status_code=404, detail=str(e))


@course_router.put("/{c_id}")
async def update_course(update_course_req: UpdateCourseReq, request: Request):
    try:
        user_id = request.state.user_id
        # Get admin and maintainer role values
        admin_enum = course_crud.get_role_key("Admin")
        maintainer_enum = course_crud.get_role_key("Maintainer")
        if not admin_enum or not maintainer_enum:
            raise HTTPException(
                status_code=404, detail="Failed to get Admin and Maintaner roles"
            )
        admin_id = admin_enum.data[0]["id"]
        maintainer_id = maintainer_enum.data[0]["id"]
        response = course_crud.update_course(
            update_course_req, user_id, admin_id, maintainer_id
        )
        if not response:
            raise HTTPException(status_code=404, detail="Failed to update course.")
        return response
    except NoPermissionException:
        raise HTTPException(
            status_code=404, detail="User has no permission to update role"
        )
    except ValueError:
        raise HTTPException(status_code=404, detail=str(e))
