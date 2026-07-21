"""Veridian API — FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import ai, auth, charts, cleaning, datasets, ml, reports
from app.core.config import settings
from app.core.database import init_db

app = FastAPI(
    title="Veridian API",
    description="AI-powered business intelligence platform — upload, clean, analyze, and model datasets.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok", "app": settings.app_name, "environment": settings.environment}


app.include_router(auth.router)
app.include_router(datasets.router)
app.include_router(cleaning.router)
app.include_router(charts.router)
app.include_router(ml.router)
app.include_router(ai.router)
app.include_router(reports.router)
