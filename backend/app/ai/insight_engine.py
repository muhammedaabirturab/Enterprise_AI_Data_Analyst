"""Rule-based statistical AI engine that writes natural-language business insights.

Works fully offline (no external API required). When an LLM provider is configured
via settings, the generated statistical summary is used as grounding context and
handed to the LLM for a more fluent rewrite; if that call fails or is unavailable,
the offline-generated text below is returned as-is.
"""
import numpy as np
import pandas as pd

from app.ai.llm_client import generate_llm_text
from app.services.profiling_service import build_profile, correlation_matrix, detect_outliers


def _strong_correlations(corr: dict, threshold: float = 0.6) -> list[dict]:
    columns = corr["columns"]
    matrix = corr["matrix"]
    pairs = []
    for i in range(len(columns)):
        for j in range(i + 1, len(columns)):
            value = matrix[i][j]
            if value is not None and abs(value) >= threshold:
                pairs.append({"a": columns[i], "b": columns[j], "correlation": round(value, 3)})
    return sorted(pairs, key=lambda p: abs(p["correlation"]), reverse=True)


def dataset_summary(df: pd.DataFrame) -> str:
    profile = build_profile(df)
    numeric_names = [c.name for c in profile.columns if c.inferred_type == "numeric"][:5]
    cat_names = [c.name for c in profile.columns if c.inferred_type in ("categorical", "text")][:5]
    parts = [
        f"This dataset contains {profile.n_rows:,} rows and {profile.n_columns} columns "
        f"({profile.numeric_columns} numeric, {profile.categorical_columns} categorical, "
        f"{profile.datetime_columns} datetime), using {profile.memory_usage_mb} MB of memory.",
    ]
    if numeric_names:
        parts.append(f"Key numeric fields include: {', '.join(numeric_names)}.")
    if cat_names:
        parts.append(f"Key categorical fields include: {', '.join(cat_names)}.")
    parts.append(
        f"Overall data quality score is {profile.quality_score}/100, with {profile.missing_pct}% missing "
        f"values and {profile.duplicate_rows} duplicate rows detected."
    )
    return " ".join(parts)


def business_summary(df: pd.DataFrame) -> str:
    profile = build_profile(df)
    numeric_cols = [c for c in profile.columns if c.inferred_type == "numeric"]
    lines = ["From a business perspective, this dataset offers measurable signal across "
             f"{len(numeric_cols)} quantitative metric(s)."]
    for col in numeric_cols[:3]:
        if col.mean is not None:
            lines.append(
                f"'{col.name}' averages {col.mean:.2f} (range {col.min:.2f} to {col.max:.2f}), "
                f"suggesting {'high variability' if col.std and col.mean and col.std > abs(col.mean) * 0.5 else 'a fairly stable pattern'}."
            )
    return " ".join(lines)


def executive_summary(df: pd.DataFrame) -> str:
    profile = build_profile(df)
    corr = correlation_matrix(df)
    strong = _strong_correlations(corr)
    lines = [
        f"Executive Summary — {profile.n_rows:,} records analyzed across {profile.n_columns} attributes.",
        f"Data quality stands at {profile.quality_score}/100.",
    ]
    if strong:
        top = strong[0]
        lines.append(
            f"The strongest relationship found is between '{top['a']}' and '{top['b']}' "
            f"(r={top['correlation']}), which merits business attention."
        )
    if profile.missing_pct > 5:
        lines.append(f"Missing data ({profile.missing_pct}%) should be addressed before deeper analysis.")
    else:
        lines.append("Missing data levels are low and unlikely to bias analysis.")
    lines.append("Recommended next steps: review data quality findings, then proceed to statistical or ML modeling.")
    return " ".join(lines)


def recommendations(df: pd.DataFrame) -> list[str]:
    profile = build_profile(df)
    recs = []
    if profile.missing_pct > 0:
        recs.append("Address missing values using mean/median imputation for numeric fields or mode for categorical fields.")
    if profile.duplicate_rows > 0:
        recs.append(f"Remove {profile.duplicate_rows} duplicate row(s) to avoid skewing aggregate statistics.")
    numeric_cols = [c for c in profile.columns if c.inferred_type == "numeric"]
    if len(numeric_cols) >= 2:
        recs.append("Run correlation analysis to identify redundant or highly related features before modeling.")
        recs.append("Consider feature scaling (normalization/standardization) prior to training distance-based models.")
    if any(c.unique_count == 1 for c in profile.columns):
        recs.append("Drop constant columns (single unique value) — they add no predictive signal.")
    if not recs:
        recs.append("Dataset quality is strong; proceed directly to exploratory charting and modeling.")
    return recs


def potential_problems(df: pd.DataFrame) -> list[str]:
    profile = build_profile(df)
    problems = []
    for col in profile.columns:
        if col.missing_pct > 30:
            problems.append(f"Column '{col.name}' has {col.missing_pct}% missing values — consider dropping or careful imputation.")
        if col.inferred_type == "numeric" and col.unique_count == 1:
            problems.append(f"Column '{col.name}' is constant and carries no information.")
    if profile.duplicate_rows > profile.n_rows * 0.05:
        problems.append(f"High duplicate rate ({profile.duplicate_rows} rows) suggests possible data collection errors.")
    if not problems:
        problems.append("No major structural problems detected.")
    return problems


def opportunities(df: pd.DataFrame) -> list[str]:
    corr = correlation_matrix(df)
    strong = _strong_correlations(corr, threshold=0.5)
    ops = []
    for pair in strong[:5]:
        direction = "positively" if pair["correlation"] > 0 else "negatively"
        ops.append(
            f"'{pair['a']}' and '{pair['b']}' are strongly {direction} correlated (r={pair['correlation']}) — "
            "worth investigating for causal business drivers or predictive modeling."
        )
    if not ops:
        ops.append("Explore clustering to uncover hidden customer/record segments not visible in raw fields.")
    return ops


def data_quality_report(df: pd.DataFrame) -> dict:
    profile = build_profile(df)
    flagged_columns = [
        {"column": c.name, "issue": "high missingness", "detail": f"{c.missing_pct}% missing"}
        for c in profile.columns
        if c.missing_pct > 20
    ]
    return {
        "quality_score": profile.quality_score,
        "missing_pct": profile.missing_pct,
        "duplicate_rows": profile.duplicate_rows,
        "flagged_columns": flagged_columns,
        "summary": (
            f"Quality score {profile.quality_score}/100. "
            f"{len(flagged_columns)} column(s) flagged for high missingness."
        ),
    }


def risk_analysis(df: pd.DataFrame) -> list[str]:
    profile = build_profile(df)
    risks = []
    if profile.n_rows < 100:
        risks.append("Small sample size (< 100 rows) increases risk of unreliable statistical conclusions.")
    if profile.missing_pct > 15:
        risks.append("Elevated missing-data rate risks biased models if not handled carefully.")
    numeric_cols = [c for c in profile.columns if c.inferred_type == "numeric"]
    for col in numeric_cols:
        outlier_info = detect_outliers(df, col.name)
        if outlier_info.get("outlier_pct", 0) and outlier_info["outlier_pct"] > 5:
            risks.append(
                f"'{col.name}' has {outlier_info['outlier_pct']}% outliers — extreme values may distort averages and models."
            )
    if not risks:
        risks.append("No significant statistical risks detected in the current dataset state.")
    return risks


def correlation_explanation(df: pd.DataFrame) -> str:
    corr = correlation_matrix(df)
    strong = _strong_correlations(corr)
    if not strong:
        return "No strong correlations (|r| >= 0.6) were found among numeric columns in this dataset."
    lines = [f"Found {len(strong)} strong correlation(s) among numeric columns:"]
    for pair in strong[:8]:
        relation = "increases" if pair["correlation"] > 0 else "decreases"
        lines.append(
            f"- As '{pair['a']}' increases, '{pair['b']}' tends to {relation} (r={pair['correlation']})."
        )
    return "\n".join(lines)


def outlier_explanation(df: pd.DataFrame) -> str:
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if not numeric_cols:
        return "No numeric columns available to analyze for outliers."
    lines = []
    for col in numeric_cols[:8]:
        info = detect_outliers(df, col)
        if info.get("outlier_count"):
            lines.append(
                f"- '{col}': {info['outlier_count']} outlier(s) ({info['outlier_pct']}%), "
                f"expected range [{info['lower_bound']:.2f}, {info['upper_bound']:.2f}]."
            )
    if not lines:
        return "No significant outliers detected across numeric columns (using the IQR method)."
    return "Outlier analysis (IQR method):\n" + "\n".join(lines)


def trend_explanation(df: pd.DataFrame, date_column: str | None, value_column: str | None) -> str:
    if not date_column or not value_column:
        return "Provide a date column and a numeric value column to analyze trends."
    ts = df[[date_column, value_column]].copy()
    ts[date_column] = pd.to_datetime(ts[date_column], errors="coerce")
    ts[value_column] = pd.to_numeric(ts[value_column], errors="coerce")
    ts = ts.dropna().sort_values(date_column)
    if len(ts) < 5:
        return "Not enough time-indexed data points to determine a reliable trend."
    first_half = ts[value_column].iloc[: len(ts) // 2].mean()
    second_half = ts[value_column].iloc[len(ts) // 2 :].mean()
    change_pct = ((second_half - first_half) / first_half * 100) if first_half else 0
    direction = "increased" if change_pct > 1 else "decreased" if change_pct < -1 else "remained stable"
    return (
        f"'{value_column}' has {direction} over time, moving from an average of {first_half:.2f} "
        f"in the first half of the period to {second_half:.2f} in the second half "
        f"({change_pct:+.1f}% change)."
    )


def natural_language_insights(df: pd.DataFrame) -> list[str]:
    insights = []
    insights.append(dataset_summary(df))
    corr_text = correlation_explanation(df)
    if "No strong" not in corr_text:
        insights.append(corr_text.split("\n")[0])
    outlier_text = outlier_explanation(df)
    if "No significant" not in outlier_text:
        insights.append(outlier_text.split("\n")[0])
    return insights


def full_ai_report(df: pd.DataFrame) -> dict:
    """Assemble every AI section into one payload for the dashboard / PDF report."""
    report = {
        "dataset_summary": dataset_summary(df),
        "business_summary": business_summary(df),
        "executive_summary": executive_summary(df),
        "recommendations": recommendations(df),
        "potential_problems": potential_problems(df),
        "opportunities": opportunities(df),
        "data_quality_report": data_quality_report(df),
        "risk_analysis": risk_analysis(df),
        "correlation_explanation": correlation_explanation(df),
        "outlier_explanation": outlier_explanation(df),
        "natural_language_insights": natural_language_insights(df),
    }

    llm_polish = generate_llm_text(
        "You are a senior business intelligence analyst. Rewrite the following statistical "
        "findings into a polished, concise executive summary (max 150 words), keeping every "
        f"number accurate:\n\n{report['executive_summary']}"
    )
    if llm_polish:
        report["executive_summary_ai_enhanced"] = llm_polish

    return report
