from bisect import bisect_right
from datetime import datetime, timedelta
from typing import List

from controllers.query_history_controller import update_course_history, delete_history
from models.all import QueryHistory
from models.db import get_db


def main():
    try:
        history = get_all_history()
        two_days_ago = datetime.now() - timedelta(days=2)
        for h in history:
            index_to_delete = bisect_right(h.messages, two_days_ago, key=key_getter)
            new_query = h.messages[index_to_delete : len(h.messages)]
            if len(new_query) == 0:
                delete_history(h.course_id, h.user_id)
            else:
                update_course_history(
                    h.course_id, user_id=h.user_id, messages=new_query
                )
    except Exception as e:
        print(f"Error in delete_history_after_48_hours: {type(e).__name__}: {str(e)}")


def key_getter(query_entry) -> datetime:
    timestamp = datetime.strptime(query_entry["timestamp"], "%Y-%m-%d %H:%M:%S")
    return timestamp


def get_all_history() -> List[QueryHistory]:
    try:
        with get_db() as db:
            queries = (db.query(QueryHistory)).all()
            return queries
    except Exception as e:
        print(f"Error in get_history_for course: {type(e).__name__}: {str(e)}")
        return []


if __name__ == "__main__":
    main()
