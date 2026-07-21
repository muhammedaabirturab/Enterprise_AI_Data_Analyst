"""Dataset, cleaning-history, ML run, and chat-message models."""
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(10), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    n_rows: Mapped[int] = mapped_column(Integer, default=0)
    n_columns: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    owner = relationship("User", back_populates="datasets")
    cleaning_steps = relationship(
        "CleaningStep", back_populates="dataset", cascade="all, delete-orphan", order_by="CleaningStep.id"
    )
    chat_messages = relationship(
        "ChatMessage", back_populates="dataset", cascade="all, delete-orphan", order_by="ChatMessage.id"
    )
    ml_runs = relationship("MLRun", back_populates="dataset", cascade="all, delete-orphan", order_by="MLRun.id")


class CleaningStep(Base):
    __tablename__ = "cleaning_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.id"), nullable=False)
    operation: Mapped[str] = mapped_column(String(100), nullable=False)
    params: Mapped[dict] = mapped_column(JSON, default=dict)
    snapshot_path: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    dataset = relationship("Dataset", back_populates="cleaning_steps")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.id"), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    dataset = relationship("Dataset", back_populates="chat_messages")


class MLRun(Base):
    __tablename__ = "ml_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.id"), nullable=False)
    task_type: Mapped[str] = mapped_column(String(50), nullable=False)
    algorithm: Mapped[str] = mapped_column(String(100), nullable=False)
    target_column: Mapped[str] = mapped_column(String(255), nullable=True)
    feature_columns: Mapped[list] = mapped_column(JSON, default=list)
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)
    artifacts: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    dataset = relationship("Dataset", back_populates="ml_runs")
