/**
 * AEGIS PA System — Rev.00210-Ironclad
 * 
 * Uses simple onend callback chaining (NOT async/await).
 * Chrome's speechSynthesis is unreliable with Promises.
 */

const VOICES_PRIORITY = ["Google UK English Female", "Samantha", "Victoria", "Karen"];

// Pre-load voices (Chrome requires this)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => { };
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

// ---- SESSION CONTROL ----
let _sessionId = 0;
let _heartbeat = null;

function startHeartbeat() {
  if (_heartbeat) return;
  _heartbeat = setInterval(() => {
    // Chrome bug workaround: resume() prevents speech from freezing
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.resume();
    }
  }, 3000);
}

function stopHeartbeat() {
  if (_heartbeat) clearInterval(_heartbeat);
  _heartbeat = null;
}

// ---- SPEAK ONE UTTERANCE WITH CALLBACK ----
function speakOne(text, lang, rate, session, onDone) {
  if (_sessionId !== session) return;

  const u = new SpeechSynthesisUtterance(text);
  u.voice = getBestVoice(lang);
  u.lang = lang === "hi" ? "hi-IN" : "en-US";
  u.rate = rate;
  u.pitch = 1.1;
  u.volume = 1.0;

  // Safety: if onend never fires, advance after 12s
  const safety = setTimeout(() => {
    console.warn("[AEGIS-PA] Safety timeout, advancing");
    if (onDone) onDone();
  }, 12000);

  u.onend = () => {
    clearTimeout(safety);
    if (onDone) onDone();
  };
  u.onerror = () => {
    clearTimeout(safety);
    // On error, still advance to next chunk
    if (onDone) setTimeout(onDone, 300);
  };

  window.speechSynthesis.speak(u);
}

// ---- SPEAK A LIST OF CHUNKS IN SEQUENCE ----
function speakList(chunks, lang, rate, session, onAllDone) {
  let i = 0;
  function next() {
    if (_sessionId !== session || i >= chunks.length) {
      if (onAllDone) onAllDone();
      return;
    }
    const text = chunks[i];
    i++;
    speakOne(text, lang, rate, session, () => {
      // Small pause between chunks
      setTimeout(next, 150);
    });
  }
  next();
}

// ---- PUBLIC API ----

export function stopAnnouncements() {
  _sessionId++;
  window.speechSynthesis.cancel();
  stopHeartbeat();
}

/**
 * Speak a single text with optional onEnd callback.
 * Used for All-Clear announcements.
 */
export function announce(text, options = {}) {
  const session = _sessionId;
  startHeartbeat();

  // Small delay to let any previous cancel() settle
  setTimeout(() => {
    if (_sessionId !== session) return;
    speakOne(text, options.lang || "en", options.rate || 1.15, session, () => {
      if (options.onEnd) options.onEnd();
    });
  }, 150);
}

/**
 * Emergency loop: English → pause → Hindi → pause → repeat forever.
 * Starts with a 3-second delay to let the "scream" moment breathe.
 */
export function startEmergencyLoop(englishChunks, hindiChunks, onSpeak) {
  const session = ++_sessionId;
  window.speechSynthesis.cancel();
  startHeartbeat();

  function loop() {
    if (_sessionId !== session) return;

    // Update PA ticker with first chunk
    if (onSpeak && englishChunks[0]) onSpeak(englishChunks[0]);

    // English sequence
    speakList(englishChunks, "en", 1.15, session, () => {
      if (_sessionId !== session) return;

      // 1s pause then Hindi
      setTimeout(() => {
        if (_sessionId !== session) return;
        if (onSpeak && hindiChunks[0]) onSpeak(hindiChunks[0]);

        speakList(hindiChunks, "hi", 1.1, session, () => {
          if (_sessionId !== session) return;

          // 2s pause then loop
          setTimeout(loop, 2000);
        });
      }, 1000);
    });
  }

  // 3-second lead-in: let the fire detection moment be dramatic
  // First, speak a short "ATTENTION" to warm up Chrome's TTS engine
  speakOne("Attention!", "en", 1.2, session, () => {
    if (_sessionId !== session) return;
    // Now wait 2 more seconds, then start the full loop
    setTimeout(() => {
      if (_sessionId !== session) return;
      loop();
    }, 2000);
  });
}

// ---- ANNOUNCEMENT TEXTS ----

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
