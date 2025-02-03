from datetime import date, datetime
from enum import Enum as PyEnum
from typing import List, Optional
from uuid import UUID

from httpx import post
from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    ARRAY,
    DDL,
    INT,
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    Nullable,
    String,
    Table,
    Text,
    UniqueConstraint,
    event,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PUUID
from sqlalchemy.orm import backref, declarative_base, declared_attr, relationship
from sqlalchemy.sql import func
from sqlalchemy.types import VARCHAR, TypeDecorator


# Define base class with schema setting
class CustomBase:
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()  # type: ignore

    @declared_attr  # type: ignore
    def __table_args__(cls):
        return {"schema": "public"}


Base = declarative_base(cls=CustomBase)

# Setup extensions
event.listen(
    Base.metadata, "before_create", DDL("CREATE EXTENSION IF NOT EXISTS uuid-ossp")
)

event.listen(
    Base.metadata, "before_create", DDL("CREATE EXTENSION IF NOT EXISTS vector")
)

event.listen(
    Base.metadata, "before_create", DDL("CREATE EXTENSION IF NOT EXISTS pg_cron")
)


class PostStatus(PyEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    DELETED = "deleted"


# Create VECTOR type
class VECTOR(TypeDecorator):
    impl = VARCHAR
    cache_ok = True

    def __init__(self, dim):
        super().__init__()
        self.dim = dim


# Create auth.users table reference
users = Table(
    "users",
    Base.metadata,
    Column("id", PUUID, primary_key=True),
    schema="auth",
    keep_existing=True,
)

# Define association table
course_documents = Table(
    "course_documents",
    Base.metadata,
    Column(
        "course_id",
        PUUID,
        ForeignKey(
            "public.courses.id",
            ondelete="CASCADE",
            name="course_documents_course_id_fkey",
        ),
        primary_key=True,
    ),
    Column(
        "document_id",
        PUUID,
        ForeignKey(
            "public.documents.id",
            ondelete="CASCADE",
            name="course_documents_document_id_fkey",
        ),
        primary_key=True,
    ),
    schema="public",
)

user_courses = Table(
    "user_courses",
    Base.metadata,
    Column(
        "user_id",
        PUUID,
        ForeignKey(
            "public.profiles.id", ondelete="CASCADE", name="user_courses_user_id_fkey"
        ),
        primary_key=True,
    ),
    Column(
        "course_id",
        PUUID,
        ForeignKey(
            "public.courses.id", ondelete="CASCADE", name="user_courses_course_id_fkey"
        ),
        primary_key=True,
    ),
    schema="public",
)


document_tags = Table(
    "document_tags",
    Base.metadata,
    Column(
        "doc_id",
        PUUID,
        ForeignKey("public.documents.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        PUUID,
        ForeignKey("public.tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("created_by", PUUID, ForeignKey("auth.users.id", ondelete="SET NULL")),
    schema="public",
)

post_tags = Table(
    "post_tags",
    Base.metadata,
    Column(
        "post_id",
        PUUID,
        ForeignKey("public.posts.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        PUUID,
        ForeignKey("public.tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("created_by", PUUID, ForeignKey("auth.users.id", ondelete="SET NULL")),
    schema="public",
)


class Profile(Base):
    __tablename__ = "profiles"
    id = Column(
        PUUID,
        ForeignKey(
            "auth.users.id",
            ondelete="CASCADE",
            name="profiles_id_users_fkey",  # Added name
        ),
        primary_key=True,
    )
    first_name = Column(Text)
    last_name = Column(Text)
    email = Column(Text)
    pronouns = Column(Text, nullable=True)
    username = Column(Text, unique=True, nullable=True)
    bio = Column(Text, nullable=True)
    socials = Column(JSONB, default=dict)
    timezone = Column(Text, nullable=True)
    display_name = Column(Text, nullable=True)
    icon_url = Column(Text, nullable=True)
    status = Column(Text, nullable=True)

    # Relationships
    courses = relationship("Course", secondary=user_courses, back_populates="users")
    posts = relationship(
        "Post", back_populates="creator", foreign_keys="[Post.created_by]"
    )
    post_edits = relationship("PostEdit", back_populates="editor")
    documents = relationship("Document", back_populates="creators")

    __table_args__ = ({"schema": "public"},)


class Course(Base):
    __tablename__ = "courses"
    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    c_group = Column(Text, nullable=False)
    code = Column(Text, nullable=False)
    section = Column(Text, nullable=False)
    name = Column(Text)
    config = Column(JSONB)
    start_date = Column(Date, server_default=text("CURRENT_DATE"))
    end_date = Column(Date)

    # Relationships
    users = relationship("Profile", secondary=user_courses, back_populates="courses")
    documents = relationship(
        "Document", secondary=course_documents, back_populates="courses"
    )  # Use table object instead of string

    __table_args__ = (
        UniqueConstraint("c_group", "code", "section"),
        {"schema": "public"},
    )


class Post(Base):
    __tablename__ = "posts"
    # Primary UUID
    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)

    # Course-specific sequential ID
    local_id = Column(Integer, nullable=False)
    course_id = Column(
        PUUID,
        ForeignKey(
            "public.courses.id", ondelete="CASCADE", name="posts_course_id_fkey"
        ),
        nullable=False,
    )

    # Regular fields
    title = Column(Text)
    content = Column(Text)
    status = Column(
        Enum(PostStatus, name="post_status", schema="public"), nullable=True
    )
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(
        PUUID,
        ForeignKey("public.profiles.id", name="posts_created_by_fkey"),
        nullable=False,
    )

    # Relationships
    creator = relationship("Profile", back_populates="posts", foreign_keys=[created_by])
    edits = relationship(
        "PostEdit", back_populates="post", cascade="all, delete-orphan"
    )
    events = relationship("UserPostEvent", back_populates="post")
    embeddings = relationship(
        "Embedding",
        foreign_keys="[Embedding.entity_id]",
        primaryjoin="and_(Post.id==Embedding.entity_id, Embedding.entity_type=='post')",
        cascade="all, delete-orphan",
        back_populates="post",
    )
    tags = relationship("Tag", secondary=post_tags, back_populates="posts")

    __table_args__ = (
        UniqueConstraint("course_id", "local_id", name="uq_posts_course_local_id"),
        {"schema": "public"},
    )


class PostEdit(Base):
    __tablename__ = "post_edits"
    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    post_id = Column(
        PUUID,
        ForeignKey(
            "public.posts.id", ondelete="CASCADE", name="post_edits_post_id_fkey"
        ),
        nullable=False,
    )
    edited_by = Column(
        PUUID,
        ForeignKey("public.profiles.id", name="post_edits_edited_by_fkey"),
        nullable=False,
    )
    previous_content = Column(Text)
    new_content = Column(Text)
    edit_reason = Column(Text)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    post = relationship("Post", back_populates="edits")
    editor = relationship("Profile", back_populates="post_edits")


class UserPostEvent(Base):
    __tablename__ = "user_post_events"
    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    viewed = Column(Boolean)
    liked = Column(Boolean)
    user_id = Column(
        PUUID,
        ForeignKey("public.profiles.id", name="user_post_events_user_id_fkey"),
        nullable=False,
    )
    post_id = Column(
        PUUID,
        ForeignKey(
            "public.posts.id", ondelete="CASCADE", name="user_post_events_post_id_fkey"
        ),
        nullable=False,
    )
    # Relationships
    post = relationship("Post", back_populates="events")


class Document(Base):
    __tablename__ = "documents"
    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    title = Column(String(255), nullable=False)
    created_at = Column(
        DateTime, server_default=text("CURRENT_TIMESTAMP"), nullable=False
    )
    created_by = Column(
        PUUID,
        ForeignKey(
            "public.profiles.id", ondelete="CASCADE", name="documents_created_by_fkey"
        ),
        nullable=False,
    )
    updated_at = Column(
        DateTime, server_default=text("CURRENT_TIMESTAMP"), nullable=False
    )
    document_type = Column(String(50), nullable=False)
    doc_metadata = Column(JSONB)
    file_url = Column(String)

    # Relationships
    courses = relationship(
        "Course", secondary=course_documents, back_populates="documents"
    )
    creators = relationship("Profile", back_populates="documents")
    embeddings = relationship(
        "Embedding",
        foreign_keys="[Embedding.entity_id]",
        primaryjoin="and_(Document.id==Embedding.entity_id, "
        "Embedding.entity_type=='document')",
        cascade="all, delete-orphan",
        back_populates="document",
    )
    tags = relationship("Tag", secondary=document_tags, back_populates="documents")

    __table_args__ = (
        CheckConstraint(
            "document_type IN ('application/pdf', 'text/plain', 'text/markdown', 'image/png', 'image/jpeg')",
            name="valid_document_type",
        ),
        CheckConstraint("jsonb_typeof(doc_metadata) = 'object'", name="valid_metadata"),
        {"schema": "public"},
    )


class Embedding(Base):
    """
    A single table to store 'chunks' of content (from a Post or a Document)
    along with their vector embeddings and metadata.

    id: UUID - primary key
    entity_type: String - e.g., "document" or "post" as of 25/01/2025. can be extended to other entities in the future
    entity_id: ID of the record in the corresponding table (documents.id or posts.id, etc.)
    content: Text - the textual content of this "chunk. In the case of images/videos, store the URL of the image/video
    chunk_index: Integer - if you're chunking large posts or documents, store chunk index
    chunk_type: String - enum("text", "image", "code")
    chunk_metadata: JSONB - Optionally store chunk type and other metadata
    parent_chunk_id: UUID - For parent-child chunk relationships (if needed)
    embedding: Vector - Embedding vector (1536 since we are using OpenAI's text-embedding-3-small model)
    created_at: DateTime - Basic timestamps, etc.
    """

    __tablename__ = "embeddings"

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)

    entity_type = Column(String(50), nullable=False)
    entity_id = Column(PUUID, nullable=False)

    content = Column(Text, nullable=False)

    chunk_index = Column(Integer, nullable=True)
    chunk_type = Column(String(50), nullable=True)
    chunk_metadata = Column(JSONB)
    parent_chunk_id = Column(
        PUUID,
        ForeignKey(
            "public.embeddings.id",
            ondelete="CASCADE",
            name="embeddings_parent_chunk_id_fkey",  # Added name
        ),
        nullable=True,
    )
    embedding = Column(Vector(1536), nullable=False)

    created_at = Column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )

    # Add relationships
    document = relationship(
        "Document",
        foreign_keys=[entity_id],
        primaryjoin="and_(Document.id==Embedding.entity_id, "
        "Embedding.entity_type=='document')",
        back_populates="embeddings",
    )
    post = relationship(
        "Post",
        foreign_keys=[entity_id],
        primaryjoin="and_(Post.id==Embedding.entity_id, Embedding.entity_type=='post')",
        back_populates="embeddings",
    )

    __table_args__ = (
        Index(
            "embeddings_vector_idx",
            embedding,
            postgresql_using="ivfflat",
            postgresql_with={"lists": 100},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
        CheckConstraint(
            "chunk_type IN ('text', 'image', 'code') OR chunk_type IS NULL",
            name="valid_chunk_type",
        ),
        CheckConstraint(
            "jsonb_typeof(chunk_metadata) = 'object' OR chunk_metadata IS NULL",
            name="valid_metadata",
        ),
        # Add composite index for entity lookups
        Index("ix_embeddings_entity", entity_type, entity_id),
        {"schema": "public"},
    )


class QueryHistory(Base):
    __tablename__ = "query_history"
    user_id = Column(
        PUUID,
        ForeignKey(
            "auth.users.id",
            ondelete="CASCADE",
            name="query_history_user_id_fkey",  # Match existing constraint name
        ),
        nullable=False,  # Changed to match your DB
        primary_key=True,
    )
    course_id = Column(
        PUUID,
        ForeignKey(
            "public.courses.id",
            ondelete="CASCADE",
            name="query_history_course_id_fkey",  # Match existing constraint name
        ),
        primary_key=True,
    )
    messages = Column(JSONB)


class Message(Base):
    __tablename__ = "messages"
    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    content = Column(Text, nullable=False)
    created_by = Column(PUUID, ForeignKey("public.profiles.id"), nullable=False)
    created_at = Column(
        DateTime, server_default=text("CURRENT_TIMESTAMP"), nullable=False
    )
    channel_id = Column(
        PUUID, ForeignKey("public.channels.id", ondelete="CASCADE"), nullable=False
    )


class Job(Base):
    __tablename__ = "job"

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    params = Column(JSONB)
    status = Column(
        Enum("not started", "running", "success", "failed", name="job_status"),
        nullable=False,
    )
    retry_count = Column(Integer, nullable=False)
    updated_at = Column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )
    priority = Column(
        Enum("low", "medium", "high", name="job_priority"), nullable=False
    )
    recurring = Column(Boolean, nullable=False)
    recurring_interval = Column(Integer, nullable=False)  # measured in seconds
    recurring_end_date = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_status_priority", "status", "priority"),
        {"schema": "public"},
    )
    
class Channel(Base):
    __tablename__ = "channels"
    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(
        DateTime, server_default=text("CURRENT_TIMESTAMP"), nullable=False
    )
    created_by = Column(PUUID, ForeignKey("public.profiles.id"), nullable=False)



class UserChannel(Base):
    __tablename__ = "user_channels"
    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    user_id = Column(
        PUUID, ForeignKey("public.profiles.id", ondelete="CASCADE"), nullable=False
    )
    channel_id = Column(
        PUUID, ForeignKey("public.channels.id", ondelete="CASCADE"), nullable=False
    )

class JobSpecification(Base):
    __tablename__ = "job_specification"

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    job_id = Column(
        PUUID, ForeignKey("public.job.id", ondelete="CASCADE"), nullable=False
    )
    description = Column(Text, nullable=False)
    action_name = Column(Text, nullable=False)
    timeout = Column(Integer, nullable=False)  # measured in seconds
    failure_strategy = Column(
        Enum("retry", "abort", name="job_failure_strategy"), nullable=False
    )
    cleanup_action = Column(Text, nullable=True)
    job_file = Column(String, nullable=False)


class Visibility(PyEnum):
    public = "public"
    private = "private"


class Tag(Base):
    __tablename__ = "tags"

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    name = Column(String(255), nullable=False)
    visibility = Column(
        Enum(Visibility, name="visibility", schema="public"), nullable=False
    )
    course_id = Column(PUUID, ForeignKey("public.courses.id", ondelete="CASCADE"))
    parent_tag_id = Column(PUUID, ForeignKey("public.tags.id", ondelete="CASCADE"))
    created_by = Column(PUUID, ForeignKey("auth.users.id", ondelete="SET NULL"))
    properties = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    course = relationship("Course")
    parent_tag = relationship("Tag", remote_side=[id])
    documents = relationship("Document", secondary=document_tags, back_populates="tags")
    posts = relationship("Post", secondary=post_tags, back_populates="tags")
