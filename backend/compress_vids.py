import cv2
import os

os.makedirs('cloud_videos', exist_ok=True)
files = [
    'lobby_normal.mp4', 
    'restaurant_incident.mp4', 
    'corridor_normal.mp4', 
    'stairwell_normal.mp4', 
    'parking_normal.mp4', 
    'pool_normal.mp4'
]

for f in files:
    cap = cv2.VideoCapture(f"videos/{f}")
    if not cap.isOpened():
        print(f"FAILED to open videos/{f}")
        continue
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(f"cloud_videos/{f}", fourcc, 10.0, (854, 480))
    count = 0
    while cap.isOpened() and count < 15:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.resize(frame, (854, 480))
        out.write(frame)
        count += 1
    
    cap.release()
    out.release()
    print(f"Created cloud_videos/{f} - Size: {os.path.getsize(f'cloud_videos/{f}')} bytes")
