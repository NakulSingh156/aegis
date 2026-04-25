import cv2
import os
from typing import Optional

class CCTVConnector:
    """
    Production CCTV integration via RTSP protocol.
    Supports: Hikvision, Dahua, Axis, Bosch, and 
    any ONVIF-compliant IP camera.
    
    For demo: falls back to local video files.
    For production: connects to live RTSP streams.
    """
    
    SUPPORTED_FORMATS = {
        "hikvision": "rtsp://{{user}}:{{pass}}@{{ip}}:554/Streaming/Channels/101",
        "dahua":     "rtsp://{{user}}:{{pass}}@{{ip}}:554/cam/realmonitor?channel=1",
        "axis":      "rtsp://{{user}}:{{pass}}@{{ip}}/axis-media/media.amp",
        "generic":   "rtsp://{{user}}:{{pass}}@{{ip}}:554/stream",
    }
    
    def __init__(self, zone_name: str, config: dict):
        self.zone_name = zone_name
        self.config    = config
        self.stream    = None
        self.connected = False
    
    def connect_rtsp(self, ip: str, username: str,
                     password: str, brand: str = "generic") -> bool:
        """
        Connect to live CCTV camera via RTSP.
        One line change from demo mode to production mode.
        """
        url_template = self.SUPPORTED_FORMATS.get(
            brand, self.SUPPORTED_FORMATS["generic"]
        )
        rtsp_url = url_template.format(
            user=username, **{"pass": password}, ip=ip
        )
        
        print(f"[CCTV] Connecting to {brand} camera at {ip}...")
        cap = cv2.VideoCapture(rtsp_url)
        
        if cap.isOpened():
            self.stream    = cap
            self.connected = True
            print(f"[CCTV] ✅ {self.zone_name} → {ip} connected")
            return True
        else:
            print(f"[CCTV] ❌ Failed to connect to {ip}")
            return False
    
    def connect_demo(self, video_path: str) -> bool:
        """Demo mode — uses local video file"""
        cap = cv2.VideoCapture(video_path)
        if cap.isOpened():
            self.stream    = cap
            self.connected = True
            print(f"[CCTV] 📹 {self.zone_name} → demo mode")
            return True
        return False
    
    def connect_phone_camera(self, phone_ip: str,
                              port: int = 8080) -> bool:
        """
        Connect to phone camera via IP Webcam app.
        Install 'IP Webcam' on Android → same network.
        Perfect for live demo without real CCTV.
        """
        url = f"http://{phone_ip}:{port}/video"
        cap = cv2.VideoCapture(url)
        if cap.isOpened():
            self.stream    = cap
            self.connected = True
            print(f"[CCTV] 📱 {self.zone_name} → phone camera connected")
            return True
        return False
    
    def read_frame(self):
        if not self.stream:
            return False, None
        ret, frame = self.stream.read()
        if not ret:
            # Loop video in demo mode
            self.stream.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = self.stream.read()
        return ret, frame
    
    def disconnect(self):
        if self.stream:
            self.stream.release()
            self.connected = False
            print(f"[CCTV] {self.zone_name} disconnected")
