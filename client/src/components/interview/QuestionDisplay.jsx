import { useEffect, useState, useRef } from 'react';
import useEnhancedTTS from '../../hooks/useEnhancedTTS';

/**
 * QuestionDisplay — headless TTS controller with filler/pause support
 *
 * Manages TTS playback and exposes isSpeaking + audioData to the parent.
 * Supports optional filler phrases that play before the main text with a natural pause.
 * Voice profile and interview-type tone are configured via props.
 *
 * Props:
 *   text           - text to speak (question or feedback)
 *   filler         - optional filler phrase before main text
 *   delay          - ms delay before starting speech (default 600)
 *   autoPlay       - whether to speak automatically on text change
 *   personality    - voice profile: 'professional' | 'technical' | 'startup'
 *   interviewType  - tone modifier: 'hr' | 'technical' | 'managerial' | 'behavioral' | 'default'
 *   onSpeakingChange(isSpeaking, audioData) - callback for parent sync
 *   onSpeechEnd    - callback when speech finishes
 *   muted          - if true, suppress playback
 */
export default function QuestionDisplay({
  text,
  filler,
  delay = 600,
  autoPlay = true,
  personality = 'professional',
  interviewType = 'default',
  onSpeakingChange,
  onSpeechEnd,
  muted = false,
}) {
  const { speak, stop, isSpeaking, isSupported, audioData } = useEnhancedTTS(personality, interviewType);
  const [lastSpoken, setLastSpoken] = useState('');
  const timerRef = useRef(null);
  const fillerTimerRef = useRef(null);

  // Notify parent of speaking state changes
  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(isSpeaking, audioData);
    }
  }, [isSpeaking, audioData, onSpeakingChange]);

  // Auto-play when text changes — with optional filler before main text
  useEffect(() => {
    if (!text || !autoPlay || !isSupported || muted) return;
    if (text === lastSpoken) return;

    // Clear any pending timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (fillerTimerRef.current) clearTimeout(fillerTimerRef.current);

    if (filler) {
      // Speak filler first, then pause, then main text
      timerRef.current = setTimeout(() => {
        speak(filler, {
          onEnd: () => {
            // Natural pause between filler and main text
            fillerTimerRef.current = setTimeout(() => {
              speak(text, {
                onEnd: () => {
                  if (onSpeechEnd) onSpeechEnd();
                },
              });
            }, 800);
          },
        });
        setLastSpoken(text);
      }, delay);
    } else {
      // No filler — speak directly after delay
      timerRef.current = setTimeout(() => {
        speak(text, {
          onEnd: () => {
            if (onSpeechEnd) onSpeechEnd();
          },
        });
        setLastSpoken(text);
      }, delay);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fillerTimerRef.current) clearTimeout(fillerTimerRef.current);
    };
  }, [text, filler, delay, autoPlay, isSupported, muted, speak, lastSpoken, onSpeechEnd]);

  // Stop speech when muted
  useEffect(() => {
    if (muted && isSpeaking) {
      stop();
    }
  }, [muted, isSpeaking, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fillerTimerRef.current) clearTimeout(fillerTimerRef.current);
    };
  }, [stop]);

  return null;
}
