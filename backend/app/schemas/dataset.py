"""Dataset, profiling, and cleaning schemas."""
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class DatasetOut(BaseModel):
    id: int
    name: str
    original_filename: str
    file_type: str
    n_rows: int
    n_columns: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PreviewResponse(BaseModel):
    columns: list[str]
    rows: list[dict[str, Any]]
    total_rows: int
    page: int
    page_size: int


class ColumnProfile(BaseModel):
    name: str
    dtype: str
    inferred_type: str
    missing_count: int
    missing_pct: float
    unique_count: int
    mean: float | None = None
    median: float | None = None
    std: float | None = None
    min: float | None = None
    max: float | None = None
    top_values: list[dict[str, Any]] = []


class ProfileResponse(BaseModel):
    n_rows: int
    n_columns: int
    memory_usage_mb: float
    duplicate_rows: int
    missing_cells: int
    missing_pct: float
    quality_score: float
    numeric_columns: int
    categorical_columns: int
    datetime_columns: int
    columns: list[ColumnProfile]


class CleaningRequest(BaseModel):
    operation: str
    params: dict[str, Any] = {}


class CleaningStepOut(BaseModel):
    id: int
    operation: str
    params: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class ChartRequest(BaseModel):
    chart_type: str
    x: str | None = None
    y: str | None = None
    category: str | None = None
    bins: int = 20
