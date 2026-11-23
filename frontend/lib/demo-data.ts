import type { Analysis, User } from "@/lib/api/types";

// TODO(krok 2): zamienić na dane z GET /users/me i GET /analyses.
// Lista analiz jest pusta, więc statystyki startują od zera i rosną dopiero z prawdziwymi analizami.

export const DEMO_USER: User = { id: 1, name: "Klaudiusz", email: "klaudiusz@firma.pl" };

export const DEMO_ANALYSES: Analysis[] = [];
