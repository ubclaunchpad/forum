"""Document Processor Module"""

import os
import uuid
from typing import Dict
from openai import OpenAI
import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import Json
from core.parsers.document_parser import DocumentParser
from .embedding_processor import EmbeddingProcessor

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
DATABASE_URL = os.environ.get("DATABASE_URL")

class DocumentProcessor:
    """
    A class that processes documents through parsing, embedding generation, and database storage.
    
    This processor handles the complete document ingestion pipeline including:
    - Document parsing using different strategies
    - Chunk creation and embedding generation
    - Version management
    - Database storage of documents, versions, chunks, and their relationships
    
    Attributes:
        client (OpenAI): OpenAI client for embedding generation
        conn (psycopg2.extensions.connection): PostgreSQL database connection
        cur (psycopg2.extensions.cursor): Database cursor
        document_parser (DocumentParser): Parser for different document types
        embedding_processor (EmbeddingProcessor): Processor for generating embeddings
    """
    
    def __init__(self):
        """Initialize the DocumentProcessor with necessary connections and dependencies."""
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.conn = psycopg2.connect(DATABASE_URL)
        self.cur = self.conn.cursor()
        self.document_parser = DocumentParser()
        self.embedding_processor = EmbeddingProcessor()

    def _create_chunks(self, content: str) -> list[Dict]:
        """
        Create chunks from document content using sentence-based splitting.
        
        Args:
            content (str): The document content to be chunked
            
        Returns:
            list[Dict]: List of chunk dictionaries containing:
                - id: Unique identifier for the chunk
                - content: The chunk text
                - embedding: Vector embedding of the chunk
                - metadata: Position and section information
                - prev_chunk_id: ID of the previous chunk for sequential linking
        """
        sentences = content.split('. ')  # Basic sentence splitting
        chunks = []
        prev_chunk_id = None
        
        for idx, chunk_text in enumerate(sentences):
            if not chunk_text.strip():
                continue
                
            chunk_id = str(uuid.uuid4())
            embedding = self.embedding_processor.generate_embedding(chunk_text)
            
            chunk = {
                "id": chunk_id,
                "content": chunk_text,
                "embedding": embedding,
                "metadata": {
                    "section": "main",
                    "position": {
                        "index": idx,
                        "is_last": idx == len(sentences) - 1
                    }
                },
                "prev_chunk_id": prev_chunk_id
            }
            
            chunks.append(chunk)
            prev_chunk_id = chunk_id
            
        return chunks

    def _create_document_version(self, doc_id: str, content: str, version_number: int = 1) -> str:
        """
        Create a new version record for a document.
        
        Args:
            doc_id (str): The document's unique identifier
            content (str): The document content for this version
            version_number (int, optional): Version number, defaults to 1
            
        Returns:
            str: The unique identifier of the created version
        """
        version_id = str(uuid.uuid4())
        
        self.cur.execute("""
            INSERT INTO document_versions (id, document_id, version_number, content_hash, changes_summary)
            VALUES (%s, %s, %s, %s, %s)
            """, (version_id, doc_id, version_number, str(hash(content)), 
                 'Initial version' if version_number == 1 else f'Version {version_number}'))
        
        return version_id

    def process(self, document: any, strategy_type: str) -> Dict:
        """
        Process a document using the specified parsing strategy and create chunks.
        
        Args:
            document (any): The document content to process
            strategy_type (str): The type of parsing strategy to use
            
        Returns:
            Dict: Processed document containing:
                - content: Parsed document content
                - metadata: Document metadata
                - chunks: List of document chunks with embeddings
        """
        parsed_document = self.document_parser.parse(document, strategy_type)
        chunks = self._create_chunks(parsed_document['content'])
        
        return {
            "content": parsed_document['content'],
            "metadata": parsed_document['metadata'],
            "chunks": chunks
        }

    def ingest_document(self, default_props: Dict, document: any, title: str, strategy_type: str) -> str:
        """
        Ingest a document into the system, creating all necessary database records.
        
        Args:
            default_props (Dict): Default properties to include in document metadata
            document (any): The document content to ingest
            title (str): The document's title
            strategy_type (str): The type of parsing strategy to use
            
        Returns:
            str: The unique identifier of the created document
            
        Raises:
            Exception: If any step of the ingestion process fails
        """
        try:
            doc_id = str(uuid.uuid4())
            processed_document = self.process(document, strategy_type)
            
            # Create document record
            doc = {
                "title": title,
                "content": document,
                "type": strategy_type,
                "metadata": {
                    **processed_document.get('metadata', {}),
                    **default_props
                },
                "id": doc_id
            }
            
            self.cur.execute("""
                INSERT INTO documents (id, title, original_content, document_type, metadata)
                VALUES (%s, %s, %s, %s, %s)
                """, (doc_id, doc['title'], doc['content'], doc['type'], Json(doc['metadata'])))
            
            # Create initial version
            version_id = self._create_document_version(doc_id, doc['content'])
            
            # Insert chunks
            for chunk in processed_document['chunks']:
                self.cur.execute("""
                    INSERT INTO chunks (id, document_id, version_id, content, embedding, chunk_index, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, (
                        chunk['id'],
                        doc_id,
                        version_id,
                        chunk['content'],
                        chunk['embedding'],
                        chunk['metadata']['position']['index'],
                        Json(chunk['metadata'])
                    ))
                
                # Create chunk relations
                if chunk['prev_chunk_id']:
                    self.cur.execute("""
                        INSERT INTO chunk_relations (id, source_chunk_id, target_chunk_id, relation_type, metadata)
                        VALUES (%s, %s, %s, %s, %s)
                        """, (
                            str(uuid.uuid4()),
                            chunk['prev_chunk_id'],
                            chunk['id'],
                            'sequential',
                            Json({"order": chunk['metadata']['position']['index']})
                        ))
            
            self.conn.commit()
            return doc_id
            
        except Exception as e:
            self.conn.rollback()
            raise e

    def __enter__(self):
        """Enable context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Clean up database connections when exiting context manager.
        
        Ensures proper closure of database cursor and connection.
        """
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()