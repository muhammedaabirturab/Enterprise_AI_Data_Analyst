"""Generates branded PDF reports (ReportLab) and CSV/Excel/JSON exports."""
import io
import json
from datetime import datetime

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.ai import insight_engine
from app.services.profiling_service import build_profile, correlation_matrix

BRAND_PRIMARY = colors.HexColor("#4F46E5")
BRAND_ACCENT = colors.HexColor("#10B981")
BRAND_DARK = colors.HexColor("#0B1120")
BRAND_MUTED = colors.HexColor("#64748B")

PAGE_WIDTH, PAGE_HEIGHT = A4


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(BRAND_MUTED)
    canvas.drawString(2 * cm, 1.3 * cm, "Veridian — AI-Powered Business Intelligence")
    canvas.drawRightString(PAGE_WIDTH - 2 * cm, 1.3 * cm, f"Page {doc.page}")
    canvas.setStrokeColor(BRAND_PRIMARY)
    canvas.setLineWidth(1.2)
    canvas.line(2 * cm, 1.7 * cm, PAGE_WIDTH - 2 * cm, 1.7 * cm)
    canvas.restoreState()


def _correlation_heatmap_image(df: pd.DataFrame) -> Image | None:
    corr = correlation_matrix(df)
    if len(corr["columns"]) < 2:
        return None
    fig, ax = plt.subplots(figsize=(6, 5))
    matrix = [[v if v is not None else 0 for v in row] for row in corr["matrix"]]
    im = ax.imshow(matrix, cmap="RdYlGn", vmin=-1, vmax=1)
    ax.set_xticks(range(len(corr["columns"])))
    ax.set_yticks(range(len(corr["columns"])))
    ax.set_xticklabels(corr["columns"], rotation=45, ha="right", fontsize=7)
    ax.set_yticklabels(corr["columns"], fontsize=7)
    fig.colorbar(im, ax=ax, shrink=0.8)
    ax.set_title("Correlation Matrix", fontsize=11)
    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150)
    plt.close(fig)
    buf.seek(0)
    return Image(buf, width=14 * cm, height=11 * cm)


def _numeric_distribution_image(df: pd.DataFrame) -> Image | None:
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    if not numeric_cols:
        return None
    col = numeric_cols[0]
    fig, ax = plt.subplots(figsize=(6, 3.5))
    ax.hist(df[col].dropna(), bins=20, color="#4F46E5", edgecolor="white")
    ax.set_title(f"Distribution of {col}", fontsize=11)
    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150)
    plt.close(fig)
    buf.seek(0)
    return Image(buf, width=14 * cm, height=7 * cm)


def generate_pdf_report(df: pd.DataFrame, dataset_name: str) -> bytes:
    profile = build_profile(df)
    ai_report = insight_engine.full_ai_report(df)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleBrand", parent=styles["Title"], textColor=BRAND_DARK, fontSize=28, spaceAfter=12)
    h2 = ParagraphStyle("H2Brand", parent=styles["Heading2"], textColor=BRAND_PRIMARY, spaceBefore=14, spaceAfter=8)
    body = ParagraphStyle("BodyBrand", parent=styles["BodyText"], fontSize=10, leading=14)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=2.2 * cm,
        bottomMargin=2.2 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        title=f"Veridian Report — {dataset_name}",
    )

    story = []

    story.append(Spacer(1, 5 * cm))
    story.append(Paragraph("VERIDIAN", ParagraphStyle("Brand", parent=title_style, fontSize=40, textColor=BRAND_PRIMARY, alignment=1)))
    story.append(Paragraph("AI-Powered Business Intelligence Report", ParagraphStyle("Sub", parent=styles["Heading3"], alignment=1, textColor=BRAND_MUTED)))
    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph(f"Dataset: {dataset_name}", ParagraphStyle("Meta", parent=body, alignment=1, fontSize=13)))
    story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %H:%M')}", ParagraphStyle("Meta2", parent=body, alignment=1, textColor=BRAND_MUTED)))
    story.append(PageBreak())

    story.append(Paragraph("Executive Summary", h2))
    story.append(Paragraph(ai_report["executive_summary"], body))
    story.append(Spacer(1, 0.4 * cm))

    kpi_data = [
        ["Rows", f"{profile.n_rows:,}"],
        ["Columns", str(profile.n_columns)],
        ["Quality Score", f"{profile.quality_score}/100"],
        ["Missing Cells", f"{profile.missing_cells} ({profile.missing_pct}%)"],
        ["Duplicate Rows", str(profile.duplicate_rows)],
        ["Memory Usage", f"{profile.memory_usage_mb} MB"],
    ]
    kpi_table = Table(kpi_data, colWidths=[6 * cm, 6 * cm])
    kpi_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), BRAND_PRIMARY),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("BACKGROUND", (1, 0), (1, -1), colors.whitesmoke),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(kpi_table)
    story.append(Spacer(1, 0.5 * cm))

    story.append(Paragraph("Business Summary", h2))
    story.append(Paragraph(ai_report["business_summary"], body))

    story.append(Paragraph("Data Quality Report", h2))
    story.append(Paragraph(ai_report["data_quality_report"]["summary"], body))

    story.append(Paragraph("Recommendations", h2))
    for rec in ai_report["recommendations"]:
        story.append(Paragraph(f"• {rec}", body))

    story.append(Paragraph("Potential Problems", h2))
    for prob in ai_report["potential_problems"]:
        story.append(Paragraph(f"• {prob}", body))

    story.append(Paragraph("Opportunities", h2))
    for opp in ai_report["opportunities"]:
        story.append(Paragraph(f"• {opp}", body))

    story.append(Paragraph("Risk Analysis", h2))
    for risk in ai_report["risk_analysis"]:
        story.append(Paragraph(f"• {risk}", body))

    story.append(PageBreak())
    story.append(Paragraph("Correlation Analysis", h2))
    story.append(Paragraph(ai_report["correlation_explanation"].replace("\n", "<br/>"), body))
    heatmap_img = _correlation_heatmap_image(df)
    if heatmap_img:
        story.append(Spacer(1, 0.3 * cm))
        story.append(heatmap_img)

    story.append(Paragraph("Outlier Analysis", h2))
    story.append(Paragraph(ai_report["outlier_explanation"].replace("\n", "<br/>"), body))
    dist_img = _numeric_distribution_image(df)
    if dist_img:
        story.append(Spacer(1, 0.3 * cm))
        story.append(dist_img)

    story.append(PageBreak())
    story.append(Paragraph("Column Profile", h2))
    header = ["Column", "Type", "Missing %", "Unique"]
    rows = [header] + [
        [c.name, c.inferred_type, f"{c.missing_pct}%", str(c.unique_count)] for c in profile.columns[:30]
    ]
    profile_table = Table(rows, colWidths=[6 * cm, 3.5 * cm, 3 * cm, 3 * cm])
    profile_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.lightgrey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.whitesmoke]),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(profile_table)

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    buffer.seek(0)
    return buffer.getvalue()


def export_csv(df: pd.DataFrame) -> bytes:
    return df.to_csv(index=False).encode("utf-8")


def export_json(df: pd.DataFrame) -> bytes:
    return df.to_json(orient="records", date_format="iso").encode("utf-8")


def export_excel(df: pd.DataFrame) -> bytes:
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Data")
    buffer.seek(0)
    return buffer.getvalue()
