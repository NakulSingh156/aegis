const STATUS_CONFIG = {
  critical: { bg: "bg-red-900",    border: "border-red-500",    badge: "bg-red-600",    icon: "🔴" },
  warning:  { bg: "bg-orange-900", border: "border-orange-500", badge: "bg-orange-600", icon: "🟠" },
  safe:     { bg: "bg-gray-800",   border: "border-gray-600",   badge: "bg-green-700",  icon: "🟢" },
};

export default function ZoneGrid({ zones = {} }) {
  return (
    <div>
      <h2 className="text-white font-bold mb-3">📷 Zone Status</h2>
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(zones).map(([zoneId, data]) => {
          const status = data.status || "safe";
          const cfg    = STATUS_CONFIG[status];

          return (
            <div key={zoneId}
              className={`${cfg.bg} ${cfg.border} border rounded-xl p-3 transition-all duration-500`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-white font-semibold text-sm capitalize">
                  {zoneId.replace("_", " ")}
                </span>
                <span className={`${cfg.badge} text-white text-xs px-2 py-0.5 rounded-full`}>
                  {status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-300">
                <span>👤 {data.person_count || 0} people</span>
                {data.fire  && <span>🔥 Fire</span>}
                {data.smoke && <span>💨 Smoke</span>}
                {data.panic && <span>🏃 Panic</span>}
              </div>
              {data.confidence > 0 && (
                <div className="mt-1 text-xs text-red-300">
                  Conf: {(data.confidence * 100).toFixed(0)}%
                </div>
              )}
              {data.audio_event && (
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-xs">
                    {data.audio_event === "gunshot"    ? "🔫" :
                     data.audio_event === "scream"     ? "😱" :
                     data.audio_event === "glass_break"? "💥" : "🔊"}
                  </span>
                  <span className="text-xs text-red-300 font-bold uppercase">
                    {data.audio_event.replace("_", " ")} detected
                  </span>
                  <span className="text-xs text-gray-500">
                    {(data.audio_confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {Object.values(zones).some(z => z.audio_event === "scream") && (
        <audio autoPlay loop>
          <source src="https://www.myinstants.com/media/sounds/female-scream.mp3" type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}
