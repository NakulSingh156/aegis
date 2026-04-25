import cv2
from detection.fire_detector import FireDetector

detector = FireDetector()
detector.use_api = False      # force offline
detector.use_yolo = False     # force color-based

frame = cv2.imread("test_fire.jpg")

if frame is None:
    print("❌ Image not found")
else:
    print(f"✅ Image loaded: {frame.shape}")
    result = detector.analyze(frame)
    print(f"Fire: {result['fire']}")
    print(f"Smoke: {result['smoke']}")
    print(f"Confidence: {result['confidence']}")

    # Show what the detector actually sees
    cv2.imshow("Fire Detection Test", result['annotated_frame'])
    cv2.waitKey(0)
    cv2.destroyAllWindows()
