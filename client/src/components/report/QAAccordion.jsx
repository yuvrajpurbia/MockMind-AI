import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare } from 'lucide-react';

/**
 * Expandable Q&A review cards.
 * Each card shows the question, candidate answer, score, and evaluator feedback.
 */
export default function QAAccordion({ qaPairs = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBorderColor = (score) => {
    if (score >= 80) return 'border-l-green-400';
    if (score >= 50) return 'border-l-yellow-400';
    return 'border-l-red-400';
  };

  if (!qaPairs || qaPairs.length === 0) {
    return (
      <div className="glass-morphism rounded-2xl p-8 text-center">
        <MessageSquare className="w-8 h-8 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No Q&A data available for this interview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Section title */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-cyber-blue" />
        <h3 className="text-lg font-bold text-white">Question-by-Question Review</h3>
      </div>

      {qaPairs.map((qa, index) => {
        const isExpanded = expandedIndex === index;

        return (
          <motion.div
            key={index}
            className={`glass-effect rounded-xl border-l-4 ${getBorderColor(qa.score)} overflow-hidden`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
          >
            {/* Collapsed header — always visible */}
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs font-bold text-cyber-blue bg-cyber-blue/10 px-2 py-1 rounded-md flex-shrink-0">
                  Q{index + 1}
                </span>
                <span className="text-sm text-gray-300 truncate">
                  {qa.question}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-black ${getScoreColor(qa.score)}`}>
                    {qa.score}
                  </span>
                  <span className="text-gray-500 text-xs">/100</span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.div>
              </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  className="print-expand"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                    {/* Question */}
                    <div>
                      <h4 className="text-xs font-bold text-cyber-blue uppercase tracking-wider mb-1">
                        Question
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">{qa.question}</p>
                    </div>

                    {/* Answer */}
                    <div>
                      <h4 className="text-xs font-bold text-cyber-purple uppercase tracking-wider mb-1">
                        Your Answer
                      </h4>
                      <p className="text-sm text-gray-400 leading-relaxed italic">
                        &ldquo;{qa.answer}&rdquo;
                      </p>
                    </div>

                    {/* Feedback */}
                    <div>
                      <h4 className="text-xs font-bold text-cyber-accent uppercase tracking-wider mb-1">
                        Feedback
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">{qa.feedback}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
