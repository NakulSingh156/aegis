const ZONE_CONFIG = {
  lobby:      { x: 60,  y: 280, w: 220, h: 160, label: "Lobby",      cam: "CAM-01", icon: "🏛️" },
  restaurant: { x: 280, y: 60,  w: 220, h: 160, label: "Restaurant", cam: "CAM-03", icon: "🍽️" },
  corridor_a: { x: 310, y: 280, w: 160, h: 120, label: "Corridor A", cam: "CAM-02", icon: "🚶" },
  stairwell:  { x: 500, y: 280, w: 140, h: 120, label: "Stairwell",  cam: "CAM-04", icon: "🪜" },
  parking:    { x: 60,  y: 460, w: 220, h: 160, label: "Parking",    cam: "CAM-05", icon: "🅿️" },
  pool:       { x: 460, y: 460, w: 220, h: 160, label: "Pool Area",  cam: "CAM-06", icon: "🏊" },
};

const EXITS = [
  { x: 30,  y: 340, label: "EXIT A", dir: "←" },
  { x: 660, y: 290, label: "EXIT B", dir: "→" },
  { x: 155, y: 640, label: "EXIT C", dir: "↓" },
];

const STATUS = {
  critical: { fill: "rgba(239,68,68,0.15)",  stroke: "#ef4444", glow: "rgba(239,68,68,0.4)",  dot: "#ef4444" },
  warning:  { fill: "rgba(249,115,22,0.12)", stroke: "#f97316", glow: "rgba(249,115,22,0.3)", dot: "#f97316" },
  safe:     { fill: "rgba(34,197,94,0.08)",  stroke: "#22c55e", glow: "rgba(34,197,94,0.2)",  dot: "#22c55e" },
};

export default function VenueMap({ venueState }) {
  const { zones = {}, evacuation_routes = {}, building_alert, severity, venue } = venueState;

  return (
    <div style={{
      background: "#080812",
      border: `1.5px solid ${building_alert ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 14,
      padding: 16,
      boxShadow: building_alert ? "0 0 40px rgba(239,68,68,0.15)" : "none",
      transition: "all 0.5s",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b7280", letterSpacing: 2 }}>
          🗺 {venue?.venueName || "GRAND MERIDIAN HOTEL"} — LIVE MAP
        </span>
        {building_alert && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: "#ef4444",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            padding: "3px 10px", borderRadius: 4, letterSpacing: 2,
            animation: "aegis-pulse 1s ease-in-out infinite",
          }}>
            ⚠ {severity} — BUILDING ALERT
          </span>
        )}
      </div>

      <svg
        viewBox="0 0 740 660"
        style={{ width: "100%", borderRadius: 10, overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Blueprint grid */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="0.5"/>
          </pattern>

          {/* Glow filters per status */}
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feFlood floodColor="#ef4444" floodOpacity="0.6" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="glow"/>
            <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feFlood floodColor="#22c55e" floodOpacity="0.5" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="glow"/>
            <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feFlood floodColor="#f97316" floodOpacity="0.5" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="glow"/>
            <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Animated arrow marker — green */}
          <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#22c55e"/>
          </marker>
          {/* Animated arrow marker — yellow (escape) */}
          <marker id="arrow-yellow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b"/>
          </marker>
          {/* Red X marker for blocked */}
          <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <circle cx="4" cy="4" r="3" fill="#ef4444"/>
          </marker>

          {/* Animated dash for paths */}
          <style>{`
            .safe-path {
              stroke-dasharray: 10 6;
              animation: flow-green 1.5s linear infinite;
            }
            .escape-path {
              stroke-dasharray: 10 6;
              animation: flow-yellow 1.2s linear infinite;
            }
            .zone-critical {
              animation: zone-pulse 1s ease-in-out infinite;
            }
            @keyframes flow-green {
              from { stroke-dashoffset: 0; }
              to   { stroke-dashoffset: -32; }
            }
            @keyframes flow-yellow {
              from { stroke-dashoffset: 0; }
              to   { stroke-dashoffset: -32; }
            }
            @keyframes zone-pulse {
              0%, 100% { opacity: 1; }
              50%       { opacity: 0.6; }
            }
          `}</style>
        </defs>

        {/* Blueprint grid background */}
        <rect width="740" height="660" fill="url(#grid)" rx="10"/>

        {/* Building outline */}
        <rect x="20" y="20" width="700" height="620" rx="8"
          fill="rgba(15,15,35,0.6)"
          stroke={building_alert ? "rgba(239,68,68,0.5)" : "rgba(99,102,241,0.15)"}
          strokeWidth={building_alert ? "2" : "1"}
        />

        {/* ── EVACUATION PATHS (drawn UNDER zones) ── */}
        {(() => {
          const segments = [];
          Object.entries(evacuation_routes).forEach(([zoneId, route]) => {
            if (!route || route.length < 2) return;
            const isEscape = route[route.length - 1]?.startsWith("exit");
            
            for (let i = 0; i < route.length - 1; i++) {
              segments.push({ u: route[i], v: route[i+1], isEscape });
            }
          });

          // Deduplicate segments (escape routes take visual priority)
          const uniqueSegments = [];
          segments.forEach(seg => {
            const exists = uniqueSegments.find(s => s.u === seg.u && s.v === seg.v);
            if (!exists) {
              uniqueSegments.push(seg);
            } else if (seg.isEscape && !exists.isEscape) {
              exists.isEscape = true;
            }
          });

          const resolvePoint = (key) => {
            if (ZONE_CONFIG[key]) {
              const z = ZONE_CONFIG[key];
              return { x: z.x + z.w / 2, y: z.y + z.h / 2 };
            }
            const ex = EXITS.find(e => e.label.toLowerCase().replace(" ", "_") === key?.toLowerCase());
            if (ex) return { x: ex.x + 30, y: ex.y + 13 };
            return null;
          };

          return uniqueSegments.map((seg, i) => {
            const p1 = resolvePoint(seg.u);
            const p2 = resolvePoint(seg.v);
            if (!p1 || !p2) return null;

            return (
              <g key={i}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={seg.isEscape ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)"}
                  strokeWidth="8" strokeLinecap="round"
                />
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={seg.isEscape ? "#f59e0b" : "#22c55e"}
                  strokeWidth="2.5" strokeLinecap="round"
                  markerEnd={seg.isEscape ? "url(#arrow-yellow)" : "url(#arrow-green)"}
                  className={seg.isEscape ? "escape-path" : "safe-path"}
                />
              </g>
            );
          });
        })()}

        {/* ── EXIT NODES ── */}
        {EXITS.map((exit, i) => (
          <g key={i}>
            <rect x={exit.x} y={exit.y} width={60} height={26} rx={5}
              fill="#16a34a"
              filter="url(#glow-green)"
            />
            <text x={exit.x + 30} y={exit.y + 17}
              textAnchor="middle" fontSize="9" fontWeight="700"
              fill="white" fontFamily="monospace" letterSpacing="1">
              {exit.dir} {exit.label}
            </text>
          </g>
        ))}

        {/* ── ZONE BOXES ── */}
        {Object.entries(ZONE_CONFIG).map(([zoneId, pos]) => {
          const data   = zones[zoneId] || {};
          const status = data.status || "safe";
          const s      = STATUS[status];
          const isCrit = status === "critical";
          const filterId = isCrit ? "glow-red" : status === "warning" ? "glow-orange" : "glow-green";

          return (
            <g key={zoneId} className={isCrit ? "zone-critical" : ""}>
              {/* Zone shadow/glow */}
              <rect
                x={pos.x - 4} y={pos.y - 4}
                width={pos.w + 8} height={pos.h + 8}
                rx="12" fill="none"
                stroke={s.stroke} strokeWidth="1"
                opacity="0.3"
              />

              {/* Main zone box */}
              <rect
                x={pos.x} y={pos.y}
                width={pos.w} height={pos.h}
                rx="10"
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth={isCrit ? "2" : "1.5"}
                filter={`url(#${filterId})`}
              />

              {/* Top status bar */}
              <rect
                x={pos.x} y={pos.y}
                width={pos.w} height={6}
                rx="10"
                fill={s.stroke}
                opacity="0.7"
              />

              {/* Status dot top-left */}
              <circle
                cx={pos.x + 16} cy={pos.y + 20}
                r="5"
                fill={s.dot}
                opacity={isCrit ? "0.9" : "0.7"}
              />

              {/* Zone icon */}
              <text x={pos.x + pos.w - 20} y={pos.y + 28}
                textAnchor="middle" fontSize="14">
                {pos.icon}
              </text>

              {/* Zone label */}
              <text
                x={pos.x + pos.w / 2}
                y={pos.y + pos.h / 2 - 12}
                textAnchor="middle"
                fontSize={isCrit ? "16" : "14"}
                fontWeight="700"
                fill="white"
                fontFamily="sans-serif"
              >
                {pos.label}
              </text>

              {/* CAM ID */}
              <text
                x={pos.x + pos.w / 2}
                y={pos.y + pos.h / 2 + 6}
                textAnchor="middle"
                fontSize="9"
                fill="rgba(255,255,255,0.4)"
                fontFamily="monospace"
                letterSpacing="1"
              >
                {pos.cam}
              </text>

              {/* Person count */}
              <text
                x={pos.x + pos.w / 2}
                y={pos.y + pos.h / 2 + 24}
                textAnchor="middle"
                fontSize="13"
                fill="#fbbf24"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                👤 {data.person_count || 0}
              </text>

              {/* Fire/warning badges */}
              {data.fire && (
                <text x={pos.x + pos.w / 2} y={pos.y + pos.h - 16}
                  textAnchor="middle" fontSize="10">
                  🔥 FIRE DETECTED
                </text>
              )}

              {/* EVACUATE button for critical zones */}
              {isCrit && (
                <g>
                  <rect x={pos.x + pos.w / 2 - 36} y={pos.y + pos.h - 28}
                    width={72} height={20} rx={4}
                    fill="rgba(239,68,68,0.8)"
                  />
                  <text x={pos.x + pos.w / 2} y={pos.y + pos.h - 14}
                    textAnchor="middle" fontSize="9" fontWeight="700"
                    fill="white" fontFamily="monospace" letterSpacing="1">
                    ⚠ EVACUATE
                  </text>
                </g>
              )}

              {/* Exit arrow for safe zones */}
              {status !== "critical" && (
                <g>
                  <rect x={pos.x + pos.w - 52} y={pos.y + pos.h - 26}
                    width={44} height={18} rx={4}
                    fill="rgba(34,197,94,0.2)"
                    stroke="rgba(34,197,94,0.5)"
                    strokeWidth="1"
                  />
                  <text x={pos.x + pos.w - 30} y={pos.y + pos.h - 13}
                    textAnchor="middle" fontSize="8" fontWeight="600"
                    fill="#4ade80" fontFamily="monospace">
                    → EXIT
                  </text>
                </g>
              )}
            </g>
          );
        })}

      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { color: "#22c55e", label: "Safe Zone" },
          { color: "#f97316", label: "Warning" },
          { color: "#ef4444", label: "Danger Zone" },
        ].map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color, boxShadow: `0 0 6px ${l.color}` }}/>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6b7280", letterSpacing: 1 }}>{l.label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: 2, background: "#22c55e", borderRadius: 1 }}/>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6b7280", letterSpacing: 1 }}>Safe Path</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: 2, background: "#f59e0b", borderRadius: 1, opacity: 0.7 }}/>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6b7280", letterSpacing: 1 }}>Escape Route</span>
        </div>
      </div>
    </div>
  );
}
