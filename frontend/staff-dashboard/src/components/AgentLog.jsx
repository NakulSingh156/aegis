export default function AgentLog({ logs = [] }) {
  const getColor = (action) => {
    if (action.startsWith("EMERGENCY"))  return "text-red-400 font-bold";
    if (action.startsWith("ALERT"))      return "text-red-300";
    if (action.startsWith("GUEST"))      return "text-yellow-300";
    if (action.startsWith("DISPATCH"))   return "text-orange-300";
    if (action.startsWith("Evacuation")) return "text-green-300";
    if (action.startsWith("INCIDENT"))   return "text-blue-300";
    return "text-gray-300";
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700 h-full">
      <h2 className="text-white font-bold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"/>
        AEGIS Agent — Live Decision Log
      </h2>
      <div className="h-48 overflow-y-auto flex flex-col gap-1 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-gray-500">Monitoring all zones. No incidents detected.</p>
        ) : (
          [...logs].reverse().map((log, i) => (
            <div key={i} className="flex gap-3 border-b border-gray-800 pb-1">
              <span className="text-gray-500 shrink-0 w-16">{log.time}</span>
              <span className={getColor(log.action)}>{log.action}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
