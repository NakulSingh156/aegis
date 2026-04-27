/**
 * AEGIS PA System — Rev.00230
 * 
 * Ultra-simple: one flat playNext() function, zero concurrency.
 * Each utterance speaks, waits for onend, then advances.
 */

const VOICES_PRIORITY = ["Google UK English Female", "Samantha", "Victoria", "Karen"];

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => { };
}

function getBestVoice(lang = "en") {
  const voices = window.speechSynthesis.getVoices();
  if (lang === "hi") {
    const v = voices.find(v => v.lang.startsWith("hi"));
    if (v) return v;
  }
  for (const name of VOICES_PRIORITY) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }
  return voices[0] || null;
}

let _sid = 0;
let _hb = null;

function heartbeat() {
  if (_hb) return;
  _hb = setInterval(() => {
    if (window.speechSynthesis.speaking) window.speechSynthesis.resume();
  }, 3000);
}

export function stopAnnouncements() {
  _sid++;
  window.speechSynthesis.cancel();
  if (_hb) { clearInterval(_hb); _hb = null; }
}

/**
 * Speak one text, then call onEnd.
 */
export function announce(text, options = {}) {
  const s = _sid;
  heartbeat();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = getBestVoice(options.lang || "en");
  u.lang = (options.lang || "en") === "hi" ? "hi-IN" : "en-US";
  u.rate = options.rate || 1.15;
  u.volume = 1.0;
  u.onend = () => { if (_sid === s && options.onEnd) options.onEnd(); };
  u.onerror = () => { if (_sid === s && options.onEnd) setTimeout(options.onEnd, 500); };
  window.speechSynthesis.speak(u);
}

/**
 * Emergency loop — single flat index, one utterance at a time.
 */
export function startEmergencyLoop(englishChunks, hindiChunks, onSpeak) {
  const s = ++_sid;
  window.speechSynthesis.cancel();
  heartbeat();

  // Build the full sequence: English → Hindi (will loop)
  const seq = [
    ...englishChunks.map(t => ({ t, l: "en", r: 1.15 })),
    ...hindiChunks.map(t => ({ t, l: "hi", r: 1.1 })),
  ];

  let i = 0;

  function playNext() {
    if (_sid !== s) return;

    // Loop back with a 2-second gap
    if (i >= seq.length) {
      i = 0;
      setTimeout(playNext, 2000);
      return;
    }

    const c = seq[i++];
    if (onSpeak) onSpeak(c.t);

    const u = new SpeechSynthesisUtterance(c.t);
    u.voice = getBestVoice(c.l);
    u.lang = c.l === "hi" ? "hi-IN" : "en-US";
    u.rate = c.r;
    u.pitch = 1.1;
    u.volume = 1.0;
    u.onend = () => { if (_sid === s) setTimeout(playNext, 200); };
    u.onerror = () => { if (_sid === s) setTimeout(playNext, 500); };

    window.speechSynthesis.speak(u);
  }

  // 300ms settle after cancel(), then start
  setTimeout(playNext, 300);
}

// ---- TEXTS ----

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
