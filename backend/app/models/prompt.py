import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Prompt(Base):
    __tablename__ = "prompts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)

    style: Mapped[str] = mapped_column(String(64))
    intent: Mapped[str] = mapped_column(String(64))
    subject: Mapped[str] = mapped_column(Text)

    layout: Mapped[str] = mapped_column(String(64))
    typography: Mapped[str] = mapped_column(String(64))
    colors: Mapped[str] = mapped_column(String(128))
    spacing: Mapped[str] = mapped_column(String(64))
    aspect_ratio: Mapped[str] = mapped_column(String(16))

    anti_slop_rules: Mapped[list[str]] = mapped_column(JSON, default=list)

    template_key: Mapped[str | None] = mapped_column(String(64), nullable=True)

    raw_prompt: Mapped[str] = mapped_column(Text)
    enhanced_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    images: Mapped[list["Image"]] = relationship(back_populates="prompt", cascade="all, delete-orphan")
