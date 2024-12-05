import enum
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy import (DDL, Boolean, CheckConstraint, Column, Date, DateTime,
                        Enum, ForeignKey, ForeignKeyConstraint, Index, Integer,
                        String, Table, Text, UniqueConstraint, event, text)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PUUID
from sqlalchemy.orm import (backref, declarative_base, declared_attr,
                            relationship)
from sqlalchemy.sql import func
from sqlalchemy.types import VARCHAR, TypeDecorator


# Define base class with schema setting
class CustomBase:
   @declared_attr
   def __tablename__(cls):
       return cls.__name__.lower()

   @declared_attr
   def __table_args__(cls):
       return {'schema': 'public'}

Base = declarative_base(cls=CustomBase)

# Setup extensions
event.listen(
   Base.metadata,
   'before_create',
   DDL('CREATE EXTENSION IF NOT EXISTS uuid-ossp')
)

event.listen(
   Base.metadata,
   'before_create',
   DDL('CREATE EXTENSION IF NOT EXISTS vector')
)

event.listen(
   Base.metadata,
   'before_create',
   DDL('CREATE EXTENSION IF NOT EXISTS pg_cron')
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
   'users',
   Base.metadata,
   Column('id', PUUID, primary_key=True),
   schema='auth',
   keep_existing=True
)

# Define association table
user_courses = Table(
   'user_courses',
   Base.metadata,
   Column('user_id', PUUID, ForeignKey('public.profiles.id', ondelete="CASCADE"), primary_key=True),
   Column('course_id', PUUID, ForeignKey('public.courses.id', ondelete="CASCADE"), primary_key=True),
   schema='public'
)

class Profile(Base):
   __tablename__ = "profiles"
   id = Column(PUUID, ForeignKey("auth.users.id", ondelete="CASCADE"), primary_key=True)
   first_name = Column(Text)
   last_name = Column(Text)
   email = Column(Text)

   # Relationships
   courses = relationship("Course", secondary=user_courses, back_populates="users")

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

   __table_args__ = (
       UniqueConstraint('c_group', 'code', 'section'),
       {'schema': 'public'}
   )


# import enum
# from datetime import date, datetime
# from typing import List, Optional
# from uuid import UUID

# from sqlalchemy import (DDL, Boolean, CheckConstraint, Column, Date, DateTime,
#                         Enum, ForeignKey, ForeignKeyConstraint, Index, Integer,
#                         String, Table, Text, UniqueConstraint, event, text)
# from sqlalchemy.dialects.postgresql import JSONB
# from sqlalchemy.dialects.postgresql import UUID as PUUID
# from sqlalchemy.orm import (backref, declarative_base, declared_attr,
#                             relationship)
# from sqlalchemy.sql import func
# from sqlalchemy.types import VARCHAR, TypeDecorator


# # Define base class with schema setting
# class CustomBase:
#     @declared_attr
#     def __tablename__(cls):
#         return cls.__name__.lower()

#     @declared_attr
#     def __table_args__(cls):
#         return {'schema': 'public'}

# Base = declarative_base(cls=CustomBase)

# # Setup extensions
# event.listen(
#     Base.metadata,
#     'before_create',
#     DDL('CREATE EXTENSION IF NOT EXISTS uuid-ossp')  # Added this extension
# )

# event.listen(
#     Base.metadata,
#     'before_create',
#     DDL('CREATE EXTENSION IF NOT EXISTS vector')
# )

# event.listen(
#     Base.metadata,
#     'before_create',
#     DDL('CREATE EXTENSION IF NOT EXISTS pg_cron')
# )

# # Create VECTOR type
# class VECTOR(TypeDecorator):
#     impl = VARCHAR
#     cache_ok = True
    
#     def __init__(self, dim):
#         super().__init__()
#         self.dim = dim

# # Create auth.users table reference
# users = Table(
#     'users',
#     Base.metadata,
#     Column('id', PUUID, primary_key=True),
#     schema='auth',
#     keep_existing=True
# )

# # Define association tables first
# course_documents = Table(
#     'course_documents',
#     Base.metadata,
#     Column('course_id', PUUID, ForeignKey('public.courses.id', ondelete="CASCADE"), primary_key=True),
#     Column('document_id', PUUID, ForeignKey('public.documents.id', ondelete="CASCADE"), primary_key=True),
#     schema='public'
# )

# class Profile(Base):
#     __tablename__ = "profiles"
#     id = Column(PUUID, ForeignKey("auth.users.id", ondelete="CASCADE"), primary_key=True)
#     first_name = Column(Text)
#     last_name = Column(Text)
#     email = Column(Text)

#     # Relationships
#     posts = relationship("Post", back_populates="creator", foreign_keys="[Post.created_by]")
#     post_edits = relationship("PostEdit", back_populates="editor")
#     user_courses = relationship("UserCourse", back_populates="user")
#     # Convenience relationship
#     courses = relationship("Course", secondary="public.user_courses", viewonly=True)

# class UserCourse(Base):
#     __tablename__ = "user_courses"
#     user_id = Column(PUUID, ForeignKey("public.profiles.id", ondelete="CASCADE"), primary_key=True)
#     course_id = Column(PUUID, ForeignKey("public.courses.id", ondelete="CASCADE"), primary_key=True)
#     joined_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

#     # Relationships
#     user = relationship("Profile", back_populates="user_courses")
#     course = relationship("Course", back_populates="user_courses")

# class Course(Base):
#     __tablename__ = "courses"
#     id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)
#     c_group = Column(Text, nullable=False)
#     code = Column(Text, nullable=False)
#     section = Column(Text, nullable=False)
#     name = Column(Text)
#     config = Column(JSONB)
#     start_date = Column(Date, server_default=text("CURRENT_DATE"))
#     end_date = Column(Date)

#     # Relationships
#     documents = relationship("Document", 
#                            secondary="public.course_documents", 
#                            back_populates="courses")
#     user_courses = relationship("UserCourse", back_populates="course")
#     # Convenience relationship
#     users = relationship("Profile", secondary="public.user_courses", viewonly=True)

#     __table_args__ = (
#         UniqueConstraint('c_group', 'code', 'section'),
#         {'schema': 'public'}
#     )
    
    
# # class Document(Base):
# #     __tablename__ = "documents"
# #     id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)  # Changed to gen_random_uuid()
# #     title = Column(String(255), nullable=False)
# #     created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), nullable=False)
# #     updated_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), nullable=False)
# #     status = Column(String(50), server_default="active", nullable=False)
# #     document_type = Column(String(50), nullable=False)
# #     doc_metadata = Column(JSONB)

# #     # Relationships
# #     courses = relationship("Course", secondary=course_documents, back_populates="documents")

# #     __table_args__ = (
# #         CheckConstraint(
# #             "document_type IN ('application/pdf', 'text/plain', 'text/markdown', 'image/png', 'image/jpeg')",
# #             name="valid_document_type"
# #         ),
# #         CheckConstraint(
# #             "jsonb_typeof(doc_metadata) = 'object'",
# #             name="valid_metadata"
# #         ),
# #         Index('idx_documents_updated_at', 'updated_at'),
# #         Index('documents_status_idx', 'status'),
# #         {'schema': 'public'}
# #     )

# class Post(Base):
#     __tablename__ = "posts"
#     id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)  # Changed to gen_random_uuid()
#     course_id = Column(PUUID, ForeignKey("public.courses.id", ondelete="CASCADE"))
#     title = Column(Text)
#     content = Column(Text)
#     parent_id = Column(PUUID)
#     status = Column(Enum(PostStatus))
#     applied_at = Column(DateTime(timezone=True), server_default=func.now())
#     created_by = Column(PUUID, ForeignKey("public.profiles.id"), nullable=False)

#     # Relationships
#     creator = relationship("Profile", back_populates="posts", foreign_keys=[created_by])
#     edits = relationship("PostEdit", back_populates="post", cascade="all, delete-orphan")
#     events = relationship("UserPostEvent", back_populates="post")

# class PostEdit(Base):
#     __tablename__ = "post_edits"
#     id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)  # Changed to gen_random_uuid()
#     post_id = Column(PUUID, ForeignKey("public.posts.id", ondelete="CASCADE"), nullable=False)
#     edited_by = Column(PUUID, ForeignKey("public.profiles.id"), nullable=False)
#     previous_content = Column(Text)
#     new_content = Column(Text)
#     edit_reason = Column(Text)
#     applied_at = Column(DateTime(timezone=True), server_default=func.now())

#     # Relationships
#     post = relationship("Post", back_populates="edits")
#     editor = relationship("Profile", back_populates="post_edits")

# class UserPostEvent(Base):
#     __tablename__ = "user_post_events"
#     id = Column(PUUID, server_default=text("gen_random_uuid()"), primary_key=True)  # Changed to gen_random_uuid()
#     viewed = Column(Boolean)
#     liked = Column(Boolean)
#     user_id = Column(PUUID, ForeignKey("public.profiles.id"), nullable=False)
#     post_id = Column(PUUID, ForeignKey("public.posts.id", ondelete="CASCADE"), nullable=False)

#     # Relationships
#     post = relationship("Post", back_populates="events")