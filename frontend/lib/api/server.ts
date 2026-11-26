import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { ApiError, analysesApi, usersApi } from "@/lib/api/client";
import { getServerToken } from "@/lib/auth/server";
import { ROUTES } from "@/lib/routes";

// Pobieranie danych w komponentach serwerowych. cache() sprawia, że pasek górny i strona
// w jednym żądaniu dzielą jedno zapytanie do API.
async function withServerToken<T>(call: (token: string) => Promise<T>): Promise<T> {
  const token = await getServerToken();
  if (!token) redirect(ROUTES.login);
  try {
    return await call(token);
  } catch (error) {
    // Token wygasł albo konto usunięto: /logout czyści ciasteczko i przenosi na logowanie.
    if (error instanceof ApiError && error.status === 401) redirect(ROUTES.logout);
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export const getCurrentUser = cache(() => withServerToken(usersApi.me));

export const getAnalyses = cache((limit?: number) =>
  withServerToken((token) => analysesApi.list(token, limit)),
);

export const getAnalysis = cache((id: string) => withServerToken((token) => analysesApi.get(token, id)));
