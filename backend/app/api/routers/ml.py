"""Machine-learning recommendation and training endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_owned_dataset
from app.core.database import get_db
from app.models.dataset import Dataset, MLRun
from app.schemas.ml import MLRecommendation, MLRunOut, MLTrainRequest
from app.services import dataset_service, ml_service

router = APIRouter(prefix="/api/datasets/{dataset_id}/ml", tags=["machine-learning"])


@router.get("/recommendations", response_model=list[MLRecommendation])
def recommendations(dataset: Dataset = Depends(get_owned_dataset)) -> list[MLRecommendation]:
    df = dataset_service.load_dataframe(dataset)
    return ml_service.recommend_models(df)


@router.post("/train", response_model=MLRunOut)
def train(
    payload: MLTrainRequest,
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
) -> MLRunOut:
    df = dataset_service.load_dataframe(dataset)
    result = ml_service.run_training(df, payload)

    run = MLRun(
        dataset_id=dataset.id,
        task_type=payload.task_type,
        algorithm=payload.algorithm,
        target_column=payload.target_column,
        feature_columns=payload.feature_columns,
        metrics=result["metrics"],
        artifacts=result["artifacts"],
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return MLRunOut.model_validate(run)


@router.get("/runs", response_model=list[MLRunOut])
def list_runs(dataset: Dataset = Depends(get_owned_dataset)) -> list[MLRunOut]:
    return [MLRunOut.model_validate(r) for r in dataset.ml_runs]
