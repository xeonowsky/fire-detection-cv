import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";

// Ciasteczko jest tylko flagą dla proxy.ts; prawdziwą sesję trzyma API.
// TODO(krok 3): ustawiane po udanym POST /auth/login.
export function startSession(): void {
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; samesite=lax`;
}

export function endSession(): void {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
