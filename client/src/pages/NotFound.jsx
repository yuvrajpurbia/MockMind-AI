import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/ui/PageTransition';
import GlowButton from '../components/ui/GlowButton';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <motion.div
          className="relative z-10 text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-8xl font-black mb-4 bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            404
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
          <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex gap-3 justify-center">
            <GlowButton onClick={() => navigate('/')} className="px-8">
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4" /> Go Home
              </span>
            </GlowButton>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
