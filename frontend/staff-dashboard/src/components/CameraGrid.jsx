const CAMERA_ZONES = [
  { id: "lobby",      label: "Lobby",      cam: "CAM-01" },
  { id: "restaurant", label: "Restaurant", cam: "CAM-03" },
  { id: "corridor_a", label: "Corridor A", cam: "CAM-02" },
  { id: "stairwell",  label: "Stairwell",  cam: "CAM-04" },
  { id: "parking",    label: "Parking",    cam: "CAM-05" },
  { id: "pool",       label: "Pool Area",  cam: "CAM-06" },
];

const VIDEO_SOURCES = {
  lobby:      "/videos/lobby_normal.mp4",
  restaurant: "/videos/restaurant_incident.mp4",
  corridor_a: "/videos/corridor_normal.mp4",
  stairwell:  "/videos/stairwell_normal.mp4",
  parking:    "/videos/parking_normal.mp4",
  pool:       "/videos/pool_normal.mp4",
};

function CameraCard({ zone, label, cam, data, aegisStarted }) {
  const status = data?.status || "safe";
  const isCritical = status === "critical" && aegisStarted;
  
  const borderColors = {
    critical: "#ef4444",
    warning:  "#f97316",
    safe:     "#22c55e"
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border-2 transition-all duration-500 bg-gray-900 group
      ${isCritical ? "animate-[border-pulse_1.5s_infinite]" : "border-gray-800"}`}
      style={{ 
        borderColor: aegisStarted ? borderColors[status] : "#1f2937",
        boxShadow: isCritical ? `0 0 25px rgba(239,68,68,0.4)` : "none"
      }}>
      
      {/* Video layer */}
      <video
        autoPlay muted loop playsInline
        key={zone}
        src={VIDEO_SOURCES[zone]}
        className={`w-full h-40 object-cover transition-opacity duration-1000 ${aegisStarted ? "opacity-100" : "opacity-30 grayscale"}`}
        onError={(e) => {
          // Fallback if video files aren't found yet
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />

      {/* Placeholder fallback inside card */}
      <div className="hidden absolute inset-0 bg-gray-800 flex-col items-center justify-center">
        <div className="text-2xl mb-1 opacity-20">📷</div>
        <p className="text-gray-500 text-[10px] uppercase tracking-tighter">No Source</p>
      </div>

      {/* Scanning overlay effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-12 w-full animate-[scan-line_4s_linear_infinite]" />

      {/* Gradient dark overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 pointer-events-none" />

      {/* Top Labels */}
      <div className="absolute top-2 left-2 flex flex-col gap-0.5">
        <span className="text-[10px] font-black text-white tracking-[0.2em] font-mono leading-none">{label.toUpperCase()}</span>
        <span className="text-[8px] text-gray-400 font-mono">{cam}</span>
      </div>

      {/* Status Badge */}
      {aegisStarted && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/10 backdrop-blur-sm">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${status === 'critical' ? 'bg-red-500' : status === 'warning' ? 'bg-orange-500' : 'bg-green-500'}`} />
            <span className="text-[9px] font-black text-white font-mono tracking-wider">{status.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Bottom Telemetry */}
      {aegisStarted && (
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[9px] text-yellow-400 font-mono font-bold">👤 COUNT: {data.person_count || 0}</span>
          </div>
          <div className="flex gap-2">
            {data.fire  && <span className="text-[9px] text-red-500 font-black animate-pulse font-mono">🔥 FIRE</span>}
            {data.smoke && <span className="text-lg leading-none" title="Smoke">💨</span>}
            {data.panic && <span className="text-lg leading-none animate-bounce" title="Panic">🏃</span>}
          </div>
        </div>
      )}

      {/* Critical Red Flash */}
      {isCritical && (
        <div className="absolute inset-0 bg-red-600/10 animate-[aegis-flash_1s_infinite] pointer-events-none" />
      )}
    </div>
  );
}

export default function CameraGrid({ zones = {}, aegisStarted = false }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-black tracking-widest uppercase text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Tactical Video Network — {Object.keys(zones).length} Streams Active
        </h2>
        <span className="text-gray-500 font-mono text-[10px] tracking-tighter">ENCRYPTION: AES-256 SECURED</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {CAMERA_ZONES.map(({ id, label, cam }) => (
          <CameraCard 
            key={id}
            zone={id}
            label={label}
            cam={cam}
            data={zones[id] || {}}
            aegisStarted={aegisStarted}
          />
        ))}
      </div>
    </div>
  );
}
