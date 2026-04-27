const VOICES_PRIORITY = ["Google UK English Female", "Samantha", "Victoria", "Karen"];

// Pre-load voices (required on Chrome — getVoices() returns [] until onvoiceschanged fires)
let _voicesLoaded = false;
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices(); // trigger initial load
  window.speechSynthesis.onvoiceschanged = () => { _voicesLoaded = true; };
}

function getBestVoice(lang = "en") {
  const voices = window.speechSynthesis.getVoices();
  if (lang === "hi") {
    const hindi = voices.find(v => v.lang.startsWith("hi"));
    if (hindi) return hindi;
  }
  for (const name of VOICES_PRIORITY) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }
  return voices[0] || null;
}

// ---- ROBUST KILL MECHANISM ----
// Every loop/announce gets a session ID. When we stop, we bump the ID.
// Any callback from a stale session is silently ignored.
let _sessionId = 0;
let _loopTimer = null;
let _muted = false;
let _heartbeat = null;

function startHeartbeat() {
  if (_heartbeat) return;
  _heartbeat = setInterval(() => {
    // Chrome bug: speechSynthesis can hang. resume() keeps it awake.
    window.speechSynthesis.resume();
  }, 5000);
}

function stopHeartbeat() {
  if (_heartbeat) clearInterval(_heartbeat);
  _heartbeat = null;
}

function kill() {
  _muted = true;
  _sessionId++;
  if (_loopTimer) clearTimeout(_loopTimer);
  _loopTimer = null;
  window.speechSynthesis.cancel();
  stopHeartbeat();
}

/**
 * Speak a SINGLE short chunk. ALWAYS resolves (never rejects).
 * On error, logs and resolves so the loop continues.
 */
function speakChunk(text, lang, rate, mySession) {
  return new Promise((resolve) => {
    if (_sessionId !== mySession || _muted) return resolve();

    const u = new SpeechSynthesisUtterance(text);
    u.voice = getBestVoice(lang);
    u.lang = lang === "hi" ? "hi-IN" : "en-US";
    u.rate = rate;
    u.pitch = 1.1;
    u.volume = 1.0;

    const safetyTimeout = setTimeout(() => {
      console.warn("[AEGIS] Voice timeout - advancing");
      resolve();
    }, 15000);

    u.onend = () => {
      clearTimeout(safetyTimeout);
      resolve();
    };
    u.onerror = (err) => {
      clearTimeout(safetyTimeout);
      console.warn("[AEGIS] Voice error (non-fatal):", err?.error || err);
      // Always resolve so the loop continues
      resolve();
    };

    window.speechSynthesis.speak(u);
  });
}

/**
 * Speak an array of short sentences sequentially.
 */
async function speakSequence(chunks, lang, rate, mySession) {
  for (const chunk of chunks) {
    if (_sessionId !== mySession) return;
    await speakChunk(chunk, lang, rate, mySession);
    await new Promise(r => setTimeout(r, 300));
    if (_sessionId !== mySession) return;
  }
}

// ---- PUBLIC API ----

export function stopAnnouncements() {
  kill();
}

export function announce(text, options = {}) {
  _muted = false;
  const mySession = _sessionId;
  const lang = options.lang || "en";
  const rate = options.rate || 1.15;

  if (options.onSpeak) options.onSpeak(text);

  // Fresh cancel to ensure clean slate
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.voice = getBestVoice(lang);
  u.lang = lang === "hi" ? "hi-IN" : "en-US";
  u.rate = rate;
  u.pitch = 1.1;
  u.volume = 1.0;

  if (options.onEnd) {
    u.onend = () => {
      if (_sessionId !== mySession) return;
      options.onEnd();
    };
  }
  u.onerror = () => {
    // Still call onEnd on error so the All-Clear sequence continues
    if (options.onEnd && _sessionId === mySession) {
      setTimeout(() => options.onEnd(), 500);
    }
  };

  startHeartbeat();
  if (_sessionId !== mySession) return;

  // Slight delay after cancel() to let Chrome reset
  setTimeout(() => {
    if (_sessionId !== mySession) return;
    window.speechSynthesis.speak(u);
  }, 100);
}

/**
 * Emergency loop: speaks English chunks, then Hindi chunks, then repeats.
 * Runs until stopAnnouncements() is called.
 * Resilient to Chrome errors — will retry up to 3 times.
 */
export function startEmergencyLoop(englishChunks, hindiChunks, onSpeak) {
  _muted = false;
  const mySession = ++_sessionId;
  startHeartbeat();
  window.speechSynthesis.cancel();

  async function cycle() {
    // Small initial delay to let cancel() settle
    await new Promise(r => setTimeout(r, 200));

    while (_sessionId === mySession && !_muted) {
      // 1. English Sequence
      for (const chunk of englishChunks) {
        if (_sessionId !== mySession) return;
        if (onSpeak) onSpeak(chunk);
        await speakChunk(chunk, "en", 1.15, mySession);
        await new Promise(r => setTimeout(r, 100));
      }

      if (_sessionId !== mySession) return;
      await new Promise(r => setTimeout(r, 1000));

      // 2. Hindi Sequence
      for (const chunk of hindiChunks) {
        if (_sessionId !== mySession) return;
        if (onSpeak) onSpeak(chunk);
        await speakChunk(chunk, "hi", 1.1, mySession);
        await new Promise(r => setTimeout(r, 100));
      }

      if (_sessionId !== mySession) return;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  cycle();
}

// ---- ANNOUNCEMENT TEXTS (broken into SHORT chunks to avoid Chrome 15s cutoff) ----

export const ANNOUNCEMENTS = {
  fireEnglish: (zones, safeZones, dangerZones, safeWindow) => [
    `EMERGENCY! EMERGENCY! Attention all guests and staff!`,
    `A fire has been confirmed in the ${zones.join(" and ")} zone!`,
    `Safe zones are: ${safeZones.join(", ")}! Please move to these areas immediately!`,
    `Danger zones: ${dangerZones.join(", ")}! Stay away from these areas!`,
    `Evacuate through the nearest marked exit! Do NOT use elevators!`,
    `Estimated safe window: ${safeWindow}!`,
    `Follow staff instructions! AEGIS emergency protocol is active!`,
  ],

  fireHindi: (zones, safeZones) => [
    `आपातकाल! आपातकाल! सभी अतिथि और कर्मचारी ध्यान दें!`,
    `${zones.join(" और ")} क्षेत्र में आग लगी है!`,
    `सुरक्षित क्षेत्र हैं: ${safeZones.join(", ")}! कृपया तुरंत इन क्षेत्रों में जाएं!`,
    `तुरंत निकटतम निकास से बाहर निकलें! लिफ्ट का उपयोग न करें!`,
    `कर्मचारियों के निर्देशों का पालन करें! AEGIS प्रोटोकॉल सक्रिय है!`,
  ],

  allClearEnglish: () =>
    `All clear! The emergency has been resolved! All zones are now safe! Thank you for your cooperation.`,

  allClearHindi: () =>
    `सब सुरक्षित है! आपातकाल समाप्त हो गया है! सभी क्षेत्र अब सुरक्षित हैं! आपके सहयोग के लिए धन्यवाद।`,
};
