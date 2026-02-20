import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicOff } from 'lucide-react';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';

/**
 * Voice-only recorder that auto-starts on mount.
 * No manual start/stop — recording begins immediately.
 *
 * Props:
 *   onTranscriptChange - (text) => void — called on every transcript update
 *   onStop             - (finalTranscript) => void — called when recording stops
 *
 * Ref methods:
 *   .stop()            - programmatically stop recording (used by countdown timer)
 */
const VoiceRecorder = forwardRef(function VoiceRecorder(
  { onTranscriptChange, onStop, compact = false },
  ref
) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  // Expose stop() to parent via ref
  useImperativeHandle(ref, () => ({
    stop() {
      stopListening();
    },
  }), [stopListening]);

  // Auto-start recording on mount
  useEffect(() => {
    resetTranscript();
    const id = setTimeout(() => startListening(), 300);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent of transcript changes
  useEffect(() => {
    if (onTranscriptChange) {
      onTranscriptChange(transcript + interimTranscript);
    }
  }, [transcript, interimTranscript, onTranscriptChange]);

  // Notify parent when recording stops (final transcript)
  useEffect(() => {
    if (!isListening && transcript && onStop) {
      onStop(transcript);
    }
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isSupported) {
    return (
      <motion.div
        className="glass-morphism rounded-2xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <MicOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-400 mb-2">
          Speech Recognition Not Supported
        </h3>
        <p className="text-gray-400">
          Please use Chrome or Edge browser for voice features.
        </p>
      </motion.div>
    );
  }

  // --- Compact overlay mode for candidate panel ---
  if (compact) {
    return (
      <div className="space-y-1">
        {/* Compact audio bars */}
        {isListening && (
          <div className="flex justify-center items-end gap-0.5 h-4">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-gradient-to-t from-red-500 to-pink-400 rounded-full"
                animate={{
                  height: [
                    Math.random() * 3 + 2,
                    Math.random() * 12 + 4,
                    Math.random() * 3 + 2,
                  ],
                }}
                transition={{
                  duration: 0.4 + Math.random() * 0.3,
                  repeat: Infinity,
                  delay: i * 0.04,
                }}
              />
            ))}
          </div>
        )}

        {/* Compact live transcript */}
        {(transcript || interimTranscript) && (
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5 max-h-12 overflow-y-auto">
            <p className="text-white/80 leading-snug text-[11px]">
              {transcript}
              <span className="text-gray-500 italic">{interimTranscript}</span>
              {isListening && (
                <motion.span
                  className="inline-block w-0.5 h-2.5 bg-red-400 ml-0.5 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </p>
          </div>
        )}

        {/* Error — compact */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg px-2 py-1">
            <p className="text-red-300 text-[10px] text-center">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // --- Full-size mode (original) ---
  return (
    <div className="space-y-4">
      {/* Recording indicator + audio visualization */}
      <motion.div
        className="glass-morphism rounded-2xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Recording badge */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            className="w-3 h-3 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-red-400 font-bold text-sm uppercase tracking-wider">
            Recording — Speak your answer
          </span>
        </div>

        {/* Audio visualization bars */}
        {isListening && (
          <motion.div
            className="flex justify-center items-end gap-1 h-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-gradient-to-t from-red-500 to-pink-400 rounded-full"
                animate={{
                  height: [
                    Math.random() * 10 + 4,
                    Math.random() * 32 + 12,
                    Math.random() * 10 + 4,
                  ],
                }}
                transition={{
                  duration: 0.4 + Math.random() * 0.3,
                  repeat: Infinity,
                  delay: i * 0.04,
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Live transcript (read-only) */}
      <AnimatePresence>
        {(transcript || interimTranscript) && (
          <motion.div
            className="glass-morphism rounded-2xl p-5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
              Live Transcript
            </h4>
            <div className="bg-cyber-darker/50 rounded-xl p-4 min-h-[60px] max-h-[180px] overflow-y-auto">
              <p className="text-white leading-relaxed text-sm">
                {transcript}
                <span className="text-gray-500 italic">{interimTranscript}</span>
                {isListening && (
                  <motion.span
                    className="inline-block w-0.5 h-4 bg-red-400 ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="bg-red-500/20 border border-red-500/40 rounded-xl p-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p className="text-red-300 text-sm text-center">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default VoiceRecorder;
