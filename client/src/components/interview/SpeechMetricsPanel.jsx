import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, MessageSquare } from 'lucide-react';

/**
 * Mini circular gauge used for each metric.
 */
function MiniGauge({ value, label, icon: Icon, color, subLabel }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative" style={{ width: 40, height: 40 }}>
        <svg width={40} height={40} viewBox="0 0 40 40" className="transform -rotate-90">
          {/* Track */}
          <circle
            cx={20} cy={20} r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={2.5}
            fill="none"
          />
          {/* Progress arc */}
          <motion.circle
            cx={20} cy={20} r={radius}
            stroke={color}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-3 h-3" style={{ color }} />
        </div>
      </div>
      <span className="text-[8px] text-gray-500 font-semibold uppercase tracking-wider leading-none">{label}</span>
      {subLabel && (
        <span className="text-[8px] font-bold leading-none" style={{ color }}>{subLabel}</span>
      )}
    </div>
  );
}

/**
 * Real-time speech metrics displayed as three mini gauges.
 * Shows pace (WPM), confidence (filler word ratio), and clarity (structure quality).
 *
 * Placed in the candidate camera panel during LISTENING state.
 */
export default function SpeechMetricsPanel({ metrics, visible = true }) {
  if (!visible || !metrics) return null;

  const { wpm, confidence, clarity, pace } = metrics;

  // Map WPM to a 0-100 gauge — ideal range is 110-160 WPM
  let paceScore;
  if (wpm === 0) paceScore = 0;
  else if (wpm >= 100 && wpm <= 170) paceScore = 100 - Math.abs(135 - wpm) * 0.7;
  else if (wpm < 100) paceScore = Math.max(15, wpm * 0.6);
  else paceScore = Math.max(15, 100 - (wpm - 170) * 1.5);
  paceScore = Math.max(0, Math.min(100, Math.round(paceScore)));

  const paceColor = pace === 'steady' ? '#00d4ff' : pace === 'slow' ? '#facc15' : '#f97316';
  const confColor = confidence >= 70 ? '#00ff88' : confidence >= 40 ? '#facc15' : '#ef4444';
  const clarColor = clarity >= 70 ? '#a855f7' : clarity >= 40 ? '#facc15' : '#ef4444';
  const paceLabel = wpm > 0 ? `${wpm}` : '—';

  return (
    <AnimatePresence>
      <motion.div
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-sm border border-white/8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <MiniGauge value={paceScore} label="Pace" icon={Zap} color={paceColor} subLabel={paceLabel} />
        <MiniGauge value={confidence} label="Conf" icon={Brain} color={confColor} />
        <MiniGauge value={clarity} label="Clear" icon={MessageSquare} color={clarColor} />
      </motion.div>
    </AnimatePresence>
  );
}
