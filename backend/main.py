from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import asyncio
import cv2
import time
import threading

from websocket_manager import manager
from detection.camera_processor import (
    start_all_cameras, stop_all_cameras, 
    latest_frames, frames_lock, PRELOADED_JPEG_BUFFERS
)
from fusion.event_fusion import start_fusion_engine
from agent.tools import log_action, get_venue_snapshot
from notifications.sms_service import reset_sms_flag
import venue_state as vs

app = FastAPI(title="AEGIS Crisis Response API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    print("[AEGIS] Backend ready. Waiting for START command...")

@app.get("/health")
def health():
    snap = vs.get_snapshot()
    return {
        "status": "online", 
        "system": "AEGIS",
        "aegis_started": snap.get("aegis_started", False)
    }

@app.get("/snapshot")
def snapshot():
    snap = vs.get_snapshot()
    return snap

@app.post("/venue/config")
def update_venue_config(config: dict):
    with vs.lock:
        vs.venue_state["venue_info"] = config
        if config.get("coords"):
            vs.venue_state["venue_coords"] = config["coords"]
    print(f"[AEGIS] Venue configuration received: {config.get('venueName')}")
    return {"status": "success", "message": "Venue configuration updated"}

@app.post("/start-aegis")
def start_aegis():
    if vs.venue_state["aegis_started"]:
        return {"status": "already_running"}
    
    # Full fresh reset before starting
    _full_state_reset()
    
    with vs.lock:
        vs.venue_state["aegis_started"] = True
        # Ensure incident_resolved is explicitly cleared
        vs.venue_state["incident_resolved"] = False
    log_action(f"⚡ AEGIS ACTIVATED — 6 cameras online, AI detection armed. [INCIDENT_ID: {vs.venue_state['current_incident_id']}]")
    start_all_cameras()
    start_fusion_engine()
    return {"status": "started", "incident_id": vs.venue_state["current_incident_id"]}

@app.post("/resolve")
def resolve_incident():
    # 1. Update state IMMEDIATELY and return
    with vs.lock:
        vs.venue_state["aegis_started"]     = False
        vs.venue_state["incident_active"]   = False
        vs.venue_state["building_alert"]    = False
        vs.venue_state["incident_resolved"] = True
        vs.venue_state["resolution_time"]   = time.strftime("%H:%M:%S")
        
        for zone in vs.venue_state["zones"]:
            vs.venue_state["zones"][zone].update({
                "status": "safe", "fire": False, "panic": False, 
                "audio_event": None
            })
            
    # 2. Cleanup actions in background
    def background_cleanup():
        stop_all_cameras()
        from integrations.smart_building import building_controller
        building_controller.activate_all_clear_lighting()
    
    threading.Thread(target=background_cleanup, daemon=True).start()
    
    log_action("✅ ALL CLEAR — Incident resolved. Area secured.")
    return {"status": "resolved"}

@app.get("/report")
def generate_report():
    snap = vs.get_snapshot()
    timeline = [f"[{e['time']}] {e['action']}" for e in snap.get("agent_log", [])]
    zone_summary = {}
    for zid, zd in snap.get("zones", {}).items():
        zone_summary[zid] = {
            "final_status": zd.get("status", "safe"),
            "fire_detected": zd.get("fire", False),
            "persons_last_seen": zd.get("person_count", 0),
        }
    sms_summary = [{
        "recipient": s["name"], "role": s["role"],
        "phone": s["phone"], "status": s["status"],
        "timestamp": s["timestamp"],
    } for s in snap.get("sms_log", [])]
    report = {
        "report_title": "AEGIS Incident Report",
        "venue": snap.get("venue_info", {}).get("venueName", "AEGIS Protected Venue"),
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "incident": {
            "type": snap.get("incident_type", "N/A"),
            "severity": snap.get("severity", "N/A"),
            "start_time": snap.get("incident_start_time", "N/A"),
            "resolution_time": snap.get("resolution_time", "N/A"),
            "affected_zones": snap.get("affected_zones", []),
            "total_persons_tracked": sum(z.get("person_count", 0) for z in snap.get("zones", {}).values()),
            "casualties": 0,
            "brief": snap.get("incident_brief", ""),
        },
        "danger_zones": snap.get("affected_zones", []),
        "safe_zones": [z for z in snap.get("zones", {}) if z not in snap.get("affected_zones", [])],
        "evacuation_routes": snap.get("evacuation_routes", {}),
        "zone_detail": zone_summary,
        "sms_alerts_sent": sms_summary,
        "event_timeline": timeline,
        "system_info": {
            "detection": "YOLOv8n (persons) + Classical CV (fire)",
            "routing": "BFS shortest path to nearest exit",
            "sms": "Twilio API",
            "response_time": "< 15 seconds",
        },
    }
    return JSONResponse(content=report)

def _full_state_reset():
    stop_all_cameras()
    reset_sms_flag()
    new_id = f"inc_{int(time.time())}"
    with vs.lock:
        vs.venue_state["current_incident_id"] = new_id
        vs.venue_state["incident_active"]     = False
        vs.venue_state["building_alert"]      = False
        vs.venue_state["severity"]            = None
        vs.venue_state["incident_type"]       = None
        vs.venue_state["incident_brief"]      = ""
        vs.venue_state["agent_log"]           = []
        vs.venue_state["affected_zones"]      = []
        vs.venue_state["safe_zones"]          = []
        vs.venue_state["incident_start_time"] = None
        vs.venue_state["incident_resolved"]   = False
        for zone in vs.venue_state["zones"]:
            vs.venue_state["zones"][zone].update({
                "person_count": 0, "fire": False, "panic": False, 
                "status": "safe", "audio_event": None
            })

@app.post("/simulate/gunshot")
async def simulate_gunshot():
    from detection.audio_detector import audio_detector
    audio_detector.trigger_simulated_event("gunshot")
    return {"status": "gunshot simulated"}

@app.post("/simulate/scream")
async def simulate_scream():
    from detection.audio_detector import audio_detector
    audio_detector.trigger_simulated_event("scream")
    return {"status": "scream simulated"}

def generate_mjpeg(zone_name: str):
    while True:
        jpeg_bytes = None
        with frames_lock:
            jpeg_bytes = latest_frames.get(zone_name)
        
        # [LOW LATENCY FIX] If no live frame, serve the first pre-loaded frame immediately
        if jpeg_bytes is None:
            cache = PRELOADED_JPEG_BUFFERS.get(zone_name, [])
            # Pre-load just 3 frames for instant-low-overhead startup
            if cache: jpeg_bytes = cache[0]

        if jpeg_bytes is not None:
            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' +
                jpeg_bytes +
                b'\r\n'
            )
            # Sleep slightly longer on idle to save bandwidth, faster on live
            time.sleep(0.04 if latest_frames.get(zone_name) else 0.5)
        else:
            time.sleep(0.5)

@app.get("/camera/{zone_name}")
def camera_feed(zone_name: str):
    return StreamingResponse(
        generate_mjpeg(zone_name),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            snap = vs.get_snapshot()
            await manager.broadcast(snap)
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
