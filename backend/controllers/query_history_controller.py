from http.client import HTTPException
from typing import List
from models.db import get_db
from models.schemas.query_history import QueryEntry
from models.all import QueryHistory


def get_history_for_course(course_id, user_id) -> List[QueryEntry]:
    try:
        with get_db() as db:
            queries = (
                db.query(QueryHistory)
                .filter(QueryHistory.user_id == user_id)
                .filter(QueryHistory.course_id == course_id)
            )
            return queries
    except Exception as e:
        print(f"Error in get_history_for course: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")

