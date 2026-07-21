import api from "./api";
import { CleaningStep, ProfileResponse } from "../types";

export async function getCleaningHistory(datasetId: number): Promise<CleaningStep[]> {
  const { data } = await api.get<CleaningStep[]>(`/datasets/${datasetId}/cleaning/history`);
  return data;
}

export async function applyCleaning(
  datasetId: number,
  operation: string,
  params: Record<string, unknown>
): Promise<ProfileResponse> {
  const { data } = await api.post<ProfileResponse>(`/datasets/${datasetId}/cleaning/apply`, { operation, params });
  return data;
}

export async function undoCleaning(datasetId: number): Promise<ProfileResponse> {
  const { data } = await api.post<ProfileResponse>(`/datasets/${datasetId}/cleaning/undo`);
  return data;
}

export async function resetCleaning(datasetId: number): Promise<ProfileResponse> {
  const { data } = await api.post<ProfileResponse>(`/datasets/${datasetId}/cleaning/reset`);
  return data;
}
