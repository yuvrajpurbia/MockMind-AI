import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Rocket, Sparkles } from 'lucide-react';

/**
 * 3D Welcome popup shown when the user first opens the app.
 * Full-screen overlay with backdrop blur and a floating card.
 *
 * Props:
 *   onStart  - callback when the user clicks "Start Interview"
 */
export default function WelcomePopup({ onStart }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop blur */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onStart}
      />

      {/* Ambient glow orbs */}
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-cyber-blue/15 blur-3xl pointer-events-none"
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '15%', left: '10%' }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-cyber-purple/15 blur-3xl pointer-events-none"
        animate={{
          x: [0, -35, 0],
          y: [0, 25, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ bottom: '10%', right: '8%' }}
      />

      {/* 3D Floating Card */}
      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 60, scale: 0.85, rotateX: 15 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, y: -40, scale: 0.9, rotateX: -10 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Tilt
          tiltMaxAngleX={8}
          tiltMaxAngleY={8}
          scale={1.02}
          transitionSpeed={400}
          glareEnable={true}
          glareMaxOpacity={0.15}
          glareColor="#00d4ff"
          glarePosition="all"
          perspective={1200}
        >
          <div
            className="relative rounded-3xl p-10 overflow-hidden border border-white/10"
            style={{
              background:
                'linear-gradient(135deg, rgba(15,15,35,0.95) 0%, rgba(10,10,30,0.98) 100%)',
              boxShadow:
                '0 0 60px rgba(0,212,255,0.15), 0 0 120px rgba(168,85,247,0.1), 0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Top decorative line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent" />

            {/* Floating particle dots */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-cyber-blue/40"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 18}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.3,
                }}
              />
            ))}

            {/* Icon */}
            <motion.div
              className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15))',
                border: '1px solid rgba(0,212,255,0.2)',
              }}
              animate={{
                y: [0, -6, 0],
                boxShadow: [
                  '0 0 20px rgba(0,212,255,0.2)',
                  '0 0 35px rgba(0,212,255,0.4)',
                  '0 0 20px rgba(0,212,255,0.2)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Rocket className="w-8 h-8 text-cyber-blue" />
            </motion.div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl font-black text-center mb-3 leading-tight">
              <span className="bg-gradient-to-r from-white via-cyber-blue to-cyber-purple bg-clip-text text-transparent">
                Let's Start Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-accent bg-clip-text text-transparent">
                Interview
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-center text-gray-400 text-sm sm:text-base mb-8 max-w-xs mx-auto leading-relaxed">
              Prepare like it's the real one. AI-powered, private, and built to
              sharpen your edge.
            </p>

            {/* CTA Button */}
            <motion.button
              onClick={onStart}
              className="relative w-full py-4 rounded-2xl font-bold text-lg overflow-hidden bg-gradient-to-r from-cyber-blue to-cyber-purple text-white"
              whileHover={{
                scale: 1.04,
                boxShadow:
                  '0 15px 50px rgba(0,212,255,0.5), 0 0 60px rgba(168,85,247,0.3)',
              }}
              whileTap={{ scale: 0.96 }}
              style={{
                boxShadow:
                  '0 0 30px rgba(0,212,255,0.4), 0 0 50px rgba(168,85,247,0.2)',
              }}
              animate={{
                boxShadow: [
                  '0 0 30px rgba(0,212,255,0.4), 0 0 50px rgba(168,85,247,0.2)',
                  '0 0 40px rgba(0,212,255,0.6), 0 0 70px rgba(168,85,247,0.4)',
                  '0 0 30px rgba(0,212,255,0.4), 0 0 50px rgba(168,85,247,0.2)',
                ],
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Start Interview
              </span>

              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatDelay: 1,
                }}
              />
            </motion.button>

            {/* Bottom hint */}
            <p className="text-center text-gray-500 text-xs mt-5">
              100% local &bull; No data leaves your machine
            </p>

            {/* Bottom decorative line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-cyber-purple to-transparent" />
          </div>
        </Tilt>
      </motion.div>
    </motion.div>
  );
}
