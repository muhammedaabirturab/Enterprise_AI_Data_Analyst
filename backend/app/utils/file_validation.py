"""Upload validation helpers: extension/MIME allow-listing and size limits."""
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


def detect_file_type(filename: str) -> str:
    lower = filename.lower()
    for ext in ALLOWED_EXTENSIONS:
        if lower.endswith(ext):
            return "csv" if ext == ".csv" else "excel"
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Unsupported file type. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
    )


def validate_upload(file: UploadFile, size_bytes: int) -> str:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided.")

    file_type = detect_file_type(file.filename)

    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {settings.max_upload_size_mb}MB upload limit.",
        )
    if size_bytes == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    return file_type


def sanitize_column_name(name: str) -> str:
    cleaned = "".join(ch if ch.isalnum() or ch in ("_", " ", "-") else "_" for ch in str(name)).strip()
    return cleaned or "column"
