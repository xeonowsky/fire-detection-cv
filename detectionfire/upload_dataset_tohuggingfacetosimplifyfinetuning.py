import os
from datasets import Dataset, DatasetDict, Features, Sequence, Image, ClassLabel, Value
from pathlib import Path 

def build_split(split_dir: Path, class_names: list[str]) -> Dataset:
    records = []
    for class_name in class_names:
        class_dir = split_dir / class_name
        if not class_dir.exists():
            continue
            
        # Iterujemy po podfolderach z klatkami
        for seq_dir in sorted([d for d in class_dir.iterdir() if d.is_dir()]):
            # Sortujemy klatki (jeśli nazwy to np. 1.jpg, 2.jpg, 10.jpg, użyj sortowania naturalnego)
            frames = sorted(
                [str(f) for f in seq_dir.iterdir() if f.suffix.lower() in {".jpg", ".jpeg"}],
                key=lambda x: int(Path(x).stem) if Path(x).stem.isdigit() else Path(x).stem
            )
            if frames:
                records.append({
                    "frames": frames,
                    "label": class_name,
                    "sequence_id": seq_dir.name
                })

    features = Features({
        "frames": Sequence(Image()),
        "label": ClassLabel(names=class_names),
        "sequence_id": Value("string")
    })

    return Dataset.from_list(records, features=features)

# 1. Ścieżka do głównego katalogu zawierającego train, val, test
base_dir = Path("/home/adam/fire_frames")

# 2. Wyciągamy wspólną, posortowaną listę klas na podstawie folderu 'train'
class_names = sorted([d.name for d in (base_dir / "train").iterdir() if d.is_dir()])

# 3. Budujemy DatasetDict dla wszystkich dostępnych splitów
splits = {}
for split_name in ["train", "val", "test"]:
    split_path = base_dir / split_name
    if split_path.exists():
        # W Hugging Face standardowo używa się nazwy 'validation' zamiast 'val' (choć 'val' też zadziała)
        hf_split_name = "validation" if split_name == "val" else split_name
        splits[hf_split_name] = build_split(split_path, class_names)

dataset_dict = DatasetDict(splits)
print(dataset_dict)
dataset_dict.push_to_hub("agalek056/detectionfire", private = True)