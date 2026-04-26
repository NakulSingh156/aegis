const VOICES_PRIORITY = ["Google UK English Female", "Samantha", "Victoria", "Karen"];

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

function kill() {
  _muted = true;
  _sessionId++;          // invalidate all in-flight callbacks
  if (_loopTimer) clearTimeout(_loopTimer);
  _loopTimer = null;
  window.speechSynthesis.cancel();
}

/**
 * Speak a SINGLE short chunk. Resolves when done speaking.
 * Rejects immediately if the session has been killed.
 */
function speakChunk(text, lang, rate, mySession) {
  return new Promise((resolve, reject) => {
    if (_sessionId !== mySession || _muted) return reject("killed");

    const u = new SpeechSynthesisUtterance(text);
    u.voice = getBestVoice(lang);
    u.lang = lang === "hi" ? "hi-IN" : "en-US";
    u.rate = rate;
    u.pitch = 1.1;
    u.volume = 1.0;

    u.onend = () => {
      if (_sessionId !== mySession) return reject("killed");
      resolve();
    };
    u.onerror = () => reject("error");

    window.speechSynthesis.speak(u);
  });
}

/**
 * Speak an array of short sentences sequentially.
 * Stops immediately if the session is killed.
 */
async function speakSequence(chunks, lang, rate, mySession) {
  for (const chunk of chunks) {
    if (_sessionId !== mySession) return;
    try {
      await speakChunk(chunk, lang, rate, mySession);
    } catch {
      return; // killed or error — stop silently
    }
    // Tiny pause between chunks so it sounds natural
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
  const mySession = _sessionId; // use CURRENT session, don't kill
  const lang = options.lang || "en";
  const rate = options.rate || 1.15;

  const u = new SpeechSynthesisUtterance(text);
  u.voice = getBestVoice(lang);
  u.lang = lang === "hi" ? "hi-IN" : "en-US";
  u.rate = rate;
  u.pitch = 1.1;
  u.volume = 1.0;
  if (options.onEnd) {
    u.onend = () => {
      if (_sessionId !== mySession) return; // stale — ignore
      options.onEnd();
    };
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

/**
 * Emergency loop: speaks English chunks, then Hindi chunks, then repeats.
 * Runs until stopAnnouncements() is called.
 */
export function startEmergencyLoop(englishChunks, hindiChunks) {
  kill(); // kill any prior
  _muted = false;
  const mySession = ++_sessionId; // NEW session

  async function cycle() {
    while (_sessionId === mySession) {
      // English
      await speakSequence(englishChunks, "en", 1.15, mySession);
      if (_sessionId !== mySession) return;

      // 1s gap
      await new Promise(r => setTimeout(r, 1000));
      if (_sessionId !== mySession) return;

      // Hindi
      await speakSequence(hindiChunks, "hi", 1.1, mySession);
      if (_sessionId !== mySession) return;

      // 1.5s gap before repeating
      await new Promise(r => setTimeout(r, 1500));
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
