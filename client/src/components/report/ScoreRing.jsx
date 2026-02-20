import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';

/**
 * Animated SVG circular score gauge.
 * Renders a ring that fills based on score (0-100) with color-coded gradient.
 * Score number counts up on mount.
 */
export default function ScoreRing({ score, size = 200, strokeWidth = 12, label = 'Overall Score' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    });
    return () => controls.stop();
  }, [score]);

  const getColors = () => {
    if (score >= 80) return { start: '#00ff88', end: '#00d4ff' };
    if (score >= 60) return { start: '#00d4ff', end: '#a855f7' };
    return { start: '#fbbf24', end: '#ef4444' };
  };

  const colors = getColors();

  const getScoreLabel = () => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    return 'Needs Work';
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>

        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(26, 31, 53, 0.6)"
          strokeWidth={strokeWidth}
        />

        {/* Animated foreground ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreRingGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* Score number */}
        <text
          x="50%"
          y="43%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '3rem', fontWeight: 900 }}
          className="fill-white"
        >
          {displayScore}
        </text>

        {/* "out of 100" */}
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '0.75rem' }}
          className="fill-gray-400"
        >
          out of 100
        </text>

        {/* Rating label */}
        <text
          x="50%"
          y="70%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '0.7rem', fontWeight: 600 }}
          fill={colors.start}
        >
          {getScoreLabel()}
        </text>
      </svg>

      <p className="text-sm font-bold text-cyber-blue mt-2">{label}</p>
    </div>
  );
}
