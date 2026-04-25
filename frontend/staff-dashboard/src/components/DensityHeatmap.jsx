import { useMemo } from "react";

// Mirror the zone layout from VenueMap.jsx
const ZONES = {
  lobby:      { x: 5,  y: 35, w: 28, h: 30, label: "Lobby" },
  restaurant: { x: 37, y: 5,  w: 38, h: 28, label: "Restaurant" },
  corridor_a: { x: 37, y: 37, w: 20, h: 18, label: "Corridor A" },
  stairwell:  { x: 61, y: 37, w: 14, h: 18, label: "Stairwell" },
  parking:    { x: 5,  y: 69, w: 28, h: 25, label: "Parking" },
  pool:       { x: 60, y: 65, w: 35, h: 28, label: "Pool Area" },
};

function getHeatColor(count) {
  if (count >= 15) return { color: "#ef4444", opacity: 0.7, label: "HIGH" };
  if (count >= 8)  return { color: "#f97316", opacity: 0.55, label: "MEDIUM" };
  if (count >= 1)  return { color: "#22c55e", opacity: 0.35, label: "LOW" };
  return { color: "#6b7280", opacity: 0.15, label: "EMPTY" };
}

export default function DensityHeatmap({ zones }) {
  const zoneData = useMemo(() => {
    if (!zones) return [];
    return Object.entries(ZONES).map(([id, pos]) => {
      const count = zones[id]?.person_count || 0;
      const heat = getHeatColor(count);
      return { id, pos, count, ...heat };
    });
  }, [zones]);

  const totalPeople = zoneData.reduce((s, z) => s + z.count, 0);

  return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-white font-bold text-lg">🌡️ Crowd Density Heatmap</h2>
        <span className="bg-gray-800 text-gray-300 text-xs font-mono px-3 py-1 rounded-full border border-gray-600">
          👤 {totalPeople} total occupants
        </span>
      </div>

      <svg viewBox="-2 0 104 104" className="w-full rounded-xl border border-gray-600 bg-gray-800"
           style={{ aspectRatio: "16/10" }}>
        <defs>
          <filter id="heat-blur">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* Heat blobs — large soft glows behind zones */}
        {zoneData.map(z => (
          <ellipse key={`blur-${z.id}`}
            cx={z.pos.x + z.pos.w / 2}
            cy={z.pos.y + z.pos.h / 2}
            rx={z.pos.w / 1.6}
            ry={z.pos.h / 1.6}
            fill={z.color}
            opacity={z.opacity * 0.8}
            filter="url(#heat-blur)"
          />
        ))}

        {/* Zone outlines */}
        {zoneData.map(z => (
          <g key={z.id}>
            <rect
              x={z.pos.x} y={z.pos.y}
              width={z.pos.w} height={z.pos.h}
              fill={z.color}
              opacity={z.opacity}
              stroke={z.color}
              strokeWidth="0.6"
              rx="0.8"
            />

            {/* Zone label */}
            <text x={z.pos.x + z.pos.w / 2} y={z.pos.y + z.pos.h / 2 - 4}
              textAnchor="middle" fontSize="3" fontWeight="bold" fill="white">
              {z.pos.label}
            </text>

            {/* Person count — big and bold */}
            <text x={z.pos.x + z.pos.w / 2} y={z.pos.y + z.pos.h / 2 + 2}
              textAnchor="middle" fontSize="5" fontWeight="bold" fill="white">
              {z.count}
            </text>

            {/* Density label */}
            <text x={z.pos.x + z.pos.w / 2} y={z.pos.y + z.pos.h / 2 + 7}
              textAnchor="middle" fontSize="2" fontWeight="bold" fill={z.color}>
              {z.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex gap-5 mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded inline-block" style={{backgroundColor: "#6b7280"}}/>Empty
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500 inline-block"/>Low (1-7)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-orange-500 inline-block"/>Medium (8-14)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500 inline-block"/>High (15+)
        </span>
      </div>
    </div>
  );
}
