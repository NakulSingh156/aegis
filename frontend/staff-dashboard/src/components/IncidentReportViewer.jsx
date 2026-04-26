import { useState, useEffect } from "react";

export default function IncidentReportViewer() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // PRODUCTION HARD-LOCK: Verified Cloud Run URL
    const API_URL = "https://aegis-backend-elq54assoq-el.a.run.app";
    fetch(`${API_URL}/report`)
      .then(res => res.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load report", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-blue-500/50 animate-pulse text-center text-blue-400">
        Generating Final Incident Report...
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border-2 border-blue-500/50 shadow-xl max-h-[85vh] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-700 pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="text-blue-500">📋</span> AEGIS Official Report
          </h2>
          <p className="text-gray-400 text-sm mt-1">Generated: {report.generated_at}</p>
        </div>
        <div className="text-right">
          <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/50">
            {(report.incident?.severity || "LEVEL ALPHA")} • {(report.incident?.type || "FIRE").toUpperCase()}
          </span>
          <p className="text-gray-500 text-xs mt-2 font-mono">Res: {report.incident?.resolution_time || "N/A"}</p>
        </div>
      </div>

      {/* Structured Incident Facts */}
      <div className="bg-gray-800/80 rounded-xl p-5 border border-gray-700 mb-6">
        <h4 className="text-gray-400 text-sm font-bold uppercase mb-4 border-b border-gray-700 pb-2">Incident Executive Summary</h4>
        <ul className="space-y-3 text-sm text-gray-300">
          <li className="flex gap-3 items-start">
            <span className="text-red-500 text-lg leading-none">🔥</span>
            <span><strong>Incident Type:</strong> {(report.incident?.type || "Incident").toUpperCase()} CONFIRMED at {report.incident?.start_time || "T-00:00"}</span>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-red-400 text-lg leading-none">📍</span>
            <span><strong>Critical Area of Origin:</strong> {report.danger_zones?.length > 0 ? report.danger_zones.join(", ") : "Main Venue"}</span>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-blue-400 text-lg leading-none">👥</span>
            <span><strong>Occupancy at Threat Level:</strong> {report.incident?.total_persons_tracked || 0} individuals tracked in affected infrastructure.</span>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-green-500 text-lg leading-none">🛡️</span>
            <span><strong>Response Protocol:</strong> Active AI mitigation triggered. Automatic evacuation routed. Response delivered in {report.system_info?.response_time || "< 15 seconds"}.</span>
          </li>
        </ul>
      </div>

      {/* Zone Post-Mortem */}
      <div className="mb-6">
        <h4 className="text-gray-400 text-sm font-bold uppercase mb-3">Post-Incident Zone Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(report.zone_detail).map(([zoneName, detail]) => {
            const isCritical = detail.final_status === "critical";
            return (
              <div key={zoneName} className={`rounded-xl p-3 border ${isCritical ? "bg-red-900/30 border-red-500/50" : "bg-gray-800 border-gray-700"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-200 uppercase text-xs">{zoneName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                    ${isCritical ? "bg-red-500 text-white" : "bg-green-500/20 text-green-400"}`}>
                    {detail.final_status}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Persons Evacuated: <span className="text-gray-300 font-mono">{detail.persons_last_seen}</span></p>
                  <p>Structural Threat: <span className={detail.fire_detected ? "text-red-400" : "text-gray-300"}>{detail.fire_detected ? "FIRE" : "SAFE"}</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
          <p className="text-gray-500 text-xs uppercase font-bold mb-1">Affected Zones</p>
          <div className="flex flex-wrap gap-1">
            {report.danger_zones.map(z => (
              <span key={z} className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-sm">{z}</span>
            ))}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
          <p className="text-gray-500 text-xs uppercase font-bold mb-1">Persons Tracked</p>
          <p className="text-2xl font-bold text-white">{report.incident.total_persons_tracked}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
          <p className="text-gray-500 text-xs uppercase font-bold mb-1">Casualties</p>
          <p className="text-2xl font-bold text-green-400">{report.incident.casualties}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
          <p className="text-gray-500 text-xs uppercase font-bold mb-1">Response Time</p>
          <p className="text-xl font-bold text-blue-400 whitespace-nowrap">{report.system_info.response_time}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        {/* Evacuation Routes */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h4 className="text-gray-400 text-sm font-bold uppercase mb-4">Evacuation Execution</h4>
          <ul className="space-y-3 text-sm">
            {Object.entries(report.evacuation_routes).map(([zone, route]) => (
              <li key={zone} className="flex items-start gap-3">
                <span className="text-blue-400 min-w-[90px] font-mono break-all">{zone}:</span>
                <span className="text-gray-300 flex-1 leading-relaxed">
                  {route.map((step, idx) => (
                    <span key={idx}>
                      {step}
                      {idx < route.length - 1 && <span className="text-gray-600 mx-2">→</span>}
                    </span>
                  ))}
                  {route.length === 0 && <span className="text-green-500">Shelter in place / Safe</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* SMS Status */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h4 className="text-gray-400 text-sm font-bold uppercase mb-4">Staff Notifications</h4>
          <ul className="space-y-4 text-sm">
            {report.sms_alerts_sent.map((sms, i) => (
              <li key={i} className="flex justify-between items-center text-sm border-b border-gray-700/50 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-gray-200 font-bold mb-0.5">{sms.recipient}</p>
                  <p className="text-gray-500 text-xs font-mono">{sms.phone}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold mb-1 w-max
                    ${sms.status === "DELIVERED" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-500"}`}>
                    {sms.status}
                  </span>
                  <p className="text-gray-500 text-xs">{sms.timestamp}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h4 className="text-gray-400 text-sm font-bold uppercase mb-3">Event Action Timeline</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {report.event_timeline.map((log, i) => {
            const timeMatch = log.match(/^\[(.*?)\] (.*)/);
            if (!timeMatch) return <p key={i} className="text-gray-400 text-xs font-mono">{log}</p>;

            return (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-blue-400 font-mono text-xs mt-0.5 shrink-0">{timeMatch[1]}</span>
                <span className={`${log.includes("CLEAR") ? "text-green-400" : "text-gray-300"}`}>{timeMatch[2]}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
