from dataclasses import dataclass

from firedetector_ml.detection import Detection
from firedetector_ml.geometry import iou


@dataclass
class _Track:
    track_id: int
    detection: Detection
    missed: int = 0


class IouTracker:
    """Proste śledzenie: ramka dostaje ten sam track_id co najbardziej pokrywająca się ramka
    tej samej klasy z poprzednich klatek. Wystarcza przy rzadkim próbkowaniu i kilku obiektach."""

    def __init__(self, iou_threshold: float = 0.2, max_missed: int = 3) -> None:
        self.iou_threshold = iou_threshold
        self.max_missed = max_missed
        self._tracks: list[_Track] = []
        self._next_id = 1

    def update(self, detections: list[Detection]) -> list[tuple[int, Detection]]:
        assigned: list[tuple[int, Detection]] = []
        free = list(self._tracks)
        for detection in sorted(detections, key=lambda d: d.score, reverse=True):
            candidates = [t for t in free if t.detection.label == detection.label]
            best = max(candidates, key=lambda t: iou(t.detection.box, detection.box), default=None)
            if best is not None and iou(best.detection.box, detection.box) >= self.iou_threshold:
                free.remove(best)
                best.detection, best.missed = detection, 0
                assigned.append((best.track_id, detection))
            else:
                track = _Track(self._next_id, detection)
                self._next_id += 1
                self._tracks.append(track)
                assigned.append((track.track_id, detection))

        for track in free:
            track.missed += 1
        self._tracks = [t for t in self._tracks if t.missed <= self.max_missed]
        return assigned
