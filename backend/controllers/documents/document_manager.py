from uuid import UUID

from core.util.file_storage import FileStorage
from models.all import Document
from models.db import get_db
from models.schemas.document_schema import DocumentFileUpload


async def upload_new_document(
    create_document: DocumentFileUpload,
) -> str:
    with get_db() as db:
        document = Document(
            title=create_document.title,
            course_id=create_document.course_id,
            created_by=create_document.created_by,
            document_type=create_document.document_type,
        )
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


def get_documents(course_id: UUID) -> list[Document]:
    with get_db() as db:
        documents = db.query(Document).filter_by(course_id=course_id).all()
        return documents
