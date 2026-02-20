import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, User } from 'lucide-react';

export default function AIInterviewer({
  isSpeaking = false,
  personality = 'professional',
  onMuteToggle
}) {
  const [isMuted, setIsMuted] = useState(false);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (onMuteToggle) onMuteToggle(!isMuted);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-cyber-dark via-cyber-gray to-cyber-darker rounded-2xl overflow-hidden border-2 border-cyber-blue/30">
      {/* Ambient Background */}
      <div className="absolute inset-0">
        {/* Soft Spotlight Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* AI Character Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
        {/* Avatar Circle with Glow */}
        <motion.div
          className="relative"
          animate={isSpeaking ? {
            scale: [1, 1.02, 1],
          } : {}}
          transition={{
            duration: 0.8,
            repeat: isSpeaking ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {/* Outer Glow Ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={isSpeaking ? {
              boxShadow: [
                '0 0 30px rgba(0, 212, 255, 0.3)',
                '0 0 60px rgba(0, 212, 255, 0.6)',
                '0 0 30px rgba(0, 212, 255, 0.3)',
              ]
            } : {
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)'
            }}
            transition={{
              duration: 1.5,
              repeat: isSpeaking ? Infinity : 0,
              ease: "easeInOut"
            }}
          />

          {/* AI Avatar */}
          <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 backdrop-blur-sm border-4 border-cyber-blue/50 overflow-hidden">
            {/* Avatar Face */}
            <AIFace isSpeaking={isSpeaking} personality={personality} />
          </div>
        </motion.div>

        {/* AI Name & Role */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-white mb-1">
            {personality === 'professional' ? 'Sarah Mitchell' :
             personality === 'technical' ? 'Alex Rivera' :
             'Jordan Chen'}
          </h3>
          <p className="text-cyber-blue text-sm">
            {personality === 'professional' ? 'Senior HR Manager' :
             personality === 'technical' ? 'Tech Lead' :
             'Startup Founder'}
          </p>
        </motion.div>

        {/* Speaking Indicator */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-blue/20 border border-cyber-blue/50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.div
                className="flex gap-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-4 bg-cyber-blue rounded-full"
                    animate={{
                      scaleY: [1, 1.5, 0.8, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
              <span className="text-sm text-cyber-blue font-medium">Speaking...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mute Button */}
      <motion.button
        onClick={handleMuteToggle}
        className="absolute top-4 right-4 p-3 rounded-full glass-morphism border border-cyber-blue/30 hover:border-cyber-blue transition-all z-20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-red-400" />
        ) : (
          <Volume2 className="w-5 h-5 text-cyber-blue" />
        )}
      </motion.button>

      {/* Environment Label */}
      <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-cyber-darker/80 border border-cyber-blue/20 text-xs text-gray-400">
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live Interview
        </span>
      </div>
    </div>
  );
}

// AI Face Component with Animations
function AIFace({ isSpeaking, personality }) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Blinking Animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000); // Random blink every 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Simple Avatar Illustration */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 20px rgba(0, 212, 255, 0.3))' }}
      >
        {/* Head */}
        <circle
          cx="100"
          cy="90"
          r="60"
          fill="url(#skinGradient)"
          stroke="rgba(0, 212, 255, 0.3)"
          strokeWidth="2"
        />

        {/* Hair */}
        <path
          d="M 40 80 Q 40 30, 100 30 Q 160 30, 160 80"
          fill={personality === 'professional' ? '#4B5563' :
                personality === 'technical' ? '#1F2937' : '#374151'}
        />

        {/* Eyes */}
        <motion.g
          animate={isBlinking ? { scaleY: 0.1 } : { scaleY: 1 }}
          transition={{ duration: 0.1 }}
        >
          {/* Left Eye */}
          <ellipse cx="80" cy="85" rx="8" ry="12" fill="#1F2937" />
          <circle cx="82" cy="87" r="4" fill="url(#eyeGradient)" />
          <circle cx="83" cy="86" r="2" fill="white" />

          {/* Right Eye */}
          <ellipse cx="120" cy="85" rx="8" ry="12" fill="#1F2937" />
          <circle cx="122" cy="87" r="4" fill="url(#eyeGradient)" />
          <circle cx="123" cy="86" r="2" fill="white" />
        </motion.g>

        {/* Eyebrows */}
        <path
          d="M 70 75 Q 80 73, 90 75"
          stroke="#1F2937"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 110 75 Q 120 73, 130 75"
          stroke="#1F2937"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Nose */}
        <path
          d="M 100 95 L 95 105"
          stroke="rgba(0, 0, 0, 0.2)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Mouth - Animates when speaking */}
        <motion.path
          d={isSpeaking
            ? "M 85 115 Q 100 125, 115 115" // Open mouth
            : "M 85 115 Q 100 118, 115 115"  // Closed smile
          }
          stroke="#D97706"
          strokeWidth="3"
          fill={isSpeaking ? "rgba(217, 118, 6, 0.3)" : "none"}
          strokeLinecap="round"
          animate={isSpeaking ? {
            d: [
              "M 85 115 Q 100 118, 115 115",
              "M 85 115 Q 100 125, 115 115",
              "M 85 115 Q 100 122, 115 115",
              "M 85 115 Q 100 125, 115 115",
            ]
          } : {}}
          transition={{
            duration: 0.6,
            repeat: isSpeaking ? Infinity : 0,
            ease: "easeInOut"
          }}
        />

        {/* Neck/Shoulders */}
        <rect
          x="70"
          y="140"
          width="60"
          height="40"
          fill={personality === 'professional' ? '#3B82F6' :
                personality === 'technical' ? '#1F2937' : '#10B981'}
          rx="5"
        />

        {/* Collar */}
        <path
          d="M 85 145 L 100 160 L 115 145"
          fill="white"
          opacity="0.9"
        />

        {/* Gradients */}
        <defs>
          <radialGradient id="skinGradient">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#FDBA74" />
          </radialGradient>
          <radialGradient id="eyeGradient">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </radialGradient>
        </defs>
      </svg>

      {/* Subtle Head Movement when Speaking */}
      <motion.div
        className="absolute inset-0"
        animate={isSpeaking ? {
          rotate: [-1, 1, -0.5, 0.5, 0],
        } : {}}
        transition={{
          duration: 2,
          repeat: isSpeaking ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
