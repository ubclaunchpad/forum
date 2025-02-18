from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from fastapi import File, UploadFile
from pydantic import BaseModel, Field


class CreateDocumentRequest(BaseModel):
    title: str
    course_id: UUID
    created_by: UUID
    file: UploadFile
    document_type: str


class CreateDocumentResponse(BaseModel):
    id: UUID


class DocumentFileUpload(BaseModel):
    title: str
    course_id: UUID
    created_by: UUID
    file: bytes
    type: str
    extension: str


class GetCourseDocumentsResponse(BaseModel):
    documents: list[str]


class GetCourseDocumentsRequest(BaseModel):
    pass


class DocumentEmbeddingMetadata(BaseModel):
    last_updated: Optional[datetime] = None
    chunk_count: int = 0
    has_embeddings: bool = False
