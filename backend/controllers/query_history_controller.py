from bisect import bisect_right
from datetime import datetime, timedelta
from http.client import HTTPException
from typing import List
from models.db import get_db
from models.all import QueryHistory
from models.schemas.query_history import QueryEntry


def get_all_history() -> List[QueryHistory]:
    try:
        with get_db() as db:
            queries = (
                db.query(QueryHistory)
            ).all()
            return queries
    except Exception as e:
        print(f"Error in get_history_for course: {type(e).__name__}: {str(e)}")
        return []

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
        raise HTTPException(status_code=500, detail=f"Failed to get course history: {str(e)}")

def update_course_history(course_id, user_id, messages):
    try:
        with get_db() as db:
            db.query(QueryHistory).filter(QueryHistory.user_id == user_id).filter(QueryHistory.course_id == course_id
                                                                                  ).update({"messages": messages})
            db.flush()
    except Exception as e:
        print(f"Error in updating history for course: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update history: {str(e)}")


def add_query_to_history(course_id, user_id, query):
    queries = get_history_for_course(course_id, user_id)
    # ensures there is only one query context entry for this course and user
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
                db.flush()
                return
            except Exception as e:
                db.rollback()
                raise e
    return


def delete_history(course_id, user_id):
    try:
        with get_db() as db:
            db.query(QueryHistory).filter(QueryHistory.user_id == user_id
                                          ).filter(QueryHistory.course_id == course_id).delete()
    except Exception as e:
        print(f"Error in delete_history_: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete history: {str(e)}")


def get_open_ai_context(course_id, user_id):
    try:
        history = get_history_for_course(course_id, user_id)
        ret = []
        for m in history[0].messages:
            user = {
                "role": "user",
                "content": m["question"]
            }
            assistant = {
                "role": "assistant",
                "content": m["answer"]
            }
            ret.append(user)
            ret.append(assistant)
        return ret
    except Exception as e:
        return []


def delete_history_after_48_hours():
    try:
        history = get_all_history()
        two_days_ago = datetime.now() - timedelta(days=2)
        for h in history:
            index_to_delete = bisect_right(h.messages, two_days_ago, key=key_getter)
            new_query = h.messages[index_to_delete: len(h.messages)]
            if len(new_query) == 0:
                delete_history(h.course_id, h.user_id)
            else:
                update_course_history(h.course_id, user_id=h.user_id, messages=new_query)
    except Exception as e:
        print(f"Error in delete_history_after_48_hours: {type(e).__name__}: {str(e)}")


def key_getter(query_entry) -> datetime:
    timestamp = datetime.strptime(query_entry["timestamp"], "%Y-%m-%d %H:%M:%S")
    return timestamp


