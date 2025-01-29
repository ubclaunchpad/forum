from typing import List, Dict
import re
from models.all import Post
import tiktoken

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
        sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
        return [s.strip() for s in sentences if s.strip()]

    def _create_chunks_from_text(self, text: str, chunk_type: str, start_index: int, metadata: Dict) -> List[Dict]:
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
                subparts = re.split(r'[,;:](?=\s)', sentence)
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
                            if current_part_tokens + word_tokens > self.MAX_TOKENS_PER_CHUNK:
                                # Create chunk from current part
                                chunks.append({
                                    "content": " ".join(current_part),
                                    "chunk_type": chunk_type,
                                    "chunk_index": start_index + len(chunks),
                                    "chunk_metadata": {**metadata, "is_partial": True}
                                })
                                current_part = [word]
                                current_part_tokens = word_tokens
                            else:
                                current_part.append(word)
                                current_part_tokens += word_tokens
                        
                        if current_part:
                            chunks.append({
                                "content": " ".join(current_part),
                                "chunk_type": chunk_type,
                                "chunk_index": start_index + len(chunks),
                                "chunk_metadata": {**metadata, "is_partial": True}
                            })
                    else:
                        current_chunk.append(part)
                        current_token_count += part_tokens
            
            # Normal case: add sentence to current chunk or create new chunk
            elif current_token_count + sentence_tokens > self.MAX_TOKENS_PER_CHUNK:
                # Create chunk from current sentences
                if current_chunk:
                    chunks.append({
                        "content": " ".join(current_chunk),
                        "chunk_type": chunk_type,
                        "chunk_index": start_index + len(chunks),
                        "chunk_metadata": metadata
                    })
                current_chunk = [sentence]
                current_token_count = sentence_tokens
            else:
                current_chunk.append(sentence)
                current_token_count += sentence_tokens

        # Add remaining sentences as final chunk
        if current_chunk:
            chunks.append({
                "content": " ".join(current_chunk),
                "chunk_type": chunk_type,
                "chunk_index": start_index + len(chunks),
                "chunk_metadata": metadata
            })

        return chunks

    def _create_chunks(self, post: Post) -> List[Dict]:
        """Create smart chunks from post content."""
        chunks = []
        base_metadata = {
            "title": post.title,
            "local_id": post.local_id,
            "course_id": str(post.course_id)
        }

        # Create title chunk separately
        title_chunk = {
            "content": f"Title: {post.title}",
            "chunk_type": "title",
            "chunk_index": 0,
            "chunk_metadata": {**base_metadata, "is_title": True}
        }
        chunks.append(title_chunk)

        # Create content chunks
        if post.content:
            content_chunks = self._create_chunks_from_text(
                post.content,
                "content",
                len(chunks),  # Start index after title chunk
                {**base_metadata, "is_title": False}
            )
            chunks.extend(content_chunks)

        return chunks