// AEGIS CENTRAL PRODUCTION CONFIG
// This is the single source of truth for all environment URLs.

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// VERIFIED LIVE CLOUD RUN ENDPOINT (Revision 00030)
const CLOUD_BASE_URL = "https://aegis-backend-775713800470.us-central1.run.app"; // VERIFIED STABLE FOR WSS

export const API_BASE_URL = isLocal ? "http://localhost:8000" : CLOUD_BASE_URL;

export const WS_BASE_URL = isLocal ? "ws://localhost:8000/ws" : `${CLOUD_BASE_URL.replace("https://", "wss://")}/ws`;

console.log(`[AEGIS] Config Initialized. Backend: ${API_BASE_URL}`);
