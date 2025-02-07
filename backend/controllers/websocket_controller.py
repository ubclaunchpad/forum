from typing import List
from uuid import UUID

from models.all import Channel, Message, UserChannel
from models.db import get_db, supabase
from sqlalchemy import exists


def sendMessage(data : str, user_id : str, channel_id : str):
    with get_db() as db:
        try:
            message = Message(
                content=data,
                created_by=user_id,
                channel_id=channel_id
            )
            db.add(message)
            db.flush()

            return message.id
        except Exception as e:
            raise e
        
def getMessageHistory(channel_id : str):
    with get_db() as db:
        try:
            messages = (db.query(Message).filter_by(channel_id=channel_id).
                        order_by(Message.created_at.asc()).all())
            return messages
        except Exception as e:
            raise e
    return

def getUserChannels(user_id: str):
    with get_db() as db:
        try:
            channels = db.query(UserChannel).filter_by(user_id=user_id).all()
            return channels
        except Exception as e:
            raise e

def createChannel(user_id: str, users: List[str], name):
    with get_db() as db:
        try:
            channel = Channel(
                name=name,
                created_by=UUID(user_id)
            )

            db.add(channel)
            db.flush()

            channel_id = getattr(channel, "id")

            users.append(user_id)

            user_channels = [
                UserChannel(user_id=user, channel_id=channel_id) for user in users
            ]

            db.add_all(user_channels)

            return {"success" : True}
        except Exception as e:
            raise e
    return



async def verifyToken(token : str):
    user = supabase.auth.get_user(token)
    if not user or not user.user:
        raise Exception()

    return str(user.user.id)
    

def verifyUserChannel(user_id: str, channel_id: str):
    with get_db() as db:
        try:
            res = db.query(exists().where(UserChannel.user_id == user_id, UserChannel.channel_id == channel_id)).scalar()
            return res
        except Exception as e:
            raise e
        