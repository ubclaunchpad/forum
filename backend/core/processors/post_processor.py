import logging
import re
import time
from typing import Dict, List
from uuid import UUID

import tiktoken
from core.processors.embedding_processor import EmbeddingProcessor
from models.all import Embedding, Post
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class PostProcessor:
    # Add this as a class constant
    MAX_TOKENS_PER_CHUNK = 1000  # Conservative limit for embedding models
    ENCODING = tiktoken.get_encoding("cl100k_base")  # OpenAI's recommended encoding

    def _count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string."""
        return len(self.ENCODING.encode(text))

    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences using regex."""
        # Match sentence endings (.!?) followed by spaces and capital letters
        sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z])", text)
        return [s.strip() for s in sentences if s.strip()]

    def _create_chunks_from_text(
        self, text: str, chunk_type: str, start_index: int, metadata: Dict
    ) -> List[Dict]:
        """Create appropriately sized chunks from text."""
        chunks = []
        current_chunk = []
        current_token_count = 0
        sentences = self._split_into_sentences(text)

        for sentence in sentences:
            sentence_tokens = self._count_tokens(sentence)

            # If single sentence exceeds token limit, split it into smaller pieces
            if sentence_tokens > self.MAX_TOKENS_PER_CHUNK:
                # Split by punctuation first
                subparts = re.split(r"[,;:](?=\s)", sentence)
                for part in subparts:
                    part = part.strip()
                    part_tokens = self._count_tokens(part)

                    # If still too long, split into fixed lengths
                    if part_tokens > self.MAX_TOKENS_PER_CHUNK:
                        words = part.split()
                        current_part = []
                        current_part_tokens = 0

                        for word in words:
                            word_tokens = self._count_tokens(word)
                            if (
                                current_part_tokens + word_tokens
                                > self.MAX_TOKENS_PER_CHUNK
                            ):
                                # Create chunk from current part
                                chunks.append(
                                    {
                                        "content": " ".join(current_part),
                                        "chunk_type": chunk_type,
                                        "chunk_index": start_index + len(chunks),
                                        "chunk_metadata": {
                                            **metadata,
                                            "is_partial": True,
                                        },
                                    }
                                )
                                current_part = [word]
                                current_part_tokens = word_tokens
                            else:
                                current_part.append(word)
                                current_part_tokens += word_tokens

                        if current_part:
                            chunks.append(
                                {
                                    "content": " ".join(current_part),
                                    "chunk_type": chunk_type,
                                    "chunk_index": start_index + len(chunks),
                                    "chunk_metadata": {**metadata, "is_partial": True},
                                }
                            )
                    else:
                        current_chunk.append(part)
                        current_token_count += part_tokens

            # Normal case: add sentence to current chunk or create new chunk
            elif current_token_count + sentence_tokens > self.MAX_TOKENS_PER_CHUNK:
                # Create chunk from current sentences
                if current_chunk:
                    chunks.append(
                        {
                            "content": " ".join(current_chunk),
                            "chunk_type": chunk_type,
                            "chunk_index": start_index + len(chunks),
                            "chunk_metadata": metadata,
                        }
                    )
                current_chunk = [sentence]
                current_token_count = sentence_tokens
            else:
                current_chunk.append(sentence)
                current_token_count += sentence_tokens

        # Add remaining sentences as final chunk
        if current_chunk:
            chunks.append(
                {
                    "content": " ".join(current_chunk),
                    "chunk_type": chunk_type,
                    "chunk_index": start_index + len(chunks),
                    "chunk_metadata": metadata,
                }
            )

        return chunks

    def _create_chunks(self, post: Post) -> List[Dict]:
        """Create smart chunks from post content."""
        chunks = []
        base_metadata = {
            "title": post.title,
            "local_id": post.local_id,
            "course_id": str(post.course_id),
        }

        # Create title chunk separately - using 'text' type instead of 'title'
        title_chunk = {
            "content": f"Title: {post.title}",
            "chunk_type": "text",  # Changed from 'title' to 'text'
            "chunk_index": 0,
            "chunk_metadata": {**base_metadata, "is_title": True},
        }
        chunks.append(title_chunk)

        # Create content chunks
        if post.content:
            content_chunks = self._create_chunks_from_text(
                post.content,
                "text",  # Explicitly using 'text' type
                len(chunks),  # Start index after title chunk
                {**base_metadata, "is_title": False},
            )
            chunks.extend(content_chunks)

        return chunks

    def __init__(self, db: Session):
        """Initialize the PostProcessor."""
        self.db = db
        self.embedding_processor = EmbeddingProcessor()

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        if exc_type is not None:
            # If there was an error, rollback
            self.db.rollback()
            logger.error(
                "Error in processor context",
                extra={"error": str(exc_val)},
                exc_info=True,
            )
            return False  # Re-raise the exception
        return True

    def process_post(self, post_id: UUID) -> None:
        """Process a post's content and generate embeddings.

        Args:
            post_id: UUID of the post to process

        Raises:
            ValueError: If post not found
            Exception: For other processing errors
        """
        start_time = time.time()
        logger.info("Starting post processing", extra={"post_id": str(post_id)})

        try:
            # Get post
            post = self.db.query(Post).get(post_id)
            if not post:
                logger.error("Post not found", extra={"post_id": str(post_id)})
                raise ValueError(f"Post {post_id} not found")

            # Delete existing embeddings if any
            self.db.query(Embedding).filter(
                Embedding.entity_type == "post", Embedding.entity_id == post_id
            ).delete()

            # Create chunks from post content
            chunks_start = time.time()
            chunks_data = self._create_chunks(post)

            logger.info(
                "Chunks created",
                extra={
                    "post_id": str(post_id),
                    "chunks_time": f"{time.time() - chunks_start:.2f}s",
                    "chunks_count": len(chunks_data),
                },
            )

            # Process each chunk and create embeddings
            embedding_start = time.time()
            for chunk_data in chunks_data:
                embedding = Embedding(
                    entity_type="post",
                    entity_id=post_id,
                    content=chunk_data["content"],
                    chunk_type=chunk_data["chunk_type"],
                    chunk_index=chunk_data["chunk_index"],
                    chunk_metadata=chunk_data["chunk_metadata"],
                    embedding=self.embedding_processor.generate_embedding(
                        chunk_data["content"]
                    ),
                )
                self.db.add(embedding)

            # Commit the changes
            self.db.commit()

            logger.info(
                "Post processing completed",
                extra={
                    "post_id": str(post_id),
                    "total_time": f"{time.time() - start_time:.2f}s",
                    "total_chunks": len(chunks_data),
                    "embedding_time": f"{time.time() - embedding_start:.2f}s",
                },
            )

        except Exception as e:
            self.db.rollback()
            logger.error(
                "Error processing post",
                extra={
                    "post_id": str(post_id),
                    "error": str(e),
                },
                exc_info=True,
            )
            raise e
