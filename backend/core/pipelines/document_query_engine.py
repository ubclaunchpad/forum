"""Module for document querying using RAG (Retrieval Augmented Generation)."""

import json
import logging
import os
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional, Union
from uuid import UUID

from controllers.documents import document_manager
from core.processors.embedding_processor import EmbeddingProcessor
from models.all import Document, Embedding
from openai import OpenAI
from openai.types.chat import ChatCompletion
from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or ""
TEMPLATE_DIR = Path(__file__).parent.parent / "templates"


class DocumentQueryEngine:
    def __init__(
        self,
        db: Session,
        model: str = "gpt-4",
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

    def _find_relevant_chunks(
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
                    e.content,
                    e.chunk_metadata as metadata,
                    d.title as document_title,
                    (1 - (e.embedding <=> {vector_literal}::vector)) * 0.8 as similarity,
                    d.id as document_id,
                    d.file_url as document_url
                FROM public.embeddings e
                JOIN public.documents d ON e.entity_id = d.id
                JOIN public.course_documents cd ON d.id = cd.document_id
                WHERE (1 - (e.embedding <=> {vector_literal}::vector)) * 0.8 > :threshold
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

            return [
                {
                    "id": str(chunk.id),
                    "type": "document",
                    "content": chunk.content or "",
                    "metadata": chunk.metadata or {},
                    "document_title": chunk.document_title or "Unknown Document",
                    "document_id": str(chunk.document_id),
                    "signed_url": document_manager.get_signed_document_url(
                        course_id=str(course_id), document_id=str(chunk.document_id)
                    )["signedURL"],
                    "similarity": float(chunk.similarity)
                    if chunk.similarity is not None
                    else 0.0,
                }
                for chunk in chunks
                if chunk is not None
            ]

        except Exception as e:
            logger.error("Error finding relevant chunks", exc_info=True)
            raise e

    def _find_post_relevant_posts(
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
                    e.content,
                    p.course_id,
                    (1 - (e.embedding <=> {vector_literal}::vector)) * 1.5 as similarity
                FROM public.posts p
                JOIN public.embeddings e ON e.entity_id = p.id
                WHERE (1 - (e.embedding <=> {vector_literal}::vector)) * 1.5 > :threshold
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
                    "content": post.content or "",
                    "course_id": str(post.course_id) if post.course_id else None,
                    "similarity": float(post.similarity)
                    if post.similarity is not None
                    else 0.0,
                }
                for post in posts
                if post is not None
            ]

        except Exception as e:
            logger.error("Error finding relevant posts", exc_info=True)
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
                    "content": self._safe_get(ctx, "content", "No content available"),
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
                    "sources": self._format_sources(contexts) if contexts else [],
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
        """Build the prompt with context and question."""
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
            relevant_chunks = self._find_relevant_chunks(
                question_embedding, threshold=0.0, course_id=course_id
            )
            relevant_posts = self._find_post_relevant_posts(
                question_embedding, threshold=0.0, course_id=course_id
            )

            if not relevant_chunks and not relevant_posts:
                return {
                    "answer": "I couldn't find any relevant information to answer your question.",
                    "sources": [],
                }

            all_contexts = relevant_chunks + relevant_posts
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
                    "sources": self._format_sources(all_contexts),
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
                "sample_embedding_id": str(sample_embedding.id) if sample_embedding else None,
            }
        except Exception as e:
            logger.error(f"Database verification error: {e}", exc_info=True)
            raise e

    async def stream_query(
        self,
        question: str,
        course_id: Optional[UUID] = None,
        template_name: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Process a query through the RAG pipeline with streaming response."""
        try:
            question_embedding = self.embedding_processor.generate_embedding(question)
            relevant_chunks = self._find_relevant_chunks(
                question_embedding, threshold=0.0, course_id=course_id
            )
            relevant_posts = self._find_post_relevant_posts(
                question_embedding, threshold=0.0, course_id=course_id
            )

            all_contexts = relevant_chunks + relevant_posts

            if not all_contexts:
                yield json.dumps(
                    {
                        "answer": "I couldn't find any relevant information to answer your question.",
                        "sources": [],
                        "done": True,
                    }
                )
                return

            prompt = self._build_prompt(question, all_contexts, template_name)

            sources = None
            try:
                # Initialize sources first
                sources = self._format_sources(all_contexts)
                yield json.dumps({"answer": "", "sources": sources, "done": False})

                # Stream the response
                stream = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a helpful expert who provides accurate but concise information with source citations.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.7,
                    stream=True,
                )

                current_answer = ""
                for chunk in stream:
                    if chunk.choices[0].delta.content is not None:
                        content = chunk.choices[0].delta.content
                        current_answer += content
                        yield json.dumps({"answer": current_answer, "done": False})

                # Send final chunk
                yield json.dumps(
                    {
                        "done": True
                        # No need to send sources again
                    }
                )

            except Exception as e:
                logger.error(f"OpenAI API error: {e}", exc_info=True)
                yield json.dumps(
                    {
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
                    "answer": "An error occurred while processing your question.",
                    "sources": [],
                    "done": True,
                }
            )
