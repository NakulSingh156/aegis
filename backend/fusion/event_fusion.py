import time
import threading
import venue_state as vs
from agent.triage_agent import run_triage_cycle

def fusion_loop():
    """
    Runs every 1 second.
    Triggers triage agent ONCE when incident detected.
    Does NOT re-trigger if already active or resolved.
    """
    print("[FUSION] Event fusion engine started")
    
    while True:
        time.sleep(1)
        
        snapshot = vs.get_snapshot()
        zones = snapshot["zones"]
        
        # Skip if already handled or resolved
        if snapshot.get("incident_resolved", False):
            continue
        if snapshot.get("incident_active", False):
            continue  # Already triggered — don't spam triage
        
        # Check for any critical zone
        any_critical = any(z["status"] == "critical" for z in zones.values())
        
        if any_critical:
            print("[FUSION] Critical zone detected! Triggering triage...")
            run_triage_cycle()

def start_fusion_engine():
    t = threading.Thread(target=fusion_loop)
    t.daemon = True
    t.start()
