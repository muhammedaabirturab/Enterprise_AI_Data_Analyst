"""AI chat schemas."""
from datetime import datetime

from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    reply: ChatMessageOut
    history: list[ChatMessageOut]
