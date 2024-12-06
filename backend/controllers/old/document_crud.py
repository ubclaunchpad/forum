# import logging
# import urllib.parse
# from typing import Any, Dict, List
# from uuid import UUID, uuid4

# from core.util.file_storage import FileStorage
# from fastapi import HTTPException, UploadFile

# # Import the models from your API
# from models.old.documents import (
#     DocumentMetadata,
#     DocumentResponse,
#     DocumentType,
#     ViewDocumentResponse,
# )
# from pydantic import BaseModel

# file_storage = FileStorage(bucket_name="course-files")


# class DocumentCreate(BaseModel):
#     """Internal model for document creation"""

#     title: str
#     metadata: DocumentMetadata
#     course_id: UUID


# def get_signed_document_url(file_path: str) -> ViewDocumentResponse:
#     """
#     Generate a signed URL for the document at the given path.

#     Args:
#         file_path (str): Path to the document in file storage.

#     Returns:
#         ViewDocumentResponse: Signed URL.

#     Raises:
#         HTTPException:
#             - 500: Database operation failure
#     """
#     try:
#         result = file_storage.get_file_signed_url(file_path)

#         signed_url = result.get("signedURL")
#         encoded_url = urllib.parse.quote(signed_url, safe=":/?=&.")
#         return ViewDocumentResponse(signed_url=encoded_url)

#     except HTTPException:
#         raise
#     except Exception as e:
#         logging.error("Failed to get signed url: %s", e)
#         raise HTTPException(
#             status_code=500, detail=f"Failed to get signed url: {str(e)}"
#         ) from e
