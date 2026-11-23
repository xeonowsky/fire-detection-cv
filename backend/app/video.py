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
