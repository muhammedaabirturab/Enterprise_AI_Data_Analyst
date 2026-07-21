"""Chart data endpoints — returns JSON consumed by Recharts on the frontend."""
from fastapi import APIRouter, Depends

from app.api.deps import get_owned_dataset
from app.models.dataset import Dataset
from app.schemas.dataset import ChartRequest
from app.services import chart_service, dataset_service

router = APIRouter(prefix="/api/datasets/{dataset_id}/charts", tags=["charts"])


@router.post("")
def generate_chart(payload: ChartRequest, dataset: Dataset = Depends(get_owned_dataset)) -> dict:
    df = dataset_service.load_dataframe(dataset)
    return chart_service.build_chart(df, payload.chart_type, payload.x, payload.y, payload.category, payload.bins)
