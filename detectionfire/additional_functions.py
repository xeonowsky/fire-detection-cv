from transformers import AutoModel, AutoImageProcessor
import torch 
import torch.nn as nn 
import cv2 
import numpy as np 
from torchvision.tv_tensors import Video
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