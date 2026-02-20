import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

/**
 * Professional monitoring overlay for the candidate camera panel.
 *
 * - Integrity Score badge (top-right, color-coded)
 * - Subtle warning toasts (bottom, auto-dismiss, non-aggressive)
 *
 * Warnings use three severity levels:
 *   info    — informational (blue)
 *   warning — gentle nudge (amber)
 *   danger  — serious concern (red, but still professional)
 */
export default function MonitoringOverlay({ focusScore, warnings = [] }) {
  const getScoreStyle = () => {
    if (focusScore >= 85) return {
      bg: 'bg-green-500/15',
      border: 'border-green-500/40',
      text: 'text-green-400',
      label: 'Excellent',
    };
    if (focusScore >= 65) return {
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      label: 'Good',
    };
    if (focusScore >= 45) return {
      bg: 'bg-yellow-500/15',
      border: 'border-yellow-500/40',
      text: 'text-yellow-400',
      label: 'Fair',
    };
    return {
      bg: 'bg-red-500/15',
      border: 'border-red-500/40',
      text: 'text-red-400',
      label: 'Low',
    };
  };

  const style = getScoreStyle();

  const getWarningStyle = (type) => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          text: 'text-red-200',
          Icon: ShieldAlert,
        };
      case 'info':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          text: 'text-blue-200',
          Icon: Info,
        };
      default:
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/30',
          text: 'text-amber-200',
          Icon: AlertTriangle,
        };
    }
  };

  return (
    <>
      {/* Integrity Score Badge — top right */}
      <motion.div
        className={`absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full ${style.bg} border ${style.border} backdrop-blur-md`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
      >
        <Shield className={`w-3.5 h-3.5 ${style.text}`} />
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold tabular-nums ${style.text}`}>
            {focusScore}
          </span>
          <span className={`text-[9px] ${style.text} opacity-70`}>
            {style.label}
          </span>
        </div>
      </motion.div>

      {/* Warning Toasts — top area of candidate panel (below score badge) */}
      <div className="absolute top-16 left-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {warnings.map((warning) => {
            const ws = getWarningStyle(warning.type);
            return (
              <motion.div
                key={warning.id}
                layout
                className={`flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-md text-xs font-medium ${ws.bg} border ${ws.border} ${ws.text}`}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.9 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <ws.Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{warning.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
