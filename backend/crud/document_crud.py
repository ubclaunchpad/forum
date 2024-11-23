""" CRUD operations for documents """

from typing import Any, Dict
from uuid import UUID, uuid4

from database.db import database
from fastapi import HTTPException, UploadFile

from backend.core.util.file_storage import FileStorage


class DocumentError(Exception):
    """Base exception for document operations"""

    pass


class DocumentNotFound(DocumentError):
    """Raised when a document is not found"""

    pass


class StorageError(DocumentError):
    """Raised when storage operations fail"""

    pass


file_storage = FileStorage(
    "course-files"
)  # TODO: let each course have its own file storage


def create_document(
    file: UploadFile, course_id: UUID, metadata: Dict[str, Any]
) -> Dict[str, UUID]:
    """
    Creates a new document and associates it with a course, handling both file storage and metadata.

    Flow:
    1. Stores the physical file in file storage
    2. Creates document record with metadata
    3. Associates document with course

    Args:
        file (UploadFile): The file to be stored
            Must be a valid file object with:
            - file: File-like object for content
            - filename: Original file name
            - content_type: MIME type
        course_id (UUID): Course identifier to associate document with
        metadata (Dict[str, Any]): Document metadata including:
            - title: Document title (required)
            - document_type: MIME type of document (required)
            - Additional metadata fields will be stored in metadata JSON column

    Returns:
        Dict[str, UUID]: Dictionary containing:
            - document_id: UUID of created document

    Raises:
        HTTPException:
            - 400: Invalid metadata format
            - 500: File storage or database operation failure
        ValueError: If required metadata fields are missing

    Example:
        >>> metadata = {
        ...     "title": "Lecture 1",
        ...     "document_type": "application/pdf",
        ...     "author": "Dr. Smith",
        ...     "tags": ["intro", "week1"]
        ... }
        >>> result = create_document(
        ...     file=uploaded_file,
        ...     course_id=UUID("123e4567-e89b-12d3-a456-426614174000"),
        ...     metadata=metadata
        ... )
    """
    doc_id = uuid4()

    try:
        # Extract and validate required metadata
        if "title" not in metadata:
            raise ValueError("Title is required in metadata")

        title = metadata.get("title")
        document_type = metadata.get("document_type")

        # Store file and get storage reference
        file_id = file_storage.store_file(file.file, title)

        # Prepare metadata for storage
        # Create a copy to avoid modifying the input dict
        doc_metadata = metadata.copy()
        doc_metadata["file_id"] = file_id
        doc_metadata.pop("title", None)  # Remove title since it's stored separately

        # Create document record
        doc_response = (
            database.table("documents")
            .insert(
                {
                    "id": str(doc_id),
                    "title": title,
                    "document_type": document_type,
                    "metadata": doc_metadata,
                }
            )
            .execute()
        )

        # Create course association
        course_doc_response = (
            database.table("course_documents")
            .insert({"course_id": str(course_id), "doc_id": str(doc_id)})
            .execute()
        )

        return {
            "document_id": doc_id,
        }

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Log the error here
        raise HTTPException(status_code=500, detail="Failed to create document") from e


def get_documents(course_id: UUID) -> Dict[str, Any]:
    """
    Retrieves all documents associated with a course.

    Args:
        course_id (UUID): Course identifier to retrieve documents for

    Returns:
        Dict[str, Any]: Dictionary containing:
            - documents: List of document records

    Raises:
        HTTPException:
            - 404: If course doesn't exist
            - 500: Database operation failure

    Example:
        >>> result = get_documents(UUID("123e4567-e89b-12d3-a456-426614174000"))
    """
    try:
        # Get all documents associated with course
        docs = (
            database.table("course_documents")
            .select("doc_id")
            .eq("course_id", str(course_id))
            .execute()
        )

        # Fetch document records
        doc_ids = [doc.get("doc_id") for doc in docs.get("data", [])]
        documents = database.table("documents").select("*").in_("id", doc_ids).execute()

        return {
            "documents": documents.get("data", []),
        }

    except Exception as e:
        # Log the error here
        raise HTTPException(status_code=500, detail="Failed to get documents") from e


def get_document_by_id(document_id: UUID, include_file: bool = False) -> Dict[str, Any]:
    """
    Retrieves a specific document by its identifier.

    Args:
        document_id (UUID): Document identifier to retrieve
        include_file (bool): Whether to include file content in response (default: False)

    Returns:
        Dict[str, Any]: Dictionary containing:
            - document: Document record
            - file: File content if requested

    Raises:
        HTTPException:
            - 404: If document doesn't exist
            - 500: Database operation failure

    Example:
        >>> result = get_document_by_id(UUID("123e4567-e89b-12d3-a456-426614174000"))
    """
    try:
        # Fetch document record
        document = (
            database.table("documents").select("*").eq("id", str(document_id)).execute()
        )

        if not document.get("data"):
            raise HTTPException(status_code=404, detail="Document not found")

        if include_file:
            # Fetch file content
            file_id = document.get("data")[0].get("metadata", {}).get("file_id")
            file_content = file_storage.retrieve_file(file_id)

            return {
                "document": document.get("data")[0],
                "file": file_content,
            }

        return {
            "document": document.get("data")[0],
        }

    except Exception as e:
        # Log the error here
        raise HTTPException(status_code=500, detail="Failed to get document") from e
