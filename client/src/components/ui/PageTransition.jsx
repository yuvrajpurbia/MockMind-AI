import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    rotateY: -15,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    rotateY: 15,
    scale: 0.95,
    transition: {
      duration: 0.4,
    },
  },
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
}
