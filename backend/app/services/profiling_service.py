"""Statistical profiling: dtypes, missingness, duplicates, correlation, quality score."""
import numpy as np
import pandas as pd

from app.schemas.dataset import ColumnProfile, ProfileResponse


def _infer_semantic_type(series: pd.Series) -> str:
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    if pd.api.types.is_bool_dtype(series):
        return "boolean"
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    if series.nunique(dropna=True) <= max(20, int(len(series) * 0.05)):
        return "categorical"
    return "text"


def build_profile(df: pd.DataFrame) -> ProfileResponse:
    n_rows, n_columns = df.shape
    memory_usage_mb = float(df.memory_usage(deep=True).sum()) / (1024 * 1024)
    duplicate_rows = int(df.duplicated().sum())
    missing_cells = int(df.isna().sum().sum())
    total_cells = max(n_rows * n_columns, 1)
    missing_pct = round(missing_cells / total_cells * 100, 2)

    columns: list[ColumnProfile] = []
    numeric_columns = categorical_columns = datetime_columns = 0

    for col in df.columns:
        series = df[col]
        semantic = _infer_semantic_type(series)
        if semantic == "numeric":
            numeric_columns += 1
        elif semantic == "datetime":
            datetime_columns += 1
        else:
            categorical_columns += 1

        missing_count = int(series.isna().sum())
        profile = ColumnProfile(
            name=col,
            dtype=str(series.dtype),
            inferred_type=semantic,
            missing_count=missing_count,
            missing_pct=round(missing_count / max(n_rows, 1) * 100, 2),
            unique_count=int(series.nunique(dropna=True)),
        )

        if semantic == "numeric":
            numeric = pd.to_numeric(series, errors="coerce")
            profile.mean = _safe_float(numeric.mean())
            profile.median = _safe_float(numeric.median())
            profile.std = _safe_float(numeric.std())
            profile.min = _safe_float(numeric.min())
            profile.max = _safe_float(numeric.max())
        else:
            counts = series.value_counts(dropna=True).head(5)
            profile.top_values = [{"value": str(k), "count": int(v)} for k, v in counts.items()]

        columns.append(profile)

    completeness = 1 - (missing_cells / total_cells)
    uniqueness = 1 - (duplicate_rows / max(n_rows, 1))
    quality_score = round(max(0.0, min(1.0, (completeness * 0.7 + uniqueness * 0.3))) * 100, 1)

    return ProfileResponse(
        n_rows=n_rows,
        n_columns=n_columns,
        memory_usage_mb=round(memory_usage_mb, 3),
        duplicate_rows=duplicate_rows,
        missing_cells=missing_cells,
        missing_pct=missing_pct,
        quality_score=quality_score,
        numeric_columns=numeric_columns,
        categorical_columns=categorical_columns,
        datetime_columns=datetime_columns,
        columns=columns,
    )


def _safe_float(value) -> float | None:
    if value is None or (isinstance(value, float) and (np.isnan(value) or np.isinf(value))):
        return None
    return float(value)


def correlation_matrix(df: pd.DataFrame) -> dict:
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 2:
        return {"columns": list(numeric_df.columns), "matrix": []}
    corr = numeric_df.corr(numeric_only=True).round(4)
    corr = corr.replace({np.nan: None})
    return {"columns": list(corr.columns), "matrix": corr.values.tolist()}


def null_heatmap(df: pd.DataFrame) -> dict:
    sample = df.head(200)
    return {
        "columns": list(sample.columns),
        "matrix": sample.isna().astype(int).values.tolist(),
    }


def detect_outliers(df: pd.DataFrame, column: str) -> dict:
    series = pd.to_numeric(df[column], errors="coerce").dropna()
    if series.empty:
        return {"column": column, "outliers": [], "lower_bound": None, "upper_bound": None}
    q1, q3 = series.quantile(0.25), series.quantile(0.75)
    iqr = q3 - q1
    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    outliers = series[(series < lower) | (series > upper)]
    return {
        "column": column,
        "outlier_count": int(outliers.shape[0]),
        "outlier_pct": round(float(outliers.shape[0]) / len(series) * 100, 2),
        "lower_bound": _safe_float(lower),
        "upper_bound": _safe_float(upper),
        "sample_values": [_safe_float(v) for v in outliers.head(20).tolist()],
    }
