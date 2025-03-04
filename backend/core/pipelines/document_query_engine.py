"""Module for document querying using RAG (Retrieval Augmented Generation)."""

from __future__ import print_function
import json
import logging
import os
import time
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional, Union
from uuid import UUID
from functools import lru_cache

from controllers import course_controller
from datetime import datetime


from controllers.documents import document_manager
from core.processors.embedding_processor import EmbeddingProcessor
from models.all import Document, Embedding, Profile
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

from models.db import get_db

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
                    "similarity": (
                        float(chunk.similarity) if chunk.similarity is not None else 0.0
                    ),
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
                        e.content,
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
                        re.content,
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
                        re.content,
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
                                    'document_id', dc.document_id,
                                    'content', dc.content
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
                                    'course_id', pc.course_id,
                                    'content', pc.content
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
                        "content": doc["content"],
                    }
                )

            # Process post chunks
            for post in results["posts"]:
                all_chunks.append(
                    {
                        "id": str(post["entity_id"]),
                        "type": "post",
                        "title": post["post_title"] or "Untitled Post",
                        "course_id": (
                            str(post["course_id"]) if post["course_id"] else None
                        ),
                        "similarity": float(post["similarity"]),
                        "entity_type": post["entity_type"],
                        "content": post["content"],
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
                        "content": self._safe_get(ctx, "content", ""),
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
                        "url": (
                            f"courses/{course_id}/posts/{post_id}"
                            if course_id and post_id
                            else ""
                        ),
                        "content": self._safe_get(ctx, "content", ""),
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
        c_id: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> str:
        """Build the answer with context and question."""
        context_str = "\n\n".join(
            f"[Source: {'Document: ' + ctx['document_title'] if ctx.get('type') == 'document' else 'Post: ' + ctx.get('title', 'Untitled Post')}, "
            f"Relevance: {ctx['similarity']:.2f}]\n{ctx['content']}"
            for ctx in contexts
            if ctx.get("content")
        )

        # Add additional context information if course_id and user_id are provided
        additional_context = ""
        if c_id and user_id:
            additional_context = self._add_context_info(
                "",  # Empty question since we don't want to append it
                c_id,
                user_id,
                includes=[
                    "all_members",
                    "external",
                ],  # Add contexts not used in embedding
            ).replace(
                "End of extra information. The question asked was: \n", ""
            )  # Remove the question part

        template_name = template_name or "default.txt"
        template = self.templates.get(template_name)
        if not template:
            raise KeyError(f"Template not found: {template_name}")

        # Combine both contexts
        full_context = (
            f"{context_str}\n\nAdditional Context:\n{additional_context}"
            if additional_context
            else context_str
        )
        return template.format(context=full_context, question=question)

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
                "sample_embedding_id": (
                    str(sample_embedding.id) if sample_embedding else None
                ),
            }
        except Exception as e:
            logger.error(f"Database verification error: {e}", exc_info=True)
            raise e

    def _format_time(self, seconds: float) -> str:
        """Format time in a human-readable way (ms or s)."""
        if seconds < 1:
            return f"{int(seconds * 1000)}ms"
        return f"{seconds:.1f}s"

    async def stream_query(
        self,
        question: str,
        course_id: UUID,
        user_id: UUID,
        history: Optional[
            List[
                Union[ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam]
            ]
        ] = None,
        template_name: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Process a query through the RAG pipeline with streaming response."""
        start_time = time.time()
        last_checkpoint_time = start_time

        def get_timing_info() -> str:
            current_time = time.time()
            checkpoint_duration = current_time - last_checkpoint_time
            total_duration = current_time - start_time
            return f"({self._format_time(checkpoint_duration)} / {self._format_time(total_duration)})"

        try:
            if history is None:
                history = []

            # Initial checkpoint
            yield json.dumps(
                {
                    "checkpoint": {
                        "label": f"Starting search {get_timing_info()}",
                        "expanded": "Processing your question and preparing to search through documents and posts",
                    },
                    "done": False,
                }
            )
            last_checkpoint_time = time.time()

            history = history[-10:] if history else []

            # Build combined text from history and current question
            combined_text = question
            if history:
                last_response = (
                    history[-1].get("content", "")
                    if history[-1].get("role") == "assistant"
                    else ""
                )
                combined_text = f"{last_response} {question}"

            yield json.dumps(
                {
                    "checkpoint": {
                        "label": f"Checking the course and member directory {get_timing_info()}",
                        "expanded": "Checking the course and member directory for more insights",
                    },
                    "done": False,
                }
            )
            last_checkpoint_time = time.time()

            # Only include current user context for embedding search
            combined_text = self._add_context_info(
                question,
                str(course_id),
                str(user_id),
                includes=["current_user", "course"],
            )

            max_chunk_length = 6000
            if len(combined_text) > max_chunk_length:
                text_chunks = [
                    combined_text[i : i + max_chunk_length]
                    for i in range(0, len(combined_text), max_chunk_length)
                ]
                chunk_embeddings = [
                    self.embedding_processor.generate_embedding(chunk)
                    for chunk in text_chunks
                ]
                question_embedding = [
                    sum(x) / len(chunk_embeddings) for x in zip(*chunk_embeddings)
                ]
            else:
                question_embedding = self.embedding_processor.generate_embedding(
                    combined_text
                )

            yield json.dumps(
                {
                    "checkpoint": {
                        "label": f"Searching through documents and posts {get_timing_info()}",
                        "expanded": "Looking for relevant information in course materials",
                    },
                    "done": False,
                }
            )
            last_checkpoint_time = time.time()

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
                        "label": f"Found relevant content {get_timing_info()}",
                        "expanded": f"Found {doc_count} relevant documents and {post_count} relevant posts",
                    },
                    "done": False,
                }
            )
            last_checkpoint_time = time.time()

            if not all_contexts:
                yield json.dumps(
                    {
                        "answer": "I could not find much relevant information to answer your question. Can you elaborate on your question?",
                        "sources": [],
                        "done": True,
                    }
                )
                return

            yield json.dumps(
                {
                    "checkpoint": {
                        "label": f"Analyzing information {get_timing_info()}",
                        "expanded": "Processing found information to answer your question",
                    },
                    "answer": "",
                    "sources": [],
                    "done": False,
                }
            )
            last_checkpoint_time = time.time()

            prompt = self._build_prompt(
                question,
                all_contexts,
                template_name,
                c_id=str(course_id),
                user_id=str(user_id),
            )
            sources = self._format_sources(all_contexts)

            try:
                messages = []
                if history:
                    messages.extend(history)
                    messages.append(
                        {
                            "role": "system",
                            "content": "Here are some relevant sources to help answer the question:\n\n"
                            + "\n\n".join(
                                [
                                    f"Source: {s['title']}\n{s['content']}"
                                    for s in sources
                                ]
                            ),
                        }
                    )
                messages.append(
                    ChatCompletionUserMessageParam(role="user", content=prompt)
                )

                yield json.dumps(
                    {
                        "checkpoint": {
                            "label": f"Generating response",
                            "expanded": "Creating a detailed answer based on the found information",
                        },
                        "answer": "",
                        "done": False,
                    }
                )
                last_checkpoint_time = time.time()

                stream = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7,
                    stream=True,
                )

                current_answer = ""
                buffer = ""
                BATCH_SIZE = 100

                for chunk in stream:
                    if chunk.choices[0].delta.content is not None:
                        buffer += chunk.choices[0].delta.content
                        if len(buffer) >= BATCH_SIZE:
                            current_answer += buffer
                            yield json.dumps({"answer": current_answer, "done": False})
                            buffer = ""

                if buffer:
                    current_answer += buffer
                    yield json.dumps({"answer": current_answer, "done": False})

                # Final checkpoint with sources
                yield json.dumps(
                    {
                        "checkpoint": {
                            "label": f"Completed",
                            "expanded": f"Answer generated with relevant sources {get_timing_info()}",
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
                            "label": f"Error {get_timing_info()}",
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
                        "label": f"Error {get_timing_info()}",
                        "expanded": "An error occurred while processing your question",
                    },
                    "answer": "An error occurred while processing your question.",
                    "sources": [],
                    "done": True,
                }
            )

    def _get_cache_key(self, *args, **kwargs) -> str:
        """Generate a cache key that includes a timestamp for TTL."""
        # Round down to the nearest hour for TTL
        hour_timestamp = int(time.time() / 3600)
        return f"{hour_timestamp}:{':'.join(str(arg) for arg in args)}:{':'.join(f'{k}={v}' for k, v in sorted(kwargs.items()))}"

    @lru_cache(maxsize=128)
    def _get_all_members_context_with_key(self, cache_key: str, c_id: str) -> str:
        """Cached version of _get_all_members_context."""
        return self._get_all_members_context_impl(c_id)

    def _get_all_members_context(self, c_id: str) -> str:
        """Get information about all course members with caching."""
        cache_key = self._get_cache_key(c_id)
        return self._get_all_members_context_with_key(cache_key, c_id)

    def _get_all_members_context_impl(self, c_id: str) -> str:
        """Implementation of getting all members context."""
        members = course_controller.get_course_members(c_id)
        memberInfo = []
        for member in members:
            memberInfo.append(
                ", ".join(
                    [
                        f"{key}: {value}"
                        for key, value in member.__dict__.items()
                        if not key.startswith("_") and key != "id"
                    ]
                )
            )

        return f"These are all the members in the course: {str(members)}\n"

    @lru_cache(maxsize=128)
    def _get_current_user_context_with_key(
        self, cache_key: str, c_id: str, user_id: str
    ) -> str:
        """Cached version of _get_current_user_context."""
        return self._get_current_user_context_impl(c_id, user_id)

    def _get_current_user_context(self, c_id: str, user_id: str) -> str:
        """Get information about current user with caching."""
        cache_key = self._get_cache_key(c_id, user_id)
        return self._get_current_user_context_with_key(cache_key, c_id, user_id)

    def _get_current_user_context_impl(self, c_id: str, user_id: str) -> str:
        """Implementation of getting current user context."""
        members = course_controller.get_course_members(c_id)
        current_user = None
        for member in members:
            if str(member.id) == user_id:
                current_user = member
                break

        current_user_info = (
            "I am: "
            + ", ".join(
                [
                    f"{key}: {value}"
                    for key, value in current_user.__dict__.items()
                    if not key.startswith("_")
                ]
            )
            if current_user
            else None
        )
        return f"Current User: {current_user_info if current_user_info else 'No current user is logged in - this is a guest query which means we do not know who you are'}\n"

    @lru_cache(maxsize=128)
    def _get_course_context_with_key(self, cache_key: str, c_id: str) -> str:
        """Cached version of _get_course_context."""
        return self._get_course_context_impl(c_id)

    def _get_course_context(self, c_id: str) -> str:
        """Get context information about the course with caching."""
        cache_key = self._get_cache_key(c_id)
        return self._get_course_context_with_key(cache_key, c_id)

    def _get_course_context_impl(self, c_id: str) -> str:
        """Implementation of getting course context."""
        course = course_controller.get_course(c_id, None)
        context_string = "This is a university course at UBC, university name: University of British Columbia\n"
        context_string += f"Course name: {course.name}\n"
        context_string += f"Course code: {course.code}\n"
        context_string += f"Course course group/department: {course.c_group}\n"
        context_string += f"Course section: {course.section}\n"
        return context_string

    def _get_external_context(self) -> str:
        """Get external context information like date."""
        return f"Date: {datetime.now().strftime('%B %d, %Y')}\n"

    def _add_context_info(
        self,
        question: str,
        c_id: str,
        user_id: str,
        includes: Optional[List[str]] = None,
    ) -> str:
        """
        Combine all context information with the question.

        Args:
            question: The user's question
            c_id: Course ID
            user_id: User ID
            includes: List of contexts to include. Options: ['course', 'current_user', 'all_members', 'external']
                     If None, includes all contexts except 'all_members'
        """
        if includes is None:
            includes = ["course", "current_user", "external"]

        context_string = (
            "Extra information gathered that might be relevant but good to know: \n"
        )

        if "course" in includes:
            context_string += self._get_course_context(c_id)

        if "current_user" in includes:
            context_string += self._get_current_user_context(c_id, user_id)

        if "all_members" in includes:
            context_string += self._get_all_members_context(c_id)

        if "external" in includes:
            context_string += self._get_external_context()

        context_string += (
            f"End of extra information. The question asked was: {question}\n"
        )
        return f"{context_string} {question}"
