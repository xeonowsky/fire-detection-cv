# fireDetector

Aplikacja webowa do oceny zagrożenia pożarowego na podstawie nagrań wideo. Użytkownik zakłada konto, wgrywa film
(do 4:30 min), a API w Pythonie w ciągu maks. 2 minut zwraca werdykt oraz detekcje ognia i dymu, które frontend
nakłada na odtwarzany film.

Projekt jest MVP do prezentacji: celowo prosty stos, jeden kontener z API i baza SQLite.

## Struktura repozytorium

```
fire-detection-cv/
├─ frontend/              Next.js 16 — strona, logowanie, pulpit, analizy, ustawienia (port 3000)
├─ backend/               FastAPI — konta, upload filmów, analiza w tle, SQLite (port 8000, Docker)
├─ ml/
│  ├─ firedetector_ml/    pakiet używany przez backend: analyze() → werdykt + ramki ognia i dymu
│  ├─ scripts/            narzędzia uruchamiane ręcznie (benchmark CPU)
│  └─ research/           eksperymenty: Grounded SAM 2, klasyfikacja DINOv3, przygotowanie zbioru danych
├─ docker-compose.yml     uruchamia backend razem z ml/
├─ .gitattributes         końce linii LF w całym repo
└─ .editorconfig          wspólne wcięcia i kodowanie dla edytorów
```

Każdy folder ma własne README: [frontend](frontend/README.md), [backend](backend/README.md), [ml](ml/README.md),
[ml/research](ml/research/README.md).

## Jak to działa

```
przeglądarka ──► frontend (Next.js, :3000) ──► API (FastAPI, :8000/api/v1) ──► SQLite + pliki w wolumenie /data
                                                    │
                                                    └─► analiza w tle (BackgroundTasks) → model ML
```

1. Frontend wysyła film na `POST /api/v1/analyses`. API sprawdza format i długość (ffprobe), zapisuje plik
   i od razu odpowiada `202` ze statusem `queued`.
2. Analiza działa w tle w tym samym procesie API i aktualizuje `progress` w bazie.
3. Frontend odpytuje `GET /api/v1/analyses/{id}`, aż status będzie `done` albo `failed`.
4. Wynik zawiera werdykt, poziom ryzyka, pewność i `detections_track`, czyli ramki ognia i dymu w czasie.

Analizę wykonuje pakiet `ml/firedetector_ml` (Grounding DINO + śledzenie obiektów, CPU). Ustawienie
`ANALYSIS_ENGINE=demo` w `backend/.env` przełącza na przykładowy wynik bez modelu.

## Uruchomienie

Wymagania: Docker Desktop, Node.js 20+.

### 1. Backend (Docker)

```bash
cp backend/.env.example backend/.env   # Windows: copy backend\.env.example backend\.env
# w backend/.env ustaw JWT_SECRET na długi losowy ciąg
docker compose up --build
```

- API: http://localhost:8000/api/v1
- Dokumentacja Swagger: http://localhost:8000/docs (`/` przekierowuje tutaj)
- Healthcheck: http://localhost:8000/api/v1/health

Kod backendu jest zamontowany w kontenerze, a Uvicorn działa z `--reload`, więc zmiany w `backend/app` wczytują się
bez przebudowy. Przebudowa (`--build`) jest potrzebna tylko po zmianie `requirements.txt` albo `Dockerfile`. Pierwsze
budowanie trwa kilka minut (torch), a pierwsza analiza pobiera model (ok. 700 MB) — kolejne są szybkie.

### 2. Frontend (lokalnie)

```bash
cd frontend
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm install
npm run dev
```

Aplikacja: http://localhost:3000

### Przydatne polecenia

| Polecenie                      | Co robi                                |
| ------------------------------ | -------------------------------------- |
| `docker compose up -d`         | uruchamia API w tle                    |
| `docker compose logs -f api`   | podgląd logów API                      |
| `docker compose down`          | zatrzymuje kontener (dane zostają)     |
| `docker compose down -v`       | zatrzymuje i **usuwa** bazę oraz filmy |
| `docker compose exec api bash` | powłoka w kontenerze                   |

## Stan prac

| Obszar                         | Stan                                                             |
| ------------------------------ | ---------------------------------------------------------------- |
| Frontend: strony i komponenty  | gotowe (strona główna, auth, pulpit, ustawienia, podstrony)      |
| Backend: konta, analizy, pliki | gotowe, przetestowane                                            |
| Połączenie frontendu z API     | gotowe: logowanie, rejestracja, pulpit, ustawienia               |
| Upload i status analizy        | gotowe: przeciąganie lub wybór pliku, postęp wysyłania i analizy |
| Odtwarzacz z nakładką detekcji | gotowe: ramki na żywo, oś czasu, statystyki, lista obiektów      |
| Model ML                       | podpięty (Grounding DINO); do zmierzenia czas na CPU             |

## Sposób pracy

- `main` zawsze działa. Każda zmiana na osobnym branchu (`feat/…`, `fix/…`, `ml/…`, `chore/…`) i przez Pull Request.
- Nazwy commitów według [Conventional Commits](https://www.conventionalcommits.org/): `feat(frontend): …`, `fix(backend): …`, `chore: …`.
- Sekretów nie commitujemy: `backend/.env` i `frontend/.env.local` są w `.gitignore`, w repo tylko `.env.example`. Filmów i wag modeli też nie — trzymamy je lokalnie w `ml/samples/`.

## Licencja

Zobacz [LICENSE](LICENSE).
