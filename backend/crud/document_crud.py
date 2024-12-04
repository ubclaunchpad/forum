import logging
import urllib.parse
from typing import Any, Dict, List
from uuid import UUID, uuid4

from core.util.file_storage import FileStorage
from database.db import database
from fastapi import HTTPException, UploadFile
# Import the models from your API
from models.documents import (DocumentMetadata, DocumentResponse, DocumentType,
                              ViewDocumentResponse)
from pydantic import BaseModel

file_storage = FileStorage(bucket_name="course-files")


class DocumentCreate(BaseModel):
    """Internal model for document creation"""

    title: str
    metadata: DocumentMetadata
    course_id: UUID


async def create_document(
    file: UploadFile, metadata: DocumentMetadata, course_id: UUID, title: str
) -> DocumentResponse:
    """Creates a new document and associates it with a course."""
    doc_id = uuid4()

    try:
        # Read file content
        file_content = await file.read()

        # Store file and get storage reference
        file_id = file_storage.store_file(
            file_content, file.filename
        )  # No await here since it's not async

        # Reset file pointer
        await file.seek(0)

        # Prepare metadata for storage
        metadata_dict = metadata.model_dump()
        metadata_dict["file_id"] = file_id

        # Create document record
        doc_data = {
            "id": str(doc_id),
            "title": title,
            "document_type": metadata.document_type.value,
            "metadata": metadata_dict,
        }

        database.table("documents").insert(doc_data).execute()

        # Create course association
        (
            database.table("course_documents")
            .insert({"course_id": str(course_id), "document_id": str(doc_id)})
            .execute()
        )

        # Return DocumentResponse
        return DocumentResponse(
            id=doc_id,
            title=title,
            course_id=course_id,
            document_type=metadata.document_type,
            description=metadata.description,
            file_url=file_storage.format_file_url(file_id),
        )

    except Exception as e:
        logging.error("Failed to create document: %s", e)
        raise HTTPException(
            status_code=500, detail=f"Failed to create document: {str(e)}"
        )


def get_documents(course_id: UUID) -> List[DocumentResponse]:
    """
    Retrieves all documents associated with a course.

    Args:
        course_id (UUID): Course identifier to retrieve documents for

    Returns:
        List[DocumentResponse]: List of document records

    Raises:
        HTTPException:
            - 404: If course doesn't exist
            - 500: Database operation failure
    """
    try:
        # Get all documents associated with course
        res = (
            database.table("course_documents")
            .select("document_id")
            .eq("course_id", str(course_id))
            .execute()
        )

        docs: List[Dict[str, Any]] = res.data
        # Fetch document records
        doc_ids = [doc["document_id"] for doc in docs]
        if not doc_ids:
            return []

        documents = database.table("documents").select("*").in_("id", doc_ids).execute()

        # Convert to DocumentResponse objects
        return [
            DocumentResponse(
                id=UUID(doc["id"]),
                title=doc["title"],
                course_id=course_id,
                document_type=DocumentType(doc["document_type"]),
                description=doc.get("metadata", {}).get("description"),
                tags=doc.get("metadata", {}).get("tags", []),
                file_size=doc.get("file_size"),
                other=doc.get("metadata", {}).get("other"),
                created_at=doc["created_at"],
                updated_at=doc.get("updated_at"),
                file_url=doc.get("metadata", {}).get("file_id"),
            )
            for doc in documents.data
        ]

    except Exception as e:
        logging.error("Failed to get documents: %s", e)
        raise HTTPException(
            status_code=500, detail=f"Failed to get documents: {str(e)}"
        ) from e


def get_document_by_id(document_id: UUID) -> DocumentResponse:
    """
    Retrieves a specific document by its identifier.

    Args:
        document_id (UUID): Document identifier to retrieve

    Returns:
        DocumentResponse: Document details

    Raises:
        HTTPException:
            - 404: If document doesn't exist
            - 500: Database operation failure
    """
    try:
        # Fetch document record
        result = (
            database.table("documents").select("*").eq("id", str(document_id)).execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Document not found")

        doc = result.data[0]

        # Get course_id from association table
        course_result = (
            database.table("course_documents")
            .select("course_id")
            .eq("document_id", str(document_id))
            .execute()
        )

        if not course_result.data:
            raise HTTPException(
                status_code=404, detail="Document not associated with any course"
            )

        # Convert to DocumentResponse
        return DocumentResponse(
            id=UUID(doc["id"]),
            title=doc["title"],
            course_id=UUID(course_result.data[0]["course_id"]),
            document_type=DocumentType(doc["document_type"]),
            description=doc.get("description"),
            tags=doc.get("tags", []),
            file_size=doc.get("file_size"),
            other=doc.get("metadata", {}).get("other"),
            created_at=doc["created_at"],
            updated_at=doc.get("updated_at"),
            file_url=f"/api/documents/{doc['id']}/file",
        )

    except HTTPException:
        raise
    except Exception as e:
        logging.error("Failed to get document: %s", e)
        raise HTTPException(
            status_code=500, detail=f"Failed to get document: {str(e)}"
        ) from e


def get_signed_document_url(file_path: str) -> ViewDocumentResponse:
    """
    Generate a signed URL for the document at the given path.

    Args:
        file_path (str): Path to the document in file storage.

    Returns:
        ViewDocumentResponse: Signed URL.

    Raises:
        HTTPException:
            - 500: Database operation failure
    """
    try:
        result = file_storage.get_file_signed_url(file_path)

        signed_url = result.get("signedURL")
        encoded_url = urllib.parse.quote(signed_url, safe=":/?=&.")
        return ViewDocumentResponse(signed_url=encoded_url)

    except HTTPException:
        raise
    except Exception as e:
        logging.error("Failed to get signed url: %s", e)
        raise HTTPException(
            status_code=500, detail=f"Failed to get signed url: {str(e)}"
        ) from e
