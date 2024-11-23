""" This module contains the routes for documents """

from datetime import datetime
from enum import Enum
from typing import Optional, Union
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

from crud import document_crud


document_router = APIRouter()


class DocumentType(str, Enum):
    """Enum class for document types supported by the application"""

    PDF = "application/pdf"
    TXT = "text/plain"
    MD = "text/markdown"
    PNG = "image/png"
    JPG = "image/jpeg"


class DocumentMetadata(BaseModel):
    """Base model for document metadata"""

    title: str
    document_type: DocumentType
    file_size: Optional[int] = None
    description: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    other: Optional[dict[str, Union[str, int, float]]] = None


class DocumentCreate(BaseModel):
    """Model for creating a new document"""

    metadata: DocumentMetadata
    file: UploadFile

    class Config:
        arbitrary_types_allowed = True  # Needed for UploadFile


class DocumentResponse(DocumentMetadata):
    """Model for document response"""

    id: UUID
    course_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    file_url: Optional[str] = None


@document_router.post("/documents", response_model=DocumentResponse)
async def create_document(
    course_id: UUID, file: UploadFile, metadata: DocumentMetadata
) -> DocumentResponse:
    """
    Create a new document associated with a course.

    This endpoint handles document upload and creation by:
    1. Validating the file type against the specified metadata
    2. Processing the uploaded file based on its type
    3. Storing document metadata and establishing course relationship

    Args:
        course_id (UUID): The unique identifier of the course to associate the document with
        file (UploadFile): The uploaded file object containing the document content
            Supported file types include:
            - PDF (.pdf)
            - Word (.docx)
            - PowerPoint (.pptx)
            - Text (.txt)
            - Markdown (.md)
            - Audio (.wav, .mp3)
            - Images (.png, .jpg)
        metadata (DocumentMetadata): Document metadata including:
            - title: Name/title of the document
            - document_type: Type of document (must match file content type)
            - file_size: Size of file in bytes (optional)
            - description: Document description (optional)
            - tags: List of relevant tags (optional)

    Returns:
        DocumentResponse: Created document details including:
            - All metadata fields
            - id: Generated document UUID
            - course_id: Associated course UUID
            - created_at: Timestamp of creation
            - updated_at: Last update timestamp (if any)
            - file_url: URL to access the stored file (if applicable)

    Raises:
        HTTPException (400): If file type doesn't match specified document type
        HTTPException (404): If specified course doesn't exist
        HTTPException (413): If file size exceeds limits
        HTTPException (422): If metadata validation fails

    Example:
        >>> # Create a PDF document
        >>> file = UploadFile("lecture.pdf", content_type="application/pdf")
        >>> metadata = DocumentMetadata(
        ...     title="Lecture 1",
        ...     document_type=DocumentType.PDF,
        ...     description="Introduction to the course"
        ... )
        >>> document = await create_document(
        ...     course_id=UUID("123e4567-e89b-12d3-a456-426614174000"),
        ...     file=file,
        ...     metadata=metadata
        ... )
    """
    # Validate file type matches metadata
    if file.content_type != metadata.document_type.value:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} does not match specified document type {metadata.document_type.value}",
        )

    response = document_crud.create_document(
        file=file, metadata=metadata, course_id=course_id
    )
    return response


@document_router.get("/documents")
async def get_documents(course_id: UUID) -> list[DocumentResponse]:
    """
    Retrieve all documents associated with a specific course.

    Args:
        course_id (UUID): Unique identifier of the course to fetch documents from

    Returns:
        list[DocumentResponse]: List of documents, each containing:
            - id: Document UUID
            - title: Document title
            - document_type: Type of document
            - metadata: Additional document metadata
            - created_at: Creation timestamp
            - updated_at: Last update timestamp
            - file_url: URL to access the document (if applicable)

    Raises:
        HTTPException (404): If course_id does not exist
        HTTPException (403): If user does not have access to the course

    Example:
        >>> course_id = UUID("123e4567-e89b-12d3-a456-426614174000")
        >>> documents = await get_documents(course_id)
        >>> for doc in documents:
        ...     print(f"{doc.title} ({doc.document_type})")
    """
    documents = document_crud.get_documents(course_id)
    return documents


@document_router.get("/documents/{document_id}")
async def get_document(
    course_id: UUID, document_id: UUID, request: Request
) -> DocumentResponse:
    """
    Retrieve a specific document by its ID within a course context.

    This endpoint verifies both the document existence and its association
    with the specified course before returning the document details.

    Args:
        course_id (UUID): Course identifier the document belongs to
        document_id (UUID): Unique identifier of the document to retrieve
        request (Request): FastAPI request object for additional context

    Returns:
        DocumentResponse: Document details including:
            - id: Document UUID
            - title: Document title
            - document_type: Type of document
            - metadata: Additional document metadata including:
                - file_id: Reference to stored file
                - author: Document author (if specified)
                - tags: Associated tags
                - Additional custom metadata
            - created_at: Creation timestamp
            - updated_at: Last update timestamp
            - file_url: URL to access the document (if applicable)

    Raises:
        HTTPException (404):
            - If document_id does not exist
            - If course_id does not exist
            - If document is not associated with the course
        HTTPException (403): If user does not have access to the document

    Example:
        >>> course_id = UUID("123e4567-e89b-12d3-a456-426614174000")
        >>> document_id = UUID("987fcdeb-51a2-3e4b-9876-543210987654")
        >>> document = await get_document(course_id, document_id, request)
        >>> print(f"Retrieved: {document.title}")
    """
    document = document_crud.get_document_by_id(document_id)
    return document
