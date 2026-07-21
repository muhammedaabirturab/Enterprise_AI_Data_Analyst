import api from "./api";
import { MLRecommendation, MLRunResult } from "../types";

export async function getRecommendations(datasetId: number): Promise<MLRecommendation[]> {
  const { data } = await api.get<MLRecommendation[]>(`/datasets/${datasetId}/ml/recommendations`);
  return data;
}

export interface TrainRequest {
  task_type: string;
  algorithm: string;
  target_column?: string | null;
  feature_columns?: string[];
  n_clusters?: number;
  test_size?: number;
  date_column?: string | null;
  forecast_periods?: number;
}

export async function trainModel(datasetId: number, req: TrainRequest): Promise<MLRunResult> {
  const { data } = await api.post<MLRunResult>(`/datasets/${datasetId}/ml/train`, req);
  return data;
}

export async function listRuns(datasetId: number): Promise<MLRunResult[]> {
  const { data } = await api.get<MLRunResult[]>(`/datasets/${datasetId}/ml/runs`);
  return data;
}
