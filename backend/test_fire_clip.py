import cv2
from ultralytics import YOLO
import sys

model = YOLO("fire_best.pt")
cap = cv2.VideoCapture("videos/restaurant_incident.mp4")

fire = False
for _ in range(15):
    ret, frame = cap.read()
    if not ret: break
    res = model.predict(frame, conf=0.15, verbose=False)[0]
    for box in res.boxes:
        cls_idx = int(box.cls[0].item())
        cl = model.names[cls_idx].lower()
        if cl in ["fire", "smoke"]:
            fire = True
            break
print(f"FIRE IN CLIP: {fire}")
