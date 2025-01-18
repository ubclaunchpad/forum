from http.client import HTTPException
from typing import List
from models.db import get_db
from models.schemas.query_history import QueryEntry
from models.all import QueryHistory


def get_history_for_course(course_id, user_id) -> List[QueryHistory]:
    try:
        with get_db() as db:
            queries = (
                db.query(QueryHistory)
                .filter(QueryHistory.user_id == user_id)
                .filter(QueryHistory.course_id == course_id)
            ).all()
            return queries
    except Exception as e:
        print(f"Error in get_history_for course: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")

def update_course_history(course_id, user_id, messages):
    try:
        with get_db() as db:
            db.query(QueryHistory).filter(QueryHistory.user_id == user_id).filter(QueryHistory.course_id == course_id
                                                                                  ).update({"messages": messages})
            db.flush()
            print("DB Flushed")
    except Exception as e:
        print(f"Error in updating history for course: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update history: {str(e)}")



def add_query_to_history(course_id, user_id, query):
    queries = get_history_for_course(course_id, user_id)
    # ensures there is only one query history entry for this course and user
    if queries and len(queries) == 1:
        query_to_update = queries[0]
        if query_to_update.messages and isinstance(query_to_update.messages, list):
            query_to_update.messages.append(query)
            update_course_history(course_id, user_id, query_to_update.messages)
    else:
        with get_db() as db:
            try:
                messages = [query]
                query_history = QueryHistory(user_id=user_id, course_id=course_id, messages=messages)
                db.add(query_history)
                db.commit()
                return
            except Exception as e:
                db.rollback()
                raise e
    return
