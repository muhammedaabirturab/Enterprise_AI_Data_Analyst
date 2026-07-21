"""Lightweight rule-based intent matcher powering the AI chat assistant.

Answers are grounded in the uploaded dataset's live statistics. If a real LLM is
configured, the grounded answer is used as context for a more conversational
rewrite; otherwise the grounded answer is returned directly.
"""
import re

import pandas as pd

from app.ai import insight_engine
from app.ai.llm_client import generate_llm_text
from app.services import ml_service
from app.services.profiling_service import build_profile, correlation_matrix, detect_outliers

INTENT_PATTERNS: list[tuple[str, list[str]]] = [
    ("dataset_overview", [r"what does this dataset show", r"describe (the|this) dataset", r"overview", r"tell me about (the|this) data"]),
    ("summarize", [r"summar(y|ize)", r"business summary", r"executive summary"]),
    ("missing_values", [r"missing", r"null values", r"which columns have missing"]),
    ("recommend_ml", [r"recommend.*model", r"which model", r"what model should"]),
    ("cleaning_advice", [r"what should i clean", r"clean(ing)? first", r"data quality"]),
    ("correlation", [r"correlat"]),
    ("outliers", [r"outlier", r"anomal"]),
    ("feature_importance", [r"feature.*important", r"important.*feature"]),
    ("trend", [r"trend", r"over time", r"forecast"]),
    ("row_col_count", [r"how many rows", r"how many columns", r"size of.*dataset"]),
]


def _match_intent(message: str) -> str:
    lowered = message.lower()
    for intent, patterns in INTENT_PATTERNS:
        if any(re.search(p, lowered) for p in patterns):
            return intent
    return "fallback"


def _extract_column(message: str, columns: list[str]) -> str | None:
    lowered = message.lower()
    for col in sorted(columns, key=len, reverse=True):
        if col.lower() in lowered:
            return col
    return None


def answer(df: pd.DataFrame, message: str) -> str:
    intent = _match_intent(message)
    columns = list(df.columns)

    if intent == "dataset_overview":
        grounded = insight_engine.dataset_summary(df)
    elif intent == "summarize":
        grounded = insight_engine.business_summary(df) + " " + insight_engine.executive_summary(df)
    elif intent == "missing_values":
        profile = build_profile(df)
        missing_cols = [c for c in profile.columns if c.missing_count > 0]
        if not missing_cols:
            grounded = "No columns have missing values — the dataset is complete."
        else:
            details = ", ".join(f"'{c.name}' ({c.missing_pct}%)" for c in sorted(missing_cols, key=lambda c: -c.missing_pct)[:8])
            grounded = f"{len(missing_cols)} column(s) have missing values: {details}."
    elif intent == "recommend_ml":
        recs = ml_service.recommend_models(df)
        if not recs:
            grounded = "No confident model recommendation could be derived from this dataset yet."
        else:
            top = recs[0]
            grounded = (
                f"Based on the dataset shape, I recommend a {top.algorithm.replace('_', ' ')} "
                f"for a {top.task_type.replace('_', ' ')} task"
                + (f" targeting '{top.target_column}'" if top.target_column else "")
                + f". Reason: {top.reason}"
            )
    elif intent == "cleaning_advice":
        recs = insight_engine.recommendations(df)
        grounded = "Suggested cleaning priorities: " + " ".join(f"({i + 1}) {r}" for i, r in enumerate(recs[:5]))
    elif intent == "correlation":
        grounded = insight_engine.correlation_explanation(df)
    elif intent == "outliers":
        col = _extract_column(message, columns)
        if col:
            info = detect_outliers(df, col)
            grounded = (
                f"'{col}' has {info.get('outlier_count', 0)} outlier(s) "
                f"({info.get('outlier_pct', 0)}%), expected range "
                f"[{info.get('lower_bound')}, {info.get('upper_bound')}]."
                if info.get("outlier_count") is not None
                else f"Could not compute outliers for '{col}'."
            )
        else:
            grounded = insight_engine.outlier_explanation(df)
    elif intent == "feature_importance":
        grounded = (
            "Feature importance is computed after training a model on the ML page — "
            "train a regression or classification model there and I'll surface the ranked features."
        )
    elif intent == "trend":
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        datetime_like = [c for c in columns if pd.to_datetime(df[c], errors="coerce").notna().mean() > 0.8]
        if datetime_like and numeric_cols:
            grounded = insight_engine.trend_explanation(df, datetime_like[0], numeric_cols[0])
        else:
            grounded = "I couldn't find both a date column and a numeric column to analyze a trend."
    elif intent == "row_col_count":
        grounded = f"This dataset has {len(df):,} rows and {len(df.columns)} columns."
    else:
        grounded = (
            "I can answer questions about this dataset's summary, missing values, correlations, "
            "outliers, cleaning priorities, and ML model recommendations. Try asking things like "
            "\"Which columns have missing values?\" or \"Recommend an ML model.\""
        )

    polished = generate_llm_text(
        "You are Veridian's AI data analyst assistant embedded in a BI dashboard. A user asked: "
        f"\"{message}\". Using ONLY these grounded facts (do not invent numbers), reply conversationally "
        f"in 2-4 sentences:\n\n{grounded}"
    )
    return polished or grounded
