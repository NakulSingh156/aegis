import { useState, useRef, useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import VenueMap from "../components/VenueMap";
import AgentLog from "../components/AgentLog";
import ZoneGrid from "../components/ZoneGrid";
import CameraGrid from "../components/CameraGrid";
import SMSPanel from "../components/SMSPanel";
import EmergencyDispatchPanel from "../components/EmergencyDispatchPanel";
import SimulationPanel from "../components/SimulationPanel";
import GeminiPanel from "../components/GeminiPanel";
import ThreatGraph from "../components/ThreatGraph";
import DensityHeatmap from "../components/DensityHeatmap";
import { useAuth } from "../context/AuthContext";
import IncidentHistory, { saveIncidentToHistory } from "../components/IncidentHistory";
import EmergencyManager from "../components/EmergencyManager";
import { stopAnnouncements } from "../utils/announcer";
import { WS_BASE_URL } from "../config";

export default function Dashboard() {
  const { user, venue, logout } = useAuth();

  const wsUrl = WS_BASE_URL;

  const { data: state, connected } = useWebSocket(wsUrl);
  const [paMuted, setPaMuted] = useState(false);
  const [paText, setPaText] = useState("");
  const [paActive, setPaActive] = useState(false); // UI state
  const prevIncidentRef = useRef(false);
  const prevResolvedRef = useRef(null); // use null to detect initial load
  const paTimerRef = useRef(null);
  const [showFullBrief, setShowFullBrief] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);

  // Pre-load browser voices on mount
  useEffect(() => {
    window.speechSynthesis.getVoices();
    const interval = setInterval(() => {
      if (!state) setLoadingTime(t => t + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
      if (paTimerRef.current) {
        if (typeof paTimerRef.current === 'number') clearTimeout(paTimerRef.current);
      }
      stopAnnouncements();
    };
  }, [state]);

  const paActiveRef = useRef(false); // tracks if the emergency PA loop is currently running

  // RESOLUTION HANDLER: Only for history logging and state cleanup.
  useEffect(() => {
    if (!state) return;
    const isActive = state.incident_active;
    const isResolved = state.incident_resolved;
    const wasActive = prevIncidentRef.current;

    if (isResolved && isActive && wasActive) {
      // Incident just resolved
      try { saveIncidentToHistory(state); } catch (err) { }
    }

    prevIncidentRef.current = isActive;
    prevResolvedRef.current = isResolved;
  }, [state]);

  if (!state) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(-8px) } to { opacity:1; transform:translateX(0) } }`}</style>
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6 animate-pulse">⚡</div>
        <h1 className="text-3xl font-black text-white mb-2">AEGIS Initializing</h1>
        <p className="text-gray-500 text-sm mb-1 uppercase tracking-widest">Autonomous Emergency Guardian &amp; Incident Synchronization</p>
        <p className="text-[10px] text-gray-700 font-mono">Build Version: Rev.00190-TheFinalThree</p>

        <div className="flex flex-col gap-2 text-left mt-6 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          {[
            "Starting camera processors...",
            "Loading YOLOv8 detection models...",
            "Initializing audio threat analysis...",
            "Connecting event fusion engine...",
            "System ready.",
          ].map((msg, i) => (
            <div key={i} className="flex items-center gap-2 text-sm"
              style={{ opacity: 0, animation: `fadeIn 0.3s ease ${i * 0.4}s forwards` }}>
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">{msg}</span>
            </div>
          ))}

          <div className="flex items-center gap-2 text-sm mt-2 font-mono"
            style={{ opacity: 0, animation: `fadeIn 0.3s ease 2.4s forwards` }}>
            <span className={connected ? "text-green-400" : "text-yellow-500 animate-pulse"}>
              {connected ? "✓" : "⚡"}
            </span>
            <span className={connected ? "text-gray-300" : "text-yellow-500"}>
              {connected ? "WebSocket Connected" : "Awaiting Data Stream..."}
            </span>
          </div>
        </div>

        {loadingTime > 5 && (
          <div className="mt-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-left animate-in fade-in duration-700">
            <p className="text-red-400 font-bold text-sm flex items-center gap-2">
              ⚠️ Connection slow or protocol blocked
            </p>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              You are currently on <strong>{window.location.host}</strong>.<br />
              Trying to connect to system at: <code className="bg-black/40 px-1 rounded">{wsUrl}</code>
            </p>
            <p className="text-gray-500 text-xs mt-3 italic">
              {window.location.protocol === "https:" && wsUrl.startsWith("ws:")
                ? "ERROR: Browser is blocking insecure WebSocket (WS) on an HTTPS site. Please use localhost dashboard for local testing."
                : "TIP: Ensure the backend is running and the internet connection is stable."}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const aegisStarted = state.aegis_started;
  const incidentActive = state.incident_active;
  const incidentResolved = state.incident_resolved;
  const isAlert = state.building_alert;

  // Are cameras actually running? (started AND not resolved)
  const camerasLive = aegisStarted && !incidentResolved;

  const totalPeople = Object.values(state.zones || {})
    .reduce((sum, z) => sum + (z.person_count || 0), 0);
  const criticalZones = Object.values(state.zones || {})
    .filter(z => z.status === "critical").length;

  // Status pill
  let statusPill = { text: "SYSTEM STANDBY", cls: "bg-gray-700 text-gray-300" };
  if (incidentResolved) {
    statusPill = { text: "✅ INCIDENT RESOLVED", cls: "bg-green-700" };
  } else if (incidentActive) {
    statusPill = { text: "LEVEL ALPHA ACTIVE", cls: "bg-red-600 animate-pulse" };
  } else if (aegisStarted) {
    statusPill = { text: "ALL SYSTEMS NOMINAL", cls: "bg-green-700" };
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white p-4
      ${isAlert ? "ring-4 ring-red-500 ring-inset" : ""}`}>

      {/* Emergency PA Manager (Side Effects) */}
      <EmergencyManager state={state} paMuted={paMuted} setPaText={setPaText} />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider flex items-center gap-2">
            ⚡ AEGIS
            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-md border border-gray-700 ml-2">
              {venue?.venueName || "Grand Meridian Hotel"}
            </span>
          </h1>
          <p className="text-gray-400 text-xs">Autonomous Emergency Guardian & Incident Synchronization</p>
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full font-bold text-sm ${statusPill.cls}`}>
            {statusPill.text}
          </div>
          <button
            onClick={() => {
              setPaMuted(!paMuted);
              if (!paMuted) stopAnnouncements();
            }}
            className={`text-white border rounded-xl px-3 py-2 text-xs font-bold transition ${paMuted
              ? "bg-red-900/30 border-red-600 hover:bg-red-800"
              : "bg-green-900/30 border-green-600 hover:bg-green-800"
              }`}>
            {paMuted ? "🔇 PA Muted" : "🔊 PA Active"}
          </button>
          <IncidentHistory />
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 hover:bg-gray-800 px-3 py-2 rounded-xl text-xs font-bold transition">
            Sign Out
          </button>
        </div>

        <div className="flex gap-4 text-center">
          <div className="bg-gray-800 rounded-xl px-4 py-2">
            <div className="text-2xl font-bold">{camerasLive ? totalPeople : "—"}</div>
            <div className="text-xs text-gray-400">People Tracked</div>
          </div>
          <div className="bg-gray-800 rounded-xl px-4 py-2">
            <div className={`text-2xl font-bold ${criticalZones > 0 ? "text-red-400" : "text-green-400"}`}>
              {camerasLive ? criticalZones : "—"}
            </div>
            <div className="text-xs text-gray-400">Critical Zones</div>
          </div>
          <div className="bg-gray-800 rounded-xl px-4 py-2">
            <div className={`text-2xl font-bold ${connected ? "text-green-400" : "text-red-400"}`}>
              {connected ? (camerasLive ? "LIVE" : "READY") : "OFF"}
            </div>
            <div className="text-xs text-gray-400">System Status</div>
          </div>
          <div className="bg-gray-800 rounded-xl px-4 py-2">
            <div className="text-2xl font-black text-purple-400">
              {state.agent_log?.length || 0}
            </div>
            <div className="text-xs text-gray-400">AI Decisions</div>
          </div>
        </div>
      </div>

      {/* Incident Banner */}
      {incidentActive && (
        <div style={{
          background: "rgba(220,38,38,0.1)",
          border: "1px solid rgba(220,38,38,0.4)",
          borderLeft: "4px solid #dc2626",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
          marginBottom: "16px"
        }}>
          <div style={{
            background: "#dc2626",
            color: "white",
            padding: "8px",
            borderRadius: "50%",
            flexShrink: 0,
            alignSelf: "flex-start",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            🚨
          </div>

          <div style={{ flex: 1 }}>
            <p style={{
              color: "#fca5a5",
              fontWeight: 700,
              fontSize: "15px",
              marginBottom: "8px",
              lineHeight: 1.4
            }}>
              {state.incident_brief?.split('. ')[0]}.
            </p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                `⏱ Started: ${state.incident_start_time}`,
                `📍 Zone: ${state.affected_zones?.join(", ")}`,
                `👤 Affected: ${totalPeople} people`,
                `⚡ Response: <15 seconds`,
              ].map((pill, i) => (
                <span key={i} style={{
                  background: "rgba(220,38,38,0.2)",
                  border: "1px solid rgba(220,38,38,0.3)",
                  color: "#fca5a5",
                  fontSize: "12px",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  fontFamily: "monospace"
                }}>
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowFullBrief(!showFullBrief)}
            style={{
              background: "transparent",
              border: "1px solid rgba(220,38,38,0.4)",
              color: "#fca5a5", fontSize: "12px",
              padding: "6px 12px", borderRadius: "6px",
              cursor: "pointer", flexShrink: 0
            }}>
            {showFullBrief ? "▲ Less" : "▼ Full Analysis"}
          </button>
        </div>
      )}

      {/* Full Gemini analysis — collapsible */}
      {incidentActive && showFullBrief && (
        <div style={{
          background: "rgba(14,14,24,0.8)",
          border: "1px solid rgba(220,38,38,0.2)",
          borderRadius: "12px", padding: "20px",
          fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
          color: "#9ca3af", lineHeight: 1.7,
          maxHeight: "300px", overflowY: "auto",
          marginBottom: "16px",
          backdropFilter: "blur(10px)"
        }}>
          <div className="mb-3 uppercase text-[10px] tracking-widest text-red-500 font-bold">Tactical Intelligence Report</div>
          <ul className="list-none p-0 m-0 space-y-3">
            {state.incident_brief?.split('. ').filter(s => s.trim().length > 0).map((sentence, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <span className="text-red-500 font-bold mt-1 text-lg leading-none">›</span>
                <span className="text-gray-300">{sentence.trim()}{sentence.endsWith('.') ? '' : '.'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resolved Banner */}
      {incidentResolved && !incidentActive && (
        <div className="bg-green-900/60 border-2 border-green-500 rounded-2xl p-4 mb-4">
          <p className="text-green-200 font-bold text-lg">
            ✅ All Clear — Incident resolved at {state.resolution_time}
          </p>
          <p className="text-green-300 text-sm mt-1">Cameras offline. Download report or re-simulate below.</p>
        </div>
      )}

      <div className="mb-4">
        <CameraGrid zones={state.zones} aegisStarted={camerasLive} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-4">
          <VenueMap venueState={state} />
          {(camerasLive || incidentResolved) && <DensityHeatmap zones={state.zones} />}
          {camerasLive && <ZoneGrid zones={state.zones} />}
          <SMSPanel smsLog={state.sms_log || []} />
          <EmergencyDispatchPanel dispatchLog={state.emergency_dispatch_log || []} venueState={state} />
        </div>

        <div className="flex flex-col gap-4">
          <SimulationPanel
            aegisStarted={aegisStarted}
            incidentActive={incidentActive}
            incidentResolved={incidentResolved}
            startEpoch={state.incident_start_epoch}
            onBeforeRestart={() => {
              console.log("[AEGIS] Re-simulate clicked — Force killing all audio");
              stopAnnouncements();
              window.speechSynthesis.cancel();
              prevIncidentRef.current = false;
              prevResolvedRef.current = null;
              paActiveRef.current = false;
              if (paTimerRef.current?.__killAllClear) {
                paTimerRef.current.__killAllClear();
              }
              if (paTimerRef.current && typeof paTimerRef.current === 'number') {
                clearTimeout(paTimerRef.current);
              }
              setPaMuted(false);
            }}
          />
          {(incidentActive || incidentResolved) && <GeminiPanel analysis={state.gemini_analysis} />}
          <ThreatGraph
            zones={state.zones}
            active={aegisStarted}
            resolved={incidentResolved}
          />
        </div>
      </div>

      {/* PA TICKER FAILSAFE */}
      {(incidentActive || incidentResolved) && paText && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white py-3 px-6 z-50 flex items-center gap-4 animate-in slide-in-from-bottom duration-500 shadow-2xl border-t border-white/20">
          <div className="flex-shrink-0 bg-white text-red-600 font-black px-2 py-0.5 rounded text-xs uppercase tracking-tighter">AEGIS PA</div>
          <div className="flex-1 overflow-hidden font-bold tracking-tight text-lg">
            <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite]">
              {paText} • {paText} • {paText} • {paText}
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}
