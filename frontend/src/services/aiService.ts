import api from "./api";
import { AIReport, ChatMessage } from "../types";

export async function getAIInsights(datasetId: number): Promise<AIReport> {
  const { data } = await api.get<AIReport>(`/datasets/${datasetId}/ai/insights`);
  return data;
}

export async function getChatHistory(datasetId: number): Promise<ChatMessage[]> {
  const { data } = await api.get<ChatMessage[]>(`/datasets/${datasetId}/ai/chat/history`);
  return data;
}

export async function sendChatMessage(datasetId: number, message: string) {
  const { data } = await api.post(`/datasets/${datasetId}/ai/chat`, { message });
  return data as { reply: ChatMessage; history: ChatMessage[] };
}
