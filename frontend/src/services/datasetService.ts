import api from "./api";
import { Dataset, PreviewResponse, ProfileResponse } from "../types";

export async function uploadDataset(file: File, onProgress?: (pct: number) => void): Promise<Dataset> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<Dataset>("/datasets/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
    },
  });
  return data;
}

export async function replaceDataset(datasetId: number, file: File): Promise<Dataset> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<Dataset>(`/datasets/${datasetId}/replace`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function listDatasets(): Promise<Dataset[]> {
  const { data } = await api.get<Dataset[]>("/datasets");
  return data;
}

export async function getDataset(datasetId: number): Promise<Dataset> {
  const { data } = await api.get<Dataset>(`/datasets/${datasetId}`);
  return data;
}

export async function deleteDataset(datasetId: number): Promise<void> {
  await api.delete(`/datasets/${datasetId}`);
}

export async function previewDataset(
  datasetId: number,
  params: { page?: number; page_size?: number; search?: string; sort_by?: string; sort_dir?: "asc" | "desc" }
): Promise<PreviewResponse> {
  const { data } = await api.get<PreviewResponse>(`/datasets/${datasetId}/preview`, { params });
  return data;
}

export async function profileDataset(datasetId: number): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>(`/datasets/${datasetId}/profile`);
  return data;
}

export async function getCorrelation(datasetId: number) {
  const { data } = await api.get(`/datasets/${datasetId}/correlation`);
  return data as { columns: string[]; matrix: (number | null)[][] };
}

export async function getNullHeatmap(datasetId: number) {
  const { data } = await api.get(`/datasets/${datasetId}/null-heatmap`);
  return data as { columns: string[]; matrix: number[][] };
}

export async function getOutliers(datasetId: number, column: string) {
  const { data } = await api.get(`/datasets/${datasetId}/outliers/${encodeURIComponent(column)}`);
  return data;
}
