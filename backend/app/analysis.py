import math
import time

from sqlmodel import Session

from app.config import settings
from app.db import engine
from app.models import Analysis, AnalysisStatus

PROGRESS_STEPS = 10
SAMPLE_INTERVAL_S = 0.2


def run_analysis(analysis_id: str) -> None:
    """Uruchamiane w tle po uploadzie. Zapisuje postęp i wynik w bazie."""
    with Session(engine) as session:
        analysis = session.get(Analysis, analysis_id)
        if analysis is None:
            return
        try:
            _set_status(session, analysis, AnalysisStatus.processing, progress=0)
            # TODO(model): zamienić na analyze(video_path, on_progress) od zespołu ML.
            result = _demo_analysis(session, analysis)
            analysis.result = result
            _set_status(session, analysis, AnalysisStatus.done, progress=100)
        except Exception as error:  # noqa: BLE001 - każdy błąd analizy ma trafić do użytkownika jako status
            analysis.error = f"Analiza nie powiodła się: {error}"
            _set_status(session, analysis, AnalysisStatus.failed, progress=analysis.progress)


def _set_status(session: Session, analysis: Analysis, status: AnalysisStatus, progress: int) -> None:
    analysis.status = status
    analysis.progress = progress
    session.add(analysis)
    session.commit()
    session.refresh(analysis)


def _demo_analysis(session: Session, analysis: Analysis) -> dict:
    """Przykładowy wynik w formacie kontraktu API, dopóki nie ma prawdziwego modelu."""
    step_delay = settings.demo_analysis_seconds / PROGRESS_STEPS
    for step in range(1, PROGRESS_STEPS):
        time.sleep(step_delay)
        analysis.progress = step * 100 // PROGRESS_STEPS
        session.add(analysis)
        session.commit()

    duration = analysis.duration_s or 60.0
    samples = _demo_samples(duration)
    fire_scores = [obj["score"] for s in samples for obj in s["objects"] if obj["label"] == "fire"]
    fire_frames = sum(1 for s in samples if any(o["label"] == "fire" for o in s["objects"]))
    smoke_frames = sum(1 for s in samples if any(o["label"] == "smoke" for o in s["objects"]))
    first_fire = next((s["t"] for s in samples if any(o["label"] == "fire" for o in s["objects"])), None)

    return {
        "verdict": "fire" if fire_scores else "none",
        "risk_level": "high" if fire_scores else "low",
        "confidence": round(max(fire_scores, default=0.0), 2),
        "first_detection_s": first_fire,
        "fire_frame_ratio": round(fire_frames / len(samples), 2),
        "smoke_frame_ratio": round(smoke_frames / len(samples), 2),
        "detections_track": {
            "sample_interval_s": SAMPLE_INTERVAL_S,
            "samples": samples,
        },
    }


def _demo_samples(duration_s: float) -> list[dict]:
    """Ogień pojawia się po ~20% filmu i lekko się porusza; dym nad nim od ~25%."""
    samples = []
    count = int(duration_s / SAMPLE_INTERVAL_S)
    for i in range(count):
        t = round(i * SAMPLE_INTERVAL_S, 2)
        position = t / duration_s
        sway = math.sin(t) * 0.02
        objects = []
        if position >= 0.2:
            objects.append({"track_id": 1, "label": "fire", "score": 0.91, "box": [0.40 + sway, 0.45, 0.20, 0.35]})
        if position >= 0.25:
            objects.append({"track_id": 2, "label": "smoke", "score": 0.74, "box": [0.45 + sway, 0.08, 0.35, 0.30]})
        samples.append({"t": t, "objects": objects})
    return samples
