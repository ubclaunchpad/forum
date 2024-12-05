



from typing import List
from uuid import UUID
from pydantic import BaseModel


class UserBase(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    
    
class GetUsersResponse(BaseModel):
    users: List[UserBase]