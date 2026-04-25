import numpy as np
import threading
import time
import os

class AudioDetector:
    """
    Detects audio threats from video files.
    Falls back to simulation mode if no audio track exists.
    """
    
    def __init__(self):
        self.has_librosa   = False
        self.simulation_mode = False
        
        # Simulated event queue (for demo triggering)
        self._simulated_event = None
        self._event_lock      = threading.Lock()
        
        try:
            import librosa
            self.librosa     = librosa
            self.has_librosa = True
        except:
            self.simulation_mode = True
    
    def trigger_simulated_event(self, event_type: str):
        """
        Called by backend API when judge clicks 
        'Simulate Gunshot' or 'Simulate Scream' button
        """
        with self._event_lock:
            self._simulated_event = {
                "event":      event_type,
                "confidence": 0.91,
                "timestamp":  time.time()
            }
            # Silenced for demo
    
    def get_and_clear_event(self):
        with self._event_lock:
            e = self._simulated_event
            # Clear immediately after first consumption
            self._simulated_event = None
            return e
    
    def analyze_audio_chunk(self, audio_data, sr=22050) -> dict:
        """Analyze real audio chunk from video"""
        if not self.has_librosa:
            return {"event": "normal", "confidence": 0.0}
        
        try:
            # Energy level
            rms = float(np.sqrt(np.mean(audio_data**2)))
            
            # Spectral features
            spectral_centroid = float(np.mean(
                self.librosa.feature.spectral_centroid(
                    y=audio_data, sr=sr
                )
            ))
            
            # Zero crossing rate (high = sharp sounds like gunshot)
            zcr = float(np.mean(
                self.librosa.feature.zero_crossing_rate(audio_data)
            ))
            
            # MFCC for voice/scream detection
            mfcc = self.librosa.feature.mfcc(
                y=audio_data, sr=sr, n_mfcc=13
            )
            mfcc_mean = float(np.mean(np.abs(mfcc)))
            
            # Classification logic
            # Gunshot: high RMS, very high ZCR, spike
            if rms > 0.4 and zcr > 0.15:
                return {
                    "event":      "gunshot",
                    "confidence": min(rms * 2, 0.95),
                    "rms":        rms
                }
            
            # Scream: high RMS, high spectral centroid
            if rms > 0.25 and spectral_centroid > 2500:
                return {
                    "event":      "scream",
                    "confidence": min(rms * 1.8, 0.92),
                    "rms":        rms
                }
            
            # Glass break: high ZCR, medium-high RMS
            if zcr > 0.12 and rms > 0.15 and spectral_centroid > 3000:
                return {
                    "event":      "glass_break",
                    "confidence": 0.78,
                    "rms":        rms
                }
            
            # Crowd panic: elevated RMS sustained
            if rms > 0.15 and mfcc_mean > 15:
                return {
                    "event":      "crowd_noise",
                    "confidence": 0.65,
                    "rms":        rms
                }
            
            return {"event": "normal", "confidence": 0.0}
            
        except Exception:
            return {"event": "normal", "confidence": 0.0}
    
    def analyze_video_audio(self, video_path: str,
                             zone_name: str,
                             callback) -> None:
        """
        Efficiently stream audio from video file to avoid full-file decode overhead.
        """
        if not self.has_librosa or not os.path.exists(video_path):
            return
        
        # Stagger start to avoid mass-decoding spike
        import random
        time.sleep(random.uniform(0.1, 0.5))
        
        try:
            # Use librosa.stream to avoid loading everything at once
            # This is significantly faster for 'startup'
            sr = 22050
            chunk_size_secs = 2
            stream = self.librosa.stream(
                video_path,
                block_length=1,
                frame_length=sr * chunk_size_secs,
                hop_length=sr * chunk_size_secs
            )
            
            for chunk in stream:
                from detection.camera_processor import _cameras_running
                if not _cameras_running: 
                    break

                result = self.analyze_audio_chunk(chunk, sr)
                
                if result["event"] != "normal":
                    callback(zone_name, result)
                
                # Sleep to mimic real-time processing of the chunk
                time.sleep(chunk_size_secs)
                
        except Exception as e:
            # print(f"[AudioDetector] Stream error: {e}")
            pass

# Global instance shared across cameras
audio_detector = AudioDetector()
