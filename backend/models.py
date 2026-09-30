import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class CustomKeyword(Base):
    __tablename__ = "custom_keywords"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    keyword = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.now)

    # Relasi
    user = relationship("User", back_populates="custom_keywords")

class ActionType(str, enum.Enum):
    hapus = "hapus"
    aman = "aman"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    youtube_channel = Column(String)
    oauth_token = Column(Text) # Enkripsi disarankan saat menyimpan di DB
    created_at = Column(DateTime, default=datetime.now)

    # Relasi
    videos = relationship("Video", back_populates="user", cascade="all, delete-orphan")
    custom_keywords = relationship("CustomKeyword", back_populates="user", cascade="all, delete-orphan")

class Video(Base):
    __tablename__ = "videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    video_id = Column(String, index=True) # ID Video dari YouTube (misal: dQw4w9WgXcQ)
    title = Column(String)
    is_active = Column(Boolean, default=True)
    interval_menit = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.now)

    # Relasi
    user = relationship("User", back_populates="videos")
    comment_logs = relationship("CommentLog", back_populates="video", cascade="all, delete-orphan")

class CommentLog(Base):
    __tablename__ = "comment_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id"))
    comment_text = Column(Text)
    author = Column(String)
    action = Column(Enum(ActionType))
    alasan = Column(String)
    confidence = Column(Float)
    deleted_at = Column(DateTime, default=datetime.now)

    # Relasi
    video = relationship("Video", back_populates="comment_logs")
