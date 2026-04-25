import cv2
import time
import threading
from detection.camera_processor import start_all_cameras, latest_frames, frames_lock
import venue_state as vs

# Start all cameras
start_all_cameras()
time.sleep(2)  # let cameras warm up

print("Showing all 6 cameras — press Q to quit")

while True:
    frames_to_show = []

    with frames_lock:
        for zone in ["lobby", "restaurant", "corridor_a",
                     "stairwell", "parking", "pool"]:
            if zone in latest_frames:
                frames_to_show.append(latest_frames[zone].copy())

    if len(frames_to_show) == 6:
        # 2 rows x 3 cols grid
        row1 = cv2.hconcat(frames_to_show[:3])
        row2 = cv2.hconcat(frames_to_show[3:])
        grid = cv2.vconcat([row1, row2])

        # Print venue state summary
        snapshot = vs.get_snapshot()
        for zone, data in snapshot["zones"].items():
            status = data["status"].upper()
            count  = data["person_count"]
            fire   = "🔥" if data["fire"] else "  "
            print(f"  {fire} {zone:<12} | {status:<8} | {count} people", end="   ")
        print()

        cv2.imshow("AEGIS — All Cameras", grid)

    if cv2.waitKey(1) == ord('q'):
        break
    time.sleep(0.033)

cv2.destroyAllWindows()
