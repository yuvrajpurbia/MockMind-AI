import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function GlowButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  className = ''
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden
        bg-gradient-to-r from-cyber-blue to-cyber-purple
        hover:from-cyber-purple hover:to-cyber-blue
        transition-all duration-300 shimmer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={{
        scale: 1.08,
        y: -5,
        boxShadow: '0 20px 60px rgba(0, 212, 255, 0.6), 0 0 80px rgba(168, 85, 247, 0.4)',
      }}
      whileTap={{ scale: 0.92 }}
      style={{
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
      }}
      animate={!disabled && !loading ? {
        boxShadow: [
          '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
          '0 0 40px rgba(0, 212, 255, 0.7), 0 0 80px rgba(168, 85, 247, 0.5)',
          '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
        ]
      } : {}}
      transition={{
        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      }}
    >
      {loading ? (
        <motion.div
          className="flex items-center justify-center gap-2"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Loader2 className="animate-spin" size={24} />
        </motion.div>
      ) : (
        <span className="relative z-10">{children}</span>
      )}

      {/* Animated background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyber-purple via-cyber-blue to-cyber-accent opacity-0"
        animate={{ opacity: [0, 0.3, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Pulse ring effect */}
      {!disabled && !loading && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-white"
          animate={{ scale: [1, 1.1, 1.2], opacity: [0.5, 0.2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
