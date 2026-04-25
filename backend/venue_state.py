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
}

def update_zone(zone_name, updates: dict):
    with lock:
        venue_state["zones"][zone_name].update(updates)

def get_snapshot():
    with lock:
        import copy
        return copy.deepcopy(venue_state)
