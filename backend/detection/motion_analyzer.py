import cv2
import numpy as np

class MotionAnalyzer:
    def __init__(self):
        self.prev_frame = None
        self.motion_history = []
    
    def analyze(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)
        
        if self.prev_frame is None:
            self.prev_frame = gray
            return {"panic_motion": False, "motion_score": 0.0}
        
        # Frame difference
        diff = cv2.absdiff(self.prev_frame, gray)
        _, thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)
        
        motion_score = float(np.sum(thresh)) / (frame.shape[0] * frame.shape[1] * 255)
        
        self.motion_history.append(motion_score)
        if len(self.motion_history) > 15:
            self.motion_history.pop(0)
        
        self.prev_frame = gray
        
        # Panic: sustained high motion over last 15 frames
        avg_motion = sum(self.motion_history) / len(self.motion_history)
        panic_motion = avg_motion > 0.25  # raised: normal walking = ~0.05-0.15, real panic/running = 0.25+
        
        return {
            "panic_motion": panic_motion,
            "motion_score": round(avg_motion, 4)
        }
