"""Model recommendation and training for regression, classification, clustering,
anomaly detection, and time-series forecasting."""
import numpy as np
import pandas as pd
from fastapi import HTTPException, status
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest, RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
    roc_auc_score,
    roc_curve,
    silhouette_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

from app.schemas.ml import MLRecommendation, MLTrainRequest

REGRESSION_MODELS = {
    "linear_regression": LinearRegression,
    "random_forest_regressor": lambda: RandomForestRegressor(n_estimators=200, random_state=42),
    "decision_tree_regressor": lambda: DecisionTreeRegressor(random_state=42),
}

CLASSIFICATION_MODELS = {
    "logistic_regression": lambda: LogisticRegression(max_iter=1000),
    "random_forest_classifier": lambda: RandomForestClassifier(n_estimators=200, random_state=42),
    "decision_tree_classifier": lambda: DecisionTreeClassifier(random_state=42),
    "svm_classifier": lambda: SVC(probability=True, random_state=42),
}


def recommend_models(df: pd.DataFrame) -> list[MLRecommendation]:
    recommendations: list[MLRecommendation] = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = [c for c in df.columns if c not in numeric_cols]
    n_rows = len(df)

    for col in numeric_cols:
        nunique = df[col].nunique(dropna=True)
        if nunique > max(10, n_rows * 0.05):
            recommendations.append(
                MLRecommendation(
                    task_type="regression",
                    algorithm="random_forest_regressor",
                    target_column=col,
                    reason=f"'{col}' is continuous numeric with {nunique} unique values — well suited to regression.",
                    suitability_score=round(min(1.0, nunique / max(n_rows, 1)) * 0.6 + 0.3, 2),
                )
            )
            break

    for col in df.columns:
        nunique = df[col].nunique(dropna=True)
        if 2 <= nunique <= 20 and (col in categorical_cols or nunique <= 10):
            recommendations.append(
                MLRecommendation(
                    task_type="classification",
                    algorithm="random_forest_classifier",
                    target_column=col,
                    reason=f"'{col}' has {nunique} distinct classes — a strong classification target.",
                    suitability_score=0.85 if nunique == 2 else 0.7,
                )
            )
            break

    if len(numeric_cols) >= 2:
        recommendations.append(
            MLRecommendation(
                task_type="clustering",
                algorithm="kmeans",
                target_column=None,
                reason=f"{len(numeric_cols)} numeric columns can reveal natural groupings via K-Means clustering.",
                suitability_score=0.6,
            )
        )
        recommendations.append(
            MLRecommendation(
                task_type="anomaly_detection",
                algorithm="isolation_forest",
                target_column=None,
                reason="Numeric feature space is suitable for unsupervised anomaly / outlier detection.",
                suitability_score=0.55,
            )
        )

    datetime_cols = [c for c in df.columns if pd.api.types.is_datetime64_any_dtype(df[c])]
    if not datetime_cols:
        for c in df.columns:
            try:
                parsed = pd.to_datetime(df[c], errors="coerce")
                if parsed.notna().mean() > 0.8:
                    datetime_cols.append(c)
                    break
            except Exception:  # noqa: BLE001
                continue
    if datetime_cols and numeric_cols:
        recommendations.append(
            MLRecommendation(
                task_type="time_series",
                algorithm="trend_forecast",
                target_column=numeric_cols[0],
                reason=f"'{datetime_cols[0]}' looks like a date column paired with numeric metrics — good for forecasting.",
                suitability_score=0.65,
            )
        )

    if not recommendations:
        recommendations.append(
            MLRecommendation(
                task_type="clustering",
                algorithm="kmeans",
                target_column=None,
                reason="Dataset lacks a clear target; unsupervised clustering is a safe starting point.",
                suitability_score=0.4,
            )
        )

    return sorted(recommendations, key=lambda r: r.suitability_score, reverse=True)


def _prepare_features(df: pd.DataFrame, feature_columns: list[str]) -> pd.DataFrame:
    X = df[feature_columns].copy()
    for col in X.columns:
        if not pd.api.types.is_numeric_dtype(X[col]):
            X[col] = LabelEncoder().fit_transform(X[col].astype(str))
        X[col] = pd.to_numeric(X[col], errors="coerce")
    X = X.fillna(X.mean(numeric_only=True)).fillna(0)
    return X


def train_regression(df: pd.DataFrame, req: MLTrainRequest) -> dict:
    target = req.target_column
    features = req.feature_columns or [c for c in df.columns if c != target]
    y = pd.to_numeric(df[target], errors="coerce")
    X = _prepare_features(df, features)
    valid = y.notna()
    X, y = X[valid], y[valid]

    if len(X) < 10:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough rows to train a model (need >= 10).")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=req.test_size, random_state=42)
    model_factory = REGRESSION_MODELS.get(req.algorithm)
    if not model_factory:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown regression algorithm: {req.algorithm}")
    model = model_factory() if callable(model_factory) else model_factory()
    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    metrics = {
        "r2_score": round(float(r2_score(y_test, preds)), 4),
        "mae": round(float(mean_absolute_error(y_test, preds)), 4),
        "rmse": round(float(np.sqrt(mean_squared_error(y_test, preds))), 4),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
    }

    feature_importance = _feature_importance(model, features)
    predictions_sample = [
        {"actual": _safe(a), "predicted": _safe(p)} for a, p in list(zip(y_test.tolist(), preds.tolist()))[:50]
    ]

    return {
        "metrics": metrics,
        "artifacts": {"feature_importance": feature_importance, "predictions_sample": predictions_sample},
    }


def train_classification(df: pd.DataFrame, req: MLTrainRequest) -> dict:
    target = req.target_column
    features = req.feature_columns or [c for c in df.columns if c != target]
    y_raw = df[target].astype(str)
    encoder = LabelEncoder()
    y = encoder.fit_transform(y_raw)
    X = _prepare_features(df, features)

    if len(X) < 10:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough rows to train a model (need >= 10).")

    stratify = y if len(set(y)) > 1 and min(np.bincount(y)) >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=req.test_size, random_state=42, stratify=stratify
    )
    model_factory = CLASSIFICATION_MODELS.get(req.algorithm)
    if not model_factory:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown classification algorithm: {req.algorithm}")
    model = model_factory()
    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    average = "binary" if len(encoder.classes_) == 2 else "weighted"
    metrics = {
        "accuracy": round(float(accuracy_score(y_test, preds)), 4),
        "precision": round(float(precision_score(y_test, preds, average=average, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, preds, average=average, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, preds, average=average, zero_division=0)), 4),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
    }

    labels = list(encoder.classes_)
    cm = _confusion_matrix(y_test, preds, len(labels))
    roc = None
    if len(labels) == 2 and hasattr(model, "predict_proba"):
        proba = model.predict_proba(X_test)[:, 1]
        try:
            fpr, tpr, _ = roc_curve(y_test, proba)
            auc = roc_auc_score(y_test, proba)
            roc = {
                "auc": round(float(auc), 4),
                "points": [{"fpr": _safe(f), "tpr": _safe(t)} for f, t in zip(fpr.tolist(), tpr.tolist())],
            }
        except ValueError:
            roc = None

    feature_importance = _feature_importance(model, features)

    return {
        "metrics": metrics,
        "artifacts": {
            "confusion_matrix": {"labels": labels, "matrix": cm},
            "roc_curve": roc,
            "feature_importance": feature_importance,
        },
    }


def train_clustering(df: pd.DataFrame, req: MLTrainRequest) -> dict:
    features = req.feature_columns or df.select_dtypes(include=[np.number]).columns.tolist()
    if len(features) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Clustering needs at least 2 numeric features.")
    X = _prepare_features(df, features)
    X_scaled = StandardScaler().fit_transform(X)

    model = KMeans(n_clusters=req.n_clusters, random_state=42, n_init=10)
    labels = model.fit_predict(X_scaled)

    sil = silhouette_score(X_scaled, labels) if len(set(labels)) > 1 else 0.0
    cluster_sizes = pd.Series(labels).value_counts().sort_index().to_dict()

    scatter_data = []
    if len(features) >= 2:
        for i in range(min(len(X), 1000)):
            scatter_data.append({"x": _safe(X.iloc[i, 0]), "y": _safe(X.iloc[i, 1]), "cluster": int(labels[i])})

    return {
        "metrics": {"silhouette_score": round(float(sil), 4), "n_clusters": req.n_clusters, "n_samples": len(X)},
        "artifacts": {
            "cluster_sizes": {str(k): int(v) for k, v in cluster_sizes.items()},
            "scatter_sample": scatter_data,
            "centers": model.cluster_centers_.tolist(),
        },
    }


def train_anomaly_detection(df: pd.DataFrame, req: MLTrainRequest) -> dict:
    features = req.feature_columns or df.select_dtypes(include=[np.number]).columns.tolist()
    if not features:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Anomaly detection needs numeric features.")
    X = _prepare_features(df, features)

    model = IsolationForest(contamination=0.05, random_state=42)
    preds = model.fit_predict(X)
    scores = model.score_samples(X)
    n_anomalies = int((preds == -1).sum())

    sample = []
    for i in range(min(len(X), 1000)):
        sample.append(
            {
                "index": int(i),
                "is_anomaly": bool(preds[i] == -1),
                "score": _safe(scores[i]),
                **{f: _safe(X.iloc[i][f]) for f in features[:2]},
            }
        )

    return {
        "metrics": {
            "n_anomalies": n_anomalies,
            "anomaly_pct": round(n_anomalies / len(X) * 100, 2),
            "n_samples": len(X),
        },
        "artifacts": {"sample": sample},
    }


def train_time_series(df: pd.DataFrame, req: MLTrainRequest) -> dict:
    date_col = req.date_column
    target = req.target_column
    if not date_col or not target:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Time series requires date_column and target_column.")

    ts = df[[date_col, target]].copy()
    ts[date_col] = pd.to_datetime(ts[date_col], errors="coerce")
    ts[target] = pd.to_numeric(ts[target], errors="coerce")
    ts = ts.dropna().sort_values(date_col)

    if len(ts) < 10:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough time-indexed rows to forecast (need >= 10).")

    ts["_t"] = np.arange(len(ts))
    model = LinearRegression()
    model.fit(ts[["_t"]], ts[target])
    trend_pred = model.predict(ts[["_t"]])
    residuals = ts[target].values - trend_pred

    window = max(2, min(12, len(ts) // 4))
    rolling_mean = ts[target].rolling(window=window, min_periods=1).mean()

    future_t = np.arange(len(ts), len(ts) + req.forecast_periods).reshape(-1, 1)
    future_values = model.predict(future_t)
    freq = pd.infer_freq(ts[date_col]) or "D"
    try:
        future_dates = pd.date_range(start=ts[date_col].iloc[-1], periods=req.forecast_periods + 1, freq=freq)[1:]
    except ValueError:
        future_dates = pd.date_range(start=ts[date_col].iloc[-1], periods=req.forecast_periods + 1, freq="D")[1:]

    historical = [
        {"date": d.isoformat(), "actual": _safe(v), "trend": _safe(t)}
        for d, v, t in zip(ts[date_col], ts[target], trend_pred)
    ]
    forecast = [{"date": d.isoformat(), "forecast": _safe(v)} for d, v in zip(future_dates, future_values)]

    slope = float(model.coef_[0])
    direction = "increasing" if slope > 0 else "decreasing" if slope < 0 else "flat"

    return {
        "metrics": {
            "trend_slope": round(slope, 6),
            "trend_direction": direction,
            "residual_std": round(float(np.std(residuals)), 4),
            "n_observations": len(ts),
        },
        "artifacts": {
            "historical": historical[-500:],
            "forecast": forecast,
            "rolling_mean_window": window,
        },
    }


def run_training(df: pd.DataFrame, req: MLTrainRequest) -> dict:
    dispatch = {
        "regression": train_regression,
        "classification": train_classification,
        "clustering": train_clustering,
        "anomaly_detection": train_anomaly_detection,
        "time_series": train_time_series,
    }
    handler = dispatch.get(req.task_type)
    if not handler:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown task type: {req.task_type}")
    return handler(df, req)


def _feature_importance(model, features: list[str]) -> list[dict]:
    importances = None
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    elif hasattr(model, "coef_"):
        coef = model.coef_
        importances = np.abs(coef[0]) if coef.ndim > 1 else np.abs(coef)
    if importances is None:
        return []
    pairs = sorted(zip(features, importances.tolist()), key=lambda p: p[1], reverse=True)
    return [{"feature": f, "importance": round(float(i), 4)} for f, i in pairs]


def _confusion_matrix(y_true, y_pred, n_labels: int) -> list[list[int]]:
    matrix = [[0] * n_labels for _ in range(n_labels)]
    for t, p in zip(y_true, y_pred):
        matrix[int(t)][int(p)] += 1
    return matrix


def _safe(value) -> float:
    if value is None or (isinstance(value, float) and (np.isnan(value) or np.isinf(value))):
        return 0.0
    return float(value)
