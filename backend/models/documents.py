""" Pydantic models for document handling """

from datetime import datetime
from enum import Enum
from typing import Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class DocumentType(str, Enum):
    """Enum class for document types supported by the application"""

    PDF = "application/pdf"
    TXT = "text/plain"
    MD = "text/markdown"
    PNG = "image/png"
    JPG = "image/jpeg"

    @classmethod
    def has_value(cls, value):
        return value in cls._value2member_map_


class DocumentMetadata(BaseModel):
    """Base model for document metadata"""

    document_type: DocumentType
    file_size: Optional[int] = None
    description: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    other: Optional[dict[str, Union[str, int, float]]] = None
    file_id: Optional[str] = None  # Used internally for storage reference

    @field_validator("file_size")
    @classmethod
    def validate_file_size(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("File size cannot be negative")
        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: list[str]) -> list[str]:
        return [
            tag.strip() for tag in v if tag.strip()
        ]  # Remove empty tags and strip whitespace


class DocumentTitle(BaseModel):
    """Model for document title validation"""

    title: str = Field(
        ..., min_length=1, max_length=255, description="Title of the document"
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        return v.strip()


class DocumentCreate(BaseModel):
    """Model for creating a new document"""

    title: str = Field(..., min_length=1, max_length=255)
    metadata: DocumentMetadata
    course_id: UUID

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Introduction to Python",
                "metadata": {
                    "document_type": "application/pdf",
                    "description": "Course introduction materials",
                    "tags": ["python", "introduction"],
                    "file_size": 1048576,
                },
                "course_id": "123e4567-e89b-12d3-a456-426614174000",
            }
        }
    }


class DocumentResponse(BaseModel):
    """Model for document response"""

    id: UUID
    title: str
    course_id: UUID
    document_type: DocumentType
    file_url: Optional[str] = None
    description: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Introduction to Python",
                "course_id": "123e4567-e89b-12d3-a456-426614174000",
                "document_type": "application/pdf",
                "file_size": 1048576,
                "description": "Course introduction materials",
                "tags": ["python", "introduction"],
                "created_at": "2024-11-23T10:00:00Z",
                "updated_at": None,
                "file_url": "/api/documents/123e4567-e89b-12d3-a456-426614174000/file",
            }
        }
    }

class ViewDocumentResponse(BaseModel):
    """Model for response from supabase storage, providing signed url"""
    signed_url: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "signed_url": "https://ldubcnoplotymhbjzmja.supabase.co/storage/v1/object/sign/course-files/documents/Excel%20Tutorial%20-%20Pivot%20Tables.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjb3Vyc2UtZmlsZXMvZG9jdW1lbnRzL0V4Y2VsIFR1dG9yaWFsIC0gUGl2b3QgVGFibGVzLnBkZiIsImlhdCI6MTczMzA4MzYwMiwiZXhwIjoxNzMzMTcwMDAyfQ.nq10l4fYG8_qBRbkoo93hEtPFEvU4cPZjWS5xMx__8c&t=2024-12-01T20%3A06%3A41.752Z",
            }
        }
    }


class DocumentUpdate(BaseModel):
    """Model for updating document metadata"""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    tags: Optional[list[str]] = None
    other: Optional[dict[str, Union[str, int, float]]] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return v.strip()
        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[list[str]]) -> Optional[list[str]]:
        if v is not None:
            return [tag.strip() for tag in v if tag.strip()]
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Updated Python Introduction",
                "description": "Updated course materials",
                "tags": ["python", "introduction", "updated"],
                "other": {"version": 2, "author": "John Doe"},
            }
        }
    }


class DocumentList(BaseModel):
    """Model for list of documents response"""

    items: list[DocumentResponse]
    total: int
    page: Optional[int] = 1
    page_size: Optional[int] = 10

    model_config = {
        "json_schema_extra": {
            "example": {
                "items": [
                    {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "title": "Introduction to Python",
                        "course_id": "123e4567-e89b-12d3-a456-426614174000",
                        "document_type": "application/pdf",
                        "file_size": 1048576,
                        "description": "Course introduction materials",
                        "tags": ["python", "introduction"],
                        "created_at": "2024-11-23T10:00:00Z",
                        "file_url": "/api/documents/123e4567-e89b-12d3-a456-426614174000/file",
                    }
                ],
                "total": 1,
                "page": 1,
                "page_size": 10,
            }
        }
    }


class DocumentCreateResponse(BaseModel):
    """Model for document creation response"""

    document_id: UUID
    title: str
    file_url: str
    created_at: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "document_id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Introduction to Python",
                "file_url": "/api/documents/123e4567-e89b-12d3-a456-426614174000/file",
                "created_at": "2024-11-23T10:00:00Z",
            }
        }
    }


class ErrorResponse(BaseModel):
    """Model for error responses"""

    detail: str
    error_code: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "detail": "Invalid file type: Expected PDF, got image/png",
                "error_code": "INVALID_FILE_TYPE",
            }
        }
    }
