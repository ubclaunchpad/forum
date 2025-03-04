"""Module for PDF parsing with OCR and embeddings."""

import io
import logging
from typing import Dict, List, Optional

import fitz  # PyMuPDF
import pytesseract
from PIL import Image

from .parser_strategy import ParsingStrategy

# Configure logging
logger = logging.getLogger(__name__)


class PDFParser(ParsingStrategy):
    """Strategy for parsing PDF content with OCR support."""

    def _extract_image_text(self, image_bytes: bytes) -> str:
        """Extract text from image using OCR."""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            return pytesseract.image_to_string(image)
        except Exception as e:
            logger.error(f"OCR Error: {e}", exc_info=True)
            return ""

    def _process_page(self, page: fitz.Page, page_num: int) -> Optional[Dict]:
        """
        Process a single PDF page.

        Args:
            page: PDF page object
            page_num: Page number

        Returns:
            Dict with page content and metadata, or None if processing fails
        """
        try:
            # Extract text content
            text_content = page.get_text()

            # Extract images and perform OCR
            image_content = []
            for img_index, img in enumerate(page.get_images()):
                xref = img[0]
                base_image = page.parent.extract_image(xref)
                if base_image:
                    image_text = self._extract_image_text(base_image["image"])
                    if image_text.strip():
                        image_content.append(image_text)

            # Combine text and image content
            combined_content = text_content + "\n" + "\n".join(image_content)
            combined_content = self._clean_content(combined_content)

            if not combined_content.strip():
                logger.debug(f"Empty page {page_num}, skipping")
                return None

            return {
                "content": combined_content,
                "metadata": {
                    "page_number": page_num + 1,
                    "has_images": bool(image_content),
                    "image_content": (
                        "\n".join(image_content) if image_content else None
                    ),
                },
            }

        except Exception as e:
            logger.error(f"Error processing page {page_num}: {e}", exc_info=True)
            return None

    def _clean_content(self, content: str) -> str:
        """Clean extracted text content."""
        if not content:
            return ""
        # Remove extra whitespace and normalize line endings
        return " ".join(content.split())

    def parse(self, file_content: bytes) -> Dict:
        """
        Parse PDF document.

        Args:
            file_content: PDF file content in bytes

        Returns:
            Dict containing:
                - content: Complete text content
                - chunks: List of page contents
                - metadata: Document metadata
        """
        logger.info("Starting PDF parsing")

        # Use BytesIO to read PDF from bytes
        pdf_stream = io.BytesIO(file_content)
        doc = fitz.open(stream=pdf_stream, filetype="pdf")

        try:
            pages = []
            full_content = []

            for page_num, page in enumerate(doc):
                logger.debug(f"Processing page {page_num + 1}")
                page_data = self._process_page(page, page_num)

                if page_data:  # Only include non-empty pages
                    pages.append(page_data)
                    full_content.append(page_data["content"])

            metadata = {
                "total_pages": len(pages),
                "has_ocr_content": any(p["metadata"]["has_images"] for p in pages),
                "pages": [p["metadata"] for p in pages],
            }

            result = {
                "content": "\n\n".join(full_content),
                "chunks": pages,
                "metadata": metadata,
            }

            logger.info(f"PDF parsing completed. Found {len(pages)} non-empty pages")
            return result

        except Exception as e:
            logger.error("Error parsing PDF", exc_info=True)
            raise e

        finally:
            doc.close()

    def extract_chunks(self, content: Dict) -> List[Dict]:
        """
        Extract chunks from parsed content.

        Args:
            content: Parsed document content from parse() method

        Returns:
            List of chunk dictionaries ready for database insertion
        """
        chunks = []

        for idx, page in enumerate(content["chunks"]):
            if not page or "content" not in page:
                logger.warning(f"Skipping invalid chunk at index {idx}")
                continue

            chunk_metadata = {
                "type": "page",
                "index": idx,
                "page_number": page["metadata"]["page_number"],
                "has_images": page["metadata"]["has_images"],
                "is_last": idx == len(content["chunks"]) - 1,
            }

            chunks.append(
                {
                    "content": page["content"],
                    "chunk_type": "text",
                    "chunk_index": idx,
                    "chunk_metadata": chunk_metadata,
                    "parent_id": None,  # Pages are top-level chunks
                }
            )

        logger.info(f"Extracted {len(chunks)} chunks from content")
        return chunks
