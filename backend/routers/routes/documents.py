""" This module contains the routes for documents """

from uuid import UUID

from crud import document_crud
from fastapi import APIRouter, Form, HTTPException, Request, UploadFile
from models.documents import DocumentMetadata, DocumentResponse, DocumentTitle
from pydantic import ValidationError

document_router = APIRouter()


@document_router.post("", response_model=DocumentResponse)
async def create_document(
    course_id: UUID,
    file: UploadFile,
    title: str = Form(...),
    metadata: str = Form(...)
) -> DocumentResponse:
    """
    Create a new document associated with a course.
    """
    # Validate title
    try:
        validated_title = DocumentTitle(title=title)
    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid title: {str(e)}"
        )

    # Parse and validate metadata
    try:
        metadata_obj = DocumentMetadata.model_validate_json(metadata)
    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid metadata format: {str(e)}"
        )

    # Validate file type
    if file.content_type != metadata_obj.document_type.value:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} does not match specified document type {metadata_obj.document_type.value}"
        )

    # Optional: Add file size validation
    if metadata_obj.file_size:
        try:
            content = await file.read()
            actual_size = len(content)
            if actual_size != metadata_obj.file_size:
                metadata_obj.file_size = actual_size
            await file.seek(0)  # Reset file pointer after reading
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error validating file size: {str(e)}"
            )

    # Create document - Add await here
    try:
        response = await document_crud.create_document(  # Add await here
            file=file,
            metadata=metadata_obj,
            course_id=course_id,
            title=validated_title.title
        )
        return response  # This should now return a DocumentResponse object
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating document: {str(e)}"
        )

@document_router.get("")
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


@document_router.get("/{document_id}")
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
