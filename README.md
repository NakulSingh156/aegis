# ⚡ AEGIS — Autonomous Emergency Guardian & Incident Synchronization

<div align="center">

![AEGIS Banner](https://img.shields.io/badge/AEGIS-Crisis%20Intelligence%20Platform-ef4444?style=for-the-badge&logo=lightning&logoColor=white)

[![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud%20Run-Deployed-4285F4?style=flat&logo=googlecloud&logoColor=white)](https://aegis-backend-775713800470.us-central1.run.app)
[![Firebase Hosting](https://img.shields.io/badge/Firebase-Hosted-FFCA28?style=flat&logo=firebase&logoColor=black)](https://aegis-crisis-2026.web.app)
[![Gemini 2.0 Flash](https://img.shields.io/badge/Gemini%202.0%20Flash-AI%20Powered-8B5CF6?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Computer%20Vision-00D4AA?style=flat&logo=python&logoColor=white)](https://ultralytics.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

**The world's first AI-native autonomous crisis management system for hospitality venues.**

*Detects threats. Reasons with AI. Routes evacuations. Alerts everyone. In under 15 seconds. Zero human input.*

[🌐 Live Demo](https://aegis-crisis-2026.web.app) · [🎥 Demo Video](https://youtu.be/UP2mP6CKyhU) · [📖 API Docs](https://aegis-backend-775713800470.us-central1.run.app/docs) · [💻 GitHub](https://github.com/NakulSingh156/aegis)

</div>

---

## 🎥 Demo

<div align="center">

[![AEGIS Demo Video](https://img.youtube.com/vi/UP2mP6CKyhU/maxresdefault.jpg)](https://youtu.be/UP2mP6CKyhU)

*Click to watch — Full autonomous incident response demonstration*

</div>

---

## 🚨 The Problem

Every large venue — every hotel, mall, stadium — has a **fire alarm from 1970 and a laminated map on the wall.**

When a real emergency strikes:
- Staff have **no coordination system** — they call each other on phones
- Guests **panic with no guidance** — wrong exits chosen
- First responders **arrive completely blind** — no venue layout, no occupancy data
- Average human response time: **8–15 minutes**

The Station Nightclub fire (2003): 100 people died in 4 minutes. The MGM Grand fire: 85 deaths. Astroworld crowd crush: 10 deaths. **The core problem is always the same — zero real-time coordination.**

Enterprise solutions like Honeywell and Siemens cost **₹2 Crore+** and require full building rewiring. Mid-size venues — the 700,000+ hotels, malls, and restaurants worldwide — have nothing.

**AEGIS changes that.**

---

## ⚡ What AEGIS Does

AEGIS is a complete autonomous emergency response ecosystem. When a threat is detected:

```
T + 02s  →  Fire/panic/audio threat detected across live camera feeds
T + 12s  →  Threat confirmed (10-frame sticky detection, no false alarms)
T + 13s  →  Gemini 2.0 Flash analyzes full venue snapshot with live person counts
T + 14s  →  BFS pathfinding calculates safest exit route for every zone
T + 15s  →  Staff receive personalized SMS (Twilio)
T + 15s  →  Fire brigade, ambulance, police dispatched via SMS
T + 15s  →  Guest PWAs go full red with zone-specific evacuation routes
T + 15s  →  PA system announces emergency through venue speakers
T + 15s  →  Google Maps locates nearest hospitals and fire stations with ETAs
T + 16s  →  Venue map updates — danger zones red, safe paths animated green
```

**Zero human decisions between detection and full multi-stakeholder response.**

---

## 🎯 Live Links

| Resource | URL | Status |
|----------|-----|--------|
| 🌐 Staff Dashboard | https://aegis-crisis-2026.web.app | ✅ Live |
| ⚙️ Backend API | https://aegis-backend-775713800470.us-central1.run.app | ✅ Live |
| 📋 API Documentation | https://aegis-backend-775713800470.us-central1.run.app/docs | ✅ Live |
| 🎥 Demo Video | https://youtu.be/UP2mP6CKyhU | ✅ Live |
| 💻 GitHub Repository | https://github.com/NakulSingh156/aegis | ✅ Public |

**Try it:** Open the dashboard → Register → Complete venue setup → Click **"🔥 Simulate Fire Emergency"** → Watch AEGIS respond autonomously in real time.

---

## 🔧 Features

### 🔍 Detection Engine
| Feature | Technology | Details |
|---------|-----------|---------|
| Fire Detection | OpenCV HSV + Flicker Analysis | Custom color boundary model, 10-frame confirmation |
| Person Counting | YOLOv8n | Real-time occupancy per zone, crowd density heatmap |
| Smoke Detection | HSV saturation analysis | Cross-validated with fire signals |
| Panic Detection | Frame differential motion analysis | Sustained high-motion = panic trigger |
| Fall Detection | MediaPipe Pose Estimation | Hip-nose landmark geometry |
| Gunshot Detection | librosa MFCC spectral analysis | High RMS + zero crossing rate |
| Scream Detection | Audio spectral centroid analysis | Crowd panic acoustic signature |
| Glass Break | Short-duration high-frequency burst | Robbery/forced entry detection |

### 🧠 AI Intelligence (Gemini 2.0 Flash)
- **Live threat analysis** with actual person counts from sensors — not templates
- **Fire spread prediction** based on zone adjacency and HVAC analysis
- **Safe window estimation** with specific time-to-danger per zone
- **Personalized SMS generation** per staff role — security gets different instructions than front desk
- **Evacuation strategy reasoning** that accounts for crowd density in each zone
- **Tactical staff deployment** orders with specific positions and actions
- Hard fallback to intelligent defaults if API unavailable — demo never breaks

### 🗺️ Evacuation Intelligence
- **BFS (Breadth-First Search)** pathfinding on venue zone graph
- Calculates shortest safe path to every exit from every zone
- **Dynamic rerouting** — if a safe zone becomes dangerous mid-evacuation, new path auto-calculated
- Animated flowing path display on live SVG venue map
- Danger zones: red with pulsing border + EVACUATE button
- Safe zones: green with → EXIT indicator and animated evacuation arrows

### 📡 Multi-Stakeholder Dispatch (Simultaneous)
| Stakeholder | Channel | Content |
|------------|---------|---------|
| Staff (3+) | Twilio SMS | Name, role, their zone's safe exit, specific action |
| Fire Brigade | Twilio SMS | Incident type, zones affected, venue location |
| Ambulance | Twilio SMS | Medical risk, persons at risk, staging point |
| Police Control | Twilio SMS | Threat type, venue details, coordination |
| Guests | PWA Push | Red screen, zone-specific exit direction, assembly point |
| All in venue | PA System | Web Speech API — audio through venue speakers |
| First Responders | Google Maps | Nearest hospitals + fire stations with ETAs |

### 📊 Command Dashboard
- **6 simultaneous camera feeds** with CV overlays (person count, status badge, threat indicators)
- **Live venue floor map** — SVG with zone coloring, animated evacuation arrows, exit markers
- **Gemini AI Intelligence Panel** — threat assessment, spread prediction, safe window, evacuation strategy
- **Agent Decision Log** — every autonomous action timestamped and color-coded
- **SMS Alert Log** — delivery status per recipient with expandable full message
- **Emergency Dispatch Panel** — fire brigade, ambulance, police dispatch confirmation
- **Crowd Density Heatmap** — visual occupancy grid per zone
- **Live AI Confidence Graph** — real-time fire detection confidence trending (Recharts)
- **Tactical Dispatch Units** — Google Maps nearest responders with distance and ETA
- **Incident Report** — auto-generated post-mortem with full evacuation analysis

### 📱 Guest PWA
- No app installation required — Progressive Web App
- Safe state: green screen, zone status, nearest exit
- Emergency state: **full red screen + vibration + audio alarm**
- Zone-specific evacuation instructions updated in real time
- Route auto-updates if path becomes unsafe
- QR code on staff dashboard for instant guest onboarding

### 🔊 PA System
- Web Speech API — broadcasts through venue speakers instantly
- English + Hindi announcement support
- Custom messages per incident type (fire / crowd crush / gunshot)
- Automatic "All Clear" announcement on incident resolution

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        INPUT LAYER                          │
│  CAM-01  CAM-02  CAM-03  CAM-04  CAM-05  CAM-06    MIC     │
│  (RTSP Protocol — any IP camera, or demo MP4 files)        │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   PROCESSING LAYER                          │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  YOLOv8n   │  │  HSV Fire    │  │  librosa Audio    │  │
│  │  Person     │  │  + Flicker   │  │  Threat Detector  │  │
│  │  Detection  │  │  Detector    │  │  (MFCC analysis)  │  │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬─────────┘  │
│         └────────────────▼──────────────────────┘           │
│                          │                                  │
│              ┌───────────▼────────────┐                     │
│              │   EVENT FUSION ENGINE  │                     │
│              │   Cross-validates all  │                     │
│              │   signals every 3s.    │                     │
│              │   Updates VenueState.  │                     │
│              └───────────┬────────────┘                     │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │         GEMINI 2.0 FLASH — TRIAGE AGENT              │   │
│  │  • Severity classification (P1 / P2 / P3)            │   │
│  │  • Threat assessment with live sensor data           │   │
│  │  • BFS evacuation pathfinding                        │   │
│  │  • Personalized SMS content generation               │   │
│  │  • Staff deployment coordination                     │   │
│  └───────────────────────┬──────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      OUTPUT LAYER                            │
│                                                             │
│  📱 Staff SMS     🚒 Emergency SMS    🌐 Guest PWA          │
│  (Twilio API)     (Fire/Amb/Police)   (Firebase Hosting)    │
│                                                             │
│  📊 Staff Dash    🗺️ Google Maps      🔊 PA System          │
│  (Firebase CDN)   (Places API)        (Web Speech API)      │
│                                                             │
│  💡 Smart Lights  📡 IoT MQTT Nodes   📋 Incident Reports   │
│  (Philips Hue)    (Raspberry Pi)      (Auto-generated)      │
└─────────────────────────────────────────────────────────────┘
              │                              │
┌─────────────▼──────────────┐   ┌──────────▼──────────────┐
│   Google Cloud Run          │   │   Firebase Hosting       │
│   FastAPI Backend           │   │   React Dashboard        │
│   us-central1               │   │   + Guest PWA            │
│   WebSocket + REST API      │   │   Global CDN             │
└─────────────────────────────┘   └─────────────────────────┘
              │
┌─────────────▼──────────────┐
│   Google Secret Manager     │
│   All credentials secured   │
│   Zero secrets in codebase  │
└─────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.11 | Core runtime |
| FastAPI | REST API + WebSocket server |
| YOLOv8n (Ultralytics) | Person detection and counting |
| OpenCV | Video frame processing, HSV fire analysis |
| MediaPipe | Pose estimation for fall detection |
| librosa | Audio spectral analysis for threat detection |
| Google Gemini 2.0 Flash | AI threat intelligence and SMS generation |
| BFS Algorithm | Evacuation pathfinding on zone graph |
| Twilio | SMS dispatch to staff and emergency services |
| Threading | 6 parallel camera processors |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | Staff command dashboard |
| WebSocket | Real-time venue state sync (1s updates) |
| Recharts | Live AI confidence trending graph |
| SVG + CSS Animation | Animated venue floor map with flowing paths |
| Web Speech API | PA system announcements |
| Progressive Web App | Guest safety interface |
| Google Maps JS API | First responder location |
| Google Places API | Hospital/fire station search |
| Google Geocoding API | Venue address to coordinates |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Google Cloud Run (us-central1) | Backend — serverless, auto-scales |
| Firebase Hosting | Frontend CDN — global edge |
| Google Secret Manager | Credential security |
| Google Maps Platform | Location intelligence |
| Docker | Containerization for Cloud Run |

---

## 📁 Project Structure

```
aegis/
│
├── backend/
│   ├── main.py                    # FastAPI entry point + WebSocket
│   ├── venue_state.py             # Shared real-time venue state
│   ├── simulation_mode.py         # Cloud simulation (no CV needed)
│   ├── websocket_manager.py       # WebSocket broadcast manager
│   ├── requirements.txt           # Full local dependencies
│   ├── requirements_cloud.txt     # Lightweight cloud dependencies
│   ├── Dockerfile                 # Google Cloud Run container
│   │
│   ├── detection/
│   │   ├── camera_processor.py    # 6 parallel camera threads
│   │   ├── fire_detector.py       # HSV color + flicker analysis
│   │   ├── person_detector.py     # YOLOv8n occupancy counting
│   │   ├── motion_analyzer.py     # Panic/crowd detection
│   │   ├── fall_detector.py       # MediaPipe pose estimation
│   │   └── audio_detector.py      # librosa spectral analysis
│   │
│   ├── fusion/
│   │   └── event_fusion.py        # Cross-validates all signals
│   │
│   ├── agent/
│   │   ├── triage_agent.py        # Main AI decision loop
│   │   ├── tools.py               # Agent action tools
│   │   ├── venue_map.py           # Zone graph + BFS routing
│   │   └── gemini_reasoning.py    # Gemini 2.0 Flash integration
│   │
│   ├── notifications/
│   │   └── sms_service.py         # Twilio staff + emergency SMS
│   │
│   ├── integrations/
│   │   ├── cctv_connector.py      # RTSP live camera integration
│   │   └── smart_building.py      # Hue/MQTT/DALI integration
│   │
│   ├── models/                    # YOLOv8 weights (gitignored)
│   └── videos/                    # Demo footage (gitignored)
│
├── frontend/
│   ├── staff-dashboard/           # React command center
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── LandingPage.jsx
│   │       │   ├── AuthPage.jsx
│   │       │   ├── VenueSetup.jsx
│   │       │   └── Dashboard.jsx
│   │       └── components/
│   │           ├── VenueMap.jsx
│   │           ├── CameraGrid.jsx
│   │           ├── AgentLog.jsx
│   │           ├── GeminiPanel.jsx
│   │           ├── SMSPanel.jsx
│   │           ├── EmergencyDispatch.jsx
│   │           ├── ThreatGraph.jsx
│   │           └── SimulationPanel.jsx
│   │
│   └── guest-pwa/                 # Guest safety PWA
│
└── docker-compose.yml
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- macOS / Linux (Windows via WSL)

### Backend Setup

```bash
git clone https://github.com/NakulSingh156/aegis.git
cd aegis/backend

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

# YOLOv8 model auto-downloads on first run
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

### Environment Variables

Create `backend/.env`:
```env
GEMINI_API_KEY=your_key_from_aistudio.google.com

TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=+1xxxxxxxxxx
SMS_ENABLED=false

STAFF_PHONES=+91xxxxxxxxxx,+91xxxxxxxxxx,+91xxxxxxxxxx
FIRE_BRIGADE_PHONE=+91xxxxxxxxxx
AMBULANCE_PHONE=+91xxxxxxxxxx
POLICE_PHONE=+91xxxxxxxxxx

CLOUD_MODE=false
```

### Demo Videos

Download from [Pexels.com](https://pexels.com) and save to `backend/videos/`:

| Filename | Search Term |
|----------|------------|
| `lobby_normal.mp4` | hotel lobby people |
| `restaurant_normal.mp4` | restaurant indoor dining |
| `restaurant_incident.mp4` | indoor fire smoke room |
| `corridor_normal.mp4` | hotel hallway corridor |
| `stairwell_normal.mp4` | staircase people |
| `parking_normal.mp4` | parking lot |
| `pool_normal.mp4` | hotel pool |

### Run

```bash
# Terminal 1 — Backend
cd backend && source venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2 — Dashboard
cd frontend/staff-dashboard
npm install && npm run dev

# Terminal 3 — Guest PWA (optional)
cd frontend/guest-pwa
npm install && npm run dev -- --port 5174
```

---

## 🌐 Google Cloud Deployment

```bash
# Setup
gcloud auth login
gcloud config set project aegis-crisis-2026
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

# Store secrets
echo -n "your_key" | gcloud secrets create GEMINI_API_KEY --data-file=-

# Deploy backend
cd backend
gcloud run deploy aegis-backend \
  --source . --region us-central1 \
  --allow-unauthenticated --port 8080 --memory 1Gi \
  --set-env-vars CLOUD_MODE=true,SMS_ENABLED=false \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"

# Deploy frontend
cd frontend/staff-dashboard && npm run build
firebase init hosting && firebase deploy --only hosting

# Toggle SMS (no redeploy needed)
gcloud run services update aegis-backend \
  --region us-central1 --update-env-vars SMS_ENABLED=true
```

---

## 🔌 Hardware Integration (Production Ready)

```python
# CCTV — one line change from demo to live:
cap = cv2.VideoCapture("rtsp://admin:pass@192.168.1.64:554/stream")
# Supports: Hikvision, Dahua, Axis, Bosch — any ONVIF camera

# Smart Lighting — Philips Hue:
requests.put(f"http://{bridge}/api/{key}/groups/{zone}/action",
             json={"hue": 0, "sat": 254, "bri": 254, "alert": "lselect"})

# IoT Edge Nodes — MQTT + Raspberry Pi Zero (₹1,500/zone):
client.publish(f"aegis/zone/{zone}/alert",
               json.dumps({"color": "red", "buzzer": True}))
```

---

## 🎮 Simulation API

```bash
curl -X POST https://aegis-backend-775713800470.us-central1.run.app/simulate/fire \
  -H "Content-Type: application/json" -d '{"zone": "restaurant"}'

curl -X POST https://aegis-backend-775713800470.us-central1.run.app/simulate/crowd \
  -d '{"zone": "lobby"}'

curl -X POST https://aegis-backend-775713800470.us-central1.run.app/simulate/gunshot

curl -X POST https://aegis-backend-775713800470.us-central1.run.app/reset
```

---

## 📈 Roadmap

| Timeline | Milestone |
|----------|-----------|
| Q3 2026 | Floor plan upload — CV auto-detects zones from building blueprints |
| Q3 2026 | Multi-language PA (Hindi, Tamil, Telugu) + WhatsApp Business API |
| Q4 2026 | Live RTSP CCTV integration + full IoT deployment (Hue + MQTT) |
| Q4 2026 | Government API — direct ERSS 112 emergency dispatch integration |
| 2027 | Multi-building enterprise dashboard for hotel chains and mall networks |
| 2027 | SaaS platform — ₹15,000/month/venue + NDMA compliance module |

---

## 💰 Cost

| Tier | Setup | Monthly | For |
|------|-------|---------|-----|
| Software Only | ₹0 | ~₹1,300 | Venues with existing IP cameras |
| + IoT Nodes | ₹24,000 | ~₹1,300 | Physical zone indicators |
| Full Integration | ₹85,000 | ~₹1,300 | Complete smart building |

*Enterprise alternatives (Honeywell, Siemens): ₹2 Crore+ with mandatory rewiring.*

---

## 🔐 Security

- All secrets in Google Secret Manager — zero credentials in codebase
- Phone numbers masked in UI (first 6 digits only)
- WebSocket over WSS — TLS encrypted
- No video stored — frames processed in-memory only
- Firebase Authentication for venue manager access

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Threat Detection | < 2 seconds |
| Full Response | < 15 seconds |
| Camera Zones | 6 simultaneous |
| WebSocket Refresh | Every 1 second |
| CV Processing | 30 FPS per camera |
| SMS Delivery | < 3 seconds |
| Gemini Reasoning | 3–5 seconds |

---

## 👥 Team

Built for **Google HacktoSolve (H2S) 2026** — Problem Statement: *Rapid Crisis Response*

| Name | Role |
|------|------|
| Nakul Singh | Team Lead — Backend, CV Pipeline, Architecture |
| Michelle Hoolgeri | AI Agent — Gemini Integration, Triage Logic |
| Ayesha Maniyar | Frontend — Dashboard, PWA, Full Stack Development |
| Gouri Banapurmath | Cloud and Firebase Deployment |

*3rd Year B.Tech Computer Science (AI) — 2027*

---

##  Google Technologies Used

| Technology | Usage |
|-----------|-------|
| Gemini 2.0 Flash | AI threat intelligence + personalized SMS |
| Google Cloud Run | Backend deployment (us-central1) |
| Firebase Hosting | Frontend CDN |
| Google Secret Manager | Credential security |
| Google Maps JavaScript API | Venue map + responder visualization |
| Google Places API | Nearest hospital/fire station search |
| Google Geocoding API | Address → coordinates resolution |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**⚡ AEGIS — We didn't build a smarter fire alarm.**
**We built the nervous system for any building.**

*Sight. Sound. Intelligence. Action. All in under 15 seconds.*

[![Watch Demo](https://img.shields.io/badge/🎥%20Watch%20Demo-YouTube-FF0000?style=for-the-badge)](https://youtu.be/UP2mP6CKyhU?si=U1xLlN2QkImgedZW)
[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Firebase-FFCA28?style=for-the-badge)](https://aegis-crisis-2026.web.app)
[![GitHub](https://img.shields.io/badge/💻%20Source%20Code-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/NakulSingh156/aegis)

*Built with ❤️ for Google HacktoSolve 2026*

</div>
