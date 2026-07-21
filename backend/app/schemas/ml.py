"""Machine-learning request/response schemas."""
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class MLRecommendation(BaseModel):
    task_type: str
    algorithm: str
    reason: str
    target_column: str | None = None
    suitability_score: float


class MLTrainRequest(BaseModel):
    task_type: str
    algorithm: str
    target_column: str | None = None
    feature_columns: list[str] = []
    n_clusters: int = 3
    test_size: float = 0.2
    date_column: str | None = None
    forecast_periods: int = 12


class MLRunOut(BaseModel):
    id: int
    task_type: str
    algorithm: str
    target_column: str | None
    feature_columns: list[str]
    metrics: dict[str, Any]
    artifacts: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
