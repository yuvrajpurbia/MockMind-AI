import { motion } from 'framer-motion';

/**
 * Circular countdown timer with visual warning at low time.
 *
 * Props:
 *   timeRemaining  - seconds left
 *   totalTime      - total seconds (for arc calculation)
 *   isWarning      - true when <= 15 seconds
 */
export default function CountdownTimer({ timeRemaining, totalTime, isWarning }) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const progress = timeRemaining / totalTime;

  // SVG arc params
  const size = 120;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  // Colors
  const arcColor = isWarning ? '#ef4444' : '#00d4ff';
  const textColor = isWarning ? 'text-red-400' : 'text-cyber-blue';
  const glowColor = isWarning
    ? '0 0 20px rgba(239,68,68,0.4)'
    : '0 0 20px rgba(0,212,255,0.3)';

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          style={{ filter: `drop-shadow(${glowColor})` }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={arcColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>

        {/* Center time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-2xl font-black tabular-nums ${textColor}`}
            animate={isWarning ? { scale: [1, 1.08, 1] } : {}}
            transition={isWarning ? { duration: 1, repeat: Infinity } : {}}
          >
            {display}
          </motion.span>
        </div>
      </div>

      {/* Warning label */}
      {isWarning && (
        <motion.p
          className="text-red-400 text-xs font-bold mt-2 uppercase tracking-wider"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          Time running out
        </motion.p>
      )}
    </motion.div>
  );
}
