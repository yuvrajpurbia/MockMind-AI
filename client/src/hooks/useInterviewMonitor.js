import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Smart interview monitoring hook
 *
 * Detection vectors:
 *   - Face presence (native FaceDetector API only — no unreliable pixel fallback)
 *   - Multiple faces in frame
 *   - Tab / window switching (visibilitychange + window blur)
 *   - Copy-paste attempts
 *   - Screen / window resizing
 *   - Audio anomalies (background voices)
 *
 * Design principles:
 *   - No false positives: use generous thresholds + consecutive miss requirements
 *   - Non-intrusive: subtle warnings with long cooldowns
 *   - Event log: all suspicious events are logged for end-of-interview summary
 *   - Focus score: composite metric that reflects overall candidate integrity
 */

// --- Warning cooldowns per category (ms) ---
const COOLDOWNS = {
  face: 30000,       // 30s between face warnings
  multiFace: 30000,  // 30s between multiple-face warnings
  gaze: 45000,       // 45s between gaze warnings
  tabSwitch: 10000,  // 10s between tab warnings
  windowBlur: 15000, // 15s between window blur warnings
  copyPaste: 10000,  // 10s between copy-paste warnings
  resize: 20000,     // 20s between resize warnings
  audio: 20000,      // 20s between audio warnings
};

// How many consecutive detection misses before we consider face truly absent
const FACE_MISS_THRESHOLD = 4;

export default function useInterviewMonitor(videoRef, micStream) {
  // --- Metrics state ---
  const [focusScore, setFocusScore] = useState(100);
  const [faceVisible, setFaceVisible] = useState(true);
  const [warnings, setWarnings] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // --- Event log for end-of-interview summary ---
  const eventLogRef = useRef([]);

  // --- Internal counters (refs to avoid re-render churn) ---
  const countersRef = useRef({
    tabSwitch: 0,
    windowBlur: 0,
    faceAbsent: 0,
    multiFace: 0,
    lookAway: 0,
    copyPaste: 0,
    resize: 0,
    audioAnomaly: 0,
  });

  // --- Cooldown tracking ---
  const lastWarningTimeRef = useRef({});
  const warningIdRef = useRef(0);

  // --- Face detection state ---
  const consecutiveMissesRef = useRef(0);

  // --- Intervals for cleanup ---
  const intervalsRef = useRef([]);

  // --- Audio refs ---
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // --- Window size ref for resize detection ---
  const windowSizeRef = useRef({ w: window.innerWidth, h: window.innerHeight });

  // ========================================
  // WARNING SYSTEM
  // ========================================

  // Check if a warning category is on cooldown
  const isOnCooldown = useCallback((category) => {
    const last = lastWarningTimeRef.current[category] || 0;
    const cooldown = COOLDOWNS[category] || 15000;
    return Date.now() - last < cooldown;
  }, []);

  // Add a warning with auto-dismiss (respects cooldowns)
  const addWarning = useCallback((message, type = 'warning', category = 'general') => {
    if (isOnCooldown(category)) return false;

    lastWarningTimeRef.current[category] = Date.now();
    const id = ++warningIdRef.current;
    setWarnings((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setWarnings((prev) => prev.filter((w) => w.id !== id));
    }, 5000);
    return true;
  }, [isOnCooldown]);

  // Log a suspicious event (always logged, regardless of cooldown)
  const logEvent = useCallback((category, detail) => {
    eventLogRef.current.push({
      timestamp: Date.now(),
      elapsed: eventLogRef.current.length > 0
        ? Date.now() - eventLogRef.current[0].timestamp
        : 0,
      category,
      detail,
    });
  }, []);

  // Increment a counter and recalculate focus score
  const incrementCounter = useCallback((key, amount = 1) => {
    countersRef.current[key] = (countersRef.current[key] || 0) + amount;
    recalcScore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ========================================
  // FOCUS SCORE CALCULATION
  // ========================================

  const recalcScore = useCallback(() => {
    const c = countersRef.current;
    let score = 100;
    score -= c.tabSwitch * 5;       // -5 per tab switch
    score -= c.windowBlur * 2;      // -2 per window blur (less severe than tab switch)
    score -= c.faceAbsent * 3;      // -3 per sustained face absence
    score -= c.multiFace * 8;       // -8 per multiple face detection
    score -= c.lookAway * 1;        // -1 per look-away (very minor)
    score -= c.copyPaste * 6;       // -6 per copy-paste attempt
    score -= c.resize * 2;          // -2 per suspicious resize
    score -= c.audioAnomaly * 3;    // -3 per audio anomaly
    setFocusScore(Math.max(0, Math.min(100, score)));
  }, []);

  // ========================================
  // 1. TAB SWITCHING DETECTION
  // ========================================
  useEffect(() => {
    if (!isMonitoring) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        incrementCounter('tabSwitch');
        logEvent('tabSwitch', 'Candidate switched to another tab');
        addWarning('Tab switch detected — please stay on this page', 'danger', 'tabSwitch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isMonitoring, incrementCounter, logEvent, addWarning]);

  // ========================================
  // 2. WINDOW BLUR / FOCUS DETECTION (catches Alt+Tab)
  // ========================================
  useEffect(() => {
    if (!isMonitoring) return;

    let blurTimestamp = null;

    const handleBlur = () => {
      blurTimestamp = Date.now();
    };

    const handleFocus = () => {
      if (blurTimestamp) {
        const duration = Date.now() - blurTimestamp;
        // Only count if window was unfocused for > 2 seconds
        if (duration > 2000) {
          incrementCounter('windowBlur');
          logEvent('windowBlur', `Window unfocused for ${Math.round(duration / 1000)}s`);
          addWarning('Please keep the interview window in focus', 'warning', 'windowBlur');
        }
        blurTimestamp = null;
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isMonitoring, incrementCounter, logEvent, addWarning]);

  // ========================================
  // 3. COPY-PASTE DETECTION
  // ========================================
  useEffect(() => {
    if (!isMonitoring) return;

    const handleCopy = () => {
      incrementCounter('copyPaste');
      logEvent('copyPaste', 'Copy action detected');
      addWarning('Copy action detected', 'warning', 'copyPaste');
    };

    const handlePaste = (e) => {
      incrementCounter('copyPaste');
      const textLength = (e.clipboardData?.getData('text') || '').length;
      logEvent('copyPaste', `Paste action detected (${textLength} chars)`);
      addWarning('Paste action detected — please use your own words', 'danger', 'copyPaste');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [isMonitoring, incrementCounter, logEvent, addWarning]);

  // ========================================
  // 4. SCREEN / WINDOW RESIZE DETECTION
  // ========================================
  useEffect(() => {
    if (!isMonitoring) return;

    let resizeTimeout = null;

    const handleResize = () => {
      // Debounce resize events
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const prev = windowSizeRef.current;
        const now = { w: window.innerWidth, h: window.innerHeight };

        // Only flag significant resizes (> 200px change in either dimension)
        const dw = Math.abs(now.w - prev.w);
        const dh = Math.abs(now.h - prev.h);
        if (dw > 200 || dh > 200) {
          incrementCounter('resize');
          logEvent('resize', `Window resized: ${prev.w}x${prev.h} → ${now.w}x${now.h}`);
          addWarning('Suspicious window resize detected', 'warning', 'resize');
        }

        windowSizeRef.current = now;
      }, 500);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [isMonitoring, incrementCounter, logEvent, addWarning]);

  // ========================================
  // 5. FACE DETECTION (native FaceDetector API only)
  // ========================================
  useEffect(() => {
    if (!isMonitoring) return;
    if (!('FaceDetector' in window)) return;

    let detector;
    try {
      detector = new window.FaceDetector({ fastMode: true });
    } catch {
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Use smaller canvas for faster face detection processing
    canvas.width = 120;
    canvas.height = 90;

    const checkFace = async () => {
      const video = videoRef?.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      try {
        ctx.drawImage(video, 0, 0, 120, 90);
        const faces = await detector.detect(canvas);

        // --- Multiple faces ---
        if (faces.length > 1) {
          incrementCounter('multiFace');
          logEvent('multiFace', `${faces.length} faces detected in frame`);
          addWarning('Multiple faces detected — only the candidate should be visible', 'danger', 'multiFace');
        }

        // --- Face presence ---
        if (faces.length >= 1) {
          // Face found: reset miss counter, clear face warning
          if (consecutiveMissesRef.current > 0) {
            consecutiveMissesRef.current = 0;
            setFaceVisible(true);
          }

          // --- Gaze estimation ---
          const face = faces[0].boundingBox;
          const faceCenterX = face.x + face.width / 2;
          const frameCenterX = 60; // canvas width / 2
          const deviation = Math.abs(faceCenterX - frameCenterX) / frameCenterX;
          if (deviation > 0.65) {
            incrementCounter('lookAway');
            logEvent('gaze', 'Candidate looking away from screen');
            // Gaze warnings are very subtle — only warn after many occurrences
            if (countersRef.current.lookAway % 5 === 0) {
              addWarning('Please look at the screen', 'warning', 'gaze');
            }
          }
        } else {
          // No face detected
          consecutiveMissesRef.current += 1;

          if (consecutiveMissesRef.current >= FACE_MISS_THRESHOLD) {
            setFaceVisible(false);
            incrementCounter('faceAbsent');
            logEvent('faceAbsent', 'No face detected in camera frame');
            addWarning('Please keep your face visible in the camera', 'warning', 'face');
            // Reset so we don't keep incrementing every check
            consecutiveMissesRef.current = FACE_MISS_THRESHOLD;
          }
        }
      } catch {
        // Detection error — assume face present
        consecutiveMissesRef.current = 0;
        setFaceVisible(true);
      }
    };

    const faceInterval = setInterval(checkFace, 4000);
    intervalsRef.current.push(faceInterval);

    return () => clearInterval(faceInterval);
  }, [isMonitoring, videoRef, incrementCounter, logEvent, addWarning]);

  // ========================================
  // 6. AUDIO MONITORING
  // ========================================
  useEffect(() => {
    if (!isMonitoring || !micStream) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(micStream);
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      let consecutiveLoud = 0;

      const checkAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avgAmplitude = sum / dataArray.length;

        // Sustained loud audio (need 2 consecutive loud checks = 6s of noise)
        if (avgAmplitude > 80) {
          consecutiveLoud++;
          if (consecutiveLoud >= 2) {
            incrementCounter('audioAnomaly');
            logEvent('audio', 'Sustained background noise or multiple voices detected');
            addWarning('Background noise detected', 'warning', 'audio');
            consecutiveLoud = 0;
          }
        } else {
          consecutiveLoud = 0;
        }
      };

      const audioInterval = setInterval(checkAudio, 3000);
      intervalsRef.current.push(audioInterval);

      return () => {
        clearInterval(audioInterval);
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current.close();
        }
      };
    } catch {
      // Audio monitoring not available
    }
  }, [isMonitoring, micStream, incrementCounter, logEvent, addWarning]);

  // ========================================
  // CONTROLS
  // ========================================

  const startMonitoring = useCallback(() => {
    eventLogRef.current = [];
    countersRef.current = {
      tabSwitch: 0, windowBlur: 0, faceAbsent: 0, multiFace: 0,
      lookAway: 0, copyPaste: 0, resize: 0, audioAnomaly: 0,
    };
    lastWarningTimeRef.current = {};
    consecutiveMissesRef.current = 0;
    windowSizeRef.current = { w: window.innerWidth, h: window.innerHeight };
    setFocusScore(100);
    setFaceVisible(true);
    setWarnings([]);
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
  }, []);

  // Get the event log snapshot (for end-of-interview summary)
  const getEventLog = useCallback(() => {
    return [...eventLogRef.current];
  }, []);

  // Get the counters snapshot
  const getCounters = useCallback(() => {
    return { ...countersRef.current };
  }, []);

  return {
    focusScore,
    faceVisible,
    warnings,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getEventLog,
    getCounters,
  };
}
