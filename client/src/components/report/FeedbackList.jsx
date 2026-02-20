import { motion } from 'framer-motion';

const ACCENT_MAP = {
  green: {
    title: 'text-cyber-accent',
    border: 'border-l-cyber-accent',
    dot: 'bg-cyber-accent',
    bg: 'bg-cyber-accent/5',
  },
  yellow: {
    title: 'text-yellow-400',
    border: 'border-l-yellow-400',
    dot: 'bg-yellow-400',
    bg: 'bg-yellow-400/5',
  },
  blue: {
    title: 'text-cyber-blue',
    border: 'border-l-cyber-blue',
    dot: 'bg-cyber-blue',
    bg: 'bg-cyber-blue/5',
  },
};

/**
 * Reusable feedback list for strengths, improvements, or recommendations.
 *
 * Props:
 *   title       - section heading
 *   items       - string array
 *   icon        - Lucide icon component
 *   accentColor - 'green' | 'yellow' | 'blue'
 *   delay       - base animation delay
 */
export default function FeedbackList({ title, items = [], icon: Icon, accentColor = 'blue', delay = 0 }) {
  const accent = ACCENT_MAP[accentColor] || ACCENT_MAP.blue;

  return (
    <motion.div
      className="glass-morphism rounded-2xl p-6 h-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className={`w-5 h-5 ${accent.title}`} />}
        <h3 className={`text-base font-bold ${accent.title}`}>{title}</h3>
      </div>

      {/* Items */}
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <motion.li
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg ${accent.bg} border-l-2 ${accent.border}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.1 + index * 0.05 }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${accent.dot} mt-2 flex-shrink-0`} />
              <span className="text-sm text-gray-300 leading-relaxed">{item}</span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic">No items to display.</p>
      )}
    </motion.div>
  );
}
