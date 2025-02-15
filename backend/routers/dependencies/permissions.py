from fastapi import Request
from functools import lru_cache
from typing import Annotated
from fastapi import Depends

from controllers.permission_controller import PermissionCache, UserPermissionManager


class PermissionsContainer:
    def __init__(self):
        self.cache = PermissionCache()
        self.manager = UserPermissionManager(self.cache)


@lru_cache
def get_permissions_container() -> PermissionsContainer:
    return PermissionsContainer()


def get_permissions_manager(
    container: Annotated[PermissionsContainer, Depends(get_permissions_container)],
) -> UserPermissionManager:
    return container.manager


# dependencies/database.py
from typing import Generator
from sqlalchemy.orm import Session
from models.db import SessionLocal


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
