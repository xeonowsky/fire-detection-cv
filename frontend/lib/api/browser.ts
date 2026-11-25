import { ApiError } from "@/lib/api/client";
import { endSession, getSessionToken } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

const SESSION_EXPIRED = "Sesja wygasła. Zaloguj się ponownie.";

function expireSession(): never {
  endSession();
  const next = encodeURIComponent(window.location.pathname);
  // Pełne przeładowanie celowo: czyści stan aplikacji po wygaśnięciu sesji.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`${ROUTES.login}?next=${next}`);
  throw new ApiError(401, SESSION_EXPIRED);
}

/** Zapytanie z przeglądarki z tokenem z ciasteczka. Po 401 czyści sesję i przenosi na logowanie. */
export async function withSession<T>(call: (token: string) => Promise<T>): Promise<T> {
  const token = getSessionToken();
  if (!token) expireSession();
  try {
    return await call(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) expireSession();
    throw error;
  }
}
