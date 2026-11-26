import os
import cv2
import numpy as np
import torch
from PIL import Image
from transformers import (
    AutoProcessor,
    AutoModelForZeroShotObjectDetection,
    Sam2Model,
    Sam2Processor,
)

device = "cuda" if torch.cuda.is_available() else "cpu"
dino_dtype = torch.float16 if device == "cuda" else torch.float32
sam_dtype = torch.bfloat16 if device == "cuda" else torch.float32

dino_processor = AutoProcessor.from_pretrained(
    "IDEA-Research/grounding-dino-tiny",
    size={"shortest_edge": 480, "longest_edge": 800}
)
dino_model = AutoModelForZeroShotObjectDetection.from_pretrained(
    "IDEA-Research/grounding-dino-tiny",
    torch_dtype=dino_dtype
).to(device).eval()

sam_processor = Sam2Processor.from_pretrained("facebook/sam2.1-hiera-tiny")
sam_model = Sam2Model.from_pretrained(
    "facebook/sam2.1-hiera-tiny",
    torch_dtype=sam_dtype
).to(device).eval()


def grounded_sam_realtime(video_path: str | int, output_video_path: str, frame_stride: int = 5):
    # Jako video_path możesz podać ścieżkę do pliku LUB 0 (kamera internetowa na żywo!)
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Błąd: Nie można otworzyć źródła wideo: {video_path}")
        return

    orig_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    effective_fps = max(1.0, orig_fps / frame_stride)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_pixels = width * height

    os.makedirs(os.path.dirname(output_video_path) or ".", exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out_video = cv2.VideoWriter(output_video_path, fourcc, effective_fps, (width, height))

    window_name = "Grounded SAM 2 - Podglad na zywo (nacisnij 'q' aby zakonczyc)"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)

    text_prompt = [["a fire", "a smoke"]]
    colors = {"a fire": (0, 0, 255), "a smoke": (255, 180, 0)}
    raw_idx = 0

    while cap.isOpened():
        if not cap.grab():
            break

        if raw_idx % frame_stride == 0:
            ret, frame = cap.retrieve()
            if not ret or frame is None:
                raw_idx += 1
                continue

            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

            # 1. Grounding DINO
            dino_inputs = dino_processor(
                images=pil_image, text=text_prompt, return_tensors="pt"
            ).to(device)
            if device == "cuda":
                dino_inputs["pixel_values"] = dino_inputs["pixel_values"].to(torch.float16)

            with torch.inference_mode():
                dino_out = dino_model(**dino_inputs)

            detections = dino_processor.post_process_grounded_object_detection(
                dino_out,
                dino_inputs.input_ids,
                threshold=0.28,
                text_threshold=0.22,
                target_sizes=[pil_image.size[::-1]],
            )[0]

            boxes = detections["boxes"]
            labels = detections["labels"]
            scores = detections["scores"]

            canvas = frame.copy()
            fire_pixels = 0
            smoke_pixels = 0

            # 2. SAM 2 (uruchamiany tylko gdy DINO coś znajdzie)
            if len(boxes) > 0:
                sam_inputs = sam_processor(
                    images=pil_image,
                    input_boxes=[boxes.tolist()],
                    return_tensors="pt"
                ).to(device)

                with torch.inference_mode():
                    sam_out = sam_model(**sam_inputs, multimask_output=False)

                masks = sam_processor.post_process_masks(
                    sam_out.pred_masks.cpu(),
                    sam_inputs["original_sizes"].cpu()
                )[0]

                overlay = canvas.copy()
                for m, label, score in zip(masks, labels, scores):
                    mask_bool = m.squeeze().numpy().astype(bool)
                    color = colors.get(label, (0, 255, 0))

                    if np.any(mask_bool):
                        px = int(np.sum(mask_bool))
                        if "fire" in label:
                            fire_pixels += px
                        elif "smoke" in label:
                            smoke_pixels += px

                        overlay[mask_bool] = color
                        contours, _ = cv2.findContours(
                            mask_bool.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
                        )
                        cv2.drawContours(canvas, contours, -1, color, 2)

                        y_idx, x_idx = np.where(mask_bool)
                        top_x, top_y = int(np.min(x_idx)), max(20, int(np.min(y_idx)) - 6)
                        cv2.putText(
                            canvas, f"{label} ({score.item():.2f})", (top_x, top_y),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2
                        )

                canvas = cv2.addWeighted(overlay, 0.45, canvas, 0.55, 0)

            fire_pct = (fire_pixels / total_pixels) * 100
            smoke_pct = (smoke_pixels / total_pixels) * 100
            cv2.putText(
                canvas, f"Ogien: {fire_pct:.1f}% | Dym: {smoke_pct:.1f}%", (10, 22),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2
            )

            # Wyświetlenie na żywo ORAZ zapis do pliku MP4
            cv2.imshow(window_name, canvas)
            out_video.write(canvas)

            # Przerwanie klawiszem 'q'
            if cv2.waitKey(1) & 0xFF == ord("q"):
                print("Zatrzymano przez użytkownika.")
                break

        raw_idx += 1

    cap.release()
    out_video.release()
    cv2.destroyAllWindows()
    print(f"Zakończono! Zapisano w: {output_video_path}")


# --- URUCHOMIENIE ---
# Dla pliku wideo:
grounded_sam_realtime(
    video_path="//home/adam-galek/Pulpit/detectionfire/datasetwithsplit/train/fire/fire1.avi",
    output_video_path="wynik_live.mp4",
    frame_stride=5
)

# Dla kamery na żywo (wystarczy podać 0 zamiast ścieżki):
# grounded_sam_realtime(video_path=0, output_video_path="kamera_live.mp4", frame_stride=1)



