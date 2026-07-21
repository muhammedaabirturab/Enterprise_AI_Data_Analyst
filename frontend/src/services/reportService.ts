import api from "./api";

async function downloadFile(datasetId: number, format: "pdf" | "csv" | "json" | "excel", filename: string) {
  const response = await api.get(`/datasets/${datasetId}/export/${format}`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const exportPdf = (datasetId: number, name: string) => downloadFile(datasetId, "pdf", `${name}_veridian_report.pdf`);
export const exportCsv = (datasetId: number, name: string) => downloadFile(datasetId, "csv", `${name}.csv`);
export const exportJson = (datasetId: number, name: string) => downloadFile(datasetId, "json", `${name}.json`);
export const exportExcel = (datasetId: number, name: string) => downloadFile(datasetId, "excel", `${name}.xlsx`);
