import { useState } from "react";

export default function SMSPanel({ smsLog = [] }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  if (smsLog.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
      <h3 className="text-white font-bold mb-3 text-lg">📱 SMS Alert Log</h3>
      
      <div className="flex flex-col gap-2">
        {smsLog.map((sms, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-3 border border-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-white font-bold text-sm">{sms.name}</span>
                <span className="text-gray-400 text-xs ml-2">— {sms.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">{sms.timestamp}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                  ${sms.status === "DELIVERED" ? "bg-green-700 text-green-200" :
                    sms.status === "SIMULATED" ? "bg-blue-900/40 text-blue-400 border border-blue-500/30" :
                    "bg-red-700 text-red-200"}`}>
                  {sms.status === "DELIVERED" ? "✅ DELIVERED" :
                   sms.status === "SIMULATED" ? "📋 LOGGED" :
                   "❌ FAILED"}
                </span>
              </div>
            </div>
            
            <div className="text-gray-400 text-xs mt-1">
              📞 {sms.phone}
            </div>

            <button
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
              className="text-blue-400 text-xs mt-2 hover:text-blue-300 transition">
              {expandedIdx === i ? "▼ Hide Message" : "▶ View Full Message"}
            </button>

            {expandedIdx === i && (
              <pre className="mt-2 bg-gray-900 rounded-lg p-3 text-green-300 text-xs whitespace-pre-wrap border border-gray-600 font-mono">
                {sms.message}
              </pre>
            )}
          </div>
        ))}
      </div>

      <p className="text-gray-500 text-xs mt-3 italic">
        💡 In production, SMS alerts are sent to all on-duty staff within 3 seconds of incident detection.
        System scales to 500+ recipients via Twilio's bulk messaging API.
      </p>
    </div>
  );
}
