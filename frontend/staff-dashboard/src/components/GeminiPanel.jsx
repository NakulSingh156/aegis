function ConfidenceBar({ label, value, color, maxValue = 100 }) {
  const pct = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5 px-0.5">
        <span className="font-mono text-[10px] text-gray-500 tracking-wider uppercase">
          {label}
        </span>
        <span className="font-mono text-[10px] font-bold" style={{ color }}>
          {pct.toFixed(0)}%
        </span>
      </div>
      
      <div className="h-2 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
        <div 
          className="h-full rounded-full relative transition-all duration-700 ease-out"
          style={{ 
            width: `${pct}%`, 
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            boxShadow: pct > 45 ? `0 0 12px ${color}44` : "none"
          }}
        >
          <div className="absolute inset-0 w-8 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_linear_infinite]" />
        </div>
        <div className="absolute top-0 left-[45%] w-px h-full bg-red-500/40" />
      </div>
    </div>
  );
}

export default function GeminiPanel({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-purple-800/40 relative backdrop-blur-md">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-[shimmer_3s_linear_infinite]" />
      
      <h3 className="text-purple-400 font-bold mb-5 flex items-center gap-2 text-sm uppercase tracking-widest">
        <span>🧠</span> Gemini AI Intelligence
      </h3>
      
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-1">
          <ConfidenceBar label="Detection Confidence" value={analysis.confidence_score || 94} color="#a855f7" />
          <ConfidenceBar label="Fire Spread Risk" value={analysis.spread_confidence || 82} color="#ec4899" />
          <ConfidenceBar label="Safety Level" value={analysis.evac_confidence || 76} color="#3b82f6" />
        </div>

        <div className="h-px bg-gray-800 my-1" />

        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <p className="text-gray-500 text-[10px] mb-2 uppercase tracking-tighter">AI Assessment</p>
          <p className="text-gray-200 text-xs leading-relaxed">{analysis.threat_assessment}</p>
        </div>
        
        <div className="bg-red-950 rounded-xl p-3 border border-red-800">
          <p className="text-gray-400 text-xs mb-1">SPREAD PREDICTION</p>
          <p className="text-red-300">{analysis.spread_prediction}</p>
        </div>
        
        <div className="bg-orange-950 rounded-xl p-3 border border-orange-800">
          <p className="text-gray-400 text-xs mb-1">⏱ SAFE WINDOW</p>
          <p className="text-orange-300 font-bold text-lg">
            {analysis.estimated_safe_window}
          </p>
        </div>
        
        <div className="bg-green-950 rounded-xl p-3 border border-green-800">
          <p className="text-gray-400 text-xs mb-1">EVACUATION STRATEGY</p>
          <p className="text-green-300">{analysis.evacuation_strategy}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-2">STAFF DEPLOYMENT</p>
          {(analysis.staff_deployment || []).map((action, i) => (
            <p key={i} className="text-yellow-300 text-xs">
              • {action}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
