import os
import threading
from dataclasses import dataclass
from typing import Literal, Protocol

from PIL import Image

from firedetector_ml.geometry import Box

Label = Literal["fire", "smoke"]

MODEL_ID = os.getenv("FIRE_DETECTOR_MODEL", "IDEA-Research/grounding-dino-tiny")

# Ustawienia 1:1 z ml/research/grounded_sam/extractboundingboxes.py (detekcja kolegi).
PROMPTS = ["a fire", "a smoke"]
IMAGE_SIZE = {"shortest_edge": 480, "longest_edge": 800}
BOX_THRESHOLD = 0.28
TEXT_THRESHOLD = 0.22


@dataclass(frozen=True)
class Detection:
    label: Label
    score: float
    # [x, y, szerokość, wysokość] względem rozmiaru klatki (0–1)
    box: Box


class Detector(Protocol):
    def detect(self, images: list[Image.Image]) -> list[list[Detection]]: ...


def to_label(phrase: str) -> Label | None:
    """Jak w oryginale: fraza z „fire” to ogień, z „smoke” to dym."""
    phrase = phrase.lower()
    if "fire" in phrase:
        return "fire"
    if "smoke" in phrase:
        return "smoke"
    return None


def select_device() -> str:
    """Jak w oryginale: GPU, gdy jest dostępne, inaczej CPU."""
    import torch

    return "cuda" if torch.cuda.is_available() else "cpu"


class GroundingDinoDetector:
    """Grounding DINO z Hugging Face. Model ładuje się przy pierwszym użyciu, nie przy imporcie."""

    def __init__(self, model_id: str = MODEL_ID) -> None:
        self.model_id = model_id
        self._model = None
        self._processor = None
        self._device = "cpu"
        self._lock = threading.Lock()

    def _load(self) -> None:
        import torch
        from transformers import AutoModelForZeroShotObjectDetection, AutoProcessor

        torch.set_num_threads(os.cpu_count() or 1)
        self._device = select_device()
        # Jak w oryginale: fp16 na GPU, fp32 na CPU.
        dtype = torch.float16 if self._device == "cuda" else torch.float32
        self._processor = AutoProcessor.from_pretrained(self.model_id, size=IMAGE_SIZE)
        self._model = (
            AutoModelForZeroShotObjectDetection.from_pretrained(self.model_id, torch_dtype=dtype)
            .to(self._device)
            .eval()
        )

    def detect(self, images: list[Image.Image]) -> list[list[Detection]]:
        import torch

        # Jedna analiza naraz: dwie równoległe na CPU byłyby wolniejsze niż po kolei.
        with self._lock:
            if self._model is None:
                self._load()
            if not images:
                return []
            inputs = self._processor(images=images, text=[PROMPTS] * len(images), return_tensors="pt").to(self._device)
            if self._device == "cuda":
                inputs["pixel_values"] = inputs["pixel_values"].to(torch.float16)
            with torch.inference_mode():
                outputs = self._model(**inputs)
            results = self._processor.post_process_grounded_object_detection(
                outputs,
                inputs.input_ids,
                threshold=BOX_THRESHOLD,
                text_threshold=TEXT_THRESHOLD,
                target_sizes=[image.size[::-1] for image in images],
            )
        return [_to_detections(result, image) for result, image in zip(results, images, strict=True)]


def _to_detections(result: dict, image: Image.Image) -> list[Detection]:
    width, height = image.size
    # Nowsze transformers: frazy w "text_labels"; starsze: w "labels".
    phrases = result["text_labels"] if "text_labels" in result else result["labels"]
    detections = []
    for box, score, phrase in zip(result["boxes"].tolist(), result["scores"].tolist(), phrases, strict=True):
        label = to_label(str(phrase))
        if label is None:
            continue
        x1, y1, x2, y2 = (max(0.0, value) for value in box)
        x2, y2 = min(x2, width), min(y2, height)
        normalized = (x1 / width, y1 / height, (x2 - x1) / width, (y2 - y1) / height)
        detections.append(Detection(label, round(score, 3), tuple(round(v, 4) for v in normalized)))
    return detections


_detector: GroundingDinoDetector | None = None
_detector_lock = threading.Lock()


def get_detector() -> Detector:
    """Jeden detektor na proces: model ładuje się raz i zostaje w pamięci."""
    global _detector
    with _detector_lock:
        if _detector is None:
            _detector = GroundingDinoDetector()
        return _detector
