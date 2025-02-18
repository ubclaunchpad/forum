"""Module for document querying using RAG (Retrieval Augmented Generation)."""

import json
import logging
import os
import time
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional, Union
from uuid import UUID

from controllers.documents import document_manager
from core.processors.embedding_processor import EmbeddingProcessor
from models.all import Document, Embedding
from openai import OpenAI
from openai.types.chat import ChatCompletion
from openai.types.chat.chat_completion_system_message_param import (
    ChatCompletionSystemMessageParam,
)
from openai.types.chat.chat_completion_user_message_param import (
    ChatCompletionUserMessageParam,
)
from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or ""
TEMPLATE_DIR = Path(__file__).parent.parent / "templates"


class DocumentQueryEngine:
    def __init__(
        self,
        db: Session,
        model: str = "gpt-4o-mini",
        embedding_model: str = "text-embedding-3-small",
        max_chunks: int = 5,
        template_dir: Optional[Path] = None,
    ):
        self.db = db
        self.model = model
        self.embedding_model = embedding_model
        self.max_chunks = max_chunks
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.embedding_processor = EmbeddingProcessor()
        self.template_dir = template_dir or TEMPLATE_DIR
        self.templates = self._load_all_templates()

    def _load_all_templates(self) -> Dict[str, str]:
        """Load all template files from the template directory."""
        if not self.template_dir.exists():
            raise FileNotFoundError(
                f"Template directory not found: {self.template_dir}"
            )

        templates = {}
        for template_file in self.template_dir.glob("*.txt"):
            with open(template_file, "r", encoding="utf-8") as f:
                templates[template_file.name] = f.read()

        if "default.txt" not in templates:
            raise FileNotFoundError("Required default.txt template not found")
        return templates

    def _find_relevant_document_chunks(
        self,
        question_embedding: List[float],
        threshold: float = 0.0,
        course_id: Optional[UUID] = None,
    ) -> List[Dict[str, Any]]:
        """Find relevant document chunks using vector similarity."""
        try:
            vector_literal = f"'[{','.join(map(str, question_embedding))}]'"

            query_str = f"""
                SELECT 
                    e.id,
                    e.chunk_metadata as metadata,
                    d.title as document_title,
                    (1 - (e.embedding <=> {vector_literal}::vector))  as similarity,
                    d.id as document_id,
                    d.file_url as document_url,
                    e.entity_type
                FROM public.embeddings e
                JOIN public.documents d ON e.entity_id = d.id
                JOIN public.course_documents cd ON d.id = cd.document_id
                WHERE (1 - (e.embedding <=> {vector_literal}::vector))  > :threshold
                AND e.embedding IS NOT NULL
                AND e.entity_type = 'document'
            """

            if course_id:
                query_str += " AND cd.course_id = :course_id"

            query_str += """
                ORDER BY similarity DESC
                LIMIT 10
            """

            query = text(query_str)
            params = {
                "threshold": threshold,
                "limit": self.max_chunks,
            }
            if course_id:
                params["course_id"] = str(course_id)

            logger.debug(f"Executing query with params: {params}")
            result = self.db.execute(statement=query, params=params)
            chunks = result.fetchall()
            logger.debug(f"Found {len(chunks)} relevant chunks")
            # Get document IDs for signed URL lookup
            doc_ids = [str(chunk.document_id) for chunk in chunks if chunk is not None]
            signed_url_map = {}
            if doc_ids and course_id:
                signed_url_map = document_manager.get_signed_document_urls(
                    course_id=course_id, document_ids=doc_ids
                )

            return [
                {
                    "id": str(chunk.id),
                    "type": "document",
                    "metadata": chunk.metadata or {},
                    "document_title": chunk.document_title or "Unknown Document",
                    "document_id": str(chunk.document_id),
                    "signed_url": signed_url_map.get(str(chunk.document_id), ""),
                    "similarity": float(chunk.similarity)
                    if chunk.similarity is not None
                    else 0.0,
                    "entity_type": chunk.entity_type,
                }
                for chunk in chunks
                if chunk is not None
            ]

        except Exception as e:
            logger.error("Error finding relevant chunks", exc_info=True)
            raise e

    def _find_relevant_post_chunks(
        self,
        question_embedding: List[float],
        threshold: float = 0.0,
        course_id: Optional[UUID] = None,
    ) -> List[Dict[str, Any]]:
        """Find relevant posts using vector similarity."""
        try:
            vector_literal = f"'[{','.join(map(str, question_embedding))}]'"

            query_str = f"""
                SELECT 
                    p.id,
                    p.title,
                    p.course_id,
                    e.entity_type,
                    (1 - (e.embedding <=> {vector_literal}::vector)) as similarity
                FROM public.posts p
                JOIN public.embeddings e ON e.entity_id = CAST(p.id::text AS uuid)
                WHERE (1 - (e.embedding <=> {vector_literal}::vector)) > :threshold
                AND e.embedding IS NOT NULL
                AND e.entity_type = 'post'
            """

            if course_id:
                query_str += " AND p.course_id = :course_id"

            query_str += """
                ORDER BY similarity DESC
                LIMIT 10
            """

            query = text(query_str)
            params = {
                "threshold": threshold,
                "limit": self.max_chunks,
            }
            if course_id:
                params["course_id"] = str(course_id)

            logger.debug(f"Executing post query with params: {params}")
            result = self.db.execute(statement=query, params=params)
            posts = result.fetchall()
            logger.debug(f"Found {len(posts)} relevant posts")

            return [
                {
                    "id": str(post.id),
                    "type": "post",
                    "title": post.title or "Untitled Post",
                    "course_id": str(post.course_id) if post.course_id else None,
                    "similarity": float(post.similarity),
                }
                for post in posts
                if post is not None
            ]

        except Exception as e:
            logger.error("Error finding relevant posts", exc_info=True)
            raise e

    def _find_all_relevant_chunks(
        self,
        question_embedding: List[float],
        threshold: float = 0.0,
        course_id: Optional[UUID] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Find all relevant chunks (both documents and posts) using a single query with CTE."""
        try:
            vector_literal = f"'[{','.join(map(str, question_embedding))}]'"

            query_str = f"""
                WITH ranked_embeddings AS (
                    SELECT 
                        e.id as embedding_id,
                        e.entity_id,
                        e.entity_type,
                        e.chunk_metadata,
                        (1 - (e.embedding <=> {vector_literal}::vector)) as similarity
                    FROM public.embeddings e
                    WHERE (1 - (e.embedding <=> {vector_literal}::vector)) > :threshold
                    AND e.embedding IS NOT NULL
                    ORDER BY similarity DESC
                    LIMIT :initial_limit
                ),
                document_chunks AS (
                    SELECT 
                        re.embedding_id,
                        re.entity_id,
                        re.entity_type,
                        re.chunk_metadata,
                        re.similarity,
                        d.title as document_title,
                        d.file_url as document_url,
                        d.id as document_id
                    FROM ranked_embeddings re
                    JOIN public.documents d ON re.entity_id = d.id
                    JOIN public.course_documents cd ON d.id = cd.document_id
                    WHERE re.entity_type = 'document'
                    {f"AND cd.course_id = :course_id" if course_id else ""}
                    ORDER BY re.similarity DESC
                    LIMIT :chunk_limit
                ),
                post_chunks AS (
                    SELECT 
                        re.embedding_id,
                        re.entity_id,
                        re.entity_type,
                        re.chunk_metadata,
                        re.similarity,
                        p.title as post_title,
                        p.course_id
                    FROM ranked_embeddings re
                    JOIN public.posts p ON re.entity_id = CAST(p.id::text AS uuid)
                    WHERE re.entity_type = 'post'
                    {f"AND p.course_id = :course_id" if course_id else ""}
                    ORDER BY re.similarity DESC
                    LIMIT :chunk_limit
                )
                SELECT 
                    json_build_object(
                        'documents', COALESCE(
                            (SELECT json_agg(
                                json_build_object(
                                    'embedding_id', dc.embedding_id,
                                    'entity_id', dc.entity_id,
                                    'entity_type', dc.entity_type,
                                    'chunk_metadata', dc.chunk_metadata,
                                    'similarity', dc.similarity,
                                    'document_title', dc.document_title,
                                    'document_url', dc.document_url,
                                    'document_id', dc.document_id
                                )
                            )
                            FROM document_chunks dc), '[]'::json
                        ),
                        'posts', COALESCE(
                            (SELECT json_agg(
                                json_build_object(
                                    'embedding_id', pc.embedding_id,
                                    'entity_id', pc.entity_id,
                                    'entity_type', pc.entity_type,
                                    'chunk_metadata', pc.chunk_metadata,
                                    'similarity', pc.similarity,
                                    'post_title', pc.post_title,
                                    'course_id', pc.course_id
                                )
                            )
                            FROM post_chunks pc), '[]'::json
                        )
                    ) as results
            """

            query = text(query_str)
            params = {
                "threshold": threshold,
                "initial_limit": limit
                * 4,  # Get more initial matches to ensure we have enough after filtering
                "chunk_limit": limit,  # Limit per type (documents/posts)
            }
            if course_id:
                params["course_id"] = str(course_id)

            logger.debug(f"Executing combined query with params: {params}")
            result = self.db.execute(statement=query, params=params)
            row = result.fetchone()
            results = row.results if row else {"documents": [], "posts": []}

            # Combine and sort all chunks by similarity
            all_chunks = []

            # Process document chunks
            for doc in results["documents"]:
                all_chunks.append(
                    {
                        "id": str(doc["embedding_id"]),
                        "type": "document",
                        "metadata": doc["chunk_metadata"] or {},
                        "document_title": doc["document_title"] or "Unknown Document",
                        "document_id": str(doc["document_id"]),
                        "signed_url": "",  # Will be populated below
                        "similarity": float(doc["similarity"]),
                        "entity_type": doc["entity_type"],
                    }
                )

            # Process post chunks
            for post in results["posts"]:
                all_chunks.append(
                    {
                        "id": str(post["entity_id"]),
                        "type": "post",
                        "title": post["post_title"] or "Untitled Post",
                        "course_id": str(post["course_id"])
                        if post["course_id"]
                        else None,
                        "similarity": float(post["similarity"]),
                        "entity_type": post["entity_type"],
                    }
                )

            # Sort all chunks by similarity
            all_chunks.sort(key=lambda x: x["similarity"], reverse=True)
            all_chunks = all_chunks[:limit]  # Apply final limit

            # Get signed URLs for documents
            doc_chunks = [chunk for chunk in all_chunks if chunk["type"] == "document"]
            doc_ids = [chunk["document_id"] for chunk in doc_chunks]
            signed_url_map = {}
            if doc_ids and course_id:
                signed_url_map = document_manager.get_signed_document_urls(
                    course_id=course_id, document_ids=doc_ids
                )

            # Update document chunks with signed URLs
            for chunk in all_chunks:
                if chunk["type"] == "document":
                    chunk["signed_url"] = signed_url_map.get(chunk["document_id"], "")

            return all_chunks

        except Exception as e:
            logger.error("Error finding relevant chunks", exc_info=True)
            raise e

    def _process_openai_response(self, response: ChatCompletion) -> str:
        """Safely process OpenAI response."""
        if not response or not response.choices or not response.choices[0].message:
            raise ValueError("Invalid response structure from OpenAI")
        return response.choices[0].message.content or ""

    def _format_sources(self, contexts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Safely format source information."""
        formatted_sources = []

        for ctx in contexts:
            try:
                base_source = {
                    "similarity": float(self._safe_get(ctx, "similarity", 0.0)),
                }

                # Ensure similarity is in valid range
                if (
                    not 0 <= base_source["similarity"] <= 1.5
                ):  # Updated max range to account for post weight
                    base_source["similarity"] = 0.0

                if ctx.get("type") == "document":
                    source = {
                        **base_source,
                        "fe_type": "pdf",  # Frontend type
                        "type": "document",
                        "title": self._safe_get(
                            ctx, "document_title", "Unknown Document"
                        ),
                        "id": self._safe_get(ctx, "document_id", ""),
                        "url": self._safe_get(ctx, "signed_url", ""),
                        "metadata": self._safe_get(ctx, "metadata", {}),
                    }
                else:  # post
                    course_id = self._safe_get(ctx, "course_id", "")
                    post_id = self._safe_get(ctx, "id", "")
                    source = {
                        **base_source,
                        "fe_type": "post",  # Frontend type
                        "type": "post",
                        "title": self._safe_get(ctx, "title", "Untitled Post"),
                        "id": post_id,
                        "url": f"courses/{course_id}/posts/{post_id}"
                        if course_id and post_id
                        else "",
                    }

                formatted_sources.append(source)

            except Exception as e:
                logger.error(f"Error formatting source: {e}", exc_info=True)
                continue

        formatted_sources.sort(key=lambda x: x["similarity"], reverse=True)
        return formatted_sources[:10]  # Limit to top 10 sources

    def _safe_get(self, d: Dict[str, Any], key: str, default: Any) -> Any:
        """Safely get a value from a dictionary."""
        try:
            value = d.get(key, default)
            return value if value is not None else default
        except Exception:
            return default

    def _format_response(
        self, answer: str, contexts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Format the final response with sources."""
        try:
            if not answer:
                logger.warning("Empty answer received")
                return {
                    "answer": "I apologize, but I couldn't generate a proper response.",
                    "sources": [],
                }

            return {"answer": answer.strip(), "sources": self._format_sources(contexts)}

        except Exception as e:
            logger.error(f"Error formatting response: {e}", exc_info=True)
            return {
                "answer": "An error occurred while formatting the response.",
                "sources": [],
            }

    def _build_prompt(
        self,
        question: str,
        contexts: List[Dict[str, Any]],
        template_name: Optional[str] = None,
    ) -> str:
        """Build the answer with context and question."""
        context_str = "\n\n".join(
            f"[Source: {'Document: ' + ctx['document_title'] if ctx.get('type') == 'document' else 'Post: ' + ctx.get('title', 'Untitled Post')}, "
            f"Relevance: {ctx['similarity']:.2f}]\n{ctx['content']}"
            for ctx in contexts
            if ctx.get("content")
        )

        template_name = template_name or "default.txt"
        template = self.templates.get(template_name)
        if not template:
            raise KeyError(f"Template not found: {template_name}")

        return template.format(context=context_str, question=question)

    def query(
        self,
        question: str,
        course_id: Optional[UUID] = None,
        template_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Process a query through the RAG pipeline."""
        try:
            question_embedding = self.embedding_processor.generate_embedding(question)
            all_contexts = self._find_all_relevant_chunks(
                question_embedding,
                threshold=0.40,
                course_id=course_id,
                limit=self.max_chunks,
            )

            if not all_contexts:
                return {
                    "answer": "I couldn't find any relevant information to answer your question.",
                    "sources": [],
                }

            prompt = self._build_prompt(question, all_contexts, template_name)
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a helpful expert who provides accurate but concise information with source citations.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.7,
                )

                answer = self._process_openai_response(response)
                return self._format_response(answer, all_contexts)

            except Exception as e:
                logger.error(f"OpenAI API error: {e}", exc_info=True)
                return {
                    "answer": "I apologize, but I encountered an error while generating the response.",
                    "sources": [],
                }

        except Exception as e:
            logger.error(f"Query processing error: {e}", exc_info=True)
            return {
                "answer": "An error occurred while processing your question.",
                "sources": [],
            }

    def verify_database(self) -> Dict[str, Any]:
        """Verify database content and embedding availability."""
        try:
            doc_count = self.db.query(Document).count()
            embedding_count = self.db.query(Embedding).count()
            sample_embedding = (
                self.db.query(Embedding).filter(Embedding.embedding.isnot(None)).first()
            )

            return {
                "document_count": doc_count,
                "embedding_count": embedding_count,
                "has_embeddings": sample_embedding is not None,
                "sample_embedding_id": str(sample_embedding.id)
                if sample_embedding
                else None,
            }
        except Exception as e:
            logger.error(f"Database verification error: {e}", exc_info=True)
            raise e

    async def stream_query(
        self,
        question: str,
        course_id: Optional[UUID] = None,
        history: Optional[
            List[
                Union[ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam]
            ]
        ] = None,
        template_name: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Process a query through the RAG pipeline with streaming response."""
        start_time = time.time()

        try:
            if history is None:
                history = []

            # Initial checkpoint
            yield json.dumps(
                {
                    "checkpoint": {
                        "label": "Starting search",
                        "expanded": "Processing your question and preparing to search through documents and posts",
                    },
                    "done": False,
                }
            )

            question_embedding = self.embedding_processor.generate_embedding(question)

            # Before search checkpoint
            yield json.dumps(
                {
                    "checkpoint": {
                        "label": "Searching through documents and posts",
                        "expanded": "Looking for relevant information in course materials",
                    },
                    "done": False,
                }
            )

            chunk_time = time.time()
            all_contexts = self._find_all_relevant_chunks(
                question_embedding,
                threshold=0.35,
                course_id=course_id,
                limit=self.max_chunks,
            )

            # After search checkpoint with results summary
            doc_count = len([c for c in all_contexts if c["type"] == "document"])
            post_count = len([c for c in all_contexts if c["type"] == "post"])
            yield json.dumps(
                {
                    "checkpoint": {
                        "label": "Found relevant content",
                        "expanded": f"Found {doc_count} relevant documents and {post_count} relevant posts",
                    },
                    "done": False,
                }
            )

            logger.debug(
                f"Finding relevant chunks took: {time.time() - chunk_time:.2f}s"
            )

            if not all_contexts:
                yield json.dumps(
                    {
                        "answer": "I could not find much relevant information to answer your question.",
                        "sources": [],
                        "done": True,
                    }
                )
                return

            prompt = self._build_prompt(question, all_contexts, template_name)
            sources = self._format_sources(all_contexts)

            try:
                # Before AI response checkpoint
                yield json.dumps(
                    {
                        "checkpoint": {
                            "label": "Analyzing information",
                            "expanded": "Processing found information to answer your question",
                        },
                        "answer": "",
                        "sources": [],
                        "done": False,
                    }
                )

                messages = []
                if history:
                    messages.extend(history)  # type: ignore
                messages.append(
                    ChatCompletionUserMessageParam(role="user", content=prompt)
                )  # type: ignore

                stream_time = time.time()
                logger.debug(
                    f"time to get to streaming: {time.time() - start_time:.2f}s"
                )

                stream = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7,
                    stream=True,
                )

                # Initialize buffers for batching
                current_answer = ""
                buffer = ""
                BATCH_SIZE = 100  # Adjust this value based on your needs

                # Start answer checkpoint
                yield json.dumps(
                    {
                        "checkpoint": {
                            "label": "Generating response",
                            "expanded": "Creating a detailed answer based on the found information",
                        },
                        "answer": "",
                        "done": False,
                    }
                )

                for chunk in stream:
                    if chunk.choices[0].delta.content is not None:
                        buffer += chunk.choices[0].delta.content
                        # Only yield when buffer reaches batch size
                        if len(buffer) >= BATCH_SIZE:
                            current_answer += buffer
                            yield json.dumps({"answer": current_answer, "done": False})
                            buffer = ""  # Reset buffer after yielding

                if buffer:
                    current_answer += buffer
                    yield json.dumps({"answer": current_answer, "done": False})

                logger.debug(f"Streaming took: {time.time() - stream_time:.2f}s")
                logger.debug(f"Total query time: {time.time() - start_time:.2f}s")

                # Final checkpoint with sources
                yield json.dumps(
                    {
                        "checkpoint": {
                            "label": "Completed",
                            "expanded": "Answer generated with relevant sources",
                        },
                        "answer": current_answer,
                        "sources": sources,
                        "done": True,
                    }
                )

            except Exception as e:
                logger.error(f"OpenAI API error: {e}", exc_info=True)
                yield json.dumps(
                    {
                        "checkpoint": {
                            "label": "Error",
                            "expanded": "An error occurred while generating the response",
                        },
                        "answer": "I apologize, but I encountered an error while generating the response.",
                        "sources": sources,
                        "done": True,
                    }
                )

        except Exception as e:
            logger.error(f"Query processing error: {e}", exc_info=True)
            print(e)
            yield json.dumps(
                {
                    "checkpoint": {
                        "label": "Error",
                        "expanded": "An error occurred while processing your question",
                    },
                    "answer": "An error occurred while processing your question.",
                    "sources": [],
                    "done": True,
                }
            )
