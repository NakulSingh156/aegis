import time
import venue_state as vs
from agent.venue_map import get_all_evacuation_routes

STAFF_LIST = [
    {"id": "S01", "name": "Nakul",              "zone": "lobby",      "role": "Incident Commander"},
    {"id": "S02", "name": "Ayesha Maniyar",     "zone": "restaurant", "role": "Security Head"},
    {"id": "S03", "name": "Michelle Hoolgeri",  "zone": "corridor_a", "role": "Floor Manager"},
    {"id": "S04", "name": "Gouri Banapurmath",  "zone": "stairwell",  "role": "Lead Supervisor"},
]

from integrations.smart_building import building_controller

def log_action(action: str):
    with vs.lock:
        vs.venue_state["agent_log"].append({
            "time": time.strftime("%H:%M:%S"),
            "action": action
        })

def activate_emergency_protocol(danger_zones: list,
                                  safe_zones: list):
    """Called automatically on P1 — activates all building systems"""
    
    # Smart lighting
    building_controller.activate_emergency_lighting(
        danger_zones, safe_zones
    )
    log_action(
        f"SMART LIGHTING: {len(danger_zones)} zones → RED, "
        f"{len(safe_zones)} zones → GREEN"
    )
    
    # IoT edge nodes
    for zone in danger_zones:
        building_controller.send_mqtt_alert(zone, {
            "alert":  "critical",
            "color":  "red",
            "buzzer": True,
            "led":    "blink"
        })
    
    for zone in safe_zones:
        building_controller.send_mqtt_alert(zone, {
            "alert":  "safe_route",
            "color":  "green",
            "buzzer": False,
            "led":    "solid"
        })
    
    log_action("IOT EDGE NODES: All zone controllers updated")
    
    # PA System intent log
    building_controller.broadcast_pa(
        "EMERGENCY! Please evacuate the building immediately.",
        zones=["all"]
    )
    log_action("PA SYSTEM: Broadcasting emergency announcement")

def get_venue_snapshot() -> dict:
    return vs.get_snapshot()

def classify_severity(snapshot: dict) -> str:
    critical_zones = [z for z, d in snapshot["zones"].items() if d["status"] == "critical"]
    warning_zones  = [z for z, d in snapshot["zones"].items() if d["status"] == "warning"]
    
    if critical_zones:
        return "LEVEL ALPHA"
    elif len(warning_zones) >= 2:
        return "HIGH ALERT"
    elif warning_zones:
        return "ADVISORY"
    return "NONE"

def update_evacuation_routes(danger_zones: list):
    routes = get_all_evacuation_routes(danger_zones)
    with vs.lock:
        vs.venue_state["evacuation_routes"] = routes
        vs.venue_state["safe_zones"] = [
            z for z, r in routes.items() if len(r) > 0
        ]
    log_action(f"Evacuation routes calculated. Danger zones: {danger_zones}")

def alert_staff(affected_zones: list):
    for staff in STAFF_LIST:
        if staff["zone"] in affected_zones:
            log_action(f"ALERT sent to {staff['name']} ({staff['role']}) at {staff['zone']} → Evacuate immediately")
        else:
            log_action(f"DISPATCH {staff['name']} ({staff['role']}) → Assist evacuation at {', '.join(affected_zones)}")

def notify_guests(affected_zones: list, routes: dict):
    for zone in affected_zones:
        route = routes.get(zone, [])
        if route:
            direction = " → ".join(route)
            log_action(f"GUEST NOTIFY [{zone}]: EXIT NOW via {direction}. Do NOT use elevators.")
        else:
            log_action(f"GUEST NOTIFY [{zone}]: SHELTER IN PLACE. Staff en route.")

def call_emergency_services(incident_type: str, zones: list, analysis: dict):
    # Get current snapshot for extra context
    snapshot = vs.get_snapshot()
    severity = snapshot.get("severity", "LEVEL ALPHA")
    routes   = snapshot.get("evacuation_routes", {})
    
    log_action(f"EMERGENCY SERVICES CALLED: {incident_type.upper()} reported at zones {zones}.")
    log_action(f"DISPATCHING SMS ALERTS to all registered staff...")
    
    import threading
    def dispatch_sms_bg():
        from notifications.sms_service import send_emergency_sms, send_emergency_services_sms
        # Staff SMS
        sent_to = send_emergency_sms(
            incident_type=incident_type,
            severity=severity,
            affected_zones=zones,
            routes=routes,
            analysis=analysis
        )
        if sent_to:
            log_action(f"STAFF SMS DELIVERED ✅ → {', '.join(sent_to)}")
        
        # Public Responder Dispatch
        log_action(f"DISPATCHING TO PUBLIC EMERGENCY SERVICES...")
        send_emergency_services_sms(
            incident_type=incident_type, 
            severity=severity, 
            affected_zones=zones, 
            venue_name=snapshot.get("venue_name", "Grand Meridian Hotel"),
            coords=snapshot.get("venue_coords")
        )
        log_action(f"EMERGENCY SERVICES NOTIFIED: Fire Brigade, Ambulance, Police Control")
            
    threading.Thread(target=dispatch_sms_bg, daemon=True).start()

def generate_incident_brief(snapshot: dict, severity: str, incident_type: str) -> str:
    critical = [z for z, d in snapshot["zones"].items() if d["status"] == "critical"]
    warning  = [z for z, d in snapshot["zones"].items() if d["status"] == "warning"]
    total_affected = sum(snapshot["zones"][z]["person_count"] for z in critical + warning)
    
    brief = (
        f"{incident_type.upper()} CONFIRMED. "
        f"Level: {severity}. "
        f"Critical zones: {', '.join(critical) if critical else 'None'}. "
        f"Warning zones: {', '.join(warning) if warning else 'None'}. "
        f"Estimated persons in affected areas: {total_affected}. "
        f"Evacuation in progress. Emergency services notified."
    )
    
    with vs.lock:
        vs.venue_state["incident_brief"] = brief
        vs.venue_state["incident_active"] = True
        vs.venue_state["severity"] = severity
        vs.venue_state["incident_type"] = incident_type
        vs.venue_state["affected_zones"] = critical + warning
        vs.venue_state["building_alert"] = severity == "CRITICAL EMERGENCY"
        if not vs.venue_state["incident_start_time"]:
            vs.venue_state["incident_start_time"] = time.strftime("%H:%M:%S")
    
    log_action(f"INCIDENT BRIEF GENERATED: {brief}")
    return brief
