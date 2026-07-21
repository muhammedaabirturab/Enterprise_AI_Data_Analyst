"""Dataset persistence: upload ingestion, dataframe snapshot load/save, and I/O helpers.

Each dataset keeps its original uploaded file plus a "current" pickled dataframe snapshot
that reflects the latest cleaning state. Cleaning steps write new snapshots so cleaning can
be undone by discarding the most recent snapshot and reloading the previous one.
"""
import shutil
import uuid
from pathlib import Path

import pandas as pd
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.dataset import CleaningStep, Dataset
from app.models.user import User
from app.utils.file_validation import sanitize_column_name, validate_upload


def _dataset_dir(dataset_id: int | str) -> Path:
    path = settings.datasets_path / str(dataset_id)
    path.mkdir(parents=True, exist_ok=True)
    return path


CSV_ENCODING_FALLBACKS = ["utf-8", "utf-8-sig", "cp1252", "latin1"]


def _read_csv_with_fallback(raw_bytes: bytes) -> pd.DataFrame:
    import io

    last_error: Exception | None = None
    for encoding in CSV_ENCODING_FALLBACKS:
        try:
            return pd.read_csv(io.BytesIO(raw_bytes), encoding=encoding)
        except UnicodeDecodeError as exc:
            last_error = exc
            continue
    # latin1 maps every byte to a character, so this should be unreachable in practice.
    raise last_error  # type: ignore[misc]


def read_dataframe_from_upload(raw_bytes: bytes, file_type: str) -> pd.DataFrame:
    import io

    try:
        if file_type == "csv":
            df = _read_csv_with_fallback(raw_bytes)
        else:
            df = pd.read_excel(io.BytesIO(raw_bytes))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not parse file: {exc}"
        ) from exc

    if df.empty:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dataset contains no rows.")

    df.columns = [sanitize_column_name(c) for c in df.columns]
    return df


def create_dataset(db: Session, user: User, file: UploadFile, raw_bytes: bytes) -> Dataset:
    file_type = validate_upload(file, len(raw_bytes))
    df = read_dataframe_from_upload(raw_bytes, file_type)

    temp_id = uuid.uuid4().hex
    dataset = Dataset(
        owner_id=user.id,
        name=file.filename.rsplit(".", 1)[0],
        original_filename=file.filename,
        file_type=file_type,
        storage_path="",
        n_rows=len(df),
        n_columns=len(df.columns),
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    ds_dir = _dataset_dir(dataset.id)
    original_path = ds_dir / f"original.{('csv' if file_type == 'csv' else 'xlsx')}"
    original_path.write_bytes(raw_bytes)

    current_path = ds_dir / "current.pkl"
    df.to_pickle(current_path)

    dataset.storage_path = str(current_path)
    db.commit()
    db.refresh(dataset)
    return dataset


def load_dataframe(dataset: Dataset) -> pd.DataFrame:
    path = Path(dataset.storage_path)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset snapshot missing on disk.")
    return pd.read_pickle(path)


def save_snapshot(db: Session, dataset: Dataset, df: pd.DataFrame, operation: str, params: dict) -> CleaningStep:
    ds_dir = _dataset_dir(dataset.id)
    step_count = len(dataset.cleaning_steps)
    snapshot_path = ds_dir / f"step_{step_count + 1}_{uuid.uuid4().hex[:8]}.pkl"
    df.to_pickle(snapshot_path)

    step = CleaningStep(
        dataset_id=dataset.id,
        operation=operation,
        params=params,
        snapshot_path=str(snapshot_path),
    )
    db.add(step)

    current_path = Path(dataset.storage_path)
    df.to_pickle(current_path)

    dataset.n_rows = len(df)
    dataset.n_columns = len(df.columns)
    db.commit()
    db.refresh(step)
    return step


def undo_last_step(db: Session, dataset: Dataset) -> pd.DataFrame:
    if not dataset.cleaning_steps:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No cleaning steps to undo.")

    last_step = dataset.cleaning_steps[-1]
    remaining_steps = dataset.cleaning_steps[:-1]

    if remaining_steps:
        restore_path = Path(remaining_steps[-1].snapshot_path)
        df = pd.read_pickle(restore_path)
    else:
        ds_dir = _dataset_dir(dataset.id)
        ext = "csv" if dataset.file_type == "csv" else "xlsx"
        original_path = ds_dir / f"original.{ext}"
        raw_bytes = original_path.read_bytes()
        df = read_dataframe_from_upload(raw_bytes, dataset.file_type)

    Path(last_step.snapshot_path).unlink(missing_ok=True)
    db.delete(last_step)

    current_path = Path(dataset.storage_path)
    df.to_pickle(current_path)
    dataset.n_rows = len(df)
    dataset.n_columns = len(df.columns)
    db.commit()
    return df


def delete_dataset_files(dataset: Dataset) -> None:
    ds_dir = _dataset_dir(dataset.id)
    shutil.rmtree(ds_dir, ignore_errors=True)


def clear_all_steps(db: Session, dataset: Dataset) -> pd.DataFrame:
    ds_dir = _dataset_dir(dataset.id)
    ext = "csv" if dataset.file_type == "csv" else "xlsx"
    original_path = ds_dir / f"original.{ext}"
    raw_bytes = original_path.read_bytes()
    df = read_dataframe_from_upload(raw_bytes, dataset.file_type)

    for step in list(dataset.cleaning_steps):
        Path(step.snapshot_path).unlink(missing_ok=True)
        db.delete(step)

    current_path = Path(dataset.storage_path)
    df.to_pickle(current_path)
    dataset.n_rows = len(df)
    dataset.n_columns = len(df.columns)
    db.commit()
    return df
