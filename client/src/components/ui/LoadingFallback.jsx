import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
      <motion.div
        className="glass-morphism rounded-2xl p-12 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Loader2 className="w-10 h-10 text-cyber-blue animate-spin mx-auto mb-4" />
        <p className="text-gray-300 font-medium">Loading...</p>
      </motion.div>
    </div>
  );
}
