from typing import Any, Dict, Protocol


class ParsingStrategy(Protocol):
    """Protocol defining interface for parsing strategies."""

    def parse(self, content: Any) -> Dict:
        raise NotImplementedError()

    def create_metadata(self, content: Any) -> Dict:
        raise NotImplementedError()

    def clean(self, content: Any) -> Any:
        raise NotImplementedError()

    def process(self, content: Any) -> Dict:
        raise NotImplementedError()
