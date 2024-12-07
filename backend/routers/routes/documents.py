import json
import logging
from typing import AsyncGenerator, Optional
from uuid import UUID

from controllers.documents import document_manager
from core.pipelines.document_query_engine import DocumentQueryEngine
from core.util import file_storage
from fastapi import APIRouter, Form, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from models.db import get_db
from models.schemas.document_schema import (CreateDocumentRequest,
                                            DocumentFileUpload)
from models.schemas.general_schema import GeneralResponse
from pydantic import BaseModel

document_router = APIRouter()

logger = logging.getLogger(__name__)


class DocumentQuery(BaseModel):
    question: str
    template_name: Optional[str] = None


@document_router.post("", response_model=GeneralResponse)
async def create_document(
    request: Request,
    c_id: str,
    file: UploadFile = Form(...),
    title: str = Form(...),
    metadata: str = Form(...),
):
    try:
        file_content = await file.read()
        await file.seek(0)
        document_type = title.split(".")[-1]
        create_document_request = DocumentFileUpload(
            title=title,
            course_id=UUID(c_id),
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
async def get_documents(c_id: UUID):
    documents = document_manager.get_documents(c_id)
    return documents


@document_router.get("/{document_id}/signed_url")
async def get_document_view(c_id: UUID, document_id: UUID):
    res = document_manager.get_signed_document_url(str(document_id))
    return {"signed_url": res["signedURL"]}


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
                model="gpt-4",  # You might want to make this configurable
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
                        "title": source["document_title"],
                        "content": source["content"],
                        "relevance": source["similarity"],
                        "metadata": source["metadata"],
                        "document_id": source["document_id"],
                        "signed_url": source["signed_url"],
                        "id": source["document_id"],
                    }
                    for source in response["sources"]
                ],
            }

    except Exception as e:
        logger.error(f"Error querying documents: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")




@document_router.post("/querystream")
async def query_documents(
    c_id: UUID,
    query: DocumentQuery,
    request: Request,
):
    async def stream_response() -> AsyncGenerator[str, None]:
        try:
            with get_db() as db:
                query_engine = DocumentQueryEngine(
                    db=db,
                    model="gpt-4o",
                    max_chunks=5,
                )

                async for chunk in query_engine.stream_query(
                    question=query.question,
                    course_id=c_id,
                    template_name=query.template_name,
                ):
                    yield chunk

        except Exception as e:
            logger.error(f"Error querying documents: {e}", exc_info=True)
            yield json.dumps({"error": str(e)})

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream"
    )