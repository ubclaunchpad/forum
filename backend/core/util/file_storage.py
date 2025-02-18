"""Module for file storage using Supabase."""

import mimetypes
import os
from datetime import datetime as dt
from enum import Enum
from logging import getLogger
from typing import List, Optional

# import magic
from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile
from supabase import Client, create_client

url: str = os.getenv("SUPABASE_URL") or ""
key: str = os.getenv("SUPABASE_KEY") or ""


class StorageError(Exception):
    """Base exception for storage operations."""

    pass


class FileNotFoundError(StorageError):
    """Raised when a file is not found in storage."""

    pass


class FileExistsError(StorageError):
    """Raised when a file already exists and cannot be overwritten."""

    pass


class ConflictResolution(Enum):
    """Conflict resolution strategies for file storage."""

    APPEND_TIMESTAMP = "append_timestamp"
    OVERWRITE = "overwrite"
    RAISE_ERROR = "raise_error"
    IGNORE = "ignore"


class FileStorage:
    MAX_SIZE_MB = 15
    PUBLIC_BUCKETS = ["profiles"]

    def __init__(
        self,
        bucket_name: str,
        supa_client: Optional[Client] = None,
        conflict_resolution: ConflictResolution = ConflictResolution.APPEND_TIMESTAMP,
        create_bucket_if_not_found=True,
    ):
        if not bucket_name:
            raise ValueError("Bucket name cannot be empty")

        self.supabase = supa_client if supa_client else create_client(url, key)
        self.bucket_name = bucket_name

        if not self._bucket_exists() and create_bucket_if_not_found:
            self._create_bucket()

        self.conflict_resolution = conflict_resolution

    def _get_content_type(self, filename: str) -> str:
        content_type, _ = mimetypes.guess_type(filename)
        return content_type or "application/octet-stream"

    def _file_exists(self, storage, filename: str) -> bool:
        try:
            files = storage.list()
            return any(f["name"] == f"documents/{filename}" for f in files)
        except Exception as e:
            return False

    def _handle_filename_conflict(self, storage, filename: str) -> str:
        base_name, extension = os.path.splitext(filename)
        timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
        return f"{base_name}_{timestamp}{extension}"

    def _bucket_exists(self) -> bool:
        try:
            buckets = self.supabase.storage.list_buckets()
            if self.bucket_name in [bucket.name for bucket in buckets]:
                return True
            return False
        except Exception as e:
            return False

    def _create_bucket(self) -> None:
        try:
            if self.bucket_name in self.PUBLIC_BUCKETS:
                self.supabase.storage.create_bucket(
                    self.bucket_name, self.bucket_name, options={"public": True}
                )
            else:
                self.supabase.storage.create_bucket(self.bucket_name, self.bucket_name)

        except Exception as e:
            raise e

    def _can_upload_file(self, file_content: bytes) -> None:
        file_content_MB = len(file_content) / (2**20)
        if file_content_MB > self.MAX_SIZE_MB:
            raise ValueError(
                f"Filesize {file_content_MB}MB exceeds maximum limit of {self.MAX_SIZE_MB}MB"
            )

    def store_file(self, file_content: bytes, filename: str) -> str:
        self._can_upload_file(file_content)

        content_type = self._get_content_type(filename)

        try:
            storage = self.supabase.storage.from_(self.bucket_name)

            if self.conflict_resolution == ConflictResolution.APPEND_TIMESTAMP:
                filename = self._handle_filename_conflict(storage, filename)
            elif self.conflict_resolution == ConflictResolution.RAISE_ERROR:
                if self._file_exists(storage, filename):
                    raise FileExistsError(f"File {filename} already exists")
            elif self.conflict_resolution == ConflictResolution.IGNORE:
                if self._file_exists(storage, filename):
                    return f"documents/{filename}"

            file_path = f"documents/{filename}"
            print(file_path)
            response = storage.upload(
                file=file_content,  # Pass bytes directly
                path=file_path,
                file_options={"content-type": content_type},
            )
            return response.path  # type: ignore

        # except FileExistsError as e:
        #     # logger.error(f"File exists error: {e}")
        #     raise HTTPException(status_code=409, detail=str(e))
        except Exception as e:
            # logger.error(f"Error storing file: {e}")
            # raise HTTPException(
            #     status_code=500, detail=f"Failed to store file: {str(e)}"
            # )
            raise e

    def retrieve_file(self, file_path: str) -> Optional[bytes]:
        storage = self.supabase.storage.from_(self.bucket_name)

        try:
            content = storage.download(file_path)
            if not content:
                raise FileNotFoundError(f"File not found: {file_path}")
            return content

        except FileNotFoundError as e:
            # logger.error(f"File not found: {e}")
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            # logger.error(f"Error retrieving file: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve file")


    def get_with_download(self, file_path: str) -> Optional[bytes]:
        storage = self.supabase.storage.from_(self.bucket_name)
        content = storage.download(file_path)
        if not content:
            return None
        return content

    def delete_file(self, file_path: str) -> bool:
        storage = self.supabase.storage.from_(self.bucket_name)

        try:
            storage.remove([file_path])
            # logger.info(f"Successfully deleted file: {file_path}")
            return True

        except Exception as e:
            # logger.error(f"Error deleting file: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete file")

    def list_files(self, prefix: Optional[str] = None) -> List[dict]:
        storage = self.supabase.storage.from_(self.bucket_name)

        try:
            files = storage.list(prefix) if prefix else storage.list()
            return files

        except Exception as e:
            # logger.error(f"Error listing files: {e}")
            raise HTTPException(status_code=500, detail="Failed to list files")

    def format_public_file_url(self, file_path: str) -> str:
        return f"{url}/storage/v1/object/public/{self.bucket_name}/{file_path}"

    def get_file_signed_url(self, file_path: str) -> dict[str, str]:
        try:
            signed_url = self.supabase.storage.from_(
                self.bucket_name
            ).create_signed_url(file_path, 3600)
            if not signed_url:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate signed URL for file: {file_path}",
                )
            return signed_url

        except Exception as e:
            # Catch and log any unexpected errors
            # logger.error(f"Unexpected error generating signed URL for {file_path}: {e}")
            raise HTTPException(
                status_code=500, detail=f"Could not generate signed URL: {e}"
            )

    def get_file_signed_urls(self, file_paths: List[str]) -> List[dict[str, str]]:
        try:
            signed_urls = self.supabase.storage.from_(
                self.bucket_name
            ).create_signed_urls(file_paths, 3600)
            if not signed_urls:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to generate signed URLs for files",
                )
            return signed_urls

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Could not generate signed URLs: {e}"
            )

    def delete_bucket(self):
        if self.bucket_name in self.PUBLIC_BUCKETS:
            raise ValueError("Cannot delete global buckets")
        self.supabase.storage.empty_bucket(self.bucket_name)
        self.supabase.storage.delete_bucket(self.bucket_name)


# async def get_file_type(file: UploadFile, file_content: bytes) -> str:
#     """Detect file type using both mime type and magic numbers."""
#     # Get mime type from file extension
#     mime_type, _ = mimetypes.guess_type(file.filename)  # type: ignore

#     # Get mime type from file content using python-magic
#     content_type = magic.from_buffer(file_content, mime=True)

#     # Prefer content-based detection over extension-based
#     detected_type = content_type or mime_type or file.content_type

#     if not detected_type:
#         raise HTTPException(status_code=400, detail="Could not determine file type")

#     return detected_type
