from datetime import datetime
from typing import List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field


class QueryEntry(BaseModel):
    question: str
    answer: str
    timestamp: str | datetime
    sources: List[Dict[str, Any]]


class GetHistoryResponse(BaseModel):
    history: List[QueryEntry]


class QueryHistoryModel(BaseModel):
    user_id: UUID
    course_id: UUID
    messages: List[Dict[str, Any]]

    class Config:
        from_attributes = True
