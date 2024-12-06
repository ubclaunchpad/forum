from uuid import UUID

from controllers.documents import document_manager
from core.util import file_storage
from fastapi import APIRouter, Form, HTTPException, Request, UploadFile
from models.schemas.document_schema import CreateDocumentRequest, DocumentFileUpload
from models.schemas.general_schema import GeneralResponse

document_router = APIRouter()


@document_router.post("", response_model=GeneralResponse)
async def create_document(
    request: Request,
    course_id: UUID,
    file: UploadFile = Form(...),
    title: str = Form(...),
    metadata: str = Form(...),
):
    try:
        file_content = await file.read()
        await file.seek(0)
        document_type = await file_storage.get_file_type(file, file_content)
        create_document_request = DocumentFileUpload(
            title=title,
            course_id=course_id,
            created_by=request.state.user_id,
            file=file_content,
            document_type=document_type,
        )
        doc_id = await document_manager.upload_new_document(create_document_request)
        return GeneralResponse(
            msg="Document created successfully", properties={"document_id": str(doc_id)}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating document: {str(e)}"
        )


@document_router.get("")
async def get_documents(course_id: UUID):
    documents = document_manager.get_documents(course_id)
    return documents


# @document_router.get("/{document_id}")
# async def get_document(
#     course_id: UUID, document_id: UUID, request: Request
# ) -> DocumentResponse:
#     document = document_crud.get_document_by_id(document_id)
#     return document


# @document_router.get("/{document_id}/signed-url", response_model=ViewDocumentResponse)
# async def get_document_view(course_id: UUID, document_id: UUID, file_path: str):
#     signed_url = document_crud.get_signed_document_url(file_path)
#     return signed_url
