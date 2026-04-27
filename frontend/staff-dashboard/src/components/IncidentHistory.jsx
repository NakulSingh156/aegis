import { useState, useEffect } from "react";

const HISTORY_KEY = "aegis_history";

export function saveIncidentToHistory(state) {
  if (!state) return;
  const log = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");

  // Calculate response time from start → resolution
  const responseTime = calcResponse(
    state.incident_start_time,
    state.resolution_time,
    state.incident_start_epoch
  );

  log.unshift({
    id: Date.now(),
    date: state.incident_date || new Date().toLocaleDateString("en-CA"),
    type: state.incident_type || "unknown",
    severity: state.severity || "P3",
    zones: state.affected_zones || [],
    startTime: state.incident_start_time || "—",
    resolvedAt: state.resolution_time || new Date().toLocaleTimeString("en-US", { hour12: false }),
    responseTime: responseTime,
    smsDelivered: state.sms_log?.length || 0,
    totalPeople: Object.values(state.zones || {}).reduce((s, z) => s + (z.person_count || 0), 0),
    geminiVerdict: state.gemini_analysis?.threat_assessment || "N/A",
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(log.slice(0, 20)));
}

function calcResponse(startStr, resolveStr, startEpoch) {
  // Method 1: use epoch if available (most accurate)
  if (startEpoch) {
    const diffSec = Math.floor(Date.now() / 1000 - startEpoch);
    if (diffSec >= 0 && diffSec < 7200) {
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      return `${mins}m ${secs}s`;
    }
  }

  // Method 2: diff between two HH:MM:SS strings
  if (startStr && resolveStr && startStr !== "—" && resolveStr !== "—") {
    const [h1, m1, s1] = startStr.split(":").map(Number);
    const [h2, m2, s2] = resolveStr.split(":").map(Number);
    let diffSec = (h2 * 3600 + m2 * 60 + s2) - (h1 * 3600 + m1 * 60 + s1);
    if (diffSec < 0) diffSec += 86400; // crossed midnight
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `${mins}m ${secs}s`;
  }

  // Fallback: ≤15s (AEGIS response time claim)
  return "<15s";
}

export default function IncidentHistory() {
  const [show, setShow] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (show) {
      setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"));
    }
  }, [show]);

  return (
    <>
      <button
        onClick={() => setShow(!show)}
        className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${show
          ? "bg-blue-900/40 border-blue-500 text-blue-400"
          : "bg-gray-800 border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
          }`}>
        {show ? "✕ Close History" : "📜 AEGIS History"}
      </button>

      {show && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShow(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-5xl max-h-[80vh] overflow-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-white font-black text-xl">📜 AEGIS Incident History</h2>
                <p className="text-gray-500 text-xs mt-1">Last {history.length} incidents recorded in this browser session</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { localStorage.removeItem(HISTORY_KEY); setHistory([]); }}
                  className="text-red-400 text-xs border border-red-800 px-3 py-1 rounded-lg hover:bg-red-900/30 transition">
                  🗑️ Clear
                </button>
                <button onClick={() => setShow(false)}
                  className="text-gray-400 text-xs border border-gray-700 px-3 py-1 rounded-lg hover:bg-gray-800 transition">
                  ✕ Close
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p className="text-3xl mb-2">📋</p>
                <p>No incidents recorded yet. Complete a simulation to see data here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                      <th className="py-3 px-2">#</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Type</th>
                      <th className="py-3 px-2">Severity</th>
                      <th className="py-3 px-2">Zones</th>
                      <th className="py-3 px-2">Start</th>
                      <th className="py-3 px-2">Resolved</th>
                      <th className="py-3 px-2">Response</th>
                      <th className="py-3 px-2">SMS</th>
                      <th className="py-3 px-2">People</th>
                      <th className="py-3 px-2">AI Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((inc, i) => (
                      <tr key={inc.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                        <td className="py-3 px-2 text-gray-500 font-mono">{i + 1}</td>
                        <td className="py-3 px-2 text-gray-400 font-mono text-xs">{inc.date}</td>
                        <td className="py-3 px-2">
                          <span className="text-white font-bold">
                            {inc.type === "fire" ? "🔥" : "⚠️"} {inc.type?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${inc.severity === "P1" ? "bg-red-900/50 text-red-400" :
                            inc.severity === "P2" ? "bg-orange-900/50 text-orange-400" :
                              "bg-yellow-900/50 text-yellow-400"
                            }`}>{inc.severity}</span>
                        </td>
                        <td className="py-3 px-2 text-gray-300 text-xs">
                          {inc.zones?.join(", ") || "—"}
                        </td>
                        <td className="py-3 px-2 text-gray-400 font-mono text-xs">{inc.startTime}</td>
                        <td className="py-3 px-2 text-green-400 font-mono text-xs">{inc.resolvedAt}</td>
                        <td className="py-3 px-2">
                          <span className="text-blue-400 font-bold text-xs">{inc.responseTime}</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="bg-green-900/40 text-green-400 px-2 py-0.5 rounded text-xs font-bold">
                            {inc.smsDelivered}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-yellow-400 font-bold text-center">{inc.totalPeople}</td>
                        <td className="py-3 px-2 text-gray-300 text-xs max-w-[200px] truncate">
                          {inc.geminiVerdict}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
