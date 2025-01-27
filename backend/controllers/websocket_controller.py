from models.all import Message
from models.db import get_db


def sendMessage(data : str):
    with get_db() as db:
        message = Message(
            content=data,
            created_by="user_id"
        )

        try:
            db.add(message)
            db.flush()
            return message
        except Exception as e:
            raise e
        