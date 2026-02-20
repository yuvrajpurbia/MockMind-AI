import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Voice profiles for different interviewer personalities.
 * Each profile defines preferred voice search criteria and tone settings.
 *
 * Voice selection priority:
 *   1. Exact name match from `preferredNames`
 *   2. Language + gender match from `lang` + `gender`
 *   3. Fallback to any English female voice
 *   4. Fallback to any English voice
 */
const VOICE_PROFILES = {
  professional: {
    label: 'Sarah Mitchell — Indian English',
    lang: 'en-IN',
    gender: 'female',
    preferredNames: [
      // Windows 11 / Edge Neural voices (highest quality)
      'Microsoft Neerja Online (Natural)',
      'Microsoft Neerja',
      // Windows built-in
      'Microsoft Heera',
      'Microsoft Heera Desktop',
      // Google voices
      'Google हिन्दी',
      // Generic Indian English
      'English India Female',
    ],
    // Tone: professional, calm, clear, confident
    tone: { rate: 0.92, pitch: 1.05, volume: 1.0 },
  },
  technical: {
    label: 'Alex Rivera — Technical',
    lang: 'en-IN',
    gender: 'female',
    preferredNames: [
      'Microsoft Neerja Online (Natural)',
      'Microsoft Neerja',
      'Microsoft Heera',
      'Google हिन्दी',
    ],
    // Tone: clear, structured, analytical — slightly faster
    tone: { rate: 0.95, pitch: 1.0, volume: 1.0 },
  },
  startup: {
    label: 'Jordan Chen — Friendly',
    lang: 'en-IN',
    gender: 'female',
    preferredNames: [
      'Microsoft Neerja Online (Natural)',
      'Microsoft Neerja',
      'Microsoft Heera',
      'Google हिन्दी',
    ],
    // Tone: friendly, welcoming, warm — slightly higher pitch
    tone: { rate: 0.9, pitch: 1.1, volume: 1.0 },
  },
};

/**
 * Interview-type tone modifiers applied on top of the base profile tone.
 */
const INTERVIEW_TONE_MODIFIERS = {
  hr: { rateOffset: -0.03, pitchOffset: 0.05 },       // Friendlier, warmer
  technical: { rateOffset: 0.02, pitchOffset: -0.05 }, // Crisper, more direct
  managerial: { rateOffset: -0.02, pitchOffset: -0.03 }, // Authoritative, measured
  behavioral: { rateOffset: -0.02, pitchOffset: 0.03 },  // Empathetic
  default: { rateOffset: 0, pitchOffset: 0 },
};

/**
 * Find the best matching voice from available system voices.
 */
function selectVoice(availableVoices, profile) {
  if (!availableVoices.length || !profile) return null;

  // 1. Try exact name match (highest priority)
  for (const name of profile.preferredNames) {
    const match = availableVoices.find(
      (v) => v.name.includes(name)
    );
    if (match) return match;
  }

  // 2. Try language + likely female (name heuristic)
  const langMatch = availableVoices.filter((v) => v.lang.startsWith(profile.lang));
  if (profile.gender === 'female') {
    const femaleMatch = langMatch.find(
      (v) =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('neerja') ||
        v.name.toLowerCase().includes('heera') ||
        v.name.toLowerCase().includes('woman')
    );
    if (femaleMatch) return femaleMatch;
  }
  if (langMatch.length > 0) return langMatch[0];

  // 3. Fallback: any English female voice
  const enFemale = availableVoices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('natural'))
  );
  if (enFemale) return enFemale;

  // 4. Fallback: any English voice
  return availableVoices.find((v) => v.lang.startsWith('en')) || availableVoices[0];
}

/**
 * Enhanced Text-to-Speech hook with:
 * - Voice profiles (Indian female accent preferred)
 * - Interview-type tone variation
 * - Audio analysis for lip-sync
 * - Future: accent/gender switching via setProfile()
 *
 * @param {string} personality - 'professional' | 'technical' | 'startup'
 * @param {string} interviewType - 'hr' | 'technical' | 'managerial' | 'behavioral' | 'default'
 */
export default function useEnhancedTTS(personality = 'professional', interviewType = 'default') {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [audioData, setAudioData] = useState({ volume: 0, frequency: 0 });
  const [activeProfile, setActiveProfile] = useState(personality);

  const utteranceRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  const profile = VOICE_PROFILES[activeProfile] || VOICE_PROFILES.professional;
  const toneModifier = INTERVIEW_TONE_MODIFIERS[interviewType] || INTERVIEW_TONE_MODIFIERS.default;

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    // Initialize Web Audio API for analysis
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    } catch (e) {
      console.warn('Web Audio API not supported, lip-sync will be approximate');
    }

    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      const best = selectVoice(availableVoices, profile);
      setSelectedVoice(best);

      if (best) {
        console.log(`[TTS] Selected voice: "${best.name}" (${best.lang})`);
      }
    };

    loadVoices();

    // Chrome/Edge requires waiting for voices to load
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [activeProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-select voice when profile changes and voices are already loaded
  useEffect(() => {
    if (voices.length > 0) {
      const best = selectVoice(voices, profile);
      setSelectedVoice(best);
    }
  }, [activeProfile, voices]); // eslint-disable-line react-hooks/exhaustive-deps

  // Analyze audio for lip-sync (simulated based on speech timing)
  const analyzeAudio = useCallback(() => {
    if (!isSpeaking) {
      setAudioData({ volume: 0, frequency: 0 });
      return;
    }

    const now = Date.now();
    const baseVolume = 0.5 + Math.random() * 0.5;
    const baseFrequency = 100 + Math.random() * 200;

    // Natural variation patterns
    const variation = Math.sin(now / 100) * 0.2;
    const microVariation = Math.random() * 0.1;

    setAudioData({
      volume: Math.min(1, baseVolume + variation + microVariation),
      frequency: baseFrequency + Math.sin(now / 50) * 50,
    });

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [isSpeaking]);

  useEffect(() => {
    if (isSpeaking) {
      analyzeAudio();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioData({ volume: 0, frequency: 0 });
    }
  }, [isSpeaking, analyzeAudio]);

  const speak = useCallback(
    (text, options = {}) => {
      if (!isSupported) {
        console.error('Text-to-speech is not supported in this browser.');
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Apply profile tone + interview-type modifier + caller overrides
      const baseTone = profile.tone;
      utterance.rate = options.rate || (baseTone.rate + toneModifier.rateOffset);
      utterance.pitch = options.pitch || (baseTone.pitch + toneModifier.pitchOffset);
      utterance.volume = options.volume || baseTone.volume;

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
        if (options.onError) options.onError(event);
      };

      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => setIsPaused(false);

      utterance.onboundary = (event) => {
        if (options.onBoundary) options.onBoundary(event);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, selectedVoice, profile, toneModifier]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  // Allow runtime profile switching
  const setProfile = useCallback((newProfile) => {
    if (VOICE_PROFILES[newProfile]) {
      setActiveProfile(newProfile);
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice,
    audioData,
    setProfile,
    activeProfile,
    profileLabel: profile.label,
  };
}
