import uuid
from datetime import UTC, datetime
from enum import StrEnum

from sqlmodel import JSON, Column, Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(UTC)


def short_id() -> str:
    return uuid.uuid4().hex[:12]


class AnalysisStatus(StrEnum):
    queued = "queued"
    processing = "processing"
    done = "done"
    failed = "failed"


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=utc_now)


class Analysis(SQLModel, table=True):
    id: str = Field(default_factory=short_id, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    name: str
    original_filename: str
    video_path: str
    duration_s: float | None = None
    status: AnalysisStatus = AnalysisStatus.queued
    progress: int = 0
    error: str | None = None
    result: dict | None = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=utc_now)
