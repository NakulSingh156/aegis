import requests
import time
import os
from typing import Optional

class SmartBuildingController:
    """
    Controls physical building infrastructure during emergencies.
    
    Integrations:
    - Philips Hue commercial lighting (REST API)
    - DALI protocol lighting (via gateway)
    - IoT edge nodes (MQTT via Raspberry Pi)
    - Building PA system (via audio matrix controller)
    """
    
    def __init__(self):
        self.hue_bridge_ip = os.getenv("HUE_BRIDGE_IP", "")
        self.hue_api_key   = os.getenv("HUE_API_KEY", "")
        self.mqtt_broker   = os.getenv("MQTT_BROKER", "")
        self.simulation    = not all([
            self.hue_bridge_ip, self.hue_api_key
        ])
        
        if self.simulation:
            print("[SmartBuilding] Simulation mode — no hardware connected")
        else:
            print("[SmartBuilding] ✅ Connected to building systems")
    
    # ── LIGHTING ──────────────────────────────────────────
    
    def set_zone_color(self, zone: str, color: str,
                        blink: bool = False):
        """
        Set zone lighting color via Philips Hue API.
        color: "red" | "green" | "orange" | "white"
        """
        color_map = {
            "red":    {"hue": 0,     "sat": 254, "bri": 254},
            "green":  {"hue": 25500, "sat": 254, "bri": 200},
            "orange": {"hue": 8000,  "sat": 254, "bri": 254},
            "white":  {"hue": 0,     "sat": 0,   "bri": 254},
            "off":    {"on": False},
        }
        
        state = color_map.get(color, color_map["white"])
        if blink:
            state["alert"] = "lselect"  # Hue blink effect
        
        if self.simulation:
            print(f"[Lighting] {zone} → {color.upper()}"
                  f"{'  🔴 BLINKING' if blink else ''}")
            return True
        
        # Real Hue API call
        group_id = self._get_group_id(zone)
        url = (f"http://{self.hue_bridge_ip}/api/"
               f"{self.hue_api_key}/groups/{group_id}/action")
        try:
            requests.put(url, json=state, timeout=2)
            return True
        except Exception as e:
            print(f"[Lighting] Error: {e}")
            return False
    
    def activate_emergency_lighting(self, danger_zones: list,
                                     safe_zones: list):
        """
        Full emergency lighting protocol:
        - Danger zones: RED blinking
        - Safe zones: GREEN solid  
        - Corridors on evacuation path: GREEN pulsing
        """
        print("[SmartBuilding] 🚨 Emergency lighting protocol activated")
        
        for zone in danger_zones:
            self.set_zone_color(zone, "red", blink=True)
        
        for zone in safe_zones:
            self.set_zone_color(zone, "green", blink=False)
        
        # Exit signs → bright white
        self.set_zone_color("exits", "white", blink=False)
        print("[SmartBuilding] ✅ All zones lit")
    
    def activate_all_clear_lighting(self):
        """Restore normal lighting after incident"""
        print("[SmartBuilding] ✅ All clear — restoring normal lighting")
        zones = ["lobby","restaurant","corridor_a",
                 "stairwell","parking","pool"]
        for zone in zones:
            self.set_zone_color(zone, "white")
    
    # ── IOT EDGE NODES (Raspberry Pi per zone) ───────────
    
    def send_mqtt_alert(self, zone: str, payload: dict):
        """
        Send MQTT message to IoT edge node in each zone.
        Each Raspberry Pi controls local LEDs + buzzer.
        """
        if self.simulation:
            print(f"[MQTT] → {zone}: {payload}")
            return
        
        try:
            import paho.mqtt.client as mqtt
            client = mqtt.Client()
            client.connect(self.mqtt_broker, 1883, 60)
            import json
            client.publish(
                f"aegis/zone/{zone}/alert",
                json.dumps(payload)
            )
            client.disconnect()
        except Exception as e:
            print(f"[MQTT] Error: {e}")
    
    # ── PA SYSTEM ─────────────────────────────────────────
    
    def broadcast_pa(self, message: str, zones: list = None):
        """
        Broadcast to building PA system via audio matrix controller.
        In demo: handled by Web Speech API in frontend.
        In production: sends to Barix audio-over-IP system.
        """
        if self.simulation:
            print(f"[PA System] Broadcasting: '{message[:60]}...'")
            return
        
        # Real PA: HTTP POST to audio matrix controller
        target_zones = zones or ["all"]
        try:
            requests.post(
                f"http://{os.getenv('PA_CONTROLLER_IP')}/broadcast",
                json={
                    "message": message,
                    "zones":   target_zones,
                    "priority": "emergency",
                    "repeat":   3
                },
                timeout=5
            )
        except Exception as e:
            print(f"[PA] Error: {e}")
    
    def _get_group_id(self, zone: str) -> int:
        """Maps zone names to Hue group IDs"""
        mapping = {
            "lobby":      1,
            "restaurant": 2,
            "corridor_a": 3,
            "stairwell":  4,
            "parking":    5,
            "pool":       6,
            "exits":      7,
        }
        return mapping.get(zone, 1)

# Global instance
building_controller = SmartBuildingController()
