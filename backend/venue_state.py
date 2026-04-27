import threading

# This is the single source of truth for the entire system
# Every camera processor writes here
# Every other component reads from here

lock = threading.Lock()

venue_state = {
    "zones": {
        "lobby":       {"person_count": 0, "fire": False, "smoke": False, "panic": False, "fall": False, "status": "safe", "audio_event": None, "audio_confidence": 0.0},
        "restaurant":  {"person_count": 0, "fire": False, "smoke": False, "panic": False, "fall": False, "status": "safe", "audio_event": None, "audio_confidence": 0.0},
        "corridor_a":  {"person_count": 0, "fire": False, "smoke": False, "panic": False, "fall": False, "status": "safe", "audio_event": None, "audio_confidence": 0.0},
        "stairwell":   {"person_count": 0, "fire": False, "smoke": False, "panic": False, "fall": False, "status": "safe", "audio_event": None, "audio_confidence": 0.0},
        "parking":     {"person_count": 0, "fire": False, "smoke": False, "panic": False, "fall": False, "status": "safe", "audio_event": None, "audio_confidence": 0.0},
        "pool":        {"person_count": 0, "fire": False, "smoke": False, "panic": False, "fall": False, "status": "safe", "audio_event": None, "audio_confidence": 0.0},
    },
    "aegis_started": False,
    "incident_active": False,
    "severity": None,           # "LEVEL ALPHA", "HIGH ALERT", "ADVISORY"
    "incident_type": None,      # "fire", "panic", "fall", etc.
    "affected_zones": [],
    "safe_zones": [],
    "evacuation_routes": {},    # zone -> [list of zones to pass through to exit]
    "agent_log": [],            # list of agent actions taken
    "incident_brief": "",
    "incident_start_time": None,
    "incident_date": None,
    "incident_start_epoch": 0,
    "building_alert": False,
    "sms_log": [],              # tracks all SMS sent this incident
    "emergency_dispatch_log": [], # tracks inbound ambulance/fire/police
    "incident_resolved": False,
    "resolution_time": None,
    "venue_info": {},           # Stores hotel name, address, etc.
    "venue_coords": {"lat": 12.9716, "lng": 77.5946}, # Default for demo
    "current_incident_id": None, # Unique ID for each simulation cycle
}

def update_zone(zone_name, updates: dict):
    with lock:
        venue_state["zones"][zone_name].update(updates)

def get_snapshot():
    """Returns a deep copy of the venue state without using thread-unsafe copy.deepcopy."""
    with lock:
        # Manual recursive construction for stability
        snap = {k: v for k, v in venue_state.items() if not k.startswith("_")}
        snap["zones"] = {zid: dict(z) for zid, z in venue_state["zones"].items()}
        snap["agent_log"] = list(venue_state.get("agent_log", []))
        snap["sms_log"] = list(venue_state.get("sms_log", []))
        snap["emergency_dispatch_log"] = list(venue_state.get("emergency_dispatch_log", []))
        snap["affected_zones"] = list(venue_state.get("affected_zones", []))
        snap["safe_zones"] = list(venue_state.get("safe_zones", []))
        snap["evacuation_routes"] = {k: list(v) for k, v in venue_state.get("evacuation_routes", {}).items()}
        return snap

def resolve_incident():
    """Thread-safe and idempotent incident resolution."""
    import time
    with lock:
        if venue_state.get("incident_resolved") and not venue_state.get("incident_active"):
            return # Already resolved
            
        # Take forensic snapshot BEFORE clearing
        venue_state["_last_report_snapshot"] = get_snapshot()
        
        # Perform system-wide reset
        venue_state.update({
            "aegis_started":     False,
            "incident_active":   False,
            "building_alert":    False,
            "incident_resolved": True,
            "resolution_time":   time.strftime("%H:%M:%S")
        })
        
        for _, z in venue_state["zones"].items():
            z.update({
                "status": "safe", 
                "fire": False, 
                "panic": False, 
                "audio_event": None, 
                "person_count": 0
            })
        
        # Log resolution only once
        resolution_msg = "✅ ALL CLEAR — Incident resolved. Area secured."
        if not venue_state["agent_log"] or venue_state["agent_log"][-1]["action"] != resolution_msg:
            venue_state["agent_log"].append({
                "time": time.strftime("%H:%M:%S"),
                "action": resolution_msg
            })
_incident_serial = 1000

def start_incident():
    """Generates a new incident ID and marks active."""
    global _incident_serial
    with lock:
        _incident_serial += 1
        venue_state["current_incident_id"] = str(_incident_serial)
        venue_state["aegis_started"] = True
        venue_state["incident_active"] = False # Wait for detection
        venue_state["incident_resolved"] = False
        print(f"[AEGIS] New Simulation Cycle: {_incident_serial}")
