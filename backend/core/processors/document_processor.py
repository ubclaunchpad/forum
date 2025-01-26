"""Document Processor Module for content processing and embeddings"""

import logging
import os
import time
from typing import Dict, List
from uuid import UUID, uuid4

from core.parsers.document_parser import DocumentParser
from models.all import Chunk, Document
from openai import OpenAI
from sqlalchemy.orm import Session

from .embedding_processor import EmbeddingProcessor

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or ""

# Configure logging
logger = logging.getLogger(__name__)


class DocumentProcessor:
    """
    A class that processes document content into chunks and generates embeddings.
    Handles parsing, chunking, and embedding generation for documents.
    """

    def __init__(self, db: Session):
        """Initialize the DocumentProcessor."""
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.db = db
        self.document_parser = DocumentParser()
        self.embedding_processor = EmbeddingProcessor()

    def process_document(
        self, document_id: UUID, file_content: bytes, strategy_type: str
    ) -> None:
        """Process a document's content into chunks with embeddings."""
        start_time = time.time()
        logger.info(
            "Starting document processing",
            extra={"document_id": str(document_id), "strategy": strategy_type},
        )

        try:
            # Get document
            document = self.db.query(Document).get(document_id)
            if not document:
                logger.error(
                    "Document not found", extra={"document_id": str(document_id)}
                )
                raise ValueError(f"Document {document_id} not found")

            # Parse content
            parse_start = time.time()
            parsed_content = self.document_parser.parse(file_content, strategy_type)
            chunks_data = self.document_parser.extract_chunks(parsed_content)

            logger.info(
                "Document parsed",
                extra={
                    "document_id": str(document_id),
                    "parse_time": f"{time.time() - parse_start:.2f}s",
                    "chunks_count": len(chunks_data),
                },
            )

            # Process chunks
            chunks_start = time.time()
            chunks = self._process_chunks(document_id, chunks_data)

            logger.info(
                "Chunks processed",
                extra={
                    "document_id": str(document_id),
                    "chunks_time": f"{time.time() - chunks_start:.2f}s",
                    "chunks_created": len(chunks),
                },
            )

            # Update metadata
            document.doc_metadata = {
                **(document.doc_metadata or {}),
                **parsed_content.get("metadata", {}),
                "processed": True,
                "chunk_count": len(chunks),
                "processing_completed_at": "NOW()",
                "processing_time": f"{time.time() - start_time:.2f}s",
            }

            self.db.commit()
            logger.info(
                "Document processing completed",
                extra={
                    "document_id": str(document_id),
                    "total_time": f"{time.time() - start_time:.2f}s",
                    "total_chunks": len(chunks),
                },
            )

        except Exception as e:
            self.db.rollback()
            logger.error(
                "Error processing document",
                extra={
                    "document_id": str(document_id),
                    "error": str(e),
                    "strategy": strategy_type,
                },
                exc_info=True,
            )
            raise e

    def _process_chunks(
        self, document_id: UUID, chunks_data: List[Dict]
    ) -> List[Chunk]:
        """Process chunk data into database records with embeddings."""
        chunks = []

        for idx, chunk_data in enumerate(chunks_data):
            chunk_start = time.time()

            try:
                # Create chunk
                chunk = Chunk(
                    id=uuid4(),
                    document_id=document_id,
                    content=chunk_data["content"],
                    chunk_type=chunk_data["chunk_type"],
                    chunk_index=chunk_data["chunk_index"],
                    chunk_metadata=chunk_data["chunk_metadata"],
                    embedding=self.embedding_processor.generate_embedding(
                        chunk_data["content"]
                    ),
                )
                self.db.add(chunk)

                chunks.append(chunk)

                logger.debug(
                    "Chunk processed",
                    extra={
                        "document_id": str(document_id),
                        "chunk_index": idx,
                        "processing_time": f"{time.time() - chunk_start:.2f}s",
                    },
                )

            except Exception as e:
                logger.error(
                    "Error processing chunk",
                    extra={
                        "document_id": str(document_id),
                        "chunk_index": idx,
                        "error": str(e),
                    },
                    exc_info=True,
                )
                raise e

        return chunks

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.db.rollback()
            logger.error(
                "Error in processor context",
                extra={"error": str(exc_val)},
                exc_info=True,
            )
