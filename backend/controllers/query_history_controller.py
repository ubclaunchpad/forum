from typing import Any, Dict, List
from uuid import UUID
import json

from fastapi import HTTPException
from sqlalchemy import text
from models.db import get_db
from models.all import QueryHistory
from models.schemas.query_history import QueryEntry, QueryHistoryModel


def get_history_for_course(course_id: str, user_id: str) -> List[QueryHistoryModel]:
    try:
        with get_db() as db:
            stmt = text("""
                SELECT  user_id, course_id, messages
                FROM query_history
                WHERE user_id = :user_id
                AND course_id = :course_id
            """)

            result = db.execute(
                stmt, {"user_id": user_id, "course_id": course_id}
            ).fetchall()

            return [
                QueryHistoryModel.model_validate(
                    {
                        "user_id": row.user_id,
                        "course_id": row.course_id,
                        "messages": row.messages,
                    }
                )
                for row in result
            ]
    except Exception as e:
        print(f"Error in get_history_for course: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get course history: {str(e)}"
        )


def update_course_history(course_id: str, user_id: str, messages: List[Dict[str, Any]]):
    try:
        with get_db() as db:
            db.query(QueryHistory).filter(
                QueryHistory.user_id == UUID(user_id),
                QueryHistory.course_id == UUID(course_id),
            ).update({"messages": messages})
            db.commit()
    except Exception as e:
        print(f"Error in updating history for course: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to update history: {str(e)}"
        )


def add_query_to_history(course_id, user_id, query):
    try:
        with get_db() as db:
            del query["checkpoint"]
            del query["done"]
            query_json = json.dumps(query)
            query_array = [query] if isinstance(query, dict) else query
            query_json = json.dumps(query_array)

            stmt = text("""
                INSERT INTO public.query_history (user_id, course_id, messages)
                VALUES (:user_id, :course_id, cast(:query as jsonb))
                ON CONFLICT (user_id, course_id) 
                DO UPDATE SET messages = query_history.messages || cast(:query as jsonb)
            """)

            db.execute(
                stmt,
                {
                    "user_id": str(user_id),
                    "course_id": str(course_id),
                    "query": query_json,
                },
            )
            db.commit()
            return
    except Exception as e:
        print(f"Error in adding new query to course: {type(e).__name__}: {str(e)}")
        return


def delete_history(course_id, user_id):
    try:
        with get_db() as db:
            db.query(QueryHistory).filter(QueryHistory.user_id == user_id).filter(
                QueryHistory.course_id == course_id
            ).delete()
    except Exception as e:
        print(f"Error in delete_history_: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to delete history: {str(e)}"
        )


def get_open_ai_context(course_id, user_id):
    try:
        print("getting history")
        history = get_history_for_course(course_id, user_id)

        ret = []
        for m in history[0].messages:
            user = {"role": "user", "content": m["question"]}
            assistant = {"role": "assistant", "content": m["answer"]}
            ret.append(user)
            ret.append(assistant)
        return ret
    except Exception as e:
        return []
