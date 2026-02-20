import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Word-by-word synchronized caption display
 * Supports dual modes: question captions and feedback captions via label prop
 * Compact mode for use as an overlay within VideoCallLayout
 */
export default function SynchronizedCaption({
  text,
  isSpeaking,
  speed = 100,
  label = 'Interview Question',
  compact = false,
}) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const words = text ? text.split(' ') : [];

  useEffect(() => {
    if (!isSpeaking || !text) {
      setHighlightedIndex(-1);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setHighlightedIndex(currentIndex);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isSpeaking, text, speed, words.length]);

  if (!text) return null;

  // Compact mode: minimal overlay-friendly rendering
  if (compact) {
    return (
      <div className="text-sm leading-relaxed">
        {words.map((word, index) => (
          <span
            key={index}
            className={`inline mr-1 ${
              index === highlightedIndex
                ? 'text-cyber-blue font-bold'
                : index < highlightedIndex
                ? 'text-white/90'
                : 'text-white/40'
            }`}
          >
            {word}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-morphism rounded-2xl p-6 border border-cyber-blue/30">
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          label === 'Feedback'
            ? 'bg-gradient-to-r from-cyber-accent to-green-400'
            : 'bg-gradient-to-r from-cyber-blue to-cyber-purple'
        }`}>
          <span className="text-white font-bold text-sm">
            {label === 'Feedback' ? 'F' : 'Q'}
          </span>
        </div>
        <div>
          <h4 className={`text-sm font-bold mb-1 ${
            label === 'Feedback' ? 'text-cyber-accent' : 'text-cyber-blue'
          }`}>
            {label}
          </h4>
          <p className="text-xs text-gray-400">
            {isSpeaking ? 'Read along as the AI speaks' : 'AI has finished speaking'}
          </p>
        </div>
      </div>

      <div className="text-lg leading-relaxed">
        {words.map((word, index) => (
          <motion.span
            key={index}
            className={`inline-block mr-2 transition-all duration-200 ${
              index === highlightedIndex
                ? 'text-cyber-blue font-bold scale-110'
                : index < highlightedIndex
                ? 'text-white'
                : 'text-gray-500'
            }`}
            animate={index === highlightedIndex ? {
              textShadow: '0 0 10px rgba(0, 212, 255, 0.8)',
            } : {}}
          >
            {word}
          </motion.span>
        ))}
      </div>

      {/* Progress Bar */}
      {isSpeaking && (
        <motion.div
          className="mt-4 h-1 bg-cyber-gray rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className={`h-full ${
              label === 'Feedback'
                ? 'bg-gradient-to-r from-cyber-accent to-green-400'
                : 'bg-gradient-to-r from-cyber-blue to-cyber-purple'
            }`}
            animate={{
              width: `${((highlightedIndex + 1) / words.length) * 100}%`
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      )}
    </div>
  );
}
