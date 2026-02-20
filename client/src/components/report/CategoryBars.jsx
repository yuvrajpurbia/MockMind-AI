import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';

const CATEGORIES = [
  {
    key: 'technical',
    label: 'Technical Depth',
    gradient: 'from-cyber-blue to-cyan-400',
    textColor: 'text-cyber-blue',
  },
  {
    key: 'communication',
    label: 'Communication',
    gradient: 'from-cyber-purple to-pink-400',
    textColor: 'text-cyber-purple',
  },
  {
    key: 'problemSolving',
    label: 'Problem Solving',
    gradient: 'from-cyber-accent to-green-400',
    textColor: 'text-cyber-accent',
  },
];

function AnimatedNumber({ value, delay }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: 'easeOut',
      delay,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, delay]);

  return <span>{display}</span>;
}

/**
 * Three animated horizontal progress bars for category scores.
 */
export default function CategoryBars({ scores }) {
  if (!scores) return null;

  return (
    <div className="space-y-6">
      {CATEGORIES.map((cat, index) => {
        const value = scores[cat.key] ?? 0;
        const delay = 0.4 + index * 0.2;

        return (
          <div key={cat.key}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">{cat.label}</span>
              <span className={`text-sm font-bold ${cat.textColor}`}>
                <AnimatedNumber value={value} delay={delay} />/100
              </span>
            </div>

            {/* Bar container */}
            <div className="h-3 rounded-full bg-cyber-gray/50 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${cat.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
