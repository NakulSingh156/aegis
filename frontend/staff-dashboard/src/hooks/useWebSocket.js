import { useState, useEffect, useRef } from "react";

export function useWebSocket(url) {
  const [data, setData]           = useState(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(url);
      ws.current.onopen    = () => setConnected(true);
      ws.current.onmessage = (e) => setData(JSON.parse(e.data));
      ws.current.onclose   = () => {
        setConnected(false);
        setTimeout(connect, 2000); // auto reconnect
      };
    }
    connect();
    return () => ws.current?.close();
  }, [url]);

  return { data, connected };
}
