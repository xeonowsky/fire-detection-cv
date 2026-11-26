// Osobny plik bez kodu przeglądarkowego, żeby proxy.ts mógł go importować.
// Ciasteczko przechowuje token JWT z API. Czas życia jak JWT_EXPIRE_MINUTES w backendzie (24 h).
export const SESSION_COOKIE = "fd_token";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
