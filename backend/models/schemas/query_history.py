from datetime import datetime
from typing import List, Dict, Any
from pydantic import BaseModel, Field


class QueryEntry(BaseModel):
    question: str
    answer: str
    timestamp: str | datetime
    sources: List[Dict[str, Any]]

class GetHistoryResponse(BaseModel):
    history: List[QueryEntry]
