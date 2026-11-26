import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";

// Token w ciasteczku czytają: proxy.ts (przekierowania), komponenty serwerowe (pobieranie danych)
// i przeglądarka (nagłówek Authorization przy zapisach).
export function startSession(token: string): void {
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; samesite=lax`;
}

export function endSession(): void {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function getSessionToken(): string | null {
  const prefix = `${SESSION_COOKIE}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) || null : null;
}
