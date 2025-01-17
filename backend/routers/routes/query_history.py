# TODO: Make get and delete/clear endpoints
from fastapi import APIRouter, HTTPException, Request
from controllers.query_history_controller import get_history_for_course
query_history_router = APIRouter()

@query_history_router.get("")
async def get_course_query_history(c_id: str, request: Request):
    user_id = request.state.user_id
    return get_history_for_course(c_id, user_id)


@query_history_router.delete("")
async def clear_user_history(c_id: str, request: Request):
    user_id = request.state.user_id
    return {"msg" : "history cleared"}