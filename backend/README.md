# fireDetector — backend

API w FastAPI: konta użytkowników (JWT), upload filmów, analiza w tle i zwracanie wyników z detekcjami ognia i dymu.
Wersja MVP: jeden kontener, baza SQLite i pliki w wolumenie Dockera, analiza przez `BackgroundTasks` (bez kolejki).

## Stack

- Python 3.12, FastAPI + Uvicorn
- SQLModel + SQLite (`/data/app.db`)
- JWT (pyjwt, HS256) w nagłówku `Authorization: Bearer …`, hasła hashowane Argon2 (pwdlib)
- pydantic-settings (konfiguracja z `.env`)
- ffprobe (z ffmpeg) do odczytu długości filmu
- Ruff (lint i formatowanie)

## Uruchomienie

Z katalogu głównego repozytorium:

```bash
cp backend/.env.example backend/.env   # Windows: copy backend\.env.example backend\.env
docker compose up --build
```

- API: http://localhost:8000/api/v1
- Swagger (testowanie endpointów w przeglądarce): http://localhost:8000/docs
- Healthcheck: http://localhost:8000/api/v1/health

W Swaggerze: zarejestruj się albo zaloguj, skopiuj `access_token`, kliknij **Authorize** i wklej token.

## Zmienne środowiskowe (`.env`)

| Zmienna                 | Domyślnie                | Opis                                                                    |
| ----------------------- | ------------------------ | ----------------------------------------------------------------------- |
| `JWT_SECRET`            | — (wymagana)             | klucz do podpisywania tokenów; długi losowy ciąg                        |
| `JWT_EXPIRE_MINUTES`    | `1440`                   | ważność tokena w minutach (24 h)                                        |
| `DATA_DIR`              | `/data`                  | katalog na dane; filmy trafiają do `DATA_DIR/uploads`                   |
| `DATABASE_URL`          | `sqlite:////data/app.db` | adres bazy                                                              |
| `CORS_ORIGINS`          | `http://localhost:3000`  | dozwolone adresy frontendu, rozdzielone przecinkami                     |
| `ANALYSIS_ENGINE`       | `demo`                   | `model` = Grounding DINO z `ml/`, `demo` = przykładowy wynik bez modelu |
| `ANALYSIS_MAX_FRAMES`   | `120`                    | maks. liczba analizowanych klatek na film (wpływa na czas analizy)      |
| `DEMO_ANALYSIS_SECONDS` | `20`                     | czas trwania analizy w trybie `demo`                                    |

Losowy `JWT_SECRET`: `python -c "import secrets; print(secrets.token_urlsafe(48))"`.

Limity filmu są w `app/config.py`: maks. 4:30 min (`max_video_seconds = 270`), maks. 1024 MB, formaty MP4, MOV, AVI.

## Endpointy

Wszystkie pod prefiksem `/api/v1`. 🔒 = wymaga nagłówka `Authorization: Bearer <token>`.

### Konto

| Metoda   | Ścieżka              |     | Opis                                  | Odpowiedź                                    |
| -------- | -------------------- | --- | ------------------------------------- | -------------------------------------------- |
| `POST`   | `/auth/register`     |     | rejestracja `{name, email, password}` | `201` token + użytkownik, `409` zajęty email |
| `POST`   | `/auth/login`        |     | logowanie `{email, password}`         | `200` token + użytkownik, `401`              |
| `GET`    | `/users/me`          | 🔒  | dane zalogowanego użytkownika         | `200`                                        |
| `PATCH`  | `/users/me`          | 🔒  | zmiana `{name?, email?}`              | `200`, `409` zajęty email                    |
| `POST`   | `/users/me/password` | 🔒  | `{current_password, new_password}`    | `204`, `400` złe obecne hasło                |
| `DELETE` | `/users/me`          | 🔒  | usuwa konto, analizy i pliki          | `204`                                        |

Hasło musi mieć co najmniej 8 znaków.

### Analizy

| Metoda   | Ścieżka                  |     | Opis                                          | Odpowiedź                                  |
| -------- | ------------------------ | --- | --------------------------------------------- | ------------------------------------------ |
| `POST`   | `/analyses`              | 🔒  | upload `multipart/form-data`: `file`, `name?` | `202`, `413` za duży, `422` format/długość |
| `GET`    | `/analyses?limit&offset` | 🔒  | lista analiz użytkownika (najnowsze pierwsze) | `200` `{items, total}`                     |
| `GET`    | `/analyses/{id}`         | 🔒  | status, postęp i wynik                        | `200`, `404`                               |
| `DELETE` | `/analyses/{id}`         | 🔒  | usuwa analizę i plik filmu                    | `204`, `404`                               |
| `DELETE` | `/analyses`              | 🔒  | usuwa wszystkie analizy użytkownika           | `204`                                      |
| `GET`    | `/analyses/{id}/video`   |     | plik filmu dla `<video src>`                  | `200`, `404`                               |

Cudza analiza zwraca `404`, nie `403`, żeby nie zdradzać, że istnieje. Film jest dostępny bez tokena, bo tag
`<video>` nie wysyła nagłówka `Authorization`; na MVP chroni go trudny do zgadnięcia identyfikator.

Błędy mają format FastAPI: `{"detail": "komunikat po polsku"}`.

### Cykl życia analizy

```
POST /analyses ──► queued ──► processing (progress 0–100) ──► done   (result)
                                                         └──► failed (error)
```

Frontend po uploadzie odpytuje `GET /analyses/{id}` co 1–2 s, aż status będzie `done` albo `failed`.

### Format wyniku (`result`)

```json
{
  "verdict": "fire",
  "risk_level": "high",
  "confidence": 0.91,
  "first_detection_s": 12.4,
  "fire_frame_ratio": 0.8,
  "smoke_frame_ratio": 0.75,
  "detections_track": {
    "sample_interval_s": 0.2,
    "samples": [
      {
        "t": 12.4,
        "objects": [{ "track_id": 1, "label": "fire", "score": 0.91, "box": [0.4, 0.45, 0.2, 0.35] }]
      }
    ]
  }
}
```

- `verdict`: `fire` | `smoke` | `none`; `risk_level`: `low` | `medium` | `high`.
- `box` to `[x, y, szerokość, wysokość]` względem rozmiaru klatki (0–1), więc nakładka skaluje się do dowolnego
  rozmiaru odtwarzacza.
- `track_id` łączy ten sam obiekt między próbkami (object tracking).

## Struktura

```
app/
  main.py          aplikacja, CORS, router /api/v1, przekierowanie / → /docs
  config.py        ustawienia z .env i limity filmu
  db.py            silnik SQLite, tworzenie tabel, sesja
  models.py        tabele User i Analysis
  schemas.py       modele żądań i odpowiedzi
  security.py      hashowanie haseł, JWT, zależność CurrentUser
  video.py         długość filmu przez ffprobe
  storage.py       usuwanie plików filmów
  analysis.py      analiza w tle: model z ml/ albo tryb demo
  routers/
    auth.py        rejestracja, logowanie, konto
    analyses.py    upload, lista, szczegóły, usuwanie, film
```

## Model ML

Przy `ANALYSIS_ENGINE=model` analiza wywołuje `analyze()` z pakietu [`ml/firedetector_ml`](../ml/README.md)
(Grounding DINO + śledzenie obiektów) i zapisuje postęp w bazie. Obraz Dockera budowany jest z katalogu głównego
repo, bo zawiera `backend/` i `ml/`; torch instaluje się w wersji CPU.

- Pierwsza analiza pobiera model (ok. 700 MB) do wolumenu `models`, kolejne korzystają z kopii.
- Analizy wykonują się po kolei: dwie naraz na CPU byłyby wolniejsze.
- Tryb `demo` (`ANALYSIS_ENGINE=demo`) zwraca przykładowy wynik bez modelu — przydatny do pracy nad frontendem.

## Jakość kodu

```bash
ruff check app
ruff format app
```

## Dane

Baza i filmy są w wolumenie Dockera `appdata` (`/data` w kontenerze), więc przetrwają restart.
`docker compose down -v` usuwa je bezpowrotnie.
