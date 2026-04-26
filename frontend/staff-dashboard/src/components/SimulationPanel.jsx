import { useState, useEffect, useCallback, memo } from "react";
import IncidentReportViewer from "./IncidentReportViewer";

// Isolated countdown component — synced with backend start epoch
const CountdownTimer = memo(function CountdownTimer({ startEpoch }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const elapsed = startEpoch ? Math.floor(now / 1000 - startEpoch) : 0;
  const remaining = Math.max(0, 120 - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-3 text-center">
      <p className="text-gray-400 text-xs text-center">Auto-resolve in</p>
      <p className="text-white text-2xl font-mono font-bold text-center">{mins}:{secs.toString().padStart(2, '0')}</p>
      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
        <div className="bg-red-500 h-1.5 rounded-full transition-all duration-1000"
          style={{ width: `${(remaining / 120) * 100}%` }} />
      </div>
    </div>
  );
});

export default function SimulationPanel({ aegisStarted, incidentActive, incidentResolved, onBeforeRestart, startEpoch }) {
  const [starting, setStarting] = useState(false);

  const handleStart = useCallback(async () => {
    // Kill all audio BEFORE re-starting (stops all-clear mid-sentence etc.)
    if (onBeforeRestart) onBeforeRestart();
    setStarting(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    try { await fetch(`${API_URL}/start-aegis`, { method: "POST" }); } catch (e) { }
    setTimeout(() => setStarting(false), 2500);
  }, [onBeforeRestart]);

  const handleResolve = useCallback(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${API_URL}/resolve`, { method: "POST" })
      .then(() => console.log("[AEGIS] Resolve OK"))
      .catch(e => console.error("[AEGIS] Resolve err:", e));
  }, []);

  // ── STANDBY ──
  if (!aegisStarted && !incidentResolved) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border-2 border-yellow-500/50 text-center">
        <div className="text-5xl mb-3">⚡</div>
        <h2 className="text-white font-black text-xl mb-2">AEGIS System</h2>
        <p className="text-gray-400 text-sm mb-5">AI-Powered Emergency Detection & Response</p>
        <button onClick={handleStart} disabled={starting}
          className={`w-full py-4 rounded-xl font-black text-lg tracking-wider transition-all
            ${starting
              ? "bg-yellow-600 animate-pulse cursor-wait"
              : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black"}`}>
          {starting ? "⏳ ACTIVATING CAMERAS..." : "▶ START AEGIS"}
        </button>
        <p className="text-gray-500 text-xs mt-3">Activates 6 cameras + AI detection</p>
      </div>
    );
  }

  // ── MONITORING ──
  if (aegisStarted && !incidentActive && !incidentResolved) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 border border-green-600/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <h3 className="text-white font-bold text-lg">System Active</h3>
        </div>
        <p className="text-green-300 text-sm mb-3">AI scanning for threats...</p>
        <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400 space-y-1">
          <p>🔍 Fire detection — <span className="text-green-400">ACTIVE</span></p>
          <p>👤 Person counting — <span className="text-green-400">ACTIVE</span></p>
          <p>🗺️ Evacuation routing — <span className="text-green-400">ARMED</span></p>
          <p>📱 SMS alerts — <span className="text-green-400">READY</span></p>
        </div>
      </div>
    );
  }

  // ── INCIDENT ACTIVE ──
  // Timer is isolated so it doesn't re-render the resolve button
  if (incidentActive) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 border-2 border-red-500/70">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h3 className="text-red-400 font-bold text-lg">Incident Active</h3>
        </div>

        <CountdownTimer startEpoch={startEpoch} />

        <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-300 space-y-1 mb-3">
          <p>✅ Threat detected & classified</p>
          <p>✅ Evacuation routes calculated</p>
          <p>✅ Staff alerted via SMS</p>
          <p>✅ Emergency services notified</p>
        </div>

        <button onClick={handleResolve}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600
            text-white rounded-xl py-3 font-bold text-sm transition-all active:scale-95 cursor-pointer">
          ✅ DECLARE ALL CLEAR
        </button>
        <p className="text-gray-500 text-xs mt-1 text-center italic">Or wait for auto-resolve</p>
      </div>
    );
  }

  // ── RESOLVED ──
  if (incidentResolved) {
    return (
      <ResolvedPanel starting={starting} handleStart={handleStart} onBeforeRestart={onBeforeRestart} />
    );
  }

  return null;
}

function ResolvedPanel({ starting, handleStart }) {
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-green-500/50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-green-400 text-xl">✅</span>
        <h3 className="text-green-400 font-bold text-lg">Incident Resolved</h3>
      </div>
      <p className="text-gray-300 text-sm mb-4">All clear. Cameras offline. Area secured.</p>
      <div className="flex flex-col gap-2">
        {!showReport && (
          <button onClick={() => setShowReport(true)}
            className="block text-center w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700
              text-white rounded-xl py-3 font-bold text-sm transition-all focus:outline-none">
            📋 Generate Incident Report
          </button>
        )}
        <button onClick={handleStart} disabled={starting}
          className={`w-full rounded-xl py-3 font-bold text-sm transition-all
            ${starting
              ? "bg-yellow-600 animate-pulse cursor-wait"
              : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black"}`}>
          {starting ? "⏳ RESTARTING..." : "🔄 Re-simulate Incident"}
        </button>
      </div>
      {showReport && (
        <div className="mt-4">
          <IncidentReportViewer />
        </div>
      )}
    </div>
  );
}
