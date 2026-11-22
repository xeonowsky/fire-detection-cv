

from pathlib import Path
from sklearn.model_selection import train_test_split
from collections import defaultdict
import shutil

sources = [
    Path("/home/adam/fire-detection/mivia_fire/mivia_fire"),
    Path("/home/adam/fire-detection/mivia_smoke/mivia_smoke")
]

output = Path("/home/adam/extract_features")

extensions = {".avi"}

video_classes = defaultdict(list)

# Zbieranie nagrań
for source_id, source in enumerate(sources):

    if not source.exists():
        print(f"Folder nie istnieje: {source}")
        continue

    for class_dir in source.iterdir():

        if not class_dir.is_dir():
            continue

        # Pomijanie niepotrzebnych folderów
        if class_dir.name in ["info", "Red reflections"]:
            continue

        for video in class_dir.rglob("*"):

            if video.is_file() and video.suffix.lower() in extensions:
                video_classes[class_dir.name].append(
                    (video, source_id)
                )

# Podział i kopiowanie
for class_name, samples in video_classes.items():

    if len(samples) < 3:
        print(f"Za mało nagrań: {class_name}")
        continue

    train, temp = train_test_split(
        samples,
        test_size=0.30,
        random_state=42
    )

    val, test = train_test_split(
        temp,
        test_size=0.50,
        random_state=42
    )

    for split, files in [
        ("train", train),
        ("val", val),
        ("test", test)
    ]:

        for video, source_id in files:

            destination = output / split / class_name
            destination.mkdir(parents=True, exist_ok=True)

            filename = f"source{source_id}_{video.name}"

            shutil.copy2(
                video,
                destination / filename
            )

    print(
        f"{class_name}: "
        f"train={len(train)}, "
        f"val={len(val)}, "
        f"test={len(test)}"
    )

print("Kopiowanie zakończone!")

