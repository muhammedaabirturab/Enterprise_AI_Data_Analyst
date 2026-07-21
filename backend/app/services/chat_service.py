"""Persists AI chat conversation history per dataset."""
import pandas as pd
from sqlalchemy.orm import Session

from app.ai.nlu_chat import answer
from app.models.dataset import ChatMessage, Dataset


def send_message(db: Session, dataset: Dataset, df: pd.DataFrame, message: str) -> ChatMessage:
    user_msg = ChatMessage(dataset_id=dataset.id, role="user", content=message)
    db.add(user_msg)
    db.commit()

    reply_text = answer(df, message)
    assistant_msg = ChatMessage(dataset_id=dataset.id, role="assistant", content=reply_text)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg


def get_history(dataset: Dataset) -> list[ChatMessage]:
    return list(dataset.chat_messages)
