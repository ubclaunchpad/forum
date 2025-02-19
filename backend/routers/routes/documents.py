import json
import logging
from ast import Dict
from datetime import datetime, timedelta
from typing import AsyncGenerator, Dict, Optional, Tuple
from uuid import UUID

from controllers import document_controller
from controllers.documents import document_manager
from controllers.query_history_controller import (
    add_query_to_history,
    get_open_ai_context,
)
from core.pipelines.document_query_engine import DocumentQueryEngine
from core.util import file_storage
from fastapi import APIRouter, Form, HTTPException, Request, UploadFile, BackgroundTasks
from fastapi.responses import StreamingResponse
from models.db import get_db
from models.schemas.course_schema import CourseTagsResponse, CreateCourseResponse
from models.schemas.document_schema import (
    CreateDocumentRequest,
    CreateDocumentResponse,
    DocumentEmbeddingMetadata,
    DocumentFileUpload,
)
from models.schemas.general_schema import GeneralResponse
from pydantic import BaseModel

DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
document_router = APIRouter()

logger = logging.getLogger(__name__)

url_cache: Dict[str, Dict[str, Tuple[str, float]]] = {}


class DocumentQuery(BaseModel):
    question: str
    template_name: Optional[str] = None


@document_router.post("", response_model=CreateCourseResponse)
async def create_document(
    request: Request,
    c_id: str,
    file: UploadFile = Form(...),
    title: str = Form(...),
    metadata: str = Form(...),
):
    try:
        if not file.filename:
            raise ValueError("No filename provided")

        file_content = await file.read()
        await file.seek(0)

        # Handle content type
        content_type = file.content_type
        if not content_type:
            # Fallback content type based on extension
            extension = file.filename.split(".")[-1].lower()
            content_type_map = {
                "pdf": "application/pdf",
                "txt": "text/plain",
                "md": "text/markdown",
                "png": "image/png",
                "jpg": "image/jpeg",
                "jpeg": "image/jpeg",
            }
            content_type = content_type_map.get(extension)
            if not content_type:
                raise ValueError(f"Unsupported file type: {extension}")

        create_document_request = DocumentFileUpload(
            title=title,
            course_id=UUID(c_id),
            created_by=request.state.user_id,
            file=file_content,
            type=content_type,
            extension=file.filename.split(".")[-1].lower(),
        )

        doc_id = await document_manager.upload_new_document(create_document_request)
        return CreateDocumentResponse(id=doc_id)
    except Exception as e:
        if isinstance(e, ValueError):
            raise HTTPException(
                status_code=422, detail=f"Error creating document: {str(e)}"
            )
        raise HTTPException(
            status_code=500, detail=f"Error creating document: {str(e)}"
        )


@document_router.get("")
async def get_documents(c_id: UUID):
    documents = document_manager.get_documents(c_id)
    return documents


def get_cached_url(user_id: str, document_id: str) -> str | None:
    """Get cached URL if exists and not expired, clean up if expired"""
    if user_id in url_cache and document_id in url_cache[user_id]:
        url, expiry = url_cache[user_id][document_id]
        if datetime.now().timestamp() < expiry:
            return url
        # Clean up expired entry
        del url_cache[user_id][document_id]
        # Clean up user dict if empty
        if not url_cache[user_id]:
            del url_cache[user_id]
    return None


def cache_signed_url(
    user_id: str, document_id: str, signed_url: str, expiry_minutes: int = 55
):
    """Cache signed URL with expiration"""
    if user_id not in url_cache:
        url_cache[user_id] = {}

    expiry = datetime.now() + timedelta(minutes=expiry_minutes)
    url_cache[user_id][document_id] = (signed_url, expiry.timestamp())


@document_router.get("/{document_id}/signed_url")
async def get_document_view(c_id: UUID, document_id: UUID, request: Request):
    res = document_manager.get_signed_document_url(
        course_id=c_id, document_id=str(document_id)
    )
    return {"signed_url": res["signedURL"]}


@document_router.delete("/{document_id}", response_model=GeneralResponse)
async def delete_document(c_id: UUID, document_id: UUID):
    try:
        document_manager.delete_document(document_id)
        return GeneralResponse(msg="Document deleted successfully")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting document: {str(e)}"
        )


@document_router.post("/query")
async def query_documents(
    c_id: UUID,
    query: DocumentQuery,
    request: Request,
):
    """
    Query documents within a course using RAG.

    Args:
        c_id: Course ID
        query: Query parameters including question and optional template

    Returns:
        Query response with answer and sources
    """
    try:
        with get_db() as db:
            query_engine = DocumentQueryEngine(
                db=db,
                model="gpt-4o-mini",  # You might want to make this configurable
                max_chunks=5,
            )

            response = query_engine.query(
                question=query.question,
                course_id=c_id,
                template_name=query.template_name,
            )

            return {
                "answer": response["answer"],
                "sources": [
                    {
                        "title": source.get("title")
                        or source.get("document_title", "Unknown Document"),
                        "content": source.get("content", ""),
                        "relevance": source.get("similarity", 0.0),
                        "metadata": source.get("metadata", {}),
                        "document_id": source.get("document_id", ""),
                        "signed_url": source.get("signed_url", ""),
                        "id": source.get("document_id", ""),
                        "type": source.get("type", "document"),
                        "url": source.get("url", "") or source.get("signed_url", ""),
                        "fe_type": source.get("fe_type", "pdf"),
                    }
                    for source in response["sources"]
                ],
            }

    except Exception as e:
        logger.error(f"Error querying documents: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@document_router.post("/querystream")
async def query_documents_stream(
    c_id: UUID,
    query: DocumentQuery,
    request: Request,
):
    context = get_open_ai_context(c_id, request.state.user_id)
    query_builder = {"question": query.question, "sources": []}

    async def stream_response() -> AsyncGenerator[str, None]:
        final_answer_history = {}
        try:
            with get_db() as db:
                query_engine = DocumentQueryEngine(
                    db=db,
                    model="gpt-4o-mini",
                    max_chunks=5,
                )
                async for chunk in query_engine.stream_query(
                    question=query.question,
                    course_id=c_id,
                    user_id=request.state.user_id,
                    history=context,
                    template_name=query.template_name,
                ):
                    answer_json = json.loads(chunk)
                    if not answer_json["done"]:
                        for key in answer_json:
                            query_builder[key] = answer_json[key]
                    else:
                        query_builder["timestamp"] = datetime.now().strftime(
                            DATE_FORMAT
                        )
                    yield f"data: {json.dumps(answer_json)}\n\n"
                    final_answer_history = answer_json

                final_answer_history["question"] = query.question
                add_query_to_history(c_id, request.state.user_id, final_answer_history)

        except Exception as e:
            logger.error(f"Error querying documents: {e}", exc_info=True)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream")


@document_router.get("/{document_id}/tags", response_model=CourseTagsResponse)
async def get_document_tags(document_id: str):
    res = document_controller.get_document_tags(document_id)
    if not res:
        raise HTTPException(status_code=400, detail="Failed to get document tags")
    return res


@document_router.post("/{document_id}/tags/{tag_id}", response_model=GeneralResponse)
async def add_document_tag(document_id: str, tag_id: str, req: Request):
    author_id = req.state.user_id
    res = document_controller.add_document_tag(document_id, tag_id, author_id)
    if not res:
        raise HTTPException(status_code=400, detail="Failed to add document tag")
    return res


@document_router.delete("/{document_id}/tags/{tag_id}", response_model=GeneralResponse)
async def remove_document_tag(document_id: str, tag_id: str):
    res = document_controller.remove_document_tag(document_id, tag_id)
    if not res:
        raise HTTPException(status_code=400, detail="Failed to remove document tag")
    return res


@document_router.post("/{document_id}/embeddings", response_model=GeneralResponse)
async def update_embeddings(
    document_id: str, request: Request, background_tasks: BackgroundTasks
):
    user_id = request.state.user_id
    background_tasks.add_task(document_manager.update_embeddings, document_id, user_id)
    return GeneralResponse(msg="Embedding update started")


@document_router.get(
    "/{document_id}/embeddings/metadata", response_model=DocumentEmbeddingMetadata
)
async def get_embedding_metadata(document_id: str, request: Request):
    # print("get_embedding_metadata", document_id, request.state.user_id)
    user_id = request.state.user_id
    return document_manager.get_embedding_metadata(document_id, user_id)
