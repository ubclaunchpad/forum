"""Document Processor Module"""

import os
from typing import Any, Dict
from uuid import UUID, uuid4

from core.parsers.document_parser import DocumentParser
from models.all import Chunk, ChunkRelation, Course, Document
from openai import OpenAI
from sqlalchemy.orm import Session

from .embedding_processor import EmbeddingProcessor

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or ""


class DocumentProcessor:
    """
    A class that processes documents through parsing, embedding generation, and database storage.

    Uses SQLAlchemy ORM for database operations and matches the existing model structure.
    """

    def __init__(self, db: Session):
        """
        Initialize the DocumentProcessor.

        Args:
            db (Session): SQLAlchemy database session
        """
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.db = db
        self.document_parser = DocumentParser()
        self.embedding_processor = EmbeddingProcessor()

    def _create_chunks(self, content: str, doc_id: UUID) -> list[Chunk]:
        """
        Create chunks from document content using sentence-based splitting.

        Args:
            content (str): The document content to be chunked
            doc_id (UUID): The document's ID these chunks belong to

        Returns:
            list[Chunk]: List of Chunk model instances
        """
        sentences = content.split(". ")  # Basic sentence splitting
        chunks: list[Chunk] = []
        prev_chunk: Chunk | None = None

        for idx, chunk_text in enumerate(sentences):
            if not chunk_text.strip():
                continue

            embedding = self.embedding_processor.generate_embedding(chunk_text)

            chunk = Chunk(
                id=uuid4(),
                document_id=doc_id,
                content=chunk_text,
                chunk_index=idx,
                chunk_type="text",
                embedding=embedding,
                chunk_metadata={
                    "section": "main",
                    "position": {"index": idx, "is_last": idx == len(sentences) - 1},
                },
            )

            # If there's a previous chunk, create sequential relationship
            if prev_chunk:
                chunk_relation = ChunkRelation(
                    id=uuid4(),
                    source_chunk_id=prev_chunk.id,
                    target_chunk_id=chunk.id,
                    relation_type="sequential",
                    properties={"order": idx},
                )
                self.db.add(chunk_relation)

            chunks.append(chunk)
            prev_chunk = chunk

        return chunks

    def process(self, document: Any, strategy_type: str) -> Dict:
        """
        Process a document using the specified parsing strategy and create chunks.

        Args:
            document (Any): The document content to process
            strategy_type (str): The type of parsing strategy to use

        Returns:
            Dict: Processed document information
        """
        parsed_document = self.document_parser.parse(document, strategy_type)
        temp_doc_id = uuid4()  # Temporary ID for chunk creation
        chunks = self._create_chunks(parsed_document["content"], temp_doc_id)

        return {
            "content": parsed_document["content"],
            "metadata": parsed_document["metadata"],
            "chunks": chunks,
        }

    def ingest_document(
        self,
        created_by: UUID,
        document: Any,
        title: str,
        strategy_type: str,
        course_id: UUID | None = None,
        metadata: Dict | None = None,
    ) -> UUID:
        """
        Ingest a document into the system, creating all necessary database records.

        Args:
            created_by (UUID): User ID of document creator
            document (Any): The document content to ingest
            title (str): The document's title
            strategy_type (str): The type of parsing strategy to use
            course_id (UUID, optional): Course ID if document belongs to a course
            metadata (Dict, optional): Additional document metadata

        Returns:
            UUID: The unique identifier of the created document

        Raises:
            Exception: If any step of the ingestion process fails
        """
        try:
            processed_document = self.process(document, strategy_type)

            # Create document record
            doc = Document(
                id=uuid4(),
                title=title,
                created_by=created_by,
                document_type=strategy_type,
                doc_metadata={
                    **(processed_document.get("metadata", {})),
                    **(metadata or {}),
                },
            )

            self.db.add(doc)
            self.db.flush()  # Flush to get the document ID

            # Update chunk document IDs and add to session
            for chunk in processed_document["chunks"]:
                chunk.document_id = doc.id
                self.db.add(chunk)

            # If course_id is provided, associate document with course
            if course_id:
                course = self.db.query(Course).get(course_id)
                if course:
                    course.documents.append(doc)

            self.db.commit()
            return doc.id

        except Exception as e:
            self.db.rollback()
            raise e

    def __enter__(self):
        """Enable context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Clean up when exiting context manager."""
        if exc_type is not None:
            self.db.rollback()
