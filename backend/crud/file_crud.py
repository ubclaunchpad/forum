from database.db import supabase
from fastapi import UploadFile
from uuid import uuid4, UUID

async def handle_upload(file):
    id = uuid4()

    create_document(file, id)
    path = await upload_file(file, id)
    response = create_file(file, id, path)
    
    return response

def create_file(file: UploadFile, id: UUID, path: str): 
    response = (
        supabase.table("files")
        .insert({
            "id": str(id),
            "file_key": path,
            "file_type": file.content_type,
            "file_size": file.size,
            "file_name": file.filename,
            "doc_id": str(id)
        })
        .execute()
    )
    return response

def delete_file_by_id(id):
    return None

def create_document(file: UploadFile, id: UUID):
    response = (
        supabase.table("documents")
        .insert({
            "id": str(id),
            "title": file.filename,
            "original_content": "blah blah blah",
            "document_type": file.content_type
        })
        .execute()
    )
    return response

async def upload_file(file: UploadFile, id: UUID):
    file_path = f"{file.filename}/{id}/{file.filename}"
    content_type = file.content_type
    print(content_type)
    bytes = await file.read()
    response = (
        supabase.storage.from_("files")
        .upload(file_path, bytes, {"contentType": content_type})
    )
    print(response)
    return file_path