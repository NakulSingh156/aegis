import cv2
from detection.fire_detector import FireDetector
from detection.person_detector import PersonDetector

fire_det   = FireDetector()
person_det = PersonDetector()

cap = cv2.VideoCapture("videos/restaurant_incident.mp4")
print("Press Q to quit")

last_fire_result   = {"fire": False, "smoke": False, "confidence": 0.0}
last_person_result = {"person_count": 0}

frame_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        continue

    frame = cv2.resize(frame, (854, 480))
    frame_count += 1

    if frame_count % 3 == 0:
        last_fire_result   = fire_det.analyze(frame)
        last_person_result = person_det.analyze(frame)

    # ALWAYS draw — every frame
    if last_fire_result["fire"]:
        cv2.rectangle(frame, (0,0), (853, 479), (0,0,255), 8)
        cv2.putText(frame, "FIRE DETECTED", (20, 50),
                   cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0,0,255), 3)
    else:
        cv2.rectangle(frame, (0,0), (853, 479), (0,255,0), 3)
        cv2.putText(frame, "NORMAL", (20, 50),
                   cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0,255,0), 2)

    cv2.putText(frame, f"People: {last_person_result['person_count']}", (20, 100),
               cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255,255,0), 2)
    cv2.putText(frame, f"Conf: {last_fire_result['confidence']}", (20, 140),
               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
    cv2.putText(frame, "CAM-03 | Restaurant Zone", (20, frame.shape[0]-20),
               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200,200,200), 2)

    cv2.imshow("AEGIS — Live Camera Feed", frame)
    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
