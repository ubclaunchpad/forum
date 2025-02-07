from typing import Annotated, List

from pydantic import BaseModel, Field


class CreateChannelRequest(BaseModel):
    name : str
    user_id : str
    users: List[str]