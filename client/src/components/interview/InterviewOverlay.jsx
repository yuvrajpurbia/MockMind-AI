import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

/**
 * Minimal interview environment overlay — elapsed timer + section label.
 * Sits in the top bar of the video call layout.
 */
export default function InterviewOverlay({
  interviewState,
  questionNumber,
  totalQuestions,
  sectionLabel,
}) {
  // --- Timer ---
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // --- Section color mapping ---
  const sectionColors = {
    Introduction: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'Technical Round': 'text-cyber-blue bg-cyber-blue/10 border-cyber-blue/20',
    'Behavioral Round': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'Closing': 'text-green-400 bg-green-500/10 border-green-500/20',
  };
  const sectionStyle = sectionColors[sectionLabel] || sectionColors['Technical Round'];

  return (
    <div className="flex items-center gap-2.5">
      {/* Elapsed timer */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
        <Clock className="w-3 h-3 text-gray-500" />
        <span className="text-[11px] text-gray-400 font-mono font-medium tabular-nums">
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Section label */}
      <AnimatePresence mode="wait">
        {sectionLabel && (
          <motion.div
            key={sectionLabel}
            className={`flex items-center px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${sectionStyle}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.25 }}
          >
            {sectionLabel}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
