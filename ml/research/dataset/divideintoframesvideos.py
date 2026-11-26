
from pathlib import Path
import cv2 as cv
import collections

input_folder = Path("/home/adam/extract_features")
output_folder = Path("/home/adam/fire_frames")

video_classes = collections.defaultdict(list)

# 1. Odczyt struktury train/val/test
for split in input_folder.iterdir():

    if not split.is_dir():
        continue

    for class_dir in split.iterdir():

        if not class_dir.is_dir():
            continue

        for video in class_dir.rglob("*"):

            if video.is_file() and video.suffix.lower() == ".avi":
                video_classes[(split.name, class_dir.name)].append(video)


# 2. Ekstrakcja klatek
for (split_name, class_name), samples in video_classes.items():

    for video_idx, video_path in enumerate(samples):

        cap = cv.VideoCapture(str(video_path))

        if not cap.isOpened():
            print(f"Unable to open: {video_path}")
            continue

        fps = cap.get(cv.CAP_PROP_FPS)
        total_frames = int(cap.get(cv.CAP_PROP_FRAME_COUNT))

        if fps <= 0:
            print(f"Invalid FPS: {video_path}")
            cap.release()
            continue

        print(f"{video_path}: {total_frames} frames")

        # Jedna klatka na sekundę
        interval = max(1, round(fps))

        frame_idx = 0
        saved_idx = 0

        destination = (
            output_folder /
            split_name /
            class_name /
            video_path.stem
        )

        destination.mkdir(parents=True, exist_ok=True)

        while True:

            ret, frame = cap.read()

            if not ret:
                break
            timestamp = frame_idx / fps 

            if frame_idx % interval == 0:

                frame_path = destination / f"frame_{saved_idx:06d}_{timestamp:.2f}s.jpg"

                cv.imwrite(str(frame_path), frame)
                print(f"Frame: {frame_idx} timestamp: {timestamp:.2f}s")

                saved_idx += 1

            frame_idx += 1

        cap.release()

        print(f"Saved {saved_idx} frames")

print("Frame extraction completed!")

        


            
