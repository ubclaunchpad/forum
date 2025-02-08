from sqlalchemy.orm.query import Query
from sqlalchemy.sql.elements import BooleanClauseList
from sqlalchemy.sql.expression import or_, and_, not_
from sqlalchemy.sql.functions import func
from datetime import datetime
from typing import List
from models.all import Post, Tag
from typing import Optional

def filter_posts(query: Query, 
                 keywords: Optional[List[str]] = None,
                 tags: Optional[List[str]] = None,
                 creation_date: Optional[datetime] = None,
                 creator_id: Optional[str] = None,
                 view_count: Optional[int] = None,
                 like_count: Optional[int] = None,
                 **kwargs) -> Query:
    """
    Filter posts based on the given keywords.

    Args:
        query: The SQLAlchemy query object to filter.
        keywords: The keywords to filter the posts with.
        tags: The tag names to filter the posts with.
        creation_date: The creation date to filter the posts with.
        creator_id: The creator id to filter the posts with.
        view_count: The minimum view count to filter the posts with.
        like_count: The minimum like count to filter the posts with.

    Returns:
        Query: The filtered SQLAlchemy query object.
    """
    if keywords:
        query = filter_by_keywords(query, keywords)
    if tags:
        query = filter_by_tags(query, tags)
    if creation_date:
        query = filter_by_created_after(query, creation_date)
    if creator_id:
        query = filter_by_creator(query, creator_id)
    if view_count:
        query = filter_by_view_count(query, view_count)
    if like_count:
        query = filter_by_like_count(query, like_count)
    return query

def filter_by_keywords(query: Query, keywords: List[str]) -> Query:
    conditions: List[BooleanClauseList] = []
    for keyword in keywords:
        keyword_condition: BooleanClauseList = or_(Post.title.ilike(f"%{keyword}%"), Post.content.ilike(f"%{keyword}%"))
        conditions.append(keyword_condition)

    return query.filter(and_(*conditions))

def filter_by_tags(query: Query, tags: List[str]) -> Query:
    query = (
        query.join(Post.tags)
        .filter(Tag.name.in_(tags))
        .group_by(Post.id)
        .having(func.count(Tag.id) >= len(tags))
    )

    return query

def filter_by_created_after(query: Query, creation_date: datetime) -> Query:
    return query.filter(Post.applied_at >= creation_date)

def filter_by_creator(query: Query, creator_username: str) -> Query:
    return query.filter(Post.created_by == creator_username)

def filter_by_view_count(query: Query, view_count: int) -> Query:
    return query.filter(Post.view_count >= view_count)

def filter_by_like_count(query: Query, like_count: int) -> Query:
    return query.filter(Post.like_count >= like_count)

def sort_posts(query: Query, sort_by: str = None, ** kwargs) -> Query:
    match sort_by:
        case "view_count":
            query = query.order_by(Post.view_count.desc())
        case "like_count":
            query = query.order_by(Post.like_count.desc())
        case _:
            query = query.order_by(Post.applied_at.desc())
    return query

def paginate_posts(query: Query, page_size: int = 10, page_number: int = 1, ** kwargs) -> [Query, bool]:
    # will return page_size + 1 to determine if there is a next page
    query = query.offset((page_number - 1) * page_size).limit(page_size + 1)
    return query, query.count() > page_size