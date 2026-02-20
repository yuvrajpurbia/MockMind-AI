import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

export default function FloatingCard({ children, className = '' }) {
  return (
    <Tilt
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      scale={1.01}
      transitionSpeed={300}
      glareEnable={true}
      glareMaxOpacity={0.15}
      glareColor="#00d4ff"
      glarePosition="all"
      perspective={1000}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`
          glass-effect rounded-2xl p-8
          border border-cyber-blue/20
          shadow-2xl
          ${className}
        `}
      >
        {children}
      </motion.div>
    </Tilt>
  );
}
