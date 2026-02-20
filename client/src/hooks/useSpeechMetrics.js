import { useState, useRef, useCallback } from 'react';

/**
 * Real-time speech analytics derived from transcript text.
 *
 * Metrics:
 *   wpm        — words per minute (calculated after a few seconds of speech)
 *   confidence — 0-100, penalizes filler words relative to total word count
 *   clarity    — 0-100, rewards longer words, structured sentences, vocabulary variety
 *   fillerCount — raw count of detected filler words
 *   wordCount  — total word count
 *   pace       — 'slow' | 'steady' | 'fast'
 */

const FILLER_WORDS = [
  'um', 'uh', 'erm', 'hmm', 'like', 'you know', 'basically',
  'actually', 'literally', 'right', 'okay', 'so yeah', 'i mean',
];

export default function useSpeechMetrics() {
  const [metrics, setMetrics] = useState({
    wpm: 0,
    confidence: 100,
    clarity: 100,
    fillerCount: 0,
    wordCount: 0,
    pace: 'steady',
  });

  const startTimeRef = useRef(null);

  const updateMetrics = useCallback((transcript) => {
    if (!transcript || !transcript.trim()) {
      startTimeRef.current = null;
      setMetrics({ wpm: 0, confidence: 100, clarity: 100, fillerCount: 0, wordCount: 0, pace: 'steady' });
      return;
    }

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const words = transcript.trim().split(/\s+/);
    const wordCount = words.length;
    const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;

    // WPM — require at least 5 seconds of speech for meaningful calculation
    const wpm = elapsedMinutes > 0.08 ? Math.round(wordCount / elapsedMinutes) : 0;

    // Filler word detection
    const lower = transcript.toLowerCase();
    let fillerCount = 0;
    for (const filler of FILLER_WORDS) {
      const regex = new RegExp(`\\b${filler.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) fillerCount += matches.length;
    }

    // Confidence — penalize heavy filler usage
    const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0;
    const confidence = Math.max(0, Math.min(100, Math.round(100 - fillerRatio * 300)));

    // Clarity — composite of word quality and sentence structure
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / wordCount;
    const hasStructure =
      transcript.includes(',') || transcript.includes('.') ||
      transcript.includes(' and ') || transcript.includes(' but ') ||
      transcript.includes(' because ') || transcript.includes(' however ');
    const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
    const vocabRatio = wordCount > 0 ? uniqueWords / wordCount : 1;

    let clarity = 40;
    if (avgWordLength >= 3 && avgWordLength <= 9) clarity += 20;
    else if (avgWordLength >= 2) clarity += 10;
    if (hasStructure) clarity += 15;
    if (wordCount > 10) clarity += 10;
    if (vocabRatio > 0.6) clarity += 15;
    clarity = Math.max(0, Math.min(100, clarity));

    // Pace label
    let pace = 'steady';
    if (wpm > 0 && wpm < 100) pace = 'slow';
    else if (wpm > 170) pace = 'fast';

    setMetrics({ wpm, confidence, clarity, fillerCount, wordCount, pace });
  }, []);

  const reset = useCallback(() => {
    startTimeRef.current = null;
    setMetrics({ wpm: 0, confidence: 100, clarity: 100, fillerCount: 0, wordCount: 0, pace: 'steady' });
  }, []);

  return { metrics, updateMetrics, reset };
}
