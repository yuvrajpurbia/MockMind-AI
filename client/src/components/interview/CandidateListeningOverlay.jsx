import { motion } from 'framer-motion';
import VoiceRecorder from './VoiceRecorder';

/**
 * Compact overlay for the candidate panel during LISTENING state.
 * Composites: inline countdown timer, compact voice recorder, finish button.
 * Designed to fit entirely within the candidate video panel without scrolling.
 */
export default function CandidateListeningOverlay({
  timeRemaining,
  totalTime,
  isWarning,
  isMicOn,
  voiceRecorderRef,
  onTranscriptChange,
  onStop,
  transcript,
  onFinishAnswer,
  loading,
}) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const progress = timeRemaining / totalTime;

  // Compact timer SVG params
  const size = 52;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const arcColor = isWarning ? '#ef4444' : '#00d4ff';

  return (
    <div className="relative flex flex-col h-full">
      {/* Compact countdown timer — top right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
            style={{
              filter: isWarning
                ? 'drop-shadow(0 0 8px rgba(239,68,68,0.4))'
                : 'drop-shadow(0 0 6px rgba(0,212,255,0.25))',
            }}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={stroke}
              fill="none"
            />
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
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className={`text-xs font-bold tabular-nums ${
                isWarning ? 'text-red-400' : 'text-cyber-blue'
              }`}
              animate={isWarning ? { scale: [1, 1.08, 1] } : {}}
              transition={isWarning ? { duration: 1, repeat: Infinity } : {}}
            >
              {display}
            </motion.span>
          </div>
        </div>
        {isWarning && (
          <motion.p
            className="text-red-400 text-[8px] font-bold uppercase tracking-wider mt-1"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            Hurry
          </motion.p>
        )}
      </div>

      {/* Spacer pushes bottom content down */}
      <div className="flex-1" />

      {/* Bottom section — recording indicator + voice recorder + finish button */}
      <div className="px-4 pb-3 space-y-2.5">
        {/* Recording indicator */}
        <div className="flex items-center gap-2 justify-center">
          <motion.div
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-red-400 font-semibold text-[10px] uppercase tracking-wider">
            Recording
          </span>
        </div>

        {/* Compact voice recorder (audio bars + transcript) */}
        {isMicOn && (
          <VoiceRecorder
            ref={voiceRecorderRef}
            onTranscriptChange={onTranscriptChange}
            onStop={onStop}
            compact={true}
          />
        )}

        {/* Finish Answer button */}
        {transcript?.trim() && (
          <motion.button
            onClick={onFinishAnswer}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-cyber-accent/20 border border-cyber-accent/30 text-cyber-accent font-semibold text-xs hover:bg-cyber-accent/30 transition-colors disabled:opacity-50"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Finish Answer
          </motion.button>
        )}
      </div>
    </div>
  );
}
