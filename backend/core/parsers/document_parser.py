"""Module for parsing documents using different strategies."""

import os
from typing import Dict

import psycopg2
from openai import OpenAI

from .parser_strategy import ParsingStrategy
from .text_parser import TextParser

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or ""
DATABASE_URL = os.getenv("DATABASE_URL") or ""


class DocumentParser:
    """Context class that manages parsing strategies."""

    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.conn = psycopg2.connect(DATABASE_URL)
        self.cur = self.conn.cursor()
        self._strategies = {
            "text": TextParser(),
            # Add more strategies as needed
        }

    def parse(self, content: any, strategy_type: str) -> Dict:
        """Parse content using specified strategy."""
        if strategy_type not in self._strategies:
            raise ValueError(f"Unknown parsing strategy: {strategy_type}")

        strategy = self._strategies[strategy_type]
        return strategy.parse(content)

    def register_strategy(self, name: str, strategy: ParsingStrategy) -> None:
        """Register a new parsing strategy."""
        self._strategies[name] = strategy

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()
