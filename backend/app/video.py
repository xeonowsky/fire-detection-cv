import json
import shutil
import subprocess
from pathlib import Path


def read_duration_seconds(video_path: Path) -> float | None:
    """Długość filmu z ffprobe; None, gdy ffprobe nie jest dostępny albo plik nie jest wideo."""
    if shutil.which("ffprobe") is None:
        return None
    command = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        str(video_path),
    ]
    completed = subprocess.run(command, capture_output=True, text=True, timeout=30, check=False)
    if completed.returncode != 0:
        return None
    try:
        return float(json.loads(completed.stdout)["format"]["duration"])
    except (KeyError, ValueError, json.JSONDecodeError):
        return None


# AVI nie odtwarza się w przeglądarkach; H.264 w MP4 odtwarza każda. +faststart: odtwarzanie przed pobraniem całości.
TRANSCODE_EXTENSIONS = {".avi"}


def make_browser_playable(video_path: Path) -> Path:
    """Konwertuje AVI do MP4 (H.264) i usuwa oryginał. Inne formaty i brak ffmpeg: plik bez zmian."""
    if video_path.suffix.lower() not in TRANSCODE_EXTENSIONS or shutil.which("ffmpeg") is None:
        return video_path
    target = video_path.with_suffix(".mp4")
    command = [
        "ffmpeg",
        "-y",
        "-v",
        "error",
        "-i",
        str(video_path),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "24",
        "-pix_fmt",
        "yuv420p",
        "-vf",
        "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        str(target),
    ]
    completed = subprocess.run(command, capture_output=True, text=True, timeout=300, check=False)
    if completed.returncode != 0:
        target.unlink(missing_ok=True)
        return video_path
    video_path.unlink(missing_ok=True)
    return target
