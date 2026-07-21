"""Data cleaning operations applied to a dataset's working dataframe."""
import numpy as np
import pandas as pd
from fastapi import HTTPException, status
from sklearn.preprocessing import LabelEncoder, MinMaxScaler, StandardScaler

from app.utils.file_validation import sanitize_column_name


def apply_operation(df: pd.DataFrame, operation: str, params: dict) -> pd.DataFrame:
    df = df.copy()

    if operation == "drop_rows_with_missing":
        columns = params.get("columns")
        df = df.dropna(subset=columns) if columns else df.dropna()

    elif operation == "drop_columns":
        columns = params.get("columns", [])
        df = df.drop(columns=[c for c in columns if c in df.columns])

    elif operation == "fill_mean":
        for col in params.get("columns", []):
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
                df[col] = df[col].fillna(df[col].mean())

    elif operation == "fill_median":
        for col in params.get("columns", []):
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
                df[col] = df[col].fillna(df[col].median())

    elif operation == "fill_mode":
        for col in params.get("columns", []):
            if col in df.columns and not df[col].mode().empty:
                df[col] = df[col].fillna(df[col].mode().iloc[0])

    elif operation == "fill_custom":
        value = params.get("value")
        for col in params.get("columns", []):
            if col in df.columns:
                df[col] = df[col].fillna(value)

    elif operation == "drop_duplicates":
        df = df.drop_duplicates()

    elif operation == "rename_column":
        old_name, new_name = params.get("old_name"), sanitize_column_name(params.get("new_name", ""))
        if old_name in df.columns and new_name:
            df = df.rename(columns={old_name: new_name})

    elif operation == "convert_type":
        column, target_type = params.get("column"), params.get("target_type")
        df = _convert_type(df, column, target_type)

    elif operation == "normalize":
        columns = [c for c in params.get("columns", []) if c in df.columns]
        if columns:
            scaler = MinMaxScaler()
            df[columns] = scaler.fit_transform(df[columns].apply(pd.to_numeric, errors="coerce"))

    elif operation == "standardize":
        columns = [c for c in params.get("columns", []) if c in df.columns]
        if columns:
            scaler = StandardScaler()
            df[columns] = scaler.fit_transform(df[columns].apply(pd.to_numeric, errors="coerce"))

    elif operation == "encode":
        columns = [c for c in params.get("columns", []) if c in df.columns]
        method = params.get("method", "label")
        if method == "onehot":
            df = pd.get_dummies(df, columns=columns)
        else:
            for col in columns:
                df[col] = LabelEncoder().fit_transform(df[col].astype(str))

    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown cleaning operation: {operation}")

    return df


def _convert_type(df: pd.DataFrame, column: str, target_type: str) -> pd.DataFrame:
    if column not in df.columns:
        return df
    try:
        if target_type == "numeric":
            df[column] = pd.to_numeric(df[column], errors="coerce")
        elif target_type == "string":
            df[column] = df[column].astype(str)
        elif target_type == "datetime":
            df[column] = pd.to_datetime(df[column], errors="coerce")
        elif target_type == "boolean":
            df[column] = df[column].astype(bool)
        elif target_type == "category":
            df[column] = df[column].astype("category")
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown target type: {target_type}")
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Type conversion failed: {exc}") from exc
    return df
