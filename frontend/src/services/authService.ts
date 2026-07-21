import api from "./api";
import { AuthResponse } from "../types";

export async function registerUser(payload: {
  email: string;
  password: string;
  full_name: string;
  company?: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}
