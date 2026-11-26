import cv2
from PIL import Image
import torch
from tqdm import tqdm
from transformers import AutoModelForZeroShotObjectDetection, AutoProcessor

# 1. Konfiguracja modelu i plików
model_id = "IDEA-Research/grounding-dino-tiny"  # zmień na 'grounding-dino-base' dla większej dokładności
video_path = "/home/adam-galek/Pulpit/detectionfire/mivia_fire/fire10.avi"
output_path = "wynik_wideo.mp4"
text_prompt = [["fire", "flames", "smoke"]]  # Twoje klasy

device = "cuda" if torch.cuda.is_available() else "cpu"
processor = AutoProcessor.from_pretrained(model_id)
model = AutoModelForZeroShotObjectDetection.from_pretrained(model_id).to(device)

# 2. Otwarcie wideo wejściowego i pobranie jego parametrów
cap = cv2.VideoCapture(video_path)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

# 3. Konfiguracja zapisu wideo wyjściowego
fourcc = cv2.VideoWriter_fourcc(*"mp4v")
out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

# 4. Pętla po wszystkich klatkach
for _ in tqdm(range(total_frames), desc="Przetwarzanie wideo"):
    ret, frame = cap.read()
    if not ret:
        break

    # Konwersja BGR -> RGB dla modelu
    image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    # Detekcja
    inputs = processor(images=image, text=text_prompt, return_tensors="pt").to(
        device
    )
    with torch.no_grad():
        outputs = model(**inputs)

    results = processor.post_process_grounded_object_detection(
        outputs,
        inputs.input_ids,
        threshold=0.30,
        text_threshold=0.25,
        target_sizes=[(height, width)],
    )[0]

    # Rysowanie ramek na klatce
    for box, score, label in zip(
        results["boxes"], results["scores"], results["labels"]
    ):
        x_min, y_min, x_max, y_max = [int(round(i)) for i in box.tolist()]
        conf = round(score.item(), 2)

        cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
        cv2.putText(
            frame,
            f"{label}: {conf}",
            (x_min, max(y_min - 10, 15)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2,
        )

    # Zapis przetworzonej klatki do nowego wideo
    out.write(frame)

# 5. Zwolnienie zasobów
cap.release()
out.release()
print(f"\nGotowe! Zapisano wideo: {output_path}")
