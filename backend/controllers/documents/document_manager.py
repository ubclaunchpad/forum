from uuid import UUID

from core.util.file_storage import FileStorage
from models.all import Course, Document
from models.db import get_db
from models.schemas.document_schema import DocumentFileUpload


async def upload_new_document(
    create_document: DocumentFileUpload,
) -> str:
    with get_db() as db:
        document = Document(
            title=create_document.title,
            created_by=create_document.created_by,
            document_type=create_document.document_type,
        )
        course = db.query(Course).get(create_document.course_id)
        if course:
            course.documents.append(document)
        try:
            db.add(document)
            db.flush()
            document_id = UUID(str(document.id))

            file_storage = FileStorage(bucket_name="course-files")

            path = file_storage.store_file(create_document.file, str(document_id))
            document.file_url = path
            db.commit()
            return str(document.id)
        except Exception as e:
            raise e


def get_documents(c_id: UUID) -> list[Document]:
    with get_db() as db:
        documents = (
            db.query(Document).join(Document.courses).filter(Course.id == c_id).all()
        )
        return documents


def get_signed_document_url(document_id: str):
    with get_db() as db:
        document = db.query(Document).get(document_id)
        if not document:
            raise ValueError("Document not found")
        file_path = document.file_url
        file_storage = FileStorage(bucket_name="course-files")
        url = file_storage.get_file_signed_url(file_path)
        return url
