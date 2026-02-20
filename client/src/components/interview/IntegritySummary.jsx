import { motion } from 'framer-motion';
import { Shield, Eye, Monitor, Clipboard, Volume2, Move, Users } from 'lucide-react';

/**
 * End-of-interview integrity summary panel.
 * Shows a breakdown of detected behaviors and the final integrity score.
 */
export default function IntegritySummary({ focusScore, counters, eventLog }) {
  if (!counters) return null;

  const totalEvents = eventLog?.length || 0;

  const getScoreColor = () => {
    if (focusScore >= 85) return 'text-green-400';
    if (focusScore >= 65) return 'text-emerald-400';
    if (focusScore >= 45) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = () => {
    if (focusScore >= 85) return 'Excellent — No concerns detected';
    if (focusScore >= 65) return 'Good — Minor observations noted';
    if (focusScore >= 45) return 'Fair — Some concerns flagged';
    return 'Needs Review — Multiple concerns detected';
  };

  // Only show categories with non-zero counts
  const categories = [
    { key: 'tabSwitch', label: 'Tab Switches', icon: Monitor, count: counters.tabSwitch, severity: 'high' },
    { key: 'windowBlur', label: 'Window Unfocused', icon: Monitor, count: counters.windowBlur, severity: 'medium' },
    { key: 'faceAbsent', label: 'Face Not Visible', icon: Eye, count: counters.faceAbsent, severity: 'medium' },
    { key: 'multiFace', label: 'Multiple Faces', icon: Users, count: counters.multiFace, severity: 'high' },
    { key: 'lookAway', label: 'Looked Away', icon: Eye, count: counters.lookAway, severity: 'low' },
    { key: 'copyPaste', label: 'Copy/Paste Actions', icon: Clipboard, count: counters.copyPaste, severity: 'high' },
    { key: 'resize', label: 'Window Resized', icon: Move, count: counters.resize, severity: 'low' },
    { key: 'audioAnomaly', label: 'Audio Anomalies', icon: Volume2, count: counters.audioAnomaly, severity: 'medium' },
  ].filter((c) => c.count > 0);

  const severityColor = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-gray-400',
  };

  return (
    <motion.div
      className="glass-morphism rounded-2xl p-6 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyber-blue" />
          <h4 className="text-lg font-bold text-white">Integrity Report</h4>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-black ${getScoreColor()}`}>{focusScore}</span>
          <span className="text-gray-500 text-sm">/100</span>
        </div>
      </div>

      {/* Score label */}
      <p className={`text-sm mb-5 ${getScoreColor()}`}>{getScoreLabel()}</p>

      {/* Category breakdown */}
      {categories.length > 0 ? (
        <div className="space-y-2">
          {categories.map(({ key, label, icon: Icon, count, severity }) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${severityColor[severity]}`} />
                <span className="text-sm text-gray-300">{label}</span>
              </div>
              <span className={`text-sm font-bold ${severityColor[severity]}`}>
                {count}x
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-green-400 text-sm font-medium">
            No suspicious behavior detected. Clean session.
          </p>
        </div>
      )}

      {/* Total events footer */}
      {totalEvents > 0 && (
        <p className="text-[11px] text-gray-500 mt-4 text-right">
          {totalEvents} event{totalEvents !== 1 ? 's' : ''} logged during session
        </p>
      )}
    </motion.div>
  );
}
