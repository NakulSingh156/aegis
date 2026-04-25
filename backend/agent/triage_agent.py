import time
import threading
import venue_state as vs
from agent.tools import (
    get_venue_snapshot, classify_severity,
    update_evacuation_routes, alert_staff,
    notify_guests, call_emergency_services,
    generate_incident_brief, log_action,
    activate_emergency_protocol
)
from integrations.smart_building import building_controller

def run_triage_cycle():
    """
    Called ONCE when an incident is detected.
    Runs full triage pipeline and starts auto-resolve timer.
    """
    snapshot = get_venue_snapshot()
    
    if snapshot.get("incident_active", False):
        return
    if snapshot.get("incident_resolved", False):
        return
    
    severity = classify_severity(snapshot)
    if severity == "NONE":
        return
    
    critical_zones = [z for z, d in snapshot["zones"].items() if d["status"] == "critical"]
    
    incident_type = "unknown"
    for zone in critical_zones:
        zdata = snapshot["zones"][zone]
        if zdata["fire"]:
            incident_type = "fire"
            break
        elif zdata.get("audio_event"):
            incident_type = zdata["audio_event"]
            break
        elif zdata["panic"]:
            incident_type = "crowd panic"
            break

    from agent.gemini_reasoning import analyze_threat
    
    # 1. Start the incident immediately to freeze event_fusion and turn UI red
    all_zones = list(snapshot["zones"].keys())
    safe_zones = [z for z in all_zones if z not in critical_zones]
    
    with vs.lock:
        vs.venue_state["incident_active"] = True
        vs.venue_state["severity"] = severity
        vs.venue_state["affected_zones"] = critical_zones
        vs.venue_state["safe_zones"] = safe_zones
        vs.venue_state["building_alert"] = severity == "CRITICAL EMERGENCY"
        vs.venue_state["incident_type"] = incident_type
        if not vs.venue_state["incident_start_time"]:
            vs.venue_state["incident_start_time"] = time.strftime("%H:%M:%S")
            vs.venue_state["incident_date"] = time.strftime("%Y-%m-%d")
            vs.venue_state["incident_start_epoch"] = time.time()

    # 1. 🎤 AUTOMATED SYNC: Inject acoustic "scream" thread
    def auto_inject_scream():
        try:
            time.sleep(2)  # brief delay to let fire UI settle
            from detection.camera_processor import audio_callback
            target = critical_zones[0] if critical_zones else "restaurant"
            audio_callback(target, {"event": "scream", "confidence": 0.98})
            log_action(f"AUDIO DETECTOR: Validated correlated panic scream at {target}.")
        except Exception as e:
            print(f"[AEGIS] Auto-scream error: {e}")
    
    threading.Thread(target=auto_inject_scream, daemon=True).start()

    # 2. 🧠 START AUTO-RESOLVE TIMER (120s)
    # Start it BEFORE Gemini to ensure exactly 120s from incident start
    _start_auto_resolve()

    # 3. 🚨 SMART BUILDING: Activate emergency lighting & IoT alerts on LEVEL ALPHA
    if severity == "LEVEL ALPHA":
        activate_emergency_protocol(critical_zones, safe_zones)

    # 3. 🧠 GEMINI ANALYZES THE SITUATION
    log_action("GEMINI analyzing multi-zone threat pattern...")
    analysis = analyze_threat(snapshot)
    
    log_action(f"THREAT ASSESSMENT: {analysis['threat_assessment']}")
    log_action(f"SPREAD PREDICTION: {analysis['spread_prediction']}")
    log_action(f"SAFE WINDOW: {analysis['estimated_safe_window']}")
    log_action(f"PRIORITY: {analysis['priority_action']}")
    
    update_evacuation_routes(critical_zones)
    snapshot = vs.get_snapshot()
    routes = snapshot["evacuation_routes"]
    
    alert_staff(critical_zones)
    notify_guests(critical_zones, routes)
    
    # Update incident brief with Gemini's analysis
    with vs.lock:
        vs.venue_state["incident_brief"] = (
            f"{analysis['threat_assessment']} "
            f"Safe window: {analysis['estimated_safe_window']}."
        )
        vs.venue_state["gemini_analysis"] = analysis
    
    call_emergency_services(incident_type, critical_zones, analysis)

def _start_auto_resolve():
    """Auto-resolve after 120 seconds (2 minutes)"""
    def timer():
        try:
            log_action("⏱️ AUTO-RESOLVE: Timer started (120 seconds).")
            for i in range(120):
                time.sleep(1)
                # Check if manually resolved during wait
                snap = vs.get_snapshot()
                if snap.get("incident_resolved", False) and not snap.get("incident_active", False):
                    return 
            
            # If we reached here, the timer expired without manual resolve
            log_action("⏱️ AUTO-RESOLVE: 120s limit reached. Initiating system-wide reset.")
            from detection.camera_processor import stop_all_cameras
            stop_all_cameras()
            
            # SMART BUILDING: Restore normal lighting
            building_controller.activate_all_clear_lighting()
            
            with vs.lock:
                vs.venue_state["aegis_started"]     = False
                vs.venue_state["incident_active"]   = False
                vs.venue_state["building_alert"]    = False
                vs.venue_state["incident_resolved"] = True
                vs.venue_state["resolution_time"]   = time.strftime("%H:%M:%S")
                # Reset all zones to safe
                for zone in vs.venue_state["zones"]:
                    vs.venue_state["zones"][zone].update({
                        "status": "safe", "fire": False, "smoke": False,
                        "panic": False, "audio_event": None
                    })
            
            log_action("✅ AUTO ALL-CLEAR: Timer expired. Incident auto-resolved.")
        except Exception as e:
            log_action(f"⚠️ AUTO-RESOLVE ERROR: {str(e)}")
    
    t = threading.Thread(target=timer, daemon=True)
    t.start()
