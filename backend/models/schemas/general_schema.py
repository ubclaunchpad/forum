from datetime import date
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class GeneralResponse(BaseModel):
    msg: str
    properties: Dict[str, Any] | None = None
