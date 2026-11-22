from datasets import load_dataset, Video  
import torch 
from functools import partial 
from tqdm import tqdm 
from additional_functions import collate_fn, DinoV3Classifier, sample_frames
from torch.utils.data import DataLoader  
from transformers import AutoImageProcessor
from sklearn.metrics import f1_score, confusion_matrix, classification_report
import torchvision.transforms.v2 as T 

test_dataset = load_dataset("/home/adam/extract_features", split="test")

# POPRAWKA 1: Przypisanie wyniku cast_column (inaczej włączy się torchcodec!)
test_dataset = test_dataset.cast_column("video", Video(decode=False))
num_classes = test_dataset.features["label"].num_classes 
class_names = test_dataset.features["label"].names

processor = AutoImageProcessor.from_pretrained("facebook/dinov3-vitb16-pretrain-lvd1689m")

image_mean, image_std = processor.image_mean, processor.image_std
size = processor.size.get("height", 224)

# POPRAWKA 2: Dodajemy T.Normalize na końcu test_transform (identycznie jak w treningu!)
test_transform = T.Compose([
    T.Resize((size, size), antialias=True), 
    T.ToDtype(torch.float32, scale=True),
    T.Normalize(mean=image_mean, std=image_std)
])

test_dataloader = DataLoader(
    test_dataset, 
    batch_size=4, 
    shuffle=False, 
    collate_fn=partial(collate_fn, transform=test_transform),
    num_workers=2 
)

test_preds, test_labels = [], []
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = DinoV3Classifier(model_name="facebook/dinov3-vitb16-pretrain-lvd1689m", num_classes=num_classes)
model.load_state_dict(torch.load("/home/adam/best_dinov3_video.pt", map_location=device, weights_only=True))
model.to(device)
model.eval()

with torch.no_grad():
    for batch in tqdm(test_dataloader, desc="Testing"):
        pv = batch["pixel_values"].to(device)
        labels = batch["labels"].to(device)
        logits = model(pv)
        preds = logits.argmax(dim=-1)
        
        test_preds.extend(preds.cpu().numpy())
        test_labels.extend(labels.cpu().numpy())

macro_f1 = f1_score(test_labels, test_preds, average="macro", zero_division=0)
conf = confusion_matrix(test_labels, test_preds)

# POPRAWKA 3: Wyświetlenie pełnego raportu i macierzy pomyłek
print(f"\nTest Macro F1: {macro_f1:.4f}\n")
print("--- RAPORT KLASYFIKACJI ---")
print(classification_report(test_labels, test_preds, target_names=class_names, zero_division=0))
print("--- MACIERZ POMYŁEK ---")
print(conf)

