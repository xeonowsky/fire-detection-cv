import torch 
from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection
from PIL import Image 
from pathlib import Path 
import cv2 
import os
import shutil
import random
def extract_frames_from_video(videofile: str, OUTPUT_FOLDER):
    """This funtion provides extract frames from video and save this frames on the list
    args: video_file - file with film which showing fire or smoke
    return: collectionofframes - this is list for deeper analysis to models for zero shot object detection
    """
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER, exist_ok = True)
    collectionsofjpgfiles = []
    videofilename =  os.path.splitext(videofile)[0]
    videoprocessed = cv2.VideoCapture(videofile)
    videoprocessed.set(cv2.CAP_PROP_POS_FRAMES, 64)
    l  =0
    while videoprocessed.isOpened():
        ret, frame =  videoprocessed.read()
        if not ret:
            break 
        filenameofjpg = f"{videofilename}_frame_{l:04d}.jpg"
        jpg_path = os.path.join(OUTPUT_FOLDER,filenameofjpg)
        cv2.imwrite(jpg_path, frame)
        collectionsofjpgfiles.append(jpg_path)
        l += 1 
    videoprocessed.release()
    return collectionsofjpgfiles

video_frames = extract_frames_from_video("/home/adam-galek/Pulpit/detectionfire/datasetwithsplit/train/Mountains/3_2012-07-18_06-47-26.avi",OUTPUT_FOLDER="Frames")





def createappropriatefolder(collectionoffolders: list, OUTPUT_FOLDER: str):
    """This function creates appropriate hierarchy between two folders with fire and another classes except fire
    args: collectionoffolders this is list because I need to extract information between subfolders which called classes events.
    return: None because this function causes create another folder and save it on the disk
    """
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER, exist_ok =True)
    filmswithfire = []
    dictionaryoffilmsandclasses = {}
    for directoryofimages in collectionoffolders:
        if directoryofimages.endswith("mivia_fire"):
            folderwithfire = directoryofimages 
            print(folderwithfire)
            if os.path.isdir(folderwithfire):
                for filmeswithfire in os.listdir(folderwithfire):
                    newfolderforclassfire = os.path.join(OUTPUT_FOLDER, "fire")
                    if not os.path.exists(newfolderforclassfire):
                        os.makedirs(newfolderforclassfire, exist_ok = True)
                    newdirectorypathfromfirefiles = os.path.join(newfolderforclassfire, filmeswithfire)

                    olddirectorypath = os.path.join(folderwithfire, filmeswithfire)
                    sucessforcopyfiles = shutil.copy(olddirectorypath, newdirectorypathfromfirefiles)
                    if sucessforcopyfiles:
                        print(f"Good copying files.Copied files from directory: {olddirectorypath} to new directorypath: {newdirectorypathfromfirefiles}\n")
                    else: 
                        print(f"Don't copying this file for folder {folderwithfire}\n")
        if directoryofimages.endswith("mivia_smoke"):
            folderwithanotherclasses = directoryofimages
            if os.path.exists(folderwithanotherclasses) and os.path.isdir(folderwithanotherclasses):
                for cls in os.listdir(folderwithanotherclasses):
                    if cls in {"info", "Red reflections"}:
                        continue 
                    class_path = os.path.join(folderwithanotherclasses, cls)
                    newfolderforclasses = os.path.join(OUTPUT_FOLDER, cls)
                    if not os.path.exists(newfolderforclasses):
                        os.makedirs(newfolderforclasses, exist_ok = True)
                    for films in os.listdir(class_path):
                        newpathforsave = os.path.join(newfolderforclasses,  films )
                        old_path = os.path.join(folderwithanotherclasses, cls, films)
                        shutil.copy(old_path, newpathforsave)
                   
collectionoffolders = ["/home/adam-galek/Pulpit/detectionfire/mivia_fire", "/home/adam-galek/Pulpit/detectionfire/mivia_smoke"]                   
#createappropriatefolder(collectionoffolders, OUTPUT_FOLDER = "newdatasetwithclasses")

       
def diveddatasettotraintestsplit(INPUT_FOLDER: str, OUTPUT_FOLDER: str):
    
    train_ratio = 0.75
    val_ratio = 0.1
    random.seed(42)
    for classes in os.listdir(INPUT_FOLDER):
        classespath = os.path.join(INPUT_FOLDER, classes)
        if os.path.isdir(classespath) and os.path.exists(classespath):
            filmfiles = [files for files in os.listdir(classespath)]
            random.shuffle(filmfiles)
            total = len(filmfiles)
            train =  int(total * train_ratio)
            val = train + int(total * val_ratio)
            splits = {
                    "train": filmfiles[:train],
                    "val" : filmfiles[train : val],
                    "test" : filmfiles[val:]
            }
            for split, samples in splits.items():
                
                    targetdirectory = os.path.join(OUTPUT_FOLDER, split,classes)
                    os.makedirs(targetdirectory, exist_ok = True)
                    for sample in samples:
                        src_path = os.path.join(classespath, sample)
                        dst_path = os.path.join(targetdirectory, sample)
                        shutil.copy2(src_path, dst_path)
                        

diveddatasettotraintestsplit(INPUT_FOLDER="/home/adam-galek/Pulpit/detectionfire/newdatasetwithclasses", OUTPUT_FOLDER="/home/adam-galek/Pulpit/detectionfire/datasetwithsplit")
                

                







        