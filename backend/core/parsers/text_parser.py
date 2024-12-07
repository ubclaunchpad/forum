"""TextParser class module."""

from typing import Dict
import re


class TextParser:
    """Strategy for parsing text documents."""

    def clean(self, content: str) -> str:
        return re.sub(r"\s+", " ", content).strip()

    def create_metadata(self, content: str) -> Dict:
        return {"length": len(content)}

    def process(self, content: str) -> Dict:
        return {
            "content": self.clean(content),
            "metadata": self.create_metadata(content),
        }

    def parse(self, content: str) -> Dict:
        return self.process(content)
