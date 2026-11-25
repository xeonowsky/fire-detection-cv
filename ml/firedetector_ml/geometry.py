Box = tuple[float, float, float, float]


def iou(a: Box, b: Box) -> float:
    """Pokrycie dwóch ramek [x, y, szerokość, wysokość] (0 = rozłączne, 1 = identyczne)."""
    ax2, ay2, bx2, by2 = a[0] + a[2], a[1] + a[3], b[0] + b[2], b[1] + b[3]
    inter_w = max(0.0, min(ax2, bx2) - max(a[0], b[0]))
    inter_h = max(0.0, min(ay2, by2) - max(a[1], b[1]))
    intersection = inter_w * inter_h
    union = a[2] * a[3] + b[2] * b[3] - intersection
    return intersection / union if union > 0 else 0.0


def center_to_corner(cx: float, cy: float, width: float, height: float) -> Box:
    """[środek x, środek y, w, h] → [lewy górny x, y, w, h], przycięte do kadru."""
    x1, y1 = max(0.0, cx - width / 2), max(0.0, cy - height / 2)
    x2, y2 = min(1.0, cx + width / 2), min(1.0, cy + height / 2)
    return (x1, y1, max(0.0, x2 - x1), max(0.0, y2 - y1))
