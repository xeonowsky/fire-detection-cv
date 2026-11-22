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
npm install
npm run dev
```

Aplikacja działa pod http://localhost:3000. Na tym etapie logowanie jest demonstracyjne: dowolne dane ustawiają
ciasteczko sesji `fd_session` i przenoszą na pulpit.

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
  (site)/          strony publiczne: regulamin, prywatność, kontakt
  (auth)/          logowanie, rejestracja, przypomnienie hasła
  (app)/           trasy po zalogowaniu: pulpit, analizy, konto
  page.tsx         strona główna
components/
  ui/              klocki bez logiki domenowej: Button, Field, PasswordField, Spotlight, typografia
  layout/          pasek górny, nawigacja, stopka, nagłówek strony
  landing/         sekcje strony głównej
  site/            elementy stron publicznych
  auth/            elementy formularzy logowania i rejestracji
  brand/           logo
lib/
  routes.ts        wszystkie ścieżki aplikacji i reguły ochrony tras
  navigation.ts    linki w nawigacji i stopce
  site.ts          dane serwisu i limity analizy (4:30 min, 2 min)
  auth/            sesja (ciasteczko-flaga dla proxy)
  cn.ts            łączenie klas Tailwinda
proxy.ts           ochrona tras (w Next.js 16 dawne middleware.ts)
```

## Konwencje

- Ścieżki tylko przez `ROUTES` z `lib/routes.ts`, nigdy jako napisy w komponentach.
- Kolory i animacje motywu w bloku `@theme` w `app/globals.css`; zmiana wariantu wizualnego = podmiana tego bloku.
- Komponenty klienckie (`"use client"`) tylko tam, gdzie jest stan lub zdarzenia; reszta to Server Components.
- Hooki czytające URL (`usePathname`, `useSearchParams`) w komponentach owiniętych w `<Suspense>` (wymóg Cache
  Components).
- Przed commitem: `npm run lint && npm run typecheck && npm run format:check`.
