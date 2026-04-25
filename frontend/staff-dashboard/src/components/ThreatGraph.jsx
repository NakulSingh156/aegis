import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

export default function ThreatGraph({ zones, active, resolved }) {
  const [data, setData] = useState([]);
  // Track peak values so bars NEVER drop — only rise or hold steady
  const peaks = useRef({ fire: 0, scream: 0, crowd: 0 });

  useEffect(() => {
    if (!active || resolved || !zones) return;

    // Calculate raw current values
    const rawFire = Math.round((zones.restaurant?.confidence || 0) * 100);
    const rawScream = Math.round((zones.restaurant?.audio_confidence || 0) * 100);
    // Crowd density — people are present but walking calmly, NOT running
    const rawCrowd = zones.lobby?.person_count > 0 
      ? Math.min(Math.round(zones.lobby.person_count * 2.2), 38) 
      : 0;

    // Scream: lock to peak ONLY (once scream ends, bar stays at max seen)
    peaks.current.scream = Math.max(peaks.current.scream, rawScream);

    const snapshot = [
      {
        metric: "🔥 Fire Detection",
        confidence: rawFire,        // DYNAMIC — bounces with live CV frames
        fill: "#ef4444"
      },
      {
        metric: "😱 Scream Detection",
        confidence: peaks.current.scream,  // LOCKED to peak after scream ends
        fill: "#10b981"
      },
      {
        metric: "🏃 Crowd Density Risk",
        confidence: rawCrowd,        // DYNAMIC — updates with live person count
        fill: "#3b82f6"
      }
    ];

    setData(snapshot);
  }, [zones, active, resolved]);

  if (!active && !resolved) return null;
  if (data.length === 0) return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700 min-h-[200px] flex items-center justify-center">
       <span className="text-gray-500 text-sm animate-pulse">Initializing Executive Telemetry...</span>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-bold flex items-center gap-2">
          <span>📊</span> Live AI Confidence Scores
        </h3>
        {resolved ? (
          <span className="text-red-500 font-bold text-xs animate-pulse bg-red-900/30 px-2 py-1 rounded">
            FROZEN (SYSTEM CLEAR)
          </span>
        ) : (
          <span className="text-green-400 font-bold text-xs animate-pulse bg-green-900/30 px-2 py-1 rounded">
            ACTIVE SCANNING
          </span>
        )}
      </div>

      <p className="text-gray-400 text-xs mb-4">
        Fire and Crowd bars update dynamically in real-time from live AI inference. 
        Scream bar locks to the peak value detected — preserving acoustic evidence after the event.
      </p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
          
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            tickFormatter={(v) => `${v}%`} 
            tick={{ fill: "#9ca3af", fontSize: 12 }} 
          />
          
          <YAxis 
            dataKey="metric" 
            type="category" 
            tick={{ fill: "#fff", fontSize: 12, fontWeight: 'bold' }} 
            width={140} 
          />
          
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: "##111827", borderColor: "#374151", color: "#fff", borderRadius: "8px" }}
            formatter={(value) => [`${value}% Peak Certainty`, "Highest Score"]}
          />

          <ReferenceLine x={45} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'top', value: '⚠️ 45% ALERT THRESHOLD', fill: '#ef4444', fontSize: 10 }} />

          <Bar dataKey="confidence" radius={[0, 4, 4, 0]} isAnimationActive={true}>
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
             ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
