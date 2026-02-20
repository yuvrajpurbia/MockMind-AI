import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Award } from 'lucide-react';
import InterviewSetup from '../components/interview/InterviewSetup';
import PageTransition from '../components/ui/PageTransition';
import Footer from '../components/layout/Footer';
import ParticleBackground from '../components/ui/ParticleBackground';
import WelcomePopup from '../components/ui/WelcomePopup';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const formRef = useRef(null);

  const handleWelcomeDismiss = useCallback(() => {
    setShowWelcome(false);
    // Smooth scroll to the form after the popup exit animation
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 450);
  }, []);

  return (
    <>
    <PageTransition>
      <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
        {/* Particle Background */}
        <ParticleBackground />

        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] z-0" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-cyber-blue/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-purple/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Hero section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo with 3D Effects */}
            <motion.div
              className="inline-block mb-3 perspective-1000"
              initial={{ scale: 0.8, opacity: 0, rotateY: -30 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotateY: 0,
                y: [0, -10, 0]
              }}
              transition={{
                scale: { duration: 0.8, delay: 0.2 },
                opacity: { duration: 0.8, delay: 0.2 },
                rotateY: { duration: 1, delay: 0.2 },
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
              }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                transition: { duration: 0.3 }
              }}
              style={{
                transformStyle: 'preserve-3d'
              }}
            >
              <motion.img
                src="/logo.png"
                alt="MockMind AI"
                className="w-64 h-64 mx-auto"
                style={{
                  filter: 'drop-shadow(0 0 40px rgba(0, 212, 255, 0.6)) drop-shadow(0 0 80px rgba(168, 85, 247, 0.4))',
                  transform: 'translateZ(50px)'
                }}
                animate={{
                  filter: [
                    'drop-shadow(0 0 40px rgba(0, 212, 255, 0.6)) drop-shadow(0 0 80px rgba(168, 85, 247, 0.4))',
                    'drop-shadow(0 0 50px rgba(0, 212, 255, 0.8)) drop-shadow(0 0 90px rgba(168, 85, 247, 0.6))',
                    'drop-shadow(0 0 40px rgba(0, 212, 255, 0.6)) drop-shadow(0 0 80px rgba(168, 85, 247, 0.4))',
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>

            {/* Creator Credit */}
            <motion.div
              className="mb-6 flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-cyber-blue to-cyber-blue" />
              <motion.p
                className="text-sm font-light tracking-widest uppercase"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 50%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.15em'
                }}
                whileHover={{ scale: 1.05 }}
              >
                By Yuvraj Purbia
              </motion.p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-cyber-purple to-cyber-purple" />
            </motion.div>

            <motion.p
              className="text-xl text-cyber-blue-dim max-w-2xl mx-auto mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Your Personal AI Interview Coach
            </motion.p>

            <motion.p
              className="text-sm text-gray-400 max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Practice interviews with AI-powered feedback • 100% Local & Private • Real-time Evaluation
            </motion.p>

            {/* Feature badges */}
            <motion.div
              className="flex justify-center gap-4 mt-6 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: Zap, text: '100% Local', color: 'text-yellow-400' },
                { icon: Award, text: 'AI-Powered', color: 'text-cyber-blue' },
                { icon: Sparkles, text: 'Real-time Feedback', color: 'text-cyber-accent' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 glass-effect px-5 py-2.5 rounded-full border border-cyber-blue/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                >
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span className="text-sm font-semibold text-white">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Demo Button */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <a
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyber-purple/30 to-cyber-blue/30 border border-cyber-blue/50 hover:border-cyber-blue hover:shadow-lg hover:shadow-cyber-blue/30 transition-all duration-300 text-cyber-blue font-semibold"
              >
                <Sparkles className="w-5 h-5" />
                Try 3D AI Interviewer Demo
              </a>
            </motion.div>
          </motion.div>

          {/* Interview Setup Component */}
          <div ref={formRef}>
            <InterviewSetup />
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </PageTransition>

      {/* Welcome Popup — rendered outside PageTransition so position:fixed works */}
      <AnimatePresence>
        {showWelcome && <WelcomePopup onStart={handleWelcomeDismiss} />}
      </AnimatePresence>
    </>
  );
}
