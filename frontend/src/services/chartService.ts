import api from "./api";

export interface ChartRequestParams {
  chart_type: string;
  x?: string | null;
  y?: string | null;
  category?: string | null;
  bins?: number;
}

export async function generateChart(datasetId: number, params: ChartRequestParams) {
  const { data } = await api.post(`/datasets/${datasetId}/charts`, params);
  return data;
}
