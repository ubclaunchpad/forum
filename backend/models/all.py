import enum
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from httpx import post
from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    ARRAY,
    DDL,
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
user_courses = Table(
    "user_courses",
    Base.metadata,
    Column(
        "user_id",
        PUUID,
        ForeignKey("public.profiles.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "course_id",
        PUUID,
        ForeignKey("public.courses.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    schema="public",
)

course_documents = Table(
    "course_documents",
    Base.metadata,
    Column(
        "course_id",
        PUUID,
        ForeignKey("public.courses.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "document_id",
        PUUID,
        ForeignKey("public.documents.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    schema="public",
)

document_tags = Table(
    "document_tags",
    Base.metadata,
    Column("doc_id", PUUID, ForeignKey('public.documents.id', ondelete="CASCADE"), primary_key=True),
    Column("tag_id", PUUID, ForeignKey('public.tags.id', ondelete="CASCADE"), primary_key=True),
    Column("created_by", PUUID, ForeignKey('auth.users.id', ondelete="SET NULL")),
    schema="public",
)

post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", PUUID, ForeignKey('public.posts.id', ondelete="CASCADE"), primary_key=True),
    Column("tag_id", PUUID, ForeignKey('public.tags.id', ondelete="CASCADE"), primary_key=True),
    Column("created_by", PUUID, ForeignKey('auth.users.id', ondelete="SET NULL")),
    schema="public",
)

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(
        PUUID, ForeignKey("auth.users.id", ondelete="CASCADE"), primary_key=True
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

    # roles = relationship("CourseRole", back_populates = "course")


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
    status = Column("status", Enum("poststatus", schema="public"), nullable=True)
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
    tags = relationship(
        "Tag", secondary=post_tags, back_populates="posts"
    )

    __table_args__ = (
        UniqueConstraint("course_id", "local_id", name="uq_posts_course_local_id"),
        {"schema": "public"},
    )


class PostEdit(Base):
    __tablename__ = "post_edits"
    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    post_id = Column(
        Integer, ForeignKey("public.posts.id", ondelete="CASCADE"), nullable=False
    )
    edited_by = Column(PUUID, ForeignKey("public.profiles.id"), nullable=False)
    previous_content = Column(Text)
    new_content = Column(Text)
    edit_reason = Column(Text)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    post = relationship("Post", back_populates="edits")
    editor = relationship("Profile", back_populates="post_edits")


class UserPostEvent(Base):
    __tablename__ = "user_post_events"
    id = Column(
        PUUID, server_default=text("gen_random_uuid()"), primary_key=True
    )  # Changed to gen_random_uuid()
    viewed = Column(Boolean)
    liked = Column(Boolean)
    user_id = Column(PUUID, ForeignKey("public.profiles.id"), nullable=False)
    post_id = Column(
        Integer, ForeignKey("public.posts.id", ondelete="CASCADE"), nullable=False
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
        PUUID, ForeignKey("public.profiles.id", ondelete="CASCADE"), nullable=False
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
    tags = relationship(
        "Tag", secondary=document_tags, back_populates="documents"
    )

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
        ForeignKey("public.embeddings.id", ondelete="CASCADE"),
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
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        nullable=True,
        primary_key=True,
    )
    course_id = Column(
        PUUID, ForeignKey("public.courses.id", ondelete="CASCADE"), primary_key=True
    )
    messages = Column(JSONB)

class VisibilityEnum(enum.Enum):
    public = "public"
    private = "private"

'''
class CourseRole(Base):
    __tablename__ = 'course_roles'

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    course_id = Column(PUUID, ForeignKey('public.courses.id', ondelete = "CASCADE"), nullable = False)
    name = Column(String(255), nullable=False)  # 'owner', 'admin', 'user', 'viewer'
    description = Column(Text)  # Optional description
    visibility = Column(Enum(VisibilityEnum, native_enum = True), nullable=False)
    created_by = Column(PUUID, ForeignKey('auth.users.id'), nullable = False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    course = relationship("Course", back_populates = "roles")
    # user = relationship("Users")


class CourseUserRole(Base):
    __tablename__ = 'course_user_roles'

    course_role_id = Column(PUUID, ForeignKey('public.course_roles.id', ondelete="CASCADE"), primary_key=True)
    user_id = Column(PUUID, ForeignKey('auth.users.id', ondelete="CASCADE"), primary_key=True)
    assigned_by = Column(PUUID, ForeignKey('auth.users.id', ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course_role = relationship("CourseRole")
    # user = relationship("Users", foreign_keys=[user_id])
    # assigned_by_user = relationship("Users", foreign_keys=[assigned_by])
'''

class PermissionTypeEnum(enum.Enum):
    Self = "Self"
    Others = "Others"

class Permission(Base):
    __tablename__ = 'permissions'

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    area = Column(String(255), nullable=False)  # 'post', 'comment', etc.
    type = Column(Enum(PermissionTypeEnum, native_enum = True), nullable=False)
    access = Column(String(255), nullable=False)  # 'read', 'write', 'delete', etc.
    description = Column(Text)
'''
class CourseRolePermission(Base):
    __tablename__ = 'course_role_permissions'

    course_role_id = Column(PUUID, ForeignKey('public.course_roles.id', ondelete="CASCADE"), primary_key=True)
    permission_id = Column(PUUID, ForeignKey('public.permissions.id', ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course_role = relationship("CourseRole")
    permission = relationship("Permission")
'''

class Tag(Base):
    __tablename__ = 'tags'

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    name = Column(String(255), nullable=False)
    visibility = Column(Enum(VisibilityEnum), nullable=False)
    course_id = Column(PUUID, ForeignKey('public.courses.id', ondelete="CASCADE"))
    parent_tag_id = Column(PUUID, ForeignKey('public.tags.id', ondelete="CASCADE"))
    created_by = Column(PUUID, ForeignKey('auth.users.id', ondelete="SET NULL"))
    properties = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    course = relationship("Course")
    parent_tag = relationship("Tag", remote_side=[id])
    documents = relationship("Document", secondary=document_tags, back_populates="tags")
    posts = relationship("Post", secondary=post_tags, back_populates="tags")
    # user = relationship("Users")

'''
class RoleTagAssociation(Base):
    __tablename__ = 'role_tag_associations'

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    role_id = Column(PUUID, ForeignKey('public.course_roles.id', ondelete="CASCADE"))
    tag_id = Column(PUUID, ForeignKey('public.tags.id', ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course_role = relationship("CourseRole")
    tag = relationship("Tag")
'''