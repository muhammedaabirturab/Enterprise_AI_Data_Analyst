"""Cleaning operation endpoints with history and undo."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_owned_dataset
from app.core.database import get_db
from app.models.dataset import Dataset
from app.schemas.dataset import CleaningRequest, CleaningStepOut, ProfileResponse
from app.services import cleaning_service, dataset_service, profiling_service

router = APIRouter(prefix="/api/datasets/{dataset_id}/cleaning", tags=["cleaning"])


@router.get("/history", response_model=list[CleaningStepOut])
def get_history(dataset: Dataset = Depends(get_owned_dataset)) -> list[CleaningStepOut]:
    return [CleaningStepOut.model_validate(s) for s in dataset.cleaning_steps]


@router.post("/apply", response_model=ProfileResponse)
def apply_cleaning(
    payload: CleaningRequest,
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    df = dataset_service.load_dataframe(dataset)
    cleaned = cleaning_service.apply_operation(df, payload.operation, payload.params)
    dataset_service.save_snapshot(db, dataset, cleaned, payload.operation, payload.params)
    return profiling_service.build_profile(cleaned)


@router.post("/undo", response_model=ProfileResponse)
def undo(dataset: Dataset = Depends(get_owned_dataset), db: Session = Depends(get_db)) -> ProfileResponse:
    df = dataset_service.undo_last_step(db, dataset)
    return profiling_service.build_profile(df)


@router.post("/reset", response_model=ProfileResponse)
def reset(dataset: Dataset = Depends(get_owned_dataset), db: Session = Depends(get_db)) -> ProfileResponse:
    df = dataset_service.clear_all_steps(db, dataset)
    return profiling_service.build_profile(df)
