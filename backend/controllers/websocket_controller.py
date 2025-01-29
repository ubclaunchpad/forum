from models.all import Message, UserChannel
from models.db import get_db
from sqlalchemy import exists


def sendMessage(data : str, user_id : str):
    with get_db() as db:
        try:
            message = Message(
                content=data,
                created_by=user_id
            )
            db.add(message)
            db.flush()
            return message
        except Exception as e:
            raise e
    

def verifyUserChannel(user_id: str, channel_id: str):
    with get_db() as db:
        try:
            res = db.query(exists().where(UserChannel.user_id == user_id, UserChannel.channel_id == channel_id)).scalar()
            return res
        except Exception as e:
            raise e
        