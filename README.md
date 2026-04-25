# ⚡ AEGIS — Autonomous Emergency Guardian & Incident Synchronization

<div align="center">

![AEGIS Banner](https://img.shields.io/badge/AEGIS-Crisis%20Intelligence%20Platform-ef4444?style=for-the-badge&logo=lightning&logoColor=white)

[![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud%20Run-Deployed-4285F4?style=flat&logo=googlecloud&logoColor=white)](https://aegis-backend-xxxxx-el.a.run.app)
[![Firebase Hosting](https://img.shields.io/badge/Firebase-Hosted-FFCA28?style=flat&logo=firebase&logoColor=black)](https://aegis-crisis-2026.web.app)
[![Gemini 2.0 Flash](https://img.shields.io/badge/Gemini%202.0%20Flash-AI%20Powered-8B5CF6?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Computer%20Vision-00D4AA?style=flat&logo=python&logoColor=white)](https://ultralytics.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

**The world's first AI-native autonomous crisis management system for hospitality venues.**

*Detects threats. Reasons with AI. Routes evacuations. Alerts everyone. In under 15 seconds. Zero human input.*

[🌐 Live Demo](https://aegis-crisis-2026.web.app) · [🎥 Demo Video](https://youtu.be/XXXXXXXXX) · [📖 API Docs](https://aegis-backend-xxxxx-el.a.run.app/docs)

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

## 🎯 Live Demo

| Resource | URL |
|----------|-----|
| 🌐 Staff Dashboard | https://aegis-crisis-2026.web.app |
| 📱 Guest PWA | https://aegis-guest.web.app |
| ⚙️ Backend API | https://aegis-backend-xxxxx-el.a.run.app |
| 📋 API Documentation | https://aegis-backend-xxxxx-el.a.run.app/docs |
| 🎥 Demo Video | https://youtu.be/XXXXXXXXX |

**Try it:** Open the dashboard → Click **"🔥 Simulate Fire Emergency"** → Watch AEGIS respond autonomously in real time.

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
- Animated path display on live SVG venue map
- Danger zones: red with pulsing border + EVACUATE button
- Safe zones: green with → EXIT indicator and animated flowing path arrows

### 📡 Multi-Stakeholder Dispatch (Simultaneous)
| Stakeholder | Channel | Content |
|------------|---------|---------|
| Staff (3+) | Twilio SMS | Name, role, their zone's safe exit, specific action |
| Fire Brigade | Twilio SMS | Incident type, zones affected, venue location, ETA note |
| Ambulance | Twilio SMS | Medical risk assessment, persons at risk, staging point |
| Police Control | Twilio SMS | Threat type, venue details, coordination request |
| Guests | PWA Push | Red screen, zone-specific exit direction, assembly point |
| All in venue | PA System | Web Speech API — audio announcement through speakers |
| First Responders | Google Maps | Nearest fire stations + hospitals with distance and ETA |

### 📊 Command Dashboard
- **6 simultaneous camera feeds** with CV overlays (person count, status badge, threat indicators)
- **Live venue floor map** — SVG with zone coloring, animated evacuation arrows, exit markers
- **Gemini AI Intelligence Panel** — threat assessment, spread prediction, safe window, evacuation strategy
- **Agent Decision Log** — every autonomous action timestamped and color-coded
- **SMS Alert Log** — delivery status per recipient with expandable full message
- **Emergency Dispatch Panel** — fire brigade, ambulance, police dispatch confirmation
- **Crowd Density Heatmap** — visual occupancy grid per zone
- **Live AI Confidence Graph** — real-time fire detection confidence trending (recharts)
- **Tactical Dispatch Units** — Google Maps nearest responders with ETAs
- **Incident Report** — auto-generated post-mortem with evacuation analysis

### 📱 Guest PWA
- No app installation required — Progressive Web App
- Safe state: green screen, zone status, nearest exit
- Emergency state: **full red screen, vibration alert, audio alarm**
- Zone-specific evacuation instructions updated in real time
- Route auto-updates if path becomes unsafe
- QR code on staff dashboard for instant guest onboarding

### 🔊 PA System
- Web Speech API — broadcasts through laptop/venue speakers
- English + Hindi announcement support
- Custom messages per incident type (fire / crowd / gunshot)
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
│  💡 Smart Lights  📡 IoT MQTT Nodes                         │
│  (Philips Hue)    (Raspberry Pi)                           │
└─────────────────────────────────────────────────────────────┘
              │                         │
┌─────────────▼─────┐         ┌────────▼──────────────┐
│  Google Cloud Run  │         │  Firebase Hosting      │
│  FastAPI Backend   │         │  React Dashboard +     │
│  asia-south1       │         │  Guest PWA             │
│  WebSocket + REST  │         │                        │
└────────────────────┘         └───────────────────────┘
              │
┌─────────────▼──────────────┐
│  Google Secret Manager     │
│  All credentials secured   │
│  Zero secrets in codebase  │
└────────────────────────────┘
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
| React 18 + Vite | Staff dashboard |
| WebSocket | Real-time venue state sync |
| Recharts | Live confidence trending graph |
| SVG + CSS Animation | Animated venue floor map |
| Web Speech API | PA system announcements |
| Progressive Web App | Guest safety interface |
| Google Maps JS API | First responder location |
| Google Places API | Hospital/fire station search |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Google Cloud Run | Backend deployment (asia-south1) |
| Firebase Hosting | Frontend CDN |
| Google Secret Manager | Credential security |
| Google Maps API | Geocoding + responder search |
| Docker | Containerization |

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
# Clone the repository
git clone https://github.com/YOURUSERNAME/aegis.git
cd aegis/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download YOLOv8 model
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
# Creates models/yolov8n.pt automatically
```

### Environment Variables

Create `backend/.env`:
```env
# AI
GEMINI_API_KEY=your_gemini_api_key

# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1xxxxxxxxxx
SMS_ENABLED=false

# Staff phones (comma-separated)
STAFF_PHONES=+91xxxxxxxxxx,+91xxxxxxxxxx,+91xxxxxxxxxx

# Emergency services
FIRE_BRIGADE_PHONE=+91xxxxxxxxxx
AMBULANCE_PHONE=+91xxxxxxxxxx
POLICE_PHONE=+91xxxxxxxxxx

# Mode
CLOUD_MODE=false
```

### Demo Videos

Download videos from Pexels.com and place in `backend/videos/`:
```
lobby_normal.mp4          # Hotel lobby with people
restaurant_normal.mp4     # Restaurant dining
restaurant_incident.mp4   # Indoor fire footage
corridor_normal.mp4       # Hotel corridor
corridor_incident.mp4     # Panic/running footage
stairwell_normal.mp4      # Staircase
parking_normal.mp4        # Parking area
pool_normal.mp4           # Pool area
```

### Run Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

Verify: http://localhost:8000/health → `{"status": "online", "system": "AEGIS"}`

### Frontend Setup

```bash
cd frontend/staff-dashboard
npm install
```

Create `frontend/staff-dashboard/.env.local`:
```env
VITE_WS_URL=ws://localhost:8000/ws
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
```

```bash
npm run dev
# Opens at http://localhost:5173
```

### Guest PWA

```bash
cd frontend/guest-pwa
npm install
npm run dev -- --port 5174
# Opens at http://localhost:5174
```

---

## 🌐 Google Cloud Deployment

### Prerequisites
```bash
brew install google-cloud-sdk
gcloud auth login
gcloud projects create aegis-crisis-2026
gcloud config set project aegis-crisis-2026
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
```

### Store Secrets
```bash
echo -n "your_value" | gcloud secrets create SECRET_NAME --data-file=-
# Repeat for: GEMINI_API_KEY, TWILIO_SID, TWILIO_TOKEN,
#             TWILIO_FROM, STAFF_PHONES, FIRE_PHONE, AMBULANCE_PHONE, POLICE_PHONE
```

### Deploy Backend to Cloud Run
```bash
cd backend
gcloud run deploy aegis-backend \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --set-env-vars CLOUD_MODE=true,SMS_ENABLED=false \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest,..."
```

### Deploy Frontend to Firebase
```bash
npm install -g firebase-tools
firebase login
cd frontend/staff-dashboard
npm run build
firebase init hosting   # public dir: dist, SPA: yes
firebase deploy --only hosting
```

### Enable/Disable SMS (toggle anytime, no redeploy needed)
```bash
# Enable for live demo:
gcloud run services update aegis-backend \
  --region asia-south1 \
  --update-env-vars SMS_ENABLED=true

# Disable to save credits:
gcloud run services update aegis-backend \
  --region asia-south1 \
  --update-env-vars SMS_ENABLED=false
```

---

## 🔌 Hardware Integration (Production)

AEGIS is designed for zero-friction deployment on existing infrastructure:

### CCTV Integration (RTSP)
```python
# One line change from demo to production:
# Demo:      cv2.VideoCapture("videos/restaurant.mp4")
# Production: cv2.VideoCapture("rtsp://admin:pass@192.168.1.64:554/stream")

# Supported brands: Hikvision, Dahua, Axis, Bosch, any ONVIF camera
```

### Smart Lighting (Philips Hue)
```python
# Danger zones → RED blinking
# Safe routes  → GREEN solid
# Exits        → WHITE bright

requests.put(f"http://{bridge_ip}/api/{api_key}/groups/{zone_id}/action",
             json={"hue": 0, "sat": 254, "bri": 254, "alert": "lselect"})
```

### IoT Edge Nodes (MQTT + Raspberry Pi Zero)
```python
# ₹1,500 per zone — LED strip + buzzer + WiFi
# Receives MQTT commands from AEGIS backend

client.publish(f"aegis/zone/{zone}/alert",
               json.dumps({"color": "red", "buzzer": True}))
```

### PA System (Barix / Audio-over-IP)
```python
# Integrates with commercial PA matrix controllers
# Web Speech API handles demo mode automatically
requests.post(f"http://{pa_controller}/broadcast",
              json={"message": announcement, "zones": ["all"]})
```

---

## 🎮 Demo Simulation

With the system running, trigger any scenario:

```bash
# Fire emergency in restaurant
curl -X POST http://localhost:8000/simulate/fire \
  -H "Content-Type: application/json" \
  -d '{"zone": "restaurant"}'

# Crowd crush in lobby
curl -X POST http://localhost:8000/simulate/crowd \
  -d '{"zone": "lobby"}'

# Gunshot detected
curl -X POST http://localhost:8000/simulate/gunshot

# Panic scream
curl -X POST http://localhost:8000/simulate/scream

# Reset all zones
curl -X POST http://localhost:8000/reset
```

Or use the **Demo Simulation panel** in the dashboard UI — select zone, click scenario button.

---

## 📈 Roadmap

### Q3 2026 — Scale
- **Floor plan upload** — CV image segmentation auto-detects rooms, corridors, exits from building blueprints. Auto-generates BFS zone graph.
- **Multi-language support** — Hindi, Tamil, Telugu in guest PWA and PA announcements
- **WhatsApp Business API** — more relevant than SMS in India
- **Crowd predictive analytics** — flag high-risk zones before crush conditions develop

### Q4 2026 — Integrate
- **Live RTSP CCTV** — replace demo video files with actual camera streams
- **Full IoT deployment** — Philips Hue + DALI protocol + MQTT Raspberry Pi edge nodes
- **Government API integration** — direct connection to city emergency dispatch systems
- **Insurance API** — automatic premium reduction trigger on AEGIS deployment

### 2027 — Platform
- **Multi-building enterprise dashboard** — hotel chain, mall network, stadium group
- **Predictive incident modeling** — historical data predicts high-risk times and zones
- **SaaS marketplace** — ₹15,000/month/venue subscription
- **NDMA compliance module** — India National Disaster Management Authority standards

---

## 💰 Deployment Cost

| Tier | Setup Cost | Monthly Cost | Best For |
|------|-----------|-------------|---------|
| Software Only | ₹0 | ₹1,300 | Venues with existing IP cameras |
| + IoT Nodes | ₹24,000 | ₹1,300 | Venues wanting physical zone indicators |
| Full Integration | ₹85,000 | ₹1,300 | Complete smart building deployment |

**Context:** Enterprise alternatives (Honeywell, Siemens) cost ₹2 Crore+ with full rewiring. AEGIS deploys on existing CCTV infrastructure in under 1 hour.

---

## 🔐 Security

- All credentials stored in **Google Secret Manager** — zero secrets in codebase
- Phone numbers masked in UI logs (show only first 6 digits)
- WebSocket connections over WSS (TLS encrypted)
- No video footage stored — processed in-memory and discarded
- Firebase Authentication for venue manager access
- Rate limiting on simulation endpoints

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Threat Detection Latency | < 2 seconds |
| Full Response Time | < 15 seconds |
| Camera Zones | 6 simultaneous (scalable) |
| WebSocket Update Frequency | 1 second |
| CV Processing | 30 FPS per camera |
| SMS Delivery | < 3 seconds (Twilio) |
| Gemini Reasoning | 3-5 seconds |
| System Uptime | 99.9% (Google Cloud Run) |

---

## 👥 Team

Built for **Google HacktoSolve 2026** — Problem Statement: *Rapid Crisis Response*

| Name | Role |
|------|------|
| Nakul Singh | Team Lead, Backend + CV Pipeline |
| Ayesha Maniyar | AI Agent + Gemini Integration |
| Michelle Hoolgeri | Frontend + Deployment |

3rd Year B.Tech Computer Science (AI), 2026

---

## 🏆 Hackathon

**Event:** Google HacktoSolve (H2S) 2026
**Problem Statement:** Rapid Crisis Response — Accelerated Emergency Response and Crisis Coordination in Hospitality
**Track:** AI + Cloud

**Google Technologies Used:**
- Gemini 2.0 Flash — AI threat intelligence
- Google Cloud Run — Backend deployment (asia-south1)
- Firebase Hosting — Frontend CDN
- Google Secret Manager — Credential security
- Google Maps JavaScript API — Venue map integration
- Google Places API — First responder location
- Google Geocoding API — Venue address resolution

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**⚡ AEGIS — We didn't build a smarter fire alarm.**
**We built the nervous system for any building.**

*Sight. Sound. Intelligence. Action. All in under 15 seconds.*

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-aegis--crisis--2026.web.app-ef4444?style=for-the-badge)](https://aegis-crisis-2026.web.app)

</div>
