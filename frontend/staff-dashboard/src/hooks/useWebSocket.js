import { useState, useEffect, useRef } from "react";

export function useWebSocket(url) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(url);
      ws.current.onopen = () => {
        setConnected(true);
        console.log(`[AEGIS] WebSocket connected to ${url}`);
      };
      ws.current.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          setData(parsed);
        } catch (err) {
          console.error("[AEGIS] WebSocket JSON parse error:", err, e.data);
        }
      };
      ws.current.onclose = () => {
        setConnected(false);
        console.log("[AEGIS] WebSocket closed. Reconnecting...");
        setTimeout(connect, 2000); // auto reconnect
      };
    }
    connect();
    return () => ws.current?.close();
  }, [url]);

  return { data, connected };
}
