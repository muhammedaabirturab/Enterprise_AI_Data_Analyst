"""Dataset upload, listing, preview, and profiling endpoints."""
import math

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_owned_dataset
from app.core.database import get_db
from app.models.dataset import Dataset
from app.models.user import User
from app.schemas.dataset import DatasetOut, PreviewResponse, ProfileResponse
from app.services import dataset_service, profiling_service

router = APIRouter(prefix="/api/datasets", tags=["datasets"])


@router.post("/upload", response_model=DatasetOut, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DatasetOut:
    raw_bytes = await file.read()
    dataset = dataset_service.create_dataset(db, user, file, raw_bytes)
    return DatasetOut.model_validate(dataset)


@router.get("", response_model=list[DatasetOut])
def list_datasets(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[DatasetOut]:
    datasets = db.query(Dataset).filter(Dataset.owner_id == user.id).order_by(Dataset.created_at.desc()).all()
    return [DatasetOut.model_validate(d) for d in datasets]


@router.get("/{dataset_id}", response_model=DatasetOut)
def get_dataset(dataset: Dataset = Depends(get_owned_dataset)) -> DatasetOut:
    return DatasetOut.model_validate(dataset)


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
) -> None:
    dataset_service.delete_dataset_files(dataset)
    db.delete(dataset)
    db.commit()


@router.post("/{dataset_id}/replace", response_model=DatasetOut)
async def replace_dataset(
    file: UploadFile,
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DatasetOut:
    dataset_service.delete_dataset_files(dataset)
    db.delete(dataset)
    db.commit()
    raw_bytes = await file.read()
    new_dataset = dataset_service.create_dataset(db, user, file, raw_bytes)
    return DatasetOut.model_validate(new_dataset)


@router.get("/{dataset_id}/preview", response_model=PreviewResponse)
def preview_dataset(
    dataset: Dataset = Depends(get_owned_dataset),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=500),
    search: str = Query("", alias="search"),
    sort_by: str | None = None,
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
) -> PreviewResponse:
    df = dataset_service.load_dataframe(dataset)

    if search:
        mask = df.astype(str).apply(lambda row: row.str.contains(search, case=False, na=False)).any(axis=1)
        df = df[mask]

    if sort_by and sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=(sort_dir == "asc"), na_position="last")

    total_rows = len(df)
    start = (page - 1) * page_size
    end = start + page_size
    page_df = df.iloc[start:end].copy()

    page_df = page_df.where(page_df.notna(), None)
    rows = page_df.to_dict(orient="records")
    rows = [{k: _jsonify(v) for k, v in row.items()} for row in rows]

    return PreviewResponse(
        columns=list(df.columns),
        rows=rows,
        total_rows=total_rows,
        page=page,
        page_size=page_size,
    )


def _jsonify(value):
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, (int, float, str, bool)):
        return value
    return str(value)


@router.get("/{dataset_id}/profile", response_model=ProfileResponse)
def profile_dataset(dataset: Dataset = Depends(get_owned_dataset)) -> ProfileResponse:
    df = dataset_service.load_dataframe(dataset)
    return profiling_service.build_profile(df)


@router.get("/{dataset_id}/correlation")
def correlation(dataset: Dataset = Depends(get_owned_dataset)) -> dict:
    df = dataset_service.load_dataframe(dataset)
    return profiling_service.correlation_matrix(df)


@router.get("/{dataset_id}/null-heatmap")
def null_heatmap(dataset: Dataset = Depends(get_owned_dataset)) -> dict:
    df = dataset_service.load_dataframe(dataset)
    return profiling_service.null_heatmap(df)


@router.get("/{dataset_id}/outliers/{column}")
def outliers(column: str, dataset: Dataset = Depends(get_owned_dataset)) -> dict:
    df = dataset_service.load_dataframe(dataset)
    if column not in df.columns:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    return profiling_service.detect_outliers(df, column)
