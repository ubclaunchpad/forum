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


class Profile(Base):
    __tablename__ = "profiles"
    id = Column(
        PUUID, ForeignKey("auth.users.id", ondelete="CASCADE"), primary_key=True
    )
    first_name = Column(Text)
    last_name = Column(Text)
    email = Column(Text)

    # Relationships
    courses = relationship("Course", secondary=user_courses, back_populates="users")
    posts = relationship(
        "Post", back_populates="creator", foreign_keys="[Post.created_by]"
    )
    post_edits = relationship("PostEdit", back_populates="editor")
    documents = relationship("Document", back_populates="creators")


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

    roles = relationship("CourseRoles", back_populates = "course")


class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(PUUID, ForeignKey("public.courses.id", ondelete="CASCADE"))
    title = Column(Text)
    content = Column(Text)
    parent_id = Column(Integer)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(PUUID, ForeignKey("public.profiles.id"), nullable=False)
    embedding = Column(Vector(1536), nullable=True)

    creator = relationship("Profile", back_populates="posts", foreign_keys=[created_by])
    edits = relationship(
        "PostEdit", back_populates="post", cascade="all, delete-orphan"
    )
    events = relationship("UserPostEvent", back_populates="post")


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
    chunks = relationship(
        "Chunk", back_populates="document", cascade="all, delete-orphan"
    )  # Added this relationship

    __table_args__ = (
        CheckConstraint(
            "document_type IN ('application/pdf', 'text/plain', 'text/markdown', 'image/png', 'image/jpeg')",
            name="valid_document_type",
        ),
        CheckConstraint("jsonb_typeof(doc_metadata) = 'object'", name="valid_metadata"),
        {"schema": "public"},
    )


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    document_id = Column(
        PUUID, ForeignKey("public.documents.id", ondelete="CASCADE"), nullable=False
    )
    content = Column(String, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_type = Column(String(50), nullable=True)
    chunk_metadata = Column(JSONB)
    embedding = Column(Vector(1536), nullable=True)
    parent_chunk_id = Column(
        PUUID, ForeignKey("public.chunks.id", ondelete="CASCADE"), nullable=True
    )
    created_at = Column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )

    # Relationships
    document = relationship("Document", back_populates="chunks")
    child_chunks = relationship(
        "Chunk",
        backref=backref("parent_chunk", remote_side=[id]),
        cascade="all, delete-orphan",
    )
    outgoing_relations = relationship(
        "ChunkRelation",
        foreign_keys="ChunkRelation.source_chunk_id",
        back_populates="source_chunk",
        cascade="all, delete-orphan",
    )
    incoming_relations = relationship(
        "ChunkRelation",
        foreign_keys="ChunkRelation.target_chunk_id",
        back_populates="target_chunk",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index(
            "chunks_embedding_idx",
            embedding,
            postgresql_using="ivfflat",
            postgresql_with={"lists": 100},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
        CheckConstraint(
            "chunk_type IN ('text', 'image', 'code')", name="valid_chunk_type"
        ),
        CheckConstraint(
            "jsonb_typeof(chunk_metadata) = 'object'", name="valid_metadata"
        ),
        {"schema": "public"},
    )


class ChunkRelation(Base):
    __tablename__ = "chunk_relations"

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    source_chunk_id = Column(
        PUUID, ForeignKey("public.chunks.id", ondelete="CASCADE"), nullable=False
    )
    target_chunk_id = Column(
        PUUID, ForeignKey("public.chunks.id", ondelete="CASCADE"), nullable=False
    )
    relation_type = Column(String(50), nullable=False)
    properties = Column(JSONB)
    created_at = Column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )

    # Relationships
    source_chunk = relationship(
        "Chunk", foreign_keys=[source_chunk_id], back_populates="outgoing_relations"
    )
    target_chunk = relationship(
        "Chunk", foreign_keys=[target_chunk_id], back_populates="incoming_relations"
    )

    __table_args__ = (
        CheckConstraint(
            "relation_type IN ('contains', 'references', 'similar_to', 'continuation_of')",
            name="valid_relation_type",
        ),
        CheckConstraint("jsonb_typeof(properties) = 'object'", name="valid_metadata"),
        {"schema": "public"},
    )

class VisibilityEnum(enum.Enum):
    public = "public"
    private = "private"
    
class CourseRoles(Base):
    __tablename__ = 'course_roles'

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    course_id = Column(PUUID, ForeignKey('public.courses.id', ondelete = "CASCADE"), nullable = False)
    name = Column(String(255), nullable=False)  # 'owner', 'admin', 'user', 'viewer'
    description = Column(Text)  # Optional description
    visibility = Column(Enum(VisibilityEnum, native_enum = True), nullable=False)
    created_by = Column(PUUID, ForeignKey('auth.users.id'), nullable = False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    course = relationship("Courses", back_populates = "roles")
    user = relationship("Users")

class CourseUserRoles(Base):
    __tablename__ = 'course_user_roles'

    course_role_id = Column(PUUID, ForeignKey('public.course_roles.id', ondelete="CASCADE"), primary_key=True)
    user_id = Column(PUUID, ForeignKey('auth.users.id', ondelete="CASCADE"), primary_key=True)
    assigned_by = Column(PUUID, ForeignKey('auth.users.id', ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course_role = relationship("CourseRoles")
    user = relationship("Users", foreign_keys=[user_id])
    assigned_by_user = relationship("Users", foreign_keys=[assigned_by])

class PermissionTypeEnum(enum.Enum):
    Self = "Self"
    Others = "Others"

class Permissions(Base):
    __tablename__ = 'permissions'

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    area = Column(String(255), nullable=False)  # 'post', 'comment', etc.
    type = Column(Enum(PermissionTypeEnum, native_enum = True), nullable=False)
    access = Column(String(255), nullable=False)  # 'read', 'write', 'delete', etc.
    description = Column(Text)

class CourseRolePermissions(Base):
    __tablename__ = 'course_role_permissions'

    course_role_id = Column(PUUID, ForeignKey('public.course_roles.id', ondelete="CASCADE"), primary_key=True)
    permission_id = Column(PUUID, ForeignKey('public.permissions.id', ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course_role = relationship("CourseRoles")
    permission = relationship("Permissions")

class Tags(Base):
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
    parent_tag = relationship("Tags", remote_side=[id])
    user = relationship("Users")

class RoleTagAssociations(Base):
    __tablename__ = 'role_tag_associations'

    id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
    role_id = Column(PUUID, ForeignKey('public.course_roles.id', ondelete="CASCADE"))
    tag_id = Column(PUUID, ForeignKey('public.tags.id', ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course_role = relationship("CourseRoles")
    tag = relationship("Tags")