from collections.abc import Callable
from pathlib import Path

from firedetector_ml.detection import Detector, get_detector
from firedetector_ml.segmentation import CoverageFunction, get_coverage_function
from firedetector_ml.tracking import IouTracker
from firedetector_ml.video import iter_frames, probe

# Limit klatek trzyma czas analizy w budżecie (2 min na film do 4:30) niezależnie od długości filmu.
MAX_FRAMES = 120
MIN_INTERVAL_S = 0.5
# Procesor i tak zmniejsza klatkę do 480–800 px; mniejsza klatka to mniej pamięci przy odczycie.
MAX_SIDE_PX = 800
BATCH_SIZE = 4

# Werdykt dopiero, gdy obiekt pojawia się w kilku klatkach: pojedyncze trafienie to częściej błąd niż pożar.
MIN_FRAMES_FOR_VERDICT = 2
HIGH_RISK_FIRE_RATIO = 0.3
HIGH_RISK_FIRE_AREA = 0.1
MEDIUM_RISK_SMOKE_RATIO = 0.3

ProgressCallback = Callable[[int], None]


def plan_frames(fps: float, frame_count: int, max_frames: int) -> tuple[list[int], float]:
    duration = frame_count / fps
    interval = max(MIN_INTERVAL_S, duration / max_frames)
    step = max(1, round(interval * fps))
    return list(range(0, frame_count, step))[:max_frames], step / fps


def analyze(
    video_path: str | Path,
    on_progress: ProgressCallback | None = None,
    *,
    detector: Detector | None = None,
    coverage: CoverageFunction | None = None,
    max_frames: int = MAX_FRAMES,
) -> dict:
    """Analizuje film i zwraca wynik w formacie pola `result` z API (backend/README.md)."""
    report = on_progress or (lambda _: None)
    detector = detector or get_detector()
    coverage = coverage or get_coverage_function()
    info = probe(video_path)
    indices, interval = plan_frames(info.fps, info.frame_count, max_frames)

    tracker = IouTracker()
    samples: list[dict] = []
    batch: list = []

    def flush() -> None:
        if not batch:
            return
        frames = detector.detect([image for _, image in batch])
        for (t, image), detections in zip(batch, frames, strict=True):
            objects = [
                {"track_id": track_id, "label": d.label, "score": float(d.score), "box": [float(v) for v in d.box]}
                for track_id, d in tracker.update(detections)
            ]
            samples.append({"t": t, "objects": objects, "coverage": coverage(image, detections)})
        batch.clear()
        report(min(99, len(samples) * 100 // len(indices)))

    report(0)
    for t, image in iter_frames(video_path, indices, info.fps, MAX_SIDE_PX):
        batch.append((t, image))
        if len(batch) == BATCH_SIZE:
            flush()
    flush()

    if not samples:
        raise ValueError("Nie udało się odczytać klatek z filmu.")
    return summarize(samples, interval)


def summarize(samples: list[dict], interval: float) -> dict:
    def frames_with(label: str) -> list[dict]:
        return [s for s in samples if any(o["label"] == label for o in s["objects"])]

    def scores(label: str) -> list[float]:
        return [o["score"] for s in samples for o in s["objects"] if o["label"] == label]

    fire_frames, smoke_frames = frames_with("fire"), frames_with("smoke")
    total = len(samples)
    fire_ratio, smoke_ratio = len(fire_frames) / total, len(smoke_frames) / total
    largest_fire = max(
        (o["box"][2] * o["box"][3] for s in fire_frames for o in s["objects"] if o["label"] == "fire"),
        default=0.0,
    )
    needed = min(MIN_FRAMES_FOR_VERDICT, total)
    fire_coverage = max((s.get("coverage", {}).get("fire", 0.0) for s in samples), default=0.0)
    smoke_coverage = max((s.get("coverage", {}).get("smoke", 0.0) for s in samples), default=0.0)

    if len(fire_frames) >= needed:
        verdict, confidence, first = "fire", max(scores("fire")), fire_frames[0]["t"]
    elif len(smoke_frames) >= needed:
        verdict, confidence, first = "smoke", max(scores("smoke")), smoke_frames[0]["t"]
    else:
        detected = scores("fire") + scores("smoke")
        verdict, confidence, first = "none", 1 - max(detected, default=0.0), None

    if verdict == "fire" and (fire_ratio >= HIGH_RISK_FIRE_RATIO or largest_fire >= HIGH_RISK_FIRE_AREA):
        risk = "high"
    elif verdict == "fire" or smoke_ratio >= MEDIUM_RISK_SMOKE_RATIO:
        risk = "medium"
    else:
        risk = "low"

    return {
        "verdict": verdict,
        "risk_level": risk,
        "confidence": round(confidence, 2),
        "first_detection_s": first,
        "fire_frame_ratio": round(fire_ratio, 2),
        "smoke_frame_ratio": round(smoke_ratio, 2),
        # Największa część kadru zajęta przez ogień / dym w jednej klatce (0–1).
        "fire_coverage_max": round(fire_coverage, 4),
        "smoke_coverage_max": round(smoke_coverage, 4),
        "detections_track": {"sample_interval_s": round(interval, 3), "samples": samples},
    }
