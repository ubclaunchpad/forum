from models.all import Profile
from models.db import get_db
from sqlalchemy.orm import joinedload


def get_all_users():
    with get_db() as db:
        users = db.query(Profile).all()
        return users


def get_user_by_id(user_id):
    with get_db() as db:
        user = (
            db.query(Profile)
            .options(joinedload(Profile.courses))
            .filter(Profile.id == user_id)
            .first()
        )
    return user


def get_user_courses(user_id):
    user = get_user_by_id(user_id)
    if not user or not user.courses:
        return []
    return user.courses


def delete_user_by_id(user_id):
    with get_db() as db:
        user = db.query(Profile).filter(Profile.id == user_id).first()
        if not user:
            return False
        db.delete(user)
        db.flush()
        return True
