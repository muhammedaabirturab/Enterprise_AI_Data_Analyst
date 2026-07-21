"""Export and PDF report generation endpoints."""
from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.api.deps import get_owned_dataset
from app.models.dataset import Dataset
from app.services import dataset_service, report_service

router = APIRouter(prefix="/api/datasets/{dataset_id}/export", tags=["reports"])

MEDIA_TYPES = {
    "csv": "text/csv",
    "json": "application/json",
    "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "pdf": "application/pdf",
}


@router.get("/pdf")
def export_pdf(dataset: Dataset = Depends(get_owned_dataset)) -> Response:
    df = dataset_service.load_dataframe(dataset)
    pdf_bytes = report_service.generate_pdf_report(df, dataset.name)
    return Response(
        content=pdf_bytes,
        media_type=MEDIA_TYPES["pdf"],
        headers={"Content-Disposition": f'attachment; filename="{dataset.name}_veridian_report.pdf"'},
    )


@router.get("/csv")
def export_csv(dataset: Dataset = Depends(get_owned_dataset)) -> Response:
    df = dataset_service.load_dataframe(dataset)
    return Response(
        content=report_service.export_csv(df),
        media_type=MEDIA_TYPES["csv"],
        headers={"Content-Disposition": f'attachment; filename="{dataset.name}.csv"'},
    )


@router.get("/json")
def export_json(dataset: Dataset = Depends(get_owned_dataset)) -> Response:
    df = dataset_service.load_dataframe(dataset)
    return Response(
        content=report_service.export_json(df),
        media_type=MEDIA_TYPES["json"],
        headers={"Content-Disposition": f'attachment; filename="{dataset.name}.json"'},
    )


@router.get("/excel")
def export_excel(dataset: Dataset = Depends(get_owned_dataset)) -> Response:
    df = dataset_service.load_dataframe(dataset)
    return Response(
        content=report_service.export_excel(df),
        media_type=MEDIA_TYPES["excel"],
        headers={"Content-Disposition": f'attachment; filename="{dataset.name}.xlsx"'},
    )
