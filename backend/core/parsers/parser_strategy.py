from typing import Any, Dict, List, Protocol


class ParsingStrategy(Protocol):
    """
    Protocol defining interface for document parsing strategies.

    All document parsers (PDF, Text, etc.) must implement these methods
    to ensure consistent processing across different document types.
    """

    def parse(self, file_content: bytes) -> Dict:
        """
        Parse the document content.

        Args:
            file_content: Raw file content in bytes

        Returns:
            Dict containing:
                - content: Complete text content
                - chunks: List of content chunks with metadata
                - metadata: Overall document metadata
        """
        raise NotImplementedError()

    def extract_chunks(self, parsed_content: Dict) -> List[Dict]:
        """
        Extract standardized chunks from parsed content.

        Args:
            parsed_content: Output from parse() method

        Returns:
            List of chunk dictionaries containing:
                - content: Chunk text content
                - chunk_type: Type of chunk (text, code, etc.)
                - chunk_index: Position in sequence
                - chunk_metadata: Additional chunk information
                - parent_id: ID of parent chunk if hierarchical
        """
        raise NotImplementedError()

    def _clean_content(self, content: str) -> str:
        """
        Clean and normalize text content.

        Args:
            content: Raw text content

        Returns:
            Cleaned and normalized text
        """
        raise NotImplementedError()
