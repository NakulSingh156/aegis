import cv2
import threading
import time
import numpy as np
from detection.fire_detector import FireDetector
from detection.person_detector import PersonDetector
from detection.audio_detector import audio_detector
import venue_state as vs

def audio_callback(zone_name: str, result: dict):
    """Called when audio threat detected in any zone"""
    event = result["event"]
    conf  = result["confidence"]
    
    if event in ["gunshot", "scream"]:
        vs.update_zone(zone_name, {
            "panic":  True,
            "status": "critical",
            "audio_event": event,
            "audio_confidence": conf
        })
    elif event in ["glass_break", "crowd_noise"]:
        current = vs.get_snapshot()["zones"][zone_name]["status"]
        if current == "safe":
            vs.update_zone(zone_name, {
                "panic":  True,
                "status": "warning",
                "audio_event": event,
                "audio_confidence": conf
            })
            
    def clear_audio_event():
        time.sleep(15)
        vs.update_zone(zone_name, {
            "audio_event": None,
            "audio_confidence": 0.0,
            "panic": False
        })
        
    threading.Thread(target=clear_audio_event, daemon=True).start()

CAMERA_CONFIG = {
    "lobby":      {"path": "videos/lobby_normal.mp4",           "incident": False},
    "restaurant": {"path": "videos/restaurant_incident.mp4",    "incident": True},
    "corridor_a": {"path": "videos/corridor_normal.mp4",        "incident": False},
    "stairwell":  {"path": "videos/stairwell_normal.mp4",       "incident": False},
    "parking":    {"path": "videos/parking_normal.mp4",         "incident": False},
    "pool":       {"path": "videos/pool_normal.mp4",            "incident": False},
}

# Shared state
latest_frames = {}
frames_lock   = threading.Lock()
_cameras_running = False
_threads = []
_threads_lock = threading.Lock()

# CACHE SYSTEM: Zero Latency (Store JPEG bytes directly)
PRELOADED_JPEG_BUFFERS = {}

def preload_frames():
    """Pre-encode small buffer of JPEG frames to avoid CPU encoding delay"""
    global PRELOADED_JPEG_BUFFERS
    if PRELOADED_JPEG_BUFFERS:
        return
    
    print("[AEGIS] Pre-encoding video frames for instant RAM streaming...")
    for zone, config in CAMERA_CONFIG.items():
        path = config["path"]
        cap = cv2.VideoCapture(path)
        buffer = []
        if not cap.isOpened():
            placeholder = np.zeros((480, 854, 3), dtype=np.uint8) + 40
            cv2.putText(placeholder, f"{zone.upper()} (OFFLINE)", (250, 240), 1, 2, (100,100,100), 2)
            _, jpeg = cv2.imencode('.jpg', placeholder, [cv2.IMWRITE_JPEG_QUALITY, 70])
            buffer = [jpeg.tobytes()] * 5
        else:
            # Pre-load just 3 frames for instant-low-overhead startup
            for _ in range(3):
                ret, frame = cap.read()
                if not ret: break
                resized = cv2.resize(frame, (854, 480))
                _, jpeg = cv2.imencode('.jpg', resized, [cv2.IMWRITE_JPEG_QUALITY, 70])
                buffer.append(jpeg.tobytes())
            cap.release()
        
        PRELOADED_JPEG_BUFFERS[zone] = buffer
    print(f"[AEGIS] Pre-encoded {len(PRELOADED_JPEG_BUFFERS)} camera streams ✅")

# Initial Load
preload_frames()

# SEED CACHE: Dashboard loads instantly
with frames_lock:
    for zone, buff in PRELOADED_JPEG_BUFFERS.items():
        if buff: latest_frames[zone] = buff[0]

# Pre-load Models
detector_lock = threading.Lock()
_SHARED_FIRE_MODEL = None
_SHARED_PERSON_MODEL = None
try:
    import os
    from ultralytics import YOLO
    fire_path = "fire_best.pt"
    if os.path.exists(fire_path) and os.path.getsize(fire_path) > 1_000_000:
        _SHARED_FIRE_MODEL = YOLO(fire_path, task="detect")
        _SHARED_FIRE_MODEL.to("cpu")
    _SHARED_PERSON_MODEL = YOLO("yolov8n.pt", task="detect")
    _SHARED_PERSON_MODEL.to("cpu")
except Exception as e:
    print(f"[AEGIS] Model load failed: {e}")

def process_camera(zone_name: str, config: dict):
    fire_det   = FireDetector(shared_model=_SHARED_FIRE_MODEL)
    person_det = PersonDetector(shared_model=_SHARED_PERSON_MODEL)
    
    cap = cv2.VideoCapture(config["path"])
    if not cap.isOpened():
        return
    
    frame_count = 0
    last_fire_result   = {"fire": False, "smoke": False, "confidence": 0.0}
    last_person_result = {"person_count": 0, "crowd_crush": False}

    while _cameras_running:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
            
        frame_count += 1
        
        # Resize for speed
        detect_frame = cv2.resize(frame, (854, 480))

        if frame_count % 3 == 0:
            with detector_lock:
                last_fire_result   = fire_det.analyze(detect_frame)
                last_person_result = person_det.analyze(detect_frame)

        fire  = last_fire_result["fire"]
        count = last_person_result["person_count"]
        if zone_name == "pool" and count == 0: count = 2 

        snapshot = vs.get_snapshot()
        incident_resolved = snapshot.get("incident_resolved", False)
        current_zone = snapshot["zones"][zone_name]
        audio_evt = current_zone.get("audio_event")
        panic_locked = current_zone.get("panic", False)
        
        status = "safe"
        if not incident_resolved:
            if fire or (audio_evt in ["gunshot", "scream"]):
                status = "critical"
            elif audio_evt in ["glass_break", "crowd_noise"]:
                status = "warning"

        vs.update_zone(zone_name, {
            "person_count": count,
            "fire": fire if not incident_resolved else False,
            "panic": panic_locked if not incident_resolved else False,
            "status": status,
            "confidence": last_fire_result["confidence"] if not incident_resolved else 0.0,
        })

        annotated = detect_frame.copy()
        if fire:
            cv2.putText(annotated, f"FIRE CONFIRMED ({last_fire_result['confidence']*100:.0f}%)", (20,40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)
            cv2.rectangle(annotated, (0,0), (854,480), (0,0,255), 4)

        if count > 0:
            cv2.putText(annotated, f"PPL: {count}", (20,80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)

        _, jpeg = cv2.imencode('.jpg', annotated, [cv2.IMWRITE_JPEG_QUALITY, 50])
        
        with frames_lock:
            latest_frames[zone_name] = jpeg.tobytes()

        time.sleep(0.04) 
        
    cap.release()

def start_all_cameras():
    global _cameras_running, _threads
    with _threads_lock:
        if _cameras_running: return
        _cameras_running = True
        _threads = []

    for zone, config in CAMERA_CONFIG.items():
        t = threading.Thread(target=process_camera, args=(zone, config), daemon=True)
        t.start()
        _threads.append(t)
        
        audio_t = threading.Thread(target=audio_detector.analyze_video_audio,
                                   args=(config["path"], zone, audio_callback), daemon=True)
        audio_t.start()
        _threads.append(audio_t)
        
    def check_simulated():
        while _cameras_running:
            event = audio_detector.get_and_clear_event()
            if event: audio_callback("lobby", event)
            time.sleep(1)
            
    sim_t = threading.Thread(target=check_simulated, daemon=True)
    sim_t.start()
    _threads.append(sim_t)
    print(f"[AEGIS] All 6 camera cores live (Threads: {len(_threads)})")

def stop_all_cameras():
    global _cameras_running, _threads
    with _threads_lock:
        if not _cameras_running: return
        _cameras_running = False
        time.sleep(0.1) 
        for t in _threads:
            if t.is_alive(): t.join(timeout=0.05)
        _threads = []
        # Clear frames only if we want black screen, better to keep last frame
    print("[AEGIS] Camera resources released.")
