"""AI insight generation and chat endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.ai import insight_engine
from app.api.deps import get_owned_dataset
from app.core.database import get_db
from app.models.dataset import Dataset
from app.schemas.chat import ChatMessageOut, ChatRequest, ChatResponse
from app.services import chat_service, dataset_service

router = APIRouter(prefix="/api/datasets/{dataset_id}/ai", tags=["ai"])


@router.get("/insights")
def get_insights(dataset: Dataset = Depends(get_owned_dataset)) -> dict:
    df = dataset_service.load_dataframe(dataset)
    return insight_engine.full_ai_report(df)


@router.get("/chat/history", response_model=list[ChatMessageOut])
def chat_history(dataset: Dataset = Depends(get_owned_dataset)) -> list[ChatMessageOut]:
    return [ChatMessageOut.model_validate(m) for m in chat_service.get_history(dataset)]


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
) -> ChatResponse:
    df = dataset_service.load_dataframe(dataset)
    reply = chat_service.send_message(db, dataset, df, payload.message)
    history = chat_service.get_history(dataset)
    return ChatResponse(
        reply=ChatMessageOut.model_validate(reply),
        history=[ChatMessageOut.model_validate(m) for m in history],
    )
