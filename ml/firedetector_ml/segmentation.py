"""Jaka część kadru to ogień, a jaka dym — jak licznik „Ogień: x% | Dym: y%” w extractboundingboxes.py.

Dwa tryby (zmienna FIRE_DETECTOR_SEGMENTATION):
- "boxes" (domyślnie): suma powierzchni ramek. Szybkie, przybliżone (ramka obejmuje też tło).
- "sam2": maski SAM 2 dla każdej ramki, liczone w pikselach jak w oryginale. Dokładne, ale na CPU
  kilka razy wolniejsze — przy limicie 2 min zmniejsz wtedy ANALYSIS_MAX_FRAMES.
"""

import os
import threading
from collections.abc import Callable

import numpy as np
from PIL import Image

from firedetector_ml.detection import Detection, Label, select_device

Coverage = dict[Label, float]
CoverageFunction = Callable[[Image.Image, list[Detection]], Coverage]

SEGMENTATION = os.getenv("FIRE_DETECTOR_SEGMENTATION", "boxes")
SAM_MODEL_ID = os.getenv("FIRE_DETECTOR_SAM_MODEL", "facebook/sam2.1-hiera-tiny")
GRID_SIZE = 200


def _empty() -> Coverage:
    return {"fire": 0.0, "smoke": 0.0}


def box_coverage(_: Image.Image, detections: list[Detection]) -> Coverage:
    """Część kadru pokryta ramkami każdej klasy; nakładające się ramki liczone raz."""
    coverage = _empty()
    for label in coverage:
        grid = np.zeros((GRID_SIZE, GRID_SIZE), dtype=bool)
        for detection in detections:
            if detection.label != label:
                continue
            x, y, width, height = detection.box
            x0, y0 = int(x * GRID_SIZE), int(y * GRID_SIZE)
            x1, y1 = int(np.ceil((x + width) * GRID_SIZE)), int(np.ceil((y + height) * GRID_SIZE))
            grid[y0:y1, x0:x1] = True
        coverage[label] = round(float(grid.mean()), 4)
    return coverage


class Sam2Segmenter:
    """SAM 2 tak jak w oryginale: ramki z Grounding DINO jako podpowiedź, maska na każdą ramkę."""

    def __init__(self, model_id: str = SAM_MODEL_ID) -> None:
        self.model_id = model_id
        self._model = None
        self._processor = None
        self._device = "cpu"
        self._lock = threading.Lock()

    def _load(self) -> None:
        import torch
        from transformers import Sam2Model, Sam2Processor

        self._device = select_device()
        dtype = torch.bfloat16 if self._device == "cuda" else torch.float32
        self._processor = Sam2Processor.from_pretrained(self.model_id)
        self._model = Sam2Model.from_pretrained(self.model_id, torch_dtype=dtype).to(self._device).eval()

    def __call__(self, image: Image.Image, detections: list[Detection]) -> Coverage:
        if not detections:
            return _empty()
        import torch

        width, height = image.size
        boxes = [
            [x * width, y * height, (x + w) * width, (y + h) * height] for x, y, w, h in (d.box for d in detections)
        ]
        with self._lock:
            if self._model is None:
                self._load()
            inputs = self._processor(images=image, input_boxes=[boxes], return_tensors="pt").to(self._device)
            with torch.inference_mode():
                outputs = self._model(**inputs, multimask_output=False)
            masks = self._processor.post_process_masks(outputs.pred_masks.cpu(), inputs["original_sizes"].cpu())[0]

        # Suma masek danej klasy (piksel liczony raz, nawet gdy maski się nakładają).
        union = {label: np.zeros((height, width), dtype=bool) for label in _empty()}
        for mask, detection in zip(masks, detections, strict=True):
            union[detection.label] |= mask.squeeze().numpy().astype(bool)
        return {label: round(float(pixels.mean()), 4) for label, pixels in union.items()}


_segmenter: CoverageFunction | None = None
_segmenter_lock = threading.Lock()


def get_coverage_function() -> CoverageFunction:
    global _segmenter
    with _segmenter_lock:
        if _segmenter is None:
            _segmenter = Sam2Segmenter() if SEGMENTATION == "sam2" else box_coverage
        return _segmenter
