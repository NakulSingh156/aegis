import cv2
import numpy as np
import os

class FireDetector:
    def __init__(self, shared_model=None):
        self.use_api  = False
        self.use_yolo = False
        self.prev_mask = None
        self.fire_streak = 0
        self.confirmed_fire = False  # STICKY: once True, stays True until reset()
        self.model = shared_model

        if self.model:
            self.use_yolo = True
            return

        # Try YOLO only if file exists AND is real (>1MB)
        model_path = "models/fire_best.pt"
        if os.path.exists(model_path):
            size_mb = os.path.getsize(model_path) / (1024 * 1024)
            if size_mb > 1.0:
                try:
                    from ultralytics import YOLO
                    self.model = YOLO(model_path)
                    self.use_yolo = True
                except Exception as e:
                    print(f"[FireDetector] YOLO failed: {e}")

    def reset(self):
        """Called on system reset to clear sticky fire state"""
        self.confirmed_fire = False
        self.fire_streak = 0
        self.prev_mask = None

    def analyze(self, frame):
        if self.use_yolo:
            return self._yolo_detection(frame)
        return self._color_based_detection(frame)

    def _color_based_detection(self, frame):
        # If fire already confirmed, stay confirmed (sticky)
        if self.confirmed_fire:
            annotated = frame.copy()
            cv2.putText(annotated, "FIRE CONFIRMED", (10, 40),
                       cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0,0,255), 2)
            return {
                "fire": True, "smoke": False,
                "confidence": 0.95, "annotated_frame": annotated
            }

        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # Fire HSV: orange-red with high saturation + value
        fire_mask = cv2.bitwise_or(
            cv2.inRange(hsv, np.array([0,  150, 150]), np.array([15, 255, 255])),
            cv2.inRange(hsv, np.array([15, 120, 150]), np.array([35, 255, 255]))
        )

        # Clean noise with moderate kernel
        k = np.ones((7,7), np.uint8)
        fire_mask = cv2.morphologyEx(fire_mask, cv2.MORPH_OPEN, k)

        total      = frame.shape[0] * frame.shape[1]
        fire_ratio = np.sum(fire_mask > 0) / total

        # Flicker: fire pixels change significantly frame-to-frame
        flicker = False
        if self.prev_mask is not None:
            diff = cv2.absdiff(fire_mask, self.prev_mask)
            flicker = (np.sum(diff > 0) / total) > 0.015
        self.prev_mask = fire_mask.copy()

        # Concentrated fire: need at least one big contour (not diffuse warm lighting)
        concentrated = False
        contours, _ = cv2.findContours(fire_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        big_contours = [c for c in contours if cv2.contourArea(c) > 1000]
        if len(big_contours) > 0:
            concentrated = True

        # ALL THREE required: enough fire pixels + flickering + concentrated
        raw_fire = (fire_ratio > 0.05) and flicker and concentrated

        if raw_fire:
            self.fire_streak += 1
        else:
            self.fire_streak = 0

        # Need 8 consecutive fire frames to confirm — then STICKY
        if self.fire_streak >= 8:
            self.confirmed_fire = True

        fire_detected = self.confirmed_fire
        confidence    = min(fire_ratio * 10, 0.99) if fire_detected else 0.0

        annotated = frame.copy()
        if fire_detected:
            for cnt in big_contours:
                x, y, w, h = cv2.boundingRect(cnt)
                cv2.rectangle(annotated, (x,y), (x+w, y+h), (0,0,255), 2)

        return {
            "fire":            bool(fire_detected),
            "smoke":           False,
            "confidence":      round(float(confidence), 3),
            "annotated_frame": annotated
        }

    def _yolo_detection(self, frame):
        # If already confirmed, stay confirmed (sticky)
        if self.confirmed_fire:
            return {
                "fire": True, "smoke": False,
                "confidence": 0.95, "annotated_frame": frame.copy()
            }

        results  = self.model(frame, verbose=False)[0]
        fire     = False
        smoke    = False
        max_conf = 0.0

        for box in results.boxes:
            cls_name = self.model.names[int(box.cls)].lower()
            conf     = float(box.conf)
            if conf < 0.40:
                continue
            if "fire"  in cls_name:
                fire     = True
                max_conf = max(max_conf, conf)
            elif "smoke" in cls_name:
                smoke = True

        if fire:
            self.fire_streak += 1
        else:
            self.fire_streak = 0
            
        # Require 3 consecutive YOLO detections (approx 1 second at 3fps scan)
        if self.fire_streak >= 3:
            self.confirmed_fire = True

        return {
            "fire":            bool(self.confirmed_fire),
            "smoke":           smoke,
            "confidence":      round(max_conf, 3) if not self.confirmed_fire else 0.95,
            "annotated_frame": results.plot()
        }
