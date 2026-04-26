import cv2
from detection.fire_detector import FireDetector

print("Testing FireDetector...")
det = FireDetector()
cap = cv2.VideoCapture("videos/restaurant_incident.mp4")

frame_idx = 0
while True:
    ret, frame = cap.read()
    if not ret or frame_idx > 100: break
    frame_idx += 1
    
    res = det.analyze(frame)
    if res["fire"]:
        print(f"Fire detected at frame {frame_idx}! Confidence: {res['confidence']}")
        break
        
print("Tested restaurant.")

det.reset()
cap2 = cv2.VideoCapture("videos/lobby_normal.mp4")
frame_idx = 0
while True:
    ret, frame = cap2.read()
    if not ret or frame_idx > 100: break
    frame_idx += 1
    res = det.analyze(frame)
    if res["fire"]:
        print(f"False positive in lobby at frame {frame_idx}!")
        break
        
print("Tried lobby.")
