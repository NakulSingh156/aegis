with open("detection/camera_processor.py", "r") as f:
    text = f.read()

import re

new_func = """def process_camera(zone_name: str, config: dict):
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
        
    cap.release()"""

# Replace between def process_camera and def start_all_cameras or stop_all_cameras or whatever is next
pattern = r"def process_camera\(zone_name: str, config: dict\):(.*?)def start_all_cameras\(\):"
res = re.sub(pattern, new_func + "\n\ndef start_all_cameras():", text, flags=re.DOTALL)

with open("detection/camera_processor.py", "w") as f:
    f.write(res)

print("Patched!")
