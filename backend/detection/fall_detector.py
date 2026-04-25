import mediapipe as mp
import numpy as np

class FallDetector:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            min_detection_confidence=0.5
        )
    
    def analyze(self, frame):
        import cv2
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb)
        
        if not results.pose_landmarks:
            return {"fall_detected": False}
        
        landmarks = results.pose_landmarks.landmark
        
        # Key landmarks
        nose = landmarks[self.mp_pose.PoseLandmark.NOSE]
        left_hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP]
        right_hip = landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP]
        left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
        
        # If nose y-coordinate is BELOW hip y-coordinate → person is horizontal → fallen
        hip_y = (left_hip.y + right_hip.y) / 2
        shoulder_y = (left_shoulder.y + right_shoulder.y) / 2
        
        # Person is upright when nose.y < hip.y (y increases downward in image coords)
        # Person has fallen when nose.y > hip.y significantly
        fall_detected = nose.y > hip_y - 0.05
        
        return {"fall_detected": bool(fall_detected)}
