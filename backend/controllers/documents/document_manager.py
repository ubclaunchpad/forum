"""Document management operations with logging."""

import logging
import time
from typing import Dict, Optional
from uuid import UUID

from core.processors.document_processor import DocumentProcessor
from core.util.file_storage import FileStorage
from models.all import Course, Document
from models.db import get_db
from models.schemas.document_schema import DocumentFileUpload

# Configure logging
logger = logging.getLogger(__name__)


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
    logger.info(
        "Starting document upload",
        extra={
            "title": create_document.title,
            "type": "application/pdf",
            "course_id": str(create_document.course_id),
        },
    )

    with get_db() as db:
        try:
            # Create document record
            document = Document(
                title=create_document.title,
                created_by=create_document.created_by,
                document_type="application/pdf",
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
            file_storage = FileStorage(bucket_name="course-files")
            path = file_storage.store_file(create_document.file, str(document_id))
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

            # Process document content
            process_start = time.time()
            with DocumentProcessor(db) as processor:
                processor.process_document(
                    document_id=document_id,
                    file_content=create_document.file,
                    strategy_type="pdf",
                )

            logger.info(
                "Document processing completed",
                extra={
                    "document_id": str(document_id),
                    "processing_time": f"{time.time() - process_start:.2f}s",
                    "total_time": f"{time.time() - start_time:.2f}s",
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


def get_documents(c_id: UUID) -> list[Document]:
    """Get all documents for a course."""
    logger.info("Fetching documents", extra={"course_id": str(c_id)})

    with get_db() as db:
        try:
            documents = (
                db.query(Document)
                .join(Document.courses)
                .filter(Course.id == c_id)
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


def get_signed_document_url(document_id: str) -> Dict[str, str]:
    """Get a signed URL for document access."""
    logger.info("Getting signed URL", extra={"document_id": document_id})

    with get_db() as db:
        try:
            document = db.query(Document).get(document_id)
            if not document:
                logger.error("Document not found", extra={"document_id": document_id})
                raise ValueError("Document not found")

            file_path = document.file_url
            file_storage = FileStorage(bucket_name="course-files")
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
