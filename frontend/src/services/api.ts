import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("veridian_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const NETWORK_ERROR_EVENT = "veridian:network-error";
let lastNetworkErrorNotifiedAt = 0;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("veridian_token");
      localStorage.removeItem("veridian_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    } else if (!error.response) {
      // The backend is unreachable (dev server down, connection reset, etc).
      // Many requests can fail at once (the workspace fires several in parallel),
      // so throttle to at most one notification every 10s instead of a flood.
      const now = Date.now();
      if (now - lastNetworkErrorNotifiedAt > 10_000) {
        lastNetworkErrorNotifiedAt = now;
        window.dispatchEvent(new CustomEvent(NETWORK_ERROR_EVENT));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export function apiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    // No response at all means the request never reached (or never returned from) the
    // backend — a dead dev server, a dropped connection, etc. — not a validation error.
    if (!error.response) {
      return "Can't reach the Veridian server. Make sure the backend is running, then try again.";
    }
    const detail = error.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
    if (error.response.status >= 500) {
      return "The server ran into a problem handling that request. Please try again in a moment.";
    }
  }
  return fallback;
}
