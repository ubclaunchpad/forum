from fastapi import APIRouter, HTTPException, Request
from controllers.query_history_controller import get_history_for_course, delete_history
from models.schemas.query_history import GetHistoryResponse

query_history_router = APIRouter()


@query_history_router.get("", response_model=GetHistoryResponse)
async def get_course_query_history(c_id: str, request: Request):
    try:
        user_id = request.state.user_id
        query_history = get_history_for_course(c_id, user_id)
        if (
            not query_history
            or len(query_history) == 0
            or len(query_history[0].messages) == 0
        ):
            raise HTTPException(
                status_code=500, detail=f"Query context for course {c_id} not found"
            )
        return {"history": query_history[0].messages}
    except Exception as e:
        return {"history": []}


@query_history_router.delete("")
async def clear_user_history(c_id: str, request: Request):
    user_id = request.state.user_id
    delete_history(c_id, user_id)
    return {"msg": "history deleted"}
