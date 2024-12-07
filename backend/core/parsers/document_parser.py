"""Module for parsing documents using different strategies."""

from typing import Dict, List
from .parser_strategy import ParsingStrategy
from .pdf_parser import PDFParser
from .text_parser import TextParser


class DocumentParser:
    """Context class that manages parsing strategies."""

    def __init__(self):
        """Initialize parser with available strategies."""
        self._strategies = {
            "text": TextParser(),
            "pdf": PDFParser(),
            # Add more strategies as needed
        }
        self._current_strategy = None

    def parse(self, content: bytes, strategy_type: str) -> Dict:
        """
        Parse content using specified strategy.

        Args:
            content: Document content in bytes
            strategy_type: Type of parsing strategy to use

        Returns:
            Dict containing parsed content and metadata

        Raises:
            ValueError: If strategy_type is not supported
        """
        if strategy_type not in self._strategies:
            raise ValueError(f"Unknown parsing strategy: {strategy_type}")

        self._current_strategy = self._strategies[strategy_type]
        return self._current_strategy.parse(content)

    def register_strategy(self, name: str, strategy: ParsingStrategy) -> None:
        """
        Register a new parsing strategy.

        Args:
            name: Strategy identifier
            strategy: ParsingStrategy implementation
        """
        self._strategies[name] = strategy

    def extract_chunks(self, parsed_content: Dict) -> List[Dict]:
        """
        Extract chunks using the current strategy.

        Args:
            parsed_content: Output from parse() method

        Returns:
            List of chunk dictionaries

        Raises:
            RuntimeError: If no strategy has been selected yet
        """
        if not self._current_strategy:
            raise RuntimeError("No parsing strategy selected. Call parse() first.")

        return self._current_strategy.extract_chunks(parsed_content)
