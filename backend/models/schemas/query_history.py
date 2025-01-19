from typing import List, Dict, Any

from fastapi import File, UploadFile
from pydantic import BaseModel, Field


class QueryEntry(BaseModel):
    question: str
    answer: str
    sources: List[Dict[str, Any]]

class GetHistoryResponse(BaseModel):
    history: List[QueryEntry]
