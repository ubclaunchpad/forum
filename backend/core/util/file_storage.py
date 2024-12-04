"""Module for file storage using Supabase."""

import mimetypes
import os
from datetime import datetime as dt
from enum import Enum
from logging import getLogger
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import HTTPException
from supabase import Client, create_client

# Load environment variables
load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# Set up logging
logger = getLogger(__name__)


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
    """
    Class for storing and retrieving files from Supabase storage.

    Attributes:
        bucket_name (str): Name of the storage bucket
        conflict_resolution (ConflictResolution): Strategy for handling file conflicts

    Methods:
        store_file: Stores a file in the bucket
        retrieve_file: Retrieves a file from the bucket
        delete_file: Deletes a file from the bucket
        list_files: Lists all files in the bucket
    """

    def __init__(
        self,
        bucket_name: str,
        supa_client: Optional[Client] = None,
        conflict_resolution: ConflictResolution = ConflictResolution.APPEND_TIMESTAMP,
    ):
        """
        Initialize the FileStorage instance.

        Args:
            bucket_name (str): Name of the storage bucket
            supa_client (Optional[Client]): Supabase client instance
            conflict_resolution (ConflictResolution): Strategy for handling file conflicts
        """
        if not bucket_name:
            raise ValueError("Bucket name cannot be empty")

        self.supabase = supa_client if supa_client else create_client(url, key)
        self.bucket_name = bucket_name
        self.conflict_resolution = conflict_resolution

    def _get_content_type(self, filename: str) -> str:
        """
        Determine content type based on file extension.

        Args:
            filename (str): Name of the file

        Returns:
            str: MIME type of the file
        """
        content_type, _ = mimetypes.guess_type(filename)
        return content_type or "application/octet-stream"

    def _file_exists(self, storage, filename: str) -> bool:
        """
        Check if a file exists in the bucket.

        Args:
            storage: Supabase storage instance
            filename (str): Name of the file to check

        Returns:
            bool: True if file exists, False otherwise
        """
        try:
            files = storage.list()
            return any(f["name"] == f"documents/{filename}" for f in files)
        except Exception as e:
            logger.error(f"Error checking file existence: {e}")
            return False

    def _handle_filename_conflict(self, storage, filename: str) -> str:
        """
        Handle filename conflicts based on the conflict resolution strategy.

        Args:
            storage: Supabase storage instance
            filename (str): Original filename

        Returns:
            str: Modified filename if needed
        """
        if not self._file_exists(storage, filename):
            return filename

        base_name, extension = os.path.splitext(filename)
        timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
        return f"{base_name}_{timestamp}{extension}"

    def store_file(self, file_content: bytes, filename: str) -> str:
        """
        Store file in Supabase storage.

        Args:
            file_content (bytes): File content as bytes
            filename (str): Name to give the stored file

        Returns:
            str: Path to the stored file

        Raises:
            HTTPException: If file storage fails
            FileExistsError: If file exists and RAISE_ERROR strategy is used
        """
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
            response = storage.upload(
                file=file_content,  # Pass bytes directly
                path=file_path,
                file_options={"content-type": content_type},
            )
            return response.path

        except FileExistsError as e:
            logger.error(f"File exists error: {e}")
            raise HTTPException(status_code=409, detail=str(e))
        except Exception as e:
            logger.error(f"Error storing file: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to store file: {str(e)}"
            )

    def retrieve_file(self, file_path: str) -> Optional[bytes]:
        """
        Get file from storage.

        Args:
            file_path (str): Path to the file in storage

        Returns:
            Optional[bytes]: File content if found, None otherwise

        Raises:
            HTTPException: If file retrieval fails
        """
        storage = self.supabase.storage.from_(self.bucket_name)

        try:
            content = storage.download(file_path)
            if not content:
                raise FileNotFoundError(f"File not found: {file_path}")
            return content

        except FileNotFoundError as e:
            logger.error(f"File not found: {e}")
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error(f"Error retrieving file: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve file")

    def delete_file(self, file_path: str) -> bool:
        """
        Delete file from storage.

        Args:
            file_path (str): Path to the file to delete

        Returns:
            bool: True if deletion successful, False otherwise

        Raises:
            HTTPException: If file deletion fails
        """
        storage = self.supabase.storage.from_(self.bucket_name)

        try:
            storage.remove([file_path])
            logger.info(f"Successfully deleted file: {file_path}")
            return True

        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete file")

    def list_files(self, prefix: Optional[str] = None) -> List[dict]:
        """
        List all files in the bucket.

        Args:
            prefix (Optional[str]): Filter files by prefix

        Returns:
            List[dict]: List of file information dictionaries

        Raises:
            HTTPException: If listing files fails
        """
        storage = self.supabase.storage.from_(self.bucket_name)

        try:
            files = storage.list(prefix) if prefix else storage.list()
            return files

        except Exception as e:
            logger.error(f"Error listing files: {e}")
            raise HTTPException(status_code=500, detail="Failed to list files")

    def format_file_url(self, file_path: str) -> str:
        """
        Format the file path into a URL for public access.

        Args:
            file_path (str): Path to the file in storage

        Returns:
            str: URL to access the file
        """
        return (
            f"{url}/storage/v1/object/public/{self.bucket_name}/documents/{file_path}"
        )

    def get_file_signed_url(self, file_path: str) -> str:
        """
        Generate a signed URL for a file in Supabase storage.

        This method creates a temporary, authenticated URL for accessing a specific file
        in the configured Supabase storage bucket. The URL is valid for a limited time.

        Args:
            file_path (str): The path to the file within the storage bucket.

        Returns:
            str: A signed URL that provides temporary access to the file.

        Raises:
            HTTPException if request fails
        """
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
            logger.error(f"Unexpected error generating signed URL for {file_path}: {e}")
            raise HTTPException(
                status_code=500, detail=f"Could not generate signed URL: {e}"
            )
