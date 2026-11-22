from datasets import load_dataset 
from datasets import Video as vid
from transformers import AutoImageProcessor, AutoModel 
import cv2 
import numpy as np 
import torch 
from transformers import Trainer, TrainingArguments 
from torchmetrics.classification import MulticlassF1Score
import torchvision.transforms.v2 as T 
import torch.nn as nn 
from functools import partial 
from torch.utils.data import DataLoader 
from torchvision.tv_tensors import Video
from tqdm import tqdm 
NUM_EPOCHS = 50 

dataset = load_dataset("/home/adam/extract_features")
dataset =  dataset.cast_column("video", vid(decode = False))
num_classes = dataset['train'].features['label'].num_classes
processor = AutoImageProcessor.from_pretrained("facebook/dinov3-vitb16-pretrain-lvd1689m")
f1_score = MulticlassF1Score(num_classes = num_classes)
def sample_frames(video_path, num_frames = 240):
    cap = cv2.VideoCapture(video_path)
    total_frames =  int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        frames = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frames.append(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB))
        cap.release()
        indices = np.linspace(0, len(frames)-1, num_frames, dtype =int)
        return [frames[i] for i in indices]
    indices = np.linspace(0, total_frames -1, num_frames, dtype= int)
    frames = []
    current_idx = 0 
    while cap.isOpened() and len(frames) < num_frames:
        ret = cap.grab()
        if not ret:
            break 
        if current_idx in indices:
            ret_val, frame = cap.retrieve()
            if ret_val:
                frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        current_idx += 1 
    cap.release()
    while len(frames) < num_frames:
        frames.append(frames[-1])
    return frames 


image_mean, image_std = processor.image_mean, processor.image_std
size = processor.size.get("height", 224)
normalize = T.Normalize(mean =image_mean, std = image_std)

train_transforms = T.Compose([
    T.Resize((size,size )),
    T.RandomHorizontalFlip(p = 0.5),
    T.RandomApply([
        T.ColorJitter(brightness =0.2, contrast = 0.2, saturation = 0.2)
    ], p =0.5),
    T.ToDtype(torch.float32, scale =True), 
    normalize
])

val_transform = T.Compose([
    T.Resize((size, size)),
    T.ToDtype(torch.float32, scale =True), 
    normalize 
])

def collate_fn(batch, transform):
    pixel_values_list = []
    labels = []
    for item in batch:
        video_path = item['video']['path']
        frames = sample_frames(video_path)
        frames_tensor = torch.from_numpy(np.stack(frames)).permute(0,3,1,2)
        video_input =Video(frames_tensor)
        
        pixel_values_list.append(video_input)
        labels.append(item['label'])

    return {
        "pixel_values" : torch.stack(pixel_values_list),
        "labels" : torch.tensor(labels, dtype = torch.long)
    }

train_dataloader = DataLoader(
    dataset['train'], 
    batch_size = 4, 
    shuffle = True,
    collate_fn = partial(collate_fn, transform=train_transforms),
    num_workers =2
)
val_loader = DataLoader(
    dataset['validation'], 
    batch_size =4, 
    shuffle= False, 
    collate_fn = partial(collate_fn, transform = val_transform),
    num_workers =2
)

class DinoV3Classifier(nn.Module):
    def __init__(self, model_name, num_classes):
        super().__init__()
        self.backbone = AutoModel.from_pretrained('facebook/dinov3-vitb16-pretrain-lvd1689m')
        for param in self.backbone.parameters(): 
            param.requires_grad = False 
        embed_dim = self.backbone.config.hidden_size 

        
        self.head = nn.Sequential(
            nn.LayerNorm(embed_dim*2),
            nn.Dropout(0.5), 
            nn.Linear(embed_dim * 2, num_classes)
        )
    def forward(self, pixel_values):
        b, t, c, h, w = pixel_values.shape
        x = pixel_values.view(b * t, c, h, w)
        
        cls_list = []
        # Wyłączamy autocast dla zamrożonego backbone, żeby wagi float32 i wejście zawsze się zgadzały
        with torch.no_grad(), torch.amp.autocast("cuda", enabled=False):
            x_fp32 = x.float()
            for i in range(0, x_fp32.size(0), 32):
                outputs = self.backbone(pixel_values=x_fp32[i:i+32])
                cls_list.append(outputs.last_hidden_state[:, 0, :])
                
        cls_tokens = torch.cat(cls_list, dim=0).view(b, t, -1)
        mean_embed = cls_tokens.mean(dim = 1)
        max_embed = cls_tokens.max(dim =1).values  # [B, T, D] (float32)
        video_embed = torch.cat([mean_embed, max_embed], dim =-1)
        return self.head(video_embed)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = DinoV3Classifier(model_name = "facebook/dinov3-vitb16-pretrain-lvd1689m",num_classes =  num_classes).to(DEVICE)
f1_score = MulticlassF1Score(num_classes = num_classes).to(DEVICE)
optimizer =torch.optim.AdamW(
    model.head.parameters(),
    lr =1e-3, 
    weight_decay= 3e-2
)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer,T_max = 25, eta_min = 1e-5)
criterion = nn.CrossEntropyLoss(label_smoothing = 0.1)
gradscaler = torch.GradScaler(device = "cuda")
best_val_f1 = 0.0
for epoch in range(NUM_EPOCHS):
    model.train()
    train_loss = 0.0 
    for batch in tqdm(train_dataloader, desc=f"Training for epoch: {epoch+1}"):
        pv = batch['pixel_values'].to(DEVICE)
        labels = batch['labels'].to(DEVICE)

        optimizer.zero_grad()
        with torch.autocast(device_type ="cuda"):
            logits = model(pv)
            loss =  criterion(logits, labels)
        gradscaler.scale(loss).backward()
        gradscaler.step(optimizer)
        gradscaler.update()
        train_loss += loss.item()
    model.eval()
    with torch.no_grad():
        for batch in tqdm(val_loader, desc=f"Evaluate on {epoch+1}"):
            pv = batch['pixel_values'].to(DEVICE)
            labels = batch['labels'].to(DEVICE)
            preds = model(pv)
            f1_score.update(preds, labels)
    epoch_val_f1 = f1_score.compute().item()
    f1_score.reset()
    avg_loss = train_loss / len(train_dataloader)
    scheduler.step()
    if epoch_val_f1 >= best_val_f1:
        best_val_f1 = epoch_val_f1 
        torch.save(model.state_dict(), "best_dinov3_video.pt")
        print(f"Zapisano najlepszy model\n")

    print(f"Epoch {epoch+1:02d}/{NUM_EPOCHS} LOSS: {avg_loss:.2f} VAL Macro F1: {epoch_val_f1:.2f}")
print(f"Train process has ended! The best result of f1-score is: {best_val_f1:.2f}")



