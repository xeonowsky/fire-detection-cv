"""Mierzy czas analizy filmu na tym komputerze. Uruchom z folderu ml/:

    python scripts/benchmark_cpu.py ścieżka/do/filmu.mp4 --max-frames 120

Analiza musi zmieścić się w 2 minutach dla filmu 4:30. Jeśli nie, zmniejsz --max-frames.
"""

import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from firedetector_ml.detection import get_detector  # noqa: E402
from firedetector_ml.pipeline import analyze  # noqa: E402

LIMIT_S = 120


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("video", type=Path)
    parser.add_argument("--max-frames", type=int, default=120)
    parser.add_argument("--json", action="store_true", help="wypisz pełny wynik")
    args = parser.parse_args()

    started = time.perf_counter()
    detector = get_detector()
    detector.detect([])  # wymusza załadowanie modelu, żeby nie liczyć go do czasu analizy
    print(f"Ładowanie modelu: {time.perf_counter() - started:.1f} s")

    started = time.perf_counter()
    result = analyze(args.video, lambda p: print(f"\rPostęp: {p}%", end=""), max_frames=args.max_frames)
    elapsed = time.perf_counter() - started
    frames = len(result["detections_track"]["samples"])

    print(f"\nKlatki: {frames}, czas: {elapsed:.1f} s, {elapsed / frames:.2f} s/klatkę")
    print(f"Werdykt: {result['verdict']}, ryzyko: {result['risk_level']}, pewność: {result['confidence']}")
    full_length_estimate = elapsed / frames * args.max_frames
    status = "OK" if full_length_estimate <= LIMIT_S else "ZA WOLNO — zmniejsz --max-frames"
    print(f"Szacunek dla filmu 4:30 ({args.max_frames} klatek): {full_length_estimate:.0f} s → {status}")
    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
