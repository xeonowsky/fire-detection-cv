# fireDetector — frontend

Aplikacja webowa do oceny zagrożenia pożarowego na podstawie nagrań wideo. Użytkownik zakłada konto, wgrywa film
(do 4:30 min), a API w Pythonie zwraca werdykt i detekcje ognia oraz dymu, które frontend nakłada na odtwarzany film.

## Stack

- Next.js 16 (App Router, Cache Components) + React 19 + TypeScript
- Tailwind CSS 4, fonty Geist (paczka `geist`, bez zależności od Google Fonts)
- lucide-react (ikony), clsx + tailwind-merge (`cn`)
- ESLint (eslint-config-next) + Prettier (z sortowaniem klas Tailwinda)

## Uruchomienie

```bash
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm install
npm run dev
```

Aplikacja działa pod http://localhost:3000. Backend uruchamia się osobno przez Docker (zobacz
[README w katalogu głównym](../README.md)).

| Zmienna               | Domyślnie                      | Opis      |
| --------------------- | ------------------------------ | --------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | adres API |

Na tym etapie frontend nie łączy się jeszcze z API. Logowanie jest demonstracyjne: dowolne dane ustawiają ciasteczko
sesji `fd_session` i przenoszą na pulpit, a pulpit czyta dane z `lib/demo-data.ts` (pusta lista analiz, więc
statystyki startują od zera).

## Skrypty

| Skrypt                 | Co robi                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | serwer deweloperski                      |
| `npm run build`        | build produkcyjny                        |
| `npm run lint`         | ESLint                                   |
| `npm run typecheck`    | generuje typy tras i sprawdza TypeScript |
| `npm run format`       | formatuje kod Prettierem                 |
| `npm run format:check` | sprawdza formatowanie (do CI)            |

## Struktura

```
app/
  (site)/              strony publiczne: regulamin, prywatność, kontakt
  (auth)/              logowanie, rejestracja, przypomnienie hasła
  (app)/               trasy po zalogowaniu (wspólny layout z paskiem górnym)
    dashboard/         pulpit: statystyki, ostatni alarm, ostatnie analizy
    analyses/          lista analiz, new/ (upload), [id]/ (wynik i odtwarzacz)
    settings/          ustawienia konta
  page.tsx             strona główna
  error.tsx            ekran błędu
  not-found.tsx        strona 404
components/
  ui/                  klocki bez logiki domenowej: Button, Field, PasswordField, Panel, Switch, Spotlight, typografia
  layout/              pasek górny, nawigacja, menu użytkownika, stopka, nagłówek strony
  landing/             sekcje strony głównej (hero, podgląd analizy, ścieżka procesu)
  site/                elementy stron publicznych
  auth/                elementy formularzy logowania i rejestracji
  dashboard/           kafle statystyk, ostatni alarm, tabela analiz, szybkie akcje, limity
  settings/            sekcje ustawień: profil, bezpieczeństwo, powiadomienia, analiza, prywatność, usunięcie konta
  analysis/            odznaki statusu i werdyktu
  brand/               logo
hooks/
  use-flash.ts         krótki komunikat „Zapisano” znikający po czasie
lib/
  api/types.ts         typy kontraktu z backendem (User, Analysis, AnalysisResult)
  analysis/            formatowanie (daty, czas, procenty, etykiety) i statystyki pulpitu
  demo-data.ts         dane przykładowe do czasu podpięcia API
  routes.ts            wszystkie ścieżki aplikacji i reguły ochrony tras
  navigation.ts        linki w nawigacji i stopce
  site.ts              dane serwisu i limity analizy (4:30 min, 2 min)
  auth/                sesja (ciasteczko-flaga dla proxy)
  cn.ts                łączenie klas Tailwinda
proxy.ts               ochrona tras (w Next.js 16 dawne middleware.ts)
```

## Co dalej

Krok 1 (strony i komponenty) jest gotowy. Kolejne:

- **Krok 2:** klient API z tokenem Bearer, zamiana `demo-data.ts` na `GET /users/me` i `GET /analyses`.
- **Krok 3:** prawdziwe logowanie, rejestracja i zapisy w ustawieniach.
- **Krok 4:** upload filmu i podgląd postępu analizy.
- **Krok 5:** odtwarzacz z nakładką detekcji (`detections_track`).
- **Krok 6:** historia analiz i dopracowanie strony głównej.

Miejsca do zmiany są oznaczone w kodzie jako `TODO(krok N)`.

## Konwencje

- Ścieżki tylko przez `ROUTES` z `lib/routes.ts`, nigdy jako napisy w komponentach.
- Kolory i animacje motywu w bloku `@theme` w `app/globals.css`; zmiana wariantu wizualnego = podmiana tego bloku.
- Komponenty klienckie (`"use client"`) tylko tam, gdzie jest stan lub zdarzenia; reszta to Server Components.
- Hooki czytające URL (`usePathname`, `useSearchParams`) w komponentach owiniętych w `<Suspense>` (wymóg Cache
  Components).
- Przed commitem: `npm run lint && npm run typecheck && npm run format:check`.
