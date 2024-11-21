"""Module for file storage using Supabase."""
# NOTE: this is a POC and will be replaced with Malcolm's implementation

from datetime import datetime as dt
from typing import Optional, BinaryIO
import os
from enum import Enum

from supabase import Client, create_client
from dotenv import load_dotenv

load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")


class ConflictResolution(Enum):
    """Conflict resolution strategies for file storage."""
    APPEND_TIMESTAMP = 1
    OVERWRITE = 2
    RAISE_ERROR = 3
    IGNORE = 4
    DO_NOTHING = 5


class FileStorage:
    """Class for storing and retrieving files from Supabase storage."""

    def __init__(
        self,
        bucket_name: str,
        supa_client: Optional[Client] = None,
        conflict_resolution: ConflictResolution = ConflictResolution.APPEND_TIMESTAMP,
    ):
        self.supabase = supa_client if supa_client else create_client(url, key)
        self.bucket_name = bucket_name
        self.conflict_resolution = conflict_resolution
        
    # TODO: Update to use conflict resolution + file type, etc.    
    def store_file(self, file: BinaryIO, filename: str) -> str: 
        """
        Store file in Supabase storage and return URL.
        If file exists, append timestamp to filename.
        """
        storage = self.supabase.storage.from_(self.bucket_name)
        
        # Check if file exists
        try:
            files = storage.list()
            base_name, extension = os.path.splitext(filename)

            timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
            # If file exists, append timestamp
            if any(f["name"] == f"documents/{filename}" for f in files):
                timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{base_name}_{timestamp}{extension}"

            file_path = f"documents/{filename}"
            response = storage.upload(
                file=file,
                path=file_path,
                file_options={"content-type": "application/pdf"},
            )
            print(response)
            return response.path

        except Exception as e:
            # pass
            print(f"Error storing file: {e}")
            raise

    def retrieve_file(self, file_path: str) -> Optional[bytes]:
        """Get file from storage."""
        storage = self.supabase.storage.from_(self.bucket_name)
        try:
            return storage.download(file_path)
        except Exception as e:
            print(f"Error retrieving file: {e}")
            return None

    def delete_file(self, file_path: str) -> bool:
        """Delete file from storage."""
        storage = self.supabase.storage.from_(self.bucket_name)
        try:
            storage.remove([file_path])
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
