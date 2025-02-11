from typing import Dict, List
from uuid import UUID

from sqlalchemy import func
from models.all import Tag, post_tags, document_tags
from models.db import get_db
from models.schemas.course_schema import CourseTagCount, CourseTagInformation


def count_all_tags(course_id: str) -> CourseTagCount:
    with get_db() as db:
        c_uuid = UUID(course_id)
        query = (
            db.query(
                Tag,
                func.count(getattr(post_tags.c, "tag_id")).label("post_tag_count"),
                func.count(getattr(document_tags.c, "tag_id")).label("doc_tag_count"),
            )
            .outerjoin(post_tags, Tag.id == getattr(post_tags.c, "tag_id"))
            .outerjoin(document_tags, Tag.id == getattr(document_tags.c, "tag_id"))
            .filter(Tag.course_id == c_uuid)
            .group_by(Tag.id)
        )
        result = db.execute(query).fetchall()
        total = len(result)
        post_tags_count = sum(getattr(row, "post_tag_count") for row in result)
        doc_tags_count = sum(getattr(row, "doc_tag_count") for row in result)
        return CourseTagCount(
            posts=post_tags_count,
            documents=doc_tags_count,
            total=total,
        )


def get_all_tag_tree_ids(tag_id: UUID) -> List[UUID]:
    with get_db() as db:
        tags = db.query(Tag).filter(Tag.parent_tag_id == tag_id).all()
        result = [tag_id]
        for tag in tags:
            result.extend(get_all_tag_tree_ids(getattr(tag, "id")))
        return result


def get_tag_association_counts(tag_id: UUID, all=False) -> CourseTagCount:
    with get_db() as db:
        if all:
            doc_filter = getattr(document_tags.c, "tag_id").in_(
                get_all_tag_tree_ids(tag_id)
            )
            post_filter = getattr(post_tags.c, "tag_id").in_(
                get_all_tag_tree_ids(tag_id)
            )
        else:
            doc_filter = getattr(document_tags.c, "tag_id") == tag_id
            post_filter = getattr(post_tags.c, "tag_id") == tag_id

        doc_count = db.query(func.count()).filter(doc_filter).scalar()
        post_count = db.query(func.count()).filter(post_filter).scalar()
        return CourseTagCount.model_validate(
            {
                "posts": post_count,
                "documents": doc_count,
                "total": doc_count + post_count,
            }
        )


def build_tag_tree(c_uuid, parent_tag_id=None) -> List[CourseTagInformation]:
    with get_db() as db:
        tags = db.query(Tag).filter(Tag.parent_tag_id == parent_tag_id).all()
        result = []
        for tag in tags:
            tag_counts = get_tag_association_counts(getattr(tag, "id"))

            children = build_tag_tree(c_uuid, tag.id)

            for child in children:
                count = getattr(child, "count")
                child_post_count = getattr(count, "posts")
                child_doc_count = getattr(count, "documents")
                child_total_count = getattr(count, "total")
                cur_post_count = getattr(tag_counts, "posts")
                cur_doc_count = getattr(tag_counts, "documents")
                cur_total_count = getattr(tag_counts, "total")
                setattr(tag_counts, "posts", cur_post_count + child_post_count)
                setattr(tag_counts, "documents", cur_doc_count + child_doc_count)
                setattr(tag_counts, "total", cur_total_count + child_total_count)

            result.append(
                CourseTagInformation.model_validate(
                    {
                        "id": getattr(tag, "id"),
                        "name": getattr(tag, "name"),
                        "visibility": getattr(tag, "visibility"),
                        "course_id": getattr(tag, "course_id"),
                        "created_by": getattr(tag, "created_by"),
                        "properties": getattr(tag, "properties"),
                        "subtags": children,
                        "count": tag_counts,
                    }
                )
            )
        return result


def build_flat_tag_array(c_uuid: UUID) -> List[CourseTagInformation]:
    with get_db() as db:
        tags = db.query(Tag).filter(Tag.course_id == c_uuid).all()
        return [
            CourseTagInformation.model_validate(
                {
                    "id": getattr(tag, "id"),
                    "name": getattr(tag, "name"),
                    "visibility": getattr(tag, "visibility"),
                    "course_id": getattr(tag, "course_id"),
                    "created_by": getattr(tag, "created_by"),
                    "properties": getattr(tag, "properties"),
                    "count": get_tag_association_counts(getattr(tag, "id")),
                }
            )
            for tag in tags
        ]


def has_cycle(tag_id: UUID, parent_tag_id: UUID) -> bool:
    if tag_id == parent_tag_id:
        return True

    with get_db() as db:
        all_tags: Dict[UUID, Tag] = {
            getattr(tag, "id"): tag for tag in db.query(Tag).all()
        }

        current_tag = all_tags.get(parent_tag_id)

        while current_tag and current_tag.parent_tag_id is not None:
            if getattr(current_tag, "parent_tag_id") == tag_id:
                return True
            current_tag = all_tags.get(getattr(current_tag, "parent_tag_id"))

    return False
