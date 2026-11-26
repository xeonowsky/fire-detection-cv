import type { Analysis, AnalysisList, TokenResponse, User } from "@/lib/api/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const NETWORK_ERROR = "Brak połączenia z serwerem. Sprawdź, czy API działa (docker compose up).";

type ValidationIssue = { loc?: (string | number)[] };

const FIELD_MESSAGES: Record<string, string> = {
  email: "Podaj poprawny adres email.",
  password: "Hasło musi mieć co najmniej 8 znaków.",
  new_password: "Nowe hasło musi mieć co najmniej 8 znaków.",
  name: "Podaj imię.",
};

export function errorMessage(status: number, payload: unknown): string {
  const detail = (payload as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const field = (detail[0] as ValidationIssue | undefined)?.loc?.at(-1);
    if (typeof field === "string" && field in FIELD_MESSAGES) return FIELD_MESSAGES[field];
    return "Sprawdź poprawność wpisanych danych.";
  }
  return `Coś poszło nie tak (błąd ${status}). Spróbuj ponownie.`;
}

/** Pełny adres pliku z API, np. video_url ("/api/v1/analyses/…/video") do <video src>. */
export function apiAssetUrl(path: string): string {
  return new URL(path, API_URL).toString();
}

export function toErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Coś poszło nie tak. Spróbuj ponownie.";
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", token, body }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR);
  }

  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, errorMessage(response.status, payload));
  return payload as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<TokenResponse>("/auth/login", { method: "POST", body: { email, password } }),
  register: (name: string, email: string, password: string) =>
    apiRequest<TokenResponse>("/auth/register", { method: "POST", body: { name, email, password } }),
};

export const usersApi = {
  me: (token: string) => apiRequest<User>("/users/me", { token }),
  update: (token: string, changes: { name?: string; email?: string }) =>
    apiRequest<User>("/users/me", { method: "PATCH", token, body: changes }),
  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    apiRequest<void>("/users/me/password", {
      method: "POST",
      token,
      body: { current_password: currentPassword, new_password: newPassword },
    }),
  remove: (token: string) => apiRequest<void>("/users/me", { method: "DELETE", token }),
};

export const analysesApi = {
  list: (token: string, limit = 20, offset = 0) =>
    apiRequest<AnalysisList>(`/analyses?limit=${limit}&offset=${offset}`, { token }),
  get: (token: string, id: string) => apiRequest<Analysis>(`/analyses/${encodeURIComponent(id)}`, { token }),
  remove: (token: string, id: string) =>
    apiRequest<void>(`/analyses/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  removeAll: (token: string) => apiRequest<void>("/analyses", { method: "DELETE", token }),
};
