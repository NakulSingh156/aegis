import React, { useEffect, useRef } from 'react';
import { startEmergencyLoop, stopAnnouncements, ANNOUNCEMENTS, announce } from '../utils/announcer';

// persist across re-renders
let _LOCKED_ID = null;
let _RESOLVED_SET = new Set();

export default function EmergencyManager({ state, paMuted, setPaText }) {
    const delayRef = useRef(null);

    useEffect(() => {
        if (!state) return;

        const currentId = state.current_incident_id || state.incident_id || 'fallback';
        const incidentActive = state.incident_active;
        const isResolved = state.incident_resolved;

        // 1. START: Lock new incident, delay PA by 4s to let scream play
        if (incidentActive && !isResolved && _LOCKED_ID !== currentId) {
            console.log("[AEGIS] PA: Locking incident", currentId);
            _LOCKED_ID = currentId;
            _RESOLVED_SET.delete(currentId);

            if (delayRef.current) clearTimeout(delayRef.current);

            if (!paMuted) {
                // 4-second delay: let the fire detection + scream moment breathe
                delayRef.current = setTimeout(() => {
                    if (_LOCKED_ID !== currentId) return;
                    const zones = state.affected_zones || ["lobby"];
                    const safe = state.safe_zones || ["parking"];
                    const win = state.gemini_analysis?.estimated_safe_window || "4 mins";
                    startEmergencyLoop(
                        ANNOUNCEMENTS.fireEnglish(zones, safe, zones, win),
                        ANNOUNCEMENTS.fireHindi(zones, safe),
                        (txt) => setPaText(txt)
                    );
                }, 4000);
            }
        }

        // 2. STOP & ALL-CLEAR
        if (_LOCKED_ID !== null && (isResolved || !incidentActive)) {
            const closingId = _LOCKED_ID;
            _LOCKED_ID = null;
            if (delayRef.current) clearTimeout(delayRef.current);
            stopAnnouncements();
            setPaText("");

            if (isResolved && !_RESOLVED_SET.has(closingId) && !paMuted) {
                _RESOLVED_SET.add(closingId);
                setTimeout(() => {
                    let r = 0;
                    const play = () => {
                        if (r >= 3 || _LOCKED_ID !== null) return;
                        r++;
                        setPaText("ALL CLEAR — AREA SECURED");
                        announce(ANNOUNCEMENTS.allClearEnglish(), {
                            onEnd: () => setTimeout(() => {
                                announce(ANNOUNCEMENTS.allClearHindi(), {
                                    lang: "hi",
                                    rate: 1.1,
                                    onEnd: () => setTimeout(play, 2000)
                                });
                            }, 1000)
                        });
                    };
                    play();
                }, 500);
            }
        }
    }, [state, paMuted, setPaText]);

    return null;
}
