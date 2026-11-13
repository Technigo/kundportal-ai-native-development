import type { Arende, ArendeCreate, ArendeStatus } from "../types/arende";
import { ApiError, NETWORK_ERROR_MESSAGE, toApiError } from "./apiError";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiError(response.status, body);
  }
  return body as T;
}

export function listArenden(): Promise<Arende[]> {
  return request<Arende[]>("/arenden");
}

export function getArende(id: number): Promise<Arende> {
  return request<Arende>(`/arenden/${id}`);
}

export function createArende(data: ArendeCreate): Promise<Arende> {
  return request<Arende>("/arenden", { method: "POST", body: JSON.stringify(data) });
}

// The backend supports this endpoint; MSW handles it in tests and `npm run dev:mock`.
export function updateStatus(id: number, status: ArendeStatus): Promise<Arende> {
  return request<Arende>(`/arenden/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}
