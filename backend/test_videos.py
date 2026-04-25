import cv2

videos = {
    "lobby":                "videos/lobby_normal.mp4",
    "restaurant_normal":    "videos/restaurant_normal.mp4",
    "restaurant_incident":  "videos/restaurant_incident.mp4",
    "corridor_normal":      "videos/corridor_normal.mp4",
    "corridor_incident":    "videos/corridor_incident.mp4",
    "stairwell":            "videos/stairwell_normal.mp4",
    "parking":              "videos/parking_normal.mp4",
    "pool":                 "videos/pool_normal.mp4",
}

for name, path in videos.items():
    cap = cv2.VideoCapture(path)
    if cap.isOpened():
        fps = cap.get(cv2.CAP_PROP_FPS)
        frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        print(f"✅ {name}: {w}x{h} @ {fps:.0f}fps, {frames} frames")
    else:
        print(f"❌ {name}: FAILED TO OPEN — check filename/path")
    cap.release()
