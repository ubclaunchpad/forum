from typing import List, Optional

from core.pipelines.doc_query_engine import DocumentQueryEngine
from crud import course_crud
from crud.course_crud import NoPermissionException, UserNotEnrolledException
from fastapi import APIRouter, HTTPException, Request
from pydantic import ValidationError, Field, BaseModel, validator
from crud import course_crud
from crud import user_crud
from crud.course_crud import UserNotEnrolledException, NoPermissionException
from routers.req.courses_req import (
    CreateCourseReq,
    UpdateCourseReq,
    AssignCourseUserRoleReq,
    CourseUserRole,
)
from routers.res.courses_res import AssignedBy, GetCourseUserRoleRes

course_router = APIRouter()
# Maximum number of chunks to retrieve from the document, hard-coded for now
MAX_CHUNKS = 5

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
    except KeyError as e:
        # Template not found
        raise HTTPException(status_code=400, detail=f"Template not found: {e}")
    except ValueError as e:
        # Other validation errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # General error handling
        raise HTTPException(status_code=500, detail=f"Error during query: {e}")

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
async def get_courses_by_id(c_id: int, request: Request):
    try:
        user_id = request.state.user_id
        courses = course_crud.get_course_by_id(c_id, user_id)
        if not courses:
            raise HTTPException(status_code=404, detail="Failed to fetch course.")
        return courses
    except UserNotEnrolledException as e:
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
    course_id = course.data[0]["id"]
    admin_id = admin_enum.data[0]["id"]
    # Adds user as admin to the added course
    add_user = course_crud.add_user_to_course(course_id, user_id, admin_id)
    if not add_user:
        raise HTTPException(
            status_code=404, detail="Failed to add user as admin to course."
        )
    return course


@course_router.delete("/{c_id}")
async def delete_course(c_id: int, request: Request):
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
    except NoPermissionException as e:
        raise HTTPException(
            status_code=404, detail="User has no permission to delete role"
        )
    except ValueError as e:
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
    except NoPermissionException as e:
        raise HTTPException(
            status_code=404, detail="User has no permission to update role"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


course_user_role_endpoint = course_router_endpoint + "/{c_id}/users/roles"


@course_router.get(course_user_role_endpoint)
async def get_users_with_course_roles(c_id: int, request: Request):
    users = course_crud.get_users_with_course_roles(c_id)
    if not users:
        raise HTTPException(status_code=404, detail="Failed to fetch users")

    response = []
    for user in users.data:
        assigned_by_name = (
            user["assigned_by_name"]["first_name"]
            + " "
            + user["assigned_by_name"]["last_name"]
        )
        assignedBy = AssignedBy(id=user["assigned_by"], name=assigned_by_name)
        user_name = (
            user["user_name"]["first_name"] + " " + user["user_name"]["last_name"]
        )
        response.append(
            GetCourseUserRoleRes(
                user_id=user["user_id"],
                name=user_name,
                access_role=user["access_role"],
                semantic_role=user["semantic_role"],
                assigned_at=user["updated_at"],
                assigned_by=assignedBy,
            )
        )
    return response


@course_router.post(course_user_role_endpoint)
async def assign_user_course_role(
    c_id: int, curRequest: AssignCourseUserRoleReq, request: Request
):
    user = validate_cur_request(c_id, curRequest, request)

    prev_cur = course_crud.get_user_course_role_by_id(curRequest.u_id, c_id)
    if prev_cur and prev_cur.data and len(prev_cur.data) > 0:
        raise HTTPException(status_code=403, detail="Requested user already has a role")

    assign_response = course_crud.assign_user_course_role(
        c_id, curRequest, str(user["id"])
    )
    if (
        not assign_response
        or not assign_response.data
        or len(assign_response.data) <= 0
    ):
        raise HTTPException(status_code=500, detail="Failed to add course role to user")

    try:
        updated_cur = CourseUserRole.model_validate(assign_response.data[0])
    except ValidationError as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to process updated user, could not update role history",
        )

    update_cur_history(None, updated_cur, curRequest.reason)
    return assign_response


@course_router.patch(course_user_role_endpoint)
async def update_user_course_role(
    c_id: int, curRequest: AssignCourseUserRoleReq, request: Request
):
    user = validate_cur_request(c_id, curRequest, request)

    prev_cur = course_crud.get_user_course_role_by_id(curRequest.u_id, c_id)
    if not prev_cur or not prev_cur.data or len(prev_cur.data) <= 0:
        raise HTTPException(status_code=403, detail="User does not have a course role")

    update_response = course_crud.update_user_course_role(
        c_id, curRequest, str(user["id"])
    )
    if (
        not update_response
        or not update_response.data
        or len(update_response.data) <= 0
    ):
        raise HTTPException(status_code=500, detail="Failed to add course role to user")
    try:
        updated_cur = CourseUserRole.model_validate(update_response.data[0])
    except ValidationError as e:
        raise HTTPException(
            status_code=500, detail="Failed to process updated user for response"
        )

    update_cur_history(prev_cur.data[0], updated_cur, curRequest.reason)
    return update_response


def validate_cur_request(
    c_id: int, curRequest: AssignCourseUserRoleReq, request: Request
):
    """
    Helper function for validating the content of the course user role request and the user making the request.
    If it fails, it will raise the appropriate HTTP exception.

    Args:
        c_id (int): course ID
        curRequest (AssignCourseUserRoleReq): Course User Role Request model
        request (Request): Request headers

    Returns:
        user: the user model of the user making the request.
    """
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        raise HTTPException(status_code=401, detail="Missing user header")

    user = user_crud.get_user_by_id(user_id)
    if not user or len(user) <= 0:
        raise HTTPException(status_code=404, detail="Failed to find user")

    min_required_role = "Maintainer"
    has_permission = course_crud.user_has_course_permissions(
        user_id, c_id, min_required_role
    )

    if not has_permission:
        raise HTTPException(status_code=403, detail="User has insufficient permissions")

    requested_user = user_crud.get_user_by_id(curRequest.u_id)
    if not requested_user:
        raise HTTPException(status_code=404, detail="Failed to find requested user")

    try:
        course_crud.get_course_by_id(c_id, curRequest.u_id)
    except UserNotEnrolledException as e:
        raise HTTPException(status_code=403, detail="User not enrolled in course")
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Failed to find course")

    return user[0]


def update_cur_history(
    prev_cur: CourseUserRole | None,
    updated_course_user_role: CourseUserRole,
    reason: str,
):
    """
    Helper function for updating the course user role history.
    If it fails, it will raise the appropriate HTTP exception.

    Args:
        curRequest (AssignCourseUserRoleReq): Course User Role Request model
        updated_course_user_role (CourseUserRole): Updated Course User Role model

    Returns:
        Nothing
    """
    try:
        if prev_cur:
            prev_cur = CourseUserRole.model_validate(prev_cur)
    except ValidationError as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to process previous course role, did not update change role history",
        )

    history_response = course_crud.create_user_course_role_history(
        updated_course_user_role, prev_cur, reason
    )
    print(history_response)
    if not history_response:
        raise HTTPException(
            status_code=500, detail="Failed to update course role history"
        )
