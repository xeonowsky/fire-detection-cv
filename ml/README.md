# fireDetector — ML

Detekcja ognia i dymu na nagraniach. Backend wywołuje jedną funkcję:

```python
from firedetector_ml import analyze

result = analyze("film.mp4", on_progress=lambda p: print(p))
```

`result` ma format pola `result` z API (zobacz [backend/README.md](../backend/README.md)): werdykt, poziom ryzyka,
pewność, pierwszy moment wykrycia i `detections_track` z ramkami i `track_id` dla nakładki w odtwarzaczu.

## Jak to działa

1. **Próbkowanie** (`video.py`): maks. 120 klatek na film, co najmniej co 0,5 s. Film 4:30 to klatka co ok. 2,3 s,
   więc czas analizy nie rośnie z długością filmu. Klatki są zmniejszane do 800 px dłuższego boku.
2. **Detekcja** (`detection.py`): [Grounding DINO tiny](https://huggingface.co/IDEA-Research/grounding-dino-tiny),
   detektor zero-shot: szuka obiektów pasujących do opisu (`"a fire"`, `"a smoke"`) bez dotrenowania.
   Ustawienia i etykiety 1:1 z `research/grounded_sam/extractboundingboxes.py`: progi 0,28 / 0,22, klatka 480–800 px,
   fraza z „fire” = ogień, z „smoke” = dym. GPU (CUDA, fp16), gdy jest dostępne. Model ładuje się przy pierwszej
   analizie i zostaje w pamięci.
3. **Pokrycie kadru** (`segmentation.py`): jaka część klatki to ogień, a jaka dym — jak licznik „Ogień: x% | Dym: y%”
   w oryginale. `FIRE_DETECTOR_SEGMENTATION=boxes` (domyślnie) liczy z ramek; `sam2` liczy z masek SAM 2 dokładnie
   jak `research/grounded_sam`, ale na CPU jest kilka razy wolniejszy (zmniejsz wtedy `ANALYSIS_MAX_FRAMES`).
4. **Śledzenie** (`tracking.py`): ramka dostaje ten sam `track_id` co najbardziej pokrywająca się ramka tej samej
   klasy z poprzednich klatek (IoU).
5. **Werdykt** (`pipeline.py`, funkcja `summarize`): ogień lub dym musi być w co najmniej 2 klatkach. Ryzyko `high`,
   gdy ogień jest w ≥30% klatek albo zajmuje ≥10% kadru; `medium` przy mniejszym ogniu albo dymie w ≥30% klatek.

Progi są stałymi na górze `pipeline.py` i `detection.py`. Inny model: zmienna `FIRE_DETECTOR_MODEL`
(np. `IDEA-Research/grounding-dino-base` — dokładniejszy, ale kilka razy wolniejszy).

## Uruchomienie lokalnie (bez Dockera)

```bash
cd ml
python -m venv .venv
.venv\Scripts\activate            # Linux/macOS: source .venv/bin/activate
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
python scripts/benchmark_cpu.py ścieżka/do/filmu.mp4 --json
```

Benchmark pokazuje czas na klatkę i szacunek dla filmu 4:30. Limit to 2 minuty — jeśli wychodzi więcej, zmniejsz
`ANALYSIS_MAX_FRAMES` w `backend/.env`.

## Struktura

```
firedetector_ml/       pakiet produkcyjny — importuje go backend
  __init__.py          eksport analyze
  pipeline.py          analyze(): próbkowanie → detekcja → śledzenie → werdykt
  detection.py         Grounding DINO, mapowanie fraz na klasy fire/smoke
  tracking.py          śledzenie obiektów między klatkami (IoU)
  video.py             odczyt wybranych klatek bez wczytywania całego filmu
scripts/
  benchmark_cpu.py     pomiar czasu analizy na tym komputerze
research/              eksperymenty i przygotowanie danych (zobacz research/README.md)
samples/               (w .gitignore) filmy testowe — nie commitujemy plików wideo
requirements.txt       zależności pakietu (torch instalowany osobno, wersja CPU)
```

Zasada: kod, który ma działać w aplikacji, trafia do `firedetector_ml/` (bez ścieżek na sztywno, bez okien `cv2`,
model ładowany przy pierwszym użyciu). Eksperymenty zostają w `research/`. SAM 2 (maski zamiast ramek) jest
domyślnie wyłączony, bo na CPU nie zmieściłby się w limicie 2 minut.
