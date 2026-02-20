import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, PhoneOff } from 'lucide-react';

/**
 * Bottom controls bar for the video call interface
 * Mimics Zoom/Meet control bar with glass morphism styling
 */
export default function ControlsBar({
  isMicOn,
  isCameraOn,
  isAIMuted,
  onToggleMic,
  onToggleCamera,
  onToggleAIMute,
  onEndInterview,
  disabled = false,
  compact = false,
}) {
  const iconSize = compact ? 'w-4 h-4' : 'w-5 h-5';
  const buttonBase = compact
    ? 'relative p-3 rounded-full transition-all duration-200 flex items-center justify-center min-w-[44px] min-h-[44px]'
    : 'relative p-4 rounded-full transition-all duration-200 flex items-center justify-center min-w-[44px] min-h-[44px]';

  const containerClass = compact
    ? 'flex items-center justify-center gap-3 py-2 px-5 bg-black/60 backdrop-blur-md rounded-full border border-white/15'
    : 'flex items-center justify-center gap-4 py-4 px-8 glass-morphism rounded-2xl border border-white/10';

  return (
    <motion.div
      className={containerClass}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Mic Toggle */}
      <motion.button
        onClick={onToggleMic}
        disabled={disabled}
        className={`${buttonBase} ${
          isMicOn
            ? 'bg-cyber-gray/60 hover:bg-cyber-gray/80 border border-white/10'
            : 'bg-red-500/80 hover:bg-red-500 border border-red-400/50'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isMicOn ? (
          <Mic className={`${iconSize} text-white`} />
        ) : (
          <MicOff className={`${iconSize} text-white`} />
        )}
      </motion.button>

      {/* Camera Toggle */}
      <motion.button
        onClick={onToggleCamera}
        disabled={disabled}
        className={`${buttonBase} ${
          isCameraOn
            ? 'bg-cyber-gray/60 hover:bg-cyber-gray/80 border border-white/10'
            : 'bg-red-500/80 hover:bg-red-500 border border-red-400/50'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
      >
        {isCameraOn ? (
          <Video className={`${iconSize} text-white`} />
        ) : (
          <VideoOff className={`${iconSize} text-white`} />
        )}
      </motion.button>

      {/* AI Mute Toggle */}
      <motion.button
        onClick={onToggleAIMute}
        disabled={disabled}
        className={`${buttonBase} ${
          isAIMuted
            ? 'bg-yellow-500/60 hover:bg-yellow-500/80 border border-yellow-400/50'
            : 'bg-cyber-gray/60 hover:bg-cyber-gray/80 border border-white/10'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isAIMuted ? 'Unmute AI' : 'Mute AI'}
      >
        {isAIMuted ? (
          <VolumeX className={`${iconSize} text-yellow-200`} />
        ) : (
          <Volume2 className={`${iconSize} text-white`} />
        )}
      </motion.button>

      {/* Divider */}
      <div className={`w-px bg-white/10 ${compact ? 'h-6 mx-1' : 'h-8 mx-2'}`} />

      {/* End Interview */}
      <motion.button
        onClick={onEndInterview}
        disabled={disabled}
        className={`${buttonBase} bg-red-600 hover:bg-red-500 border border-red-400/50 ${compact ? 'px-4' : 'px-6'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="End interview"
      >
        <PhoneOff className={`${iconSize} text-white`} />
        {!compact && <span className="ml-2 text-white text-sm font-medium">End</span>}
      </motion.button>
    </motion.div>
  );
}
