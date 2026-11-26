from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path

import cv2
from PIL import Image


@dataclass(frozen=True)
class VideoInfo:
    fps: float
    frame_count: int
    duration_s: float


def probe(video_path: str | Path) -> VideoInfo:
    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        raise ValueError("Nie można otworzyć pliku wideo.")
    fps = capture.get(cv2.CAP_PROP_FPS) or 25.0
    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    capture.release()
    if frame_count <= 0:
        raise ValueError("Plik wideo nie zawiera klatek.")
    return VideoInfo(fps=fps, frame_count=frame_count, duration_s=frame_count / fps)


def iter_frames(
    video_path: str | Path, frame_indices: list[int], fps: float, max_side: int
) -> Iterator[tuple[float, Image.Image]]:
    """Zwraca (czas_s, klatka RGB) tylko dla wskazanych klatek, bez wczytywania całego filmu do pamięci.

    Klatki są czytane po kolei (grab), bo przewijanie (seek) w AVI i części MP4 bywa niedokładne.
    """
    wanted = sorted(set(frame_indices))
    if not wanted:
        return
    capture = cv2.VideoCapture(str(video_path))
    try:
        position = 0
        for target in wanted:
            while position < target:
                if not capture.grab():
                    return
                position += 1
            ok, frame = capture.read()
            position += 1
            if not ok or frame is None:
                return
            yield round(target / fps, 2), _to_pil(frame, max_side)
    finally:
        capture.release()


def _to_pil(frame_bgr, max_side: int) -> Image.Image:
    height, width = frame_bgr.shape[:2]
    scale = max_side / max(height, width)
    if scale < 1:
        frame_bgr = cv2.resize(frame_bgr, (round(width * scale), round(height * scale)), interpolation=cv2.INTER_AREA)
    return Image.fromarray(cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB))
