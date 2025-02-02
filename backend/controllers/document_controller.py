import logging
from sqlalchemy import insert
from sqlalchemy.orm import joinedload
from uuid import UUID
from fastapi import HTTPException

from models.all import Document, Tag, document_tags
from models.db import get_db
from models.schemas.course_schema import CourseTagInformation, CourseTagsResponse
from models.schemas.general_schema import GeneralResponse

logger = logging.getLogger(__name__)

def get_document_tags(document_id: str) -> CourseTagsResponse:
    """Get tags for a document."""
    with get_db() as db:
        post = (
            db
            .query(Document)
            .options(joinedload(Document.tags))
            .filter(Document.id == UUID(document_id))
            .first()
        )
        if not post:
            raise HTTPException(status_code=404, detail="Document not found")
        tags = []
        for tag in post.tags:
            tags.append(
                CourseTagInformation(
                    id=tag.id,
                    name=tag.name,
                    visibility=tag.visibility,
                    course_id=tag.course_id,
                    parent_tag_id=tag.parent_tag_id,
                    created_by=tag.created_by,
                    properties=tag.properties,
                )
            )
    return CourseTagsResponse(tags=tags)

def add_document_tag(document_id: str, tag_id: str, author_id: str) -> GeneralResponse:
    """Add a tag to a document."""
    with get_db() as db:
        try:
            document = db.query(Document).filter(Document.id == UUID(document_id)).first()
            if not document:
                raise HTTPException(status_code=404, detail="Document not found")
            tag = db.query(Tag).filter(Tag.id == UUID(tag_id)).first()
            if not tag:
                raise HTTPException(status_code=404, detail="Tag not found")
            exec = insert(document_tags).values(
                doc_id=document.id, 
                tag_id=tag.id,
                created_by = UUID(author_id)
            )
            db.execute(exec)
            db.commit()
        except Exception as e:
            db.rollback()
            print(str(e))
            raise HTTPException(status_code=500, detail=f"Error adding tag to document: {str(e)}")
        
    return GeneralResponse(msg="Tag added to document")

def remove_document_tag(document_id: str, tag_id: str) -> GeneralResponse:
    """Remove a tag from a document."""
    with get_db() as db:
        try:
            document = db.query(Document).filter(Document.id == UUID(document_id)).first()
            if not document:
                raise HTTPException(status_code=404, detail="Document not found")
            tag = db.query(Tag).filter(Tag.id == UUID(tag_id)).first()
            if not tag:
                raise HTTPException(status_code=404, detail="Tag not found")
            document.tags.remove(tag)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error removing tag from document: {str(e)}")
        
    return GeneralResponse(msg="Tag removed from document")