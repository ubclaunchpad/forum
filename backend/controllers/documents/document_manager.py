"""Document management operations with logging."""

import logging
from pydoc import doc
import time
import os
from turtle import st
from typing import Dict, Optional
from uuid import UUID

from core.processors.document_processor import DocumentProcessor
from core.util.file_storage import FileStorage
from global_constants import CONTENTTYPEMAP
from models.all import Course, Document, Embedding
from models.db import get_db
from models.schemas.document_schema import DocumentEmbeddingMetadata, DocumentFileUpload
from models.schemas.general_schema import GeneralResponse

from dotenv import load_dotenv
from supabase import create_client
url: str = os.getenv("SUPABASE_URL") or ""
key: str = os.getenv("SUPABASE_KEY") or ""

# Configure logging
logger = logging.getLogger(__name__)

supabase = create_client(url, key)

async def upload_new_document(create_document: DocumentFileUpload) -> UUID:
    """
    Upload and process a new document.

    Args:
        create_document: Document upload request data

    Returns:
        str: Document ID

    Raises:
        Exception: If upload or processing fails
    """
    start_time = time.time()

    validate_document_type(create_document)

    logger.info(
        "Starting document upload",
        extra={
            "title": create_document.title,
            "type": create_document.type,
            "course_id": str(create_document.course_id),
        },
    )

    with get_db() as db:
        try:
            # Create document record
            document = Document(
                title=create_document.title,
                created_by=create_document.created_by,
                document_type=create_document.type,
            )

            # Associate with course
            course = db.query(Course).get(create_document.course_id)
            if not course:
                logger.error(
                    "Course not found",
                    extra={"course_id": str(create_document.course_id)},
                )
                raise ValueError(f"Course {create_document.course_id} not found")

            course.documents.append(document)
            db.add(document)
            db.flush()

            document_id = UUID(str(document.id))
            logger.info(
                "Document record created", extra={"document_id": str(document_id)}
            )

            # Store file
            storage_start = time.time()
            file_storage = FileStorage(
                bucket_name=f"course-{str(create_document.course_id)}"
            )
            document_name = str(document.title)
            path = file_storage.store_file(create_document.file, document_name, str(document_id))
            document.file_url = path  # type: ignore
            db.commit()

            logger.info(
                "Document saved to storage",
                extra={
                    "document_id": str(document_id),
                    "storage_path": path,
                    "storage_time": f"{time.time() - storage_start:.2f}s",
                },
            )

            return document_id

        except Exception as e:
            logger.error(
                "Error in document upload",
                extra={
                    "error": str(e),
                    "document_title": create_document.title,
                    "course_id": str(create_document.course_id),
                },
                exc_info=True,
            )
            raise e


def validate_document_type(document: DocumentFileUpload) -> None:
    if document.extension not in CONTENTTYPEMAP.keys():
        logger.error(
            "File extension not supported",
            extra={"extension": str(document.extension)},
        )
        raise ValueError(f".{document.extension} extension not supported.")

    content_type = CONTENTTYPEMAP[str(document.extension)]

    if content_type != document.type:
        logger.error(
            "File extension doesn't match MIME type",
            extra={
                "type": str(document.type),
                "extension": str(document.extension),
            },
        )
        raise ValueError("Extension doesn't match MIME type.")

    if content_type == "application/pdf" and not valid_pdf_signature(document.file):
        logger.error(
            "Invalid PDF signature",
            extra={
                "type": str(document.type),
                "extension": str(document.extension),
            },
        )
        raise ValueError("Invalid PDF")


def valid_pdf_signature(file: bytes) -> bool:
    header = file[:4]  # check first four bytes for PDF signature
    return header == b"%PDF"


def get_documents(c_id: UUID) -> list[Document]:
    """Get all documents for a course."""
    logger.info("Fetching documents", extra={"course_id": str(c_id)})

    with get_db() as db:
        try:
            documents = (
                db.query(Document)
                .join(Document.courses)
                .filter(Course.id == c_id)
                .order_by(Document.created_at.desc())
                .all()
            )

            logger.info(
                "Documents retrieved",
                extra={"course_id": str(c_id), "count": len(documents)},
            )
            return documents

        except Exception as e:
            logger.error(
                "Error fetching documents",
                extra={"course_id": str(c_id), "error": str(e)},
                exc_info=True,
            )
            raise e


def delete_document(document_id: UUID) -> None:
    """Delete a document."""
    logger.info("Deleting document", extra={"document_id": str(document_id)})

    with get_db() as db:
        try:
            document = (
                db.query(Document)
                .join(Document.courses)
                .filter(Document.id == document_id)
                .first()
            )
            if not document:
                logger.error(
                    "Document not found", extra={"document_id": str(document_id)}
                )
                raise ValueError("Document not found")

            file_storage = FileStorage(
                bucket_name=f"course-{str(document.courses[0].id)}"
            )
            file_storage.delete_file(str(document.file_url))
            db.delete(document)
            db.commit()

            logger.info("Document deleted", extra={"document_id": str(document_id)})

        except Exception as e:
            logger.error(
                "Error deleting document",
                extra={"document_id": str(document_id), "error": str(e)},
                exc_info=True,
            )
            raise e


def get_signed_document_url(course_id: UUID, document_id: str) -> Dict[str, str]:
    """Get a signed URL for document access."""
    logger.info("Getting signed URL", extra={"document_id": document_id})

    with get_db() as db:
        try:
            document = db.query(Document).get(document_id)
            if not document:
                logger.error("Document not found", extra={"document_id": document_id})
                raise ValueError("Document not found")

            file_path = document.file_url
            file_storage = FileStorage(
                bucket_name=f"course-{str(course_id)}", create_bucket_if_not_found=False
            )
            url = file_storage.get_file_signed_url(file_path)

            logger.info("Signed URL generated", extra={"document_id": document_id})
            return url

        except Exception as e:
            logger.error(
                "Error getting signed URL",
                extra={"document_id": document_id, "error": str(e)},
                exc_info=True,
            )
            raise e


def get_signed_document_urls(
    course_id: UUID, document_ids: list[str]
) -> Dict[str, str]:
    """Get signed URLs for multiple documents.

    Args:
        course_id: Course ID
        document_ids: List of document IDs

    Returns:
        Dict mapping document IDs to signed URLs
    """
    logger.info("Getting signed URLs", extra={"document_ids": ", ".join(document_ids)})

    with get_db() as db:
        try:
            documents = db.query(Document).filter(Document.id.in_(document_ids)).all()
            if not documents:
                logger.error("No documents found", extra={"document_ids": document_ids})
                raise ValueError("No documents found")

            file_paths = [str(doc.file_url) for doc in documents]
            file_storage = FileStorage(
                bucket_name=f"course-{str(course_id)}", create_bucket_if_not_found=False
            )

            signed_urls = file_storage.get_file_signed_urls(file_paths)

            # Map document IDs to their signed URLs
            id_to_url = {}
            for doc, signed_url in zip(documents, signed_urls):
                id_to_url[str(doc.id)] = signed_url["signedURL"]

            logger.info("Signed URLs generated", extra={"count": len(id_to_url)})
            return id_to_url

        except Exception as e:
            logger.error(
                "Error getting signed URLs",
                extra={"document_ids": document_ids, "error": str(e)},
                exc_info=True,
            )
            raise e


async def update_embeddings(document_id: str, user_id: str) -> GeneralResponse:
    """Update embeddings for a document asynchronously."""
    logger.info("Starting async embedding update", extra={"document_id": document_id})

    try:
        # Use context manager for database session
        with get_db() as db:
            document = db.query(Document).get(document_id)
            if not document:
                logger.error("Document not found", extra={"document_id": document_id})
                raise ValueError("Document not found")

            # Get file content
            file_storage = FileStorage(
                bucket_name=f"course-{str(document.courses[0].id)}",
                create_bucket_if_not_found=False,
            )
            file_content = file_storage.get_with_download(str(document.file_url))

            if not file_content:
                logger.error(
                    "File content not found", extra={"document_id": document_id}
                )
                raise ValueError("File content not found")

            # Process document content in background
            with DocumentProcessor(db) as processor:             
                strategy_type = document.document_type.split("/")[-1] # assuming document_type = "application/pdf", then returns "pdf"
                
                processor.process_document(
                    document_id=UUID(document_id),
                    file_content=file_content,
                    strategy_type=strategy_type,
                )
                
                print("\n\nthere\n\n")

            logger.info(
                "Document embeddings updated successfully",
                extra={"document_id": str(document_id)},
            )

    except Exception as e:
        logger.error(
            "Error updating embeddings",
            extra={"document_id": str(document_id), "error": str(e)},
            exc_info=True,
        )

    return GeneralResponse(msg="Embedding update started")


def get_embedding_metadata(document_id: str, user_id: str) -> DocumentEmbeddingMetadata:
    """Get metadata about a document's embeddings."""
    logger.info("Getting embedding metadata", extra={"document_id": document_id})

    with get_db() as db:
        try:
            document = db.query(Document).get(document_id)
            if not document:
                logger.error("Document not found", extra={"document_id": document_id})
                raise ValueError("Document not found")

            # Get the embeddings for this document
            embeddings = (
                db.query(Embedding)
                .filter(
                    Embedding.entity_type == "document",
                    Embedding.entity_id == document.id,
                )
                .order_by(Embedding.created_at.desc())
                .all()
            )

            if not embeddings:
                return DocumentEmbeddingMetadata()

            updated_at = getattr(embeddings[0], "created_at")

            return DocumentEmbeddingMetadata(
                last_updated=updated_at,
                chunk_count=len(embeddings),
                has_embeddings=True,
            )

        except Exception as e:
            logger.error(
                "Error getting embedding metadata",
                extra={"document_id": str(document_id), "error": str(e)},
                exc_info=True,
            )
            raise e
