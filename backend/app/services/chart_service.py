"""Produces chart-ready JSON payloads (consumed by Recharts on the frontend)."""
import numpy as np
import pandas as pd
from fastapi import HTTPException, status


def _clean_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce").dropna()


def _require_numeric(series: pd.Series, column: str) -> pd.Series:
    if series.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{column}' has no numeric values to chart. Choose a numeric column instead.",
        )
    return series


def histogram(df: pd.DataFrame, column: str, bins: int = 20) -> dict:
    series = _require_numeric(_clean_numeric(df[column]), column)
    counts, edges = np.histogram(series, bins=bins)
    data = [
        {"bin": f"{edges[i]:.2f} - {edges[i + 1]:.2f}", "count": int(counts[i]), "binStart": float(edges[i])}
        for i in range(len(counts))
    ]
    return {"chart_type": "histogram", "column": column, "data": data}


def boxplot(df: pd.DataFrame, column: str) -> dict:
    series = _require_numeric(_clean_numeric(df[column]), column)
    q1, q2, q3 = series.quantile([0.25, 0.5, 0.75])
    iqr = q3 - q1
    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    outliers = series[(series < lower) | (series > upper)].tolist()
    return {
        "chart_type": "boxplot",
        "column": column,
        "data": {
            "min": float(series.min()),
            "q1": float(q1),
            "median": float(q2),
            "q3": float(q3),
            "max": float(series.max()),
            "lower_whisker": float(max(series.min(), lower)),
            "upper_whisker": float(min(series.max(), upper)),
            "outliers": outliers[:50],
        },
    }


def scatter(df: pd.DataFrame, x: str, y: str) -> dict:
    subset = df[[x, y]].apply(pd.to_numeric, errors="coerce").dropna()
    if subset.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No overlapping numeric values between '{x}' and '{y}' to plot.",
        )
    points = subset.head(2000).rename(columns={x: "x", y: "y"}).to_dict(orient="records")
    return {"chart_type": "scatter", "x": x, "y": y, "data": points}


def pie(df: pd.DataFrame, column: str, limit: int = 12) -> dict:
    counts = df[column].astype(str).value_counts().head(limit)
    data = [{"name": k, "value": int(v)} for k, v in counts.items()]
    return {"chart_type": "pie", "column": column, "data": data}


def bar(df: pd.DataFrame, category: str, value: str | None = None, limit: int = 20) -> dict:
    if value and value in df.columns:
        numeric = pd.to_numeric(df[value], errors="coerce")
        grouped = df.assign(_v=numeric).groupby(category)["_v"].sum().sort_values(ascending=False).head(limit)
        data = [{"name": str(k), "value": _safe(v)} for k, v in grouped.items()]
    else:
        counts = df[category].astype(str).value_counts().head(limit)
        data = [{"name": k, "value": int(v)} for k, v in counts.items()]
    return {"chart_type": "bar", "category": category, "value": value, "data": data}


def line(df: pd.DataFrame, x: str, y: str) -> dict:
    subset = df[[x, y]].copy()
    subset[y] = pd.to_numeric(subset[y], errors="coerce")
    subset = subset.dropna().sort_values(by=x).head(2000)
    data = [{"x": _to_jsonable(row[x]), "y": _safe(row[y])} for _, row in subset.iterrows()]
    return {"chart_type": "line", "x": x, "y": y, "data": data}


def area(df: pd.DataFrame, x: str, y: str) -> dict:
    result = line(df, x, y)
    result["chart_type"] = "area"
    return result


def distribution(df: pd.DataFrame, column: str) -> dict:
    series = _require_numeric(_clean_numeric(df[column]), column)
    return {
        "chart_type": "distribution",
        "column": column,
        "data": {
            "mean": float(series.mean()),
            "std": float(series.std()) if len(series) > 1 else 0.0,
            "skew": float(series.skew()) if len(series) > 2 else 0.0,
            "kurtosis": float(series.kurtosis()) if len(series) > 3 else 0.0,
            "values": series.head(500).tolist(),
        },
    }


def build_chart(df: pd.DataFrame, chart_type: str, x, y, category, bins) -> dict:
    handlers = {
        "histogram": lambda: histogram(df, x or category, bins),
        "boxplot": lambda: boxplot(df, x or category),
        "scatter": lambda: scatter(df, x, y),
        "pie": lambda: pie(df, category or x),
        "bar": lambda: bar(df, category or x, y),
        "line": lambda: line(df, x, y),
        "area": lambda: area(df, x, y),
        "distribution": lambda: distribution(df, x or category),
    }
    if chart_type not in handlers:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported chart type: {chart_type}")
    for col in (x, y, category):
        if col and col not in df.columns:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Column not found: {col}")
    return handlers[chart_type]()


def _safe(value) -> float:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return 0.0
    return float(value)


def _to_jsonable(value):
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)
