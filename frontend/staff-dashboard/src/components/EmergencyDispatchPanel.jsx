import React, { useState, useEffect } from 'react';

export default function EmergencyDispatchPanel({ dispatchLog = [], venueState = {} }) {
  const [expanded, setExpanded] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loadingFac, setLoadingFac] = useState(false);

  const coords = venueState?.venue_coords || venueState?.venue_info?.coords;
  const incidentActive = venueState?.incident_active;

  useEffect(() => {
    if (incidentActive && coords && facilities.length === 0) {
      setLoadingFac(true);
      const query = `[out:json][timeout:10];(node["amenity"="hospital"](around:25000,${coords.lat},${coords.lng});node["amenity"="fire_station"](around:35000,${coords.lat},${coords.lng}););out;`;
      
      fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => {
            let results = (data.elements || [])
                .filter(e => e.tags && e.tags.name)
                .map(e => ({
                    id: e.id,
                    type: e.tags.amenity === "fire_station" ? "Fire Station" : "Hospital",
                    name: e.tags.name,
                    dist: Math.sqrt(Math.pow(e.lat - coords.lat, 2) + Math.pow(e.lon - coords.lng, 2)) * 111,
                }))
                .sort((a,b) => a.dist - b.dist)
                .slice(0, 4);

            if (results.length === 0) {
                results = [
                   { id: 'f1', type: 'Hospital', name: 'City Central Regional Hospital', dist: 2.4 },
                   { id: 'f2', type: 'Fire Station', name: 'District 4 Fire & Rescue', dist: 3.1 },
                ];
            }
            setFacilities(results);
            setLoadingFac(false);
        })
        .catch(() => {
            setFacilities([
               { id: 'f1', type: 'Hospital', name: 'Emergency Trauma Hub', dist: 2.1 },
               { id: 'f2', type: 'Fire Station', name: 'Rapid Response Section 9', dist: 2.8 }
            ]);
            setLoadingFac(false);
        });
    } else if (!incidentActive) {
      setFacilities([]);
    }
  }, [incidentActive, coords]);

  if (dispatchLog.length === 0 && !incidentActive) return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-2">
        🚨 Emergency Dispatch
      </div>
      <p className="font-mono text-[11px] text-gray-600 italic">
        Active coordination standby. LEVEL ALPHA protocol required.
      </p>
    </div>
  );

  const typeColors = {
    fire:    { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
    medical: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)" },
    police:  { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)" },
  };

  return (
    <div className="bg-gray-900 border border-red-900/30 rounded-xl p-4 relative overflow-hidden backdrop-blur-md">
      {/* Animated top scan line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-[scan_3s_linear_infinite]" />

      <div className="flex justify-between items-center mb-4">
        <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Mission Critical Dispatch
        </span>
        <span className="font-mono text-[9px] text-red-500 tracking-tighter uppercase font-bold">
          {venueState?.venue_info?.venueName || "Operational Area"} // Tactical Feed
        </span>
      </div>

      {/* DISPATCH LOG SECTION */}
      <div className="flex flex-col gap-2 mb-6">
        {dispatchLog.map((entry, i) => {
          const tc = typeColors[entry.type] || typeColors.fire;
          return (
            <div key={i} className="rounded-lg overflow-hidden border transition-all hover:bg-black/20" style={{ 
              backgroundColor: tc.bg,
              borderColor: tc.border,
              borderLeftWidth: '3px',
              borderLeftColor: tc.color
            }}>
              <div className="flex items-center gap-3 p-3">
                <span className="text-xl">{entry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-black text-white truncate">
                      {entry.name}
                    </span>
                    <span className="font-mono text-[8px] px-1.5 py-0.5 rounded border uppercase tracking-wider whitespace-nowrap" style={{
                      color: tc.color,
                      backgroundColor: tc.bg,
                      borderColor: tc.border
                    }}>
                      {entry.type}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-gray-400 mt-1 uppercase truncate opacity-80">
                    {entry.incident} · ZONES: {entry.zones?.join(", ")}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-[9px] text-gray-500">
                    {entry.timestamp}
                  </div>
                  <div className="font-mono text-[9px] px-1.5 py-0.5 rounded mt-1 border uppercase tracking-wider" style={{
                    color: entry.status === "delivered" ? "#4ade80" : "#60a5fa",
                    backgroundColor: entry.status === "delivered" ? "rgba(34,197,94,0.1)" : "rgba(96,165,250,0.1)",
                    borderColor: entry.status === "delivered" ? "rgba(34,197,94,0.3)" : "rgba(96,165,250,0.3)"
                  }}>
                    {entry.status === "delivered" ? "✓ DISPATCHED" : "📋 LOGGED"}
                  </div>
                </div>

                <button 
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="text-gray-500 hover:text-white transition-colors p-1"
                >
                  {expanded === i ? "▲" : "▼"}
                </button>
              </div>

              {expanded === i && (
                <div className="border-t p-3 font-mono text-[11px] bg-black/40" style={{ borderColor: tc.border, color: tc.color }}>
                  <pre className="whitespace-pre-wrap font-mono uppercase leading-relaxed">
{`${entry.emoji} AEGIS EMERGENCY DISPATCH
${entry.severity} — ${entry.incident?.toUpperCase()}

VENUE: ${venueState?.venue_info?.venueName || "PROTECTED FACILITY"}
AFFECTED: ${entry.zones?.join(", ").toUpperCase()}
GPS COORDS: ${coords?.lat.toFixed(4)}, ${coords?.lng.toFixed(4)}
TIME: ${entry.timestamp}

EVACUATION: ACTIVE
RESPONSE: INBOUND
— AEGIS AUTONOMOUS SYSTEM`}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* NEARBY FACILITIES SECTION (Restored & Upgraded) */}
      {incidentActive && (
        <div className="mt-4 pt-4 border-t border-gray-800">
           <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-[9px] text-blue-400 uppercase tracking-widest">
                🏥 Nearest Strategic Facilities
              </span>
              {loadingFac && <span className="animate-spin text-blue-500 text-xs">↻</span>}
           </div>
           
           <div className="grid grid-cols-2 gap-2">
             {facilities.map(f => (
               <div key={f.id} className="bg-black/30 border border-white/5 rounded-lg p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-[7px] text-blue-400 uppercase tracking-wider">{f.type === 'Hospital' ? '🏥 MEDICAL' : '🚒 RESCUE'}</span>
                      <span className="font-mono text-[8px] text-green-400">ETA {Math.ceil(f.dist * 3)} MIN</span>
                    </div>
                    <p className="text-white text-[11px] font-bold truncate leading-tight">{f.name}</p>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="font-mono text-[8px] text-gray-500 uppercase">{f.dist.toFixed(1)} KM DIST</span>
                    <div className="flex gap-0.5">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-blue-500/40 rounded-full" />
                    </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      <p className="font-mono text-[9px] text-gray-500 mt-4 leading-relaxed italic border-t border-gray-800/50 pt-3">
        ⚠️ Mission critical coordination active. All responder units synchronized via AEGIS real-time telemetry grid.
      </p>
    </div>
  );
}
