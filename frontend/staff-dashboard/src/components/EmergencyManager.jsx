import React, { useEffect } from 'react';
import { startEmergencyLoop, stopAnnouncements, ANNOUNCEMENTS, announce } from '../utils/announcer';

// persist across re-renders
let _LOCKED_ID = null;
let _RESOLVED_SET = new Set();

export default function EmergencyManager({ state, paMuted, setPaText }) {
    useEffect(() => {
        if (!state) return;

        const currentId = state.current_incident_id || state.incident_id || 'fallback';
        const incidentActive = state.incident_active;
        const isResolved = state.incident_resolved;

        // 1. START: Lock new incident and start PA immediately
        if (incidentActive && !isResolved && _LOCKED_ID !== currentId) {
            console.log("[AEGIS] Shield: Locking incident", currentId);
            _LOCKED_ID = currentId;
            _RESOLVED_SET.delete(currentId);

            if (!paMuted) {
                const zones = state.affected_zones || ["lobby"];
                const safe = state.safe_zones || ["parking"];
                const win = state.gemini_analysis?.estimated_safe_window || "4 mins";
                startEmergencyLoop(
                    ANNOUNCEMENTS.fireEnglish(zones, safe, zones, win),
                    ANNOUNCEMENTS.fireHindi(zones, safe),
                    (txt) => setPaText(txt)
                );
            }
        }

        // 2. STOP & ALL-CLEAR
        if (_LOCKED_ID !== null && (isResolved || !incidentActive)) {
            const closingId = _LOCKED_ID;
            _LOCKED_ID = null;
            stopAnnouncements();
            setPaText("");

            if (isResolved && !_RESOLVED_SET.has(closingId) && !paMuted) {
                _RESOLVED_SET.add(closingId);
                setTimeout(() => {
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
                    play();
                }, 500);
            }
        }
    }, [state, paMuted, setPaText]);

    return null;
}
