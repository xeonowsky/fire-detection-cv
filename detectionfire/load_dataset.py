from datasets import load_dataset_builder, load_dataset  

train_dataset  =  load_dataset("agalek056/detectionfire", split = "train")

val_dataset  =  load_dataset("agalek056/detectionfire", split = "validation")

print(train_dataset[0])