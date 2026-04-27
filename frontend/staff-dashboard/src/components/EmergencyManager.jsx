import React, { useEffect } from 'react';
import { startEmergencyLoop, stopAnnouncements, ANNOUNCEMENTS, announce } from '../utils/announcer';

// persist across re-renders
let _LOCKED_ID = null;
let _DELAY_TIMER = null;
let _RESOLVED_SET = new Set();

export default function EmergencyManager({ state, paMuted, setPaText }) {
    useEffect(() => {
        if (!state) return;

        const currentId = state.current_incident_id || state.incident_id || 'fallback';
        const incidentActive = state.incident_active;
        const isResolved = state.incident_resolved;

        // 1. START: Lock new incident
        if (incidentActive && !isResolved && _LOCKED_ID !== currentId) {
            if (paMuted) return;
            console.log("[AEGIS] Shield: Locking incident", currentId);
            _LOCKED_ID = currentId;
            _RESOLVED_SET.delete(currentId);
            if (_DELAY_TIMER) clearTimeout(_DELAY_TIMER);

            // 6s Delay for Scream
            _DELAY_TIMER = setTimeout(() => {
                if (_LOCKED_ID !== currentId) return;
                const zones = state.affected_zones || ["lobby"];
                const safe = state.safe_zones || ["parking"];
                const window = state.gemini_analysis?.estimated_safe_window || "4 mins";
                startEmergencyLoop(
                    ANNOUNCEMENTS.fireEnglish(zones, safe, zones, window),
                    ANNOUNCEMENTS.fireHindi(zones, safe),
                    (txt) => setPaText(txt)
                );
            }, 6000);
        }

        // 2. STOP & ALL-CLEAR
        if (_LOCKED_ID !== null && (isResolved || !incidentActive)) {
            const closingId = _LOCKED_ID;
            _LOCKED_ID = null;
            if (_DELAY_TIMER) clearTimeout(_DELAY_TIMER);
            stopAnnouncements();
            setPaText("");
            window.speechSynthesis.cancel();

            if (isResolved && !_RESOLVED_SET.has(closingId) && !paMuted) {
                _RESOLVED_SET.add(closingId);
                let r = 0;
                const play = () => {
                    if (r >= 3 || _LOCKED_ID !== null) return;
                    r++;
                    setPaText("ALL CLEAR - AREA SECURED");
                    announce(ANNOUNCEMENTS.allClearEnglish(), {
                        onEnd: () => setTimeout(() => {
                            announce(ANNOUNCEMENTS.allClearHindi(), {
                                onEnd: () => setTimeout(play, 2000)
                            });
                        }, 1000)
                    });
                };
                setTimeout(play, 2000);
            }
        }
    }, [state, paMuted, setPaText]);

    return null;
}
