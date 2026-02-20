import { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import AIInterviewer3D from '../components/interview/AIInterviewer3D';
import SynchronizedCaption from '../components/interview/SynchronizedCaption';
import useEnhancedTTS from '../hooks/useEnhancedTTS';
import GlowButton from '../components/ui/GlowButton';
import { Play, Square } from 'lucide-react';

/**
 * Demo page to showcase the 3D AI Interviewer
 */
export default function AIDemo() {
  const { speak, stop, isSpeaking, audioData } = useEnhancedTTS();
  const [selectedPersonality, setSelectedPersonality] = useState('professional');

  const demoQuestion = "Welcome to MockMind AI! I'm your AI interviewer. Today, we'll be conducting a comprehensive interview to assess your skills and abilities. Can you tell me about your background and what brought you here today?";

  const personalities = [
    { value: 'professional', name: 'Sarah Mitchell', role: 'Senior HR Manager' },
    { value: 'technical', name: 'Alex Rivera', role: 'Tech Lead' },
    { value: 'startup', name: 'Jordan Chen', role: 'Startup Founder' }
  ];

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(demoQuestion);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-dark relative overflow-hidden py-12">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black mb-4">
              <span className="neon-text">3D AI Interviewer Demo</span>
            </h1>
            <p className="text-cyber-blue-dim text-xl">
              Experience the future of AI-powered interviews with realistic 3D avatars
            </p>
          </motion.div>

          {/* Personality Selector */}
          <motion.div
            className="glass-morphism rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4 text-center">Choose Your Interviewer</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {personalities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSelectedPersonality(p.value)}
                  className={`
                    p-4 rounded-xl transition-all duration-300
                    ${selectedPersonality === p.value
                      ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple border-2 border-cyber-blue shadow-lg shadow-cyber-blue/50'
                      : 'glass-effect border border-cyber-gray hover:border-cyber-blue'
                    }
                  `}
                >
                  <h4 className="font-bold text-lg">{p.name}</h4>
                  <p className="text-sm text-cyber-blue-dim">{p.role}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 3D Interviewer Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - 3D Avatar */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="aspect-video rounded-2xl overflow-hidden" style={{ height: '500px' }}>
                <AIInterviewer3D
                  isSpeaking={isSpeaking}
                  audioData={audioData}
                  personality={selectedPersonality}
                  onMuteToggle={(muted) => muted && stop()}
                />
              </div>
            </motion.div>

            {/* Right - Controls & Caption */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Synchronized Caption */}
              <SynchronizedCaption
                text={demoQuestion}
                isSpeaking={isSpeaking}
                speed={120}
              />

              {/* Control Button */}
              <GlowButton
                onClick={handleSpeak}
                className="w-full text-xl py-6"
              >
                <span className="flex items-center justify-center gap-3">
                  {isSpeaking ? (
                    <>
                      <Square className="w-6 h-6" />
                      Stop Speaking
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      Start Demo
                    </>
                  )}
                </span>
              </GlowButton>

              {/* Features List */}
              <div className="glass-morphism rounded-2xl p-6">
                <h4 className="font-bold text-lg mb-4 text-cyber-blue">Features:</h4>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyber-accent text-lg">✓</span>
                    <span><strong>True 3D Avatar:</strong> Rendered with React Three Fiber for realistic depth and lighting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyber-accent text-lg">✓</span>
                    <span><strong>Advanced Lip-Sync:</strong> Mouth movements synchronized with audio volume in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyber-accent text-lg">✓</span>
                    <span><strong>Natural Animations:</strong> Blinking, breathing, head movements, and speaking gestures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyber-accent text-lg">✓</span>
                    <span><strong>Enhanced Voice:</strong> Premium TTS voices with optimized clarity and natural tone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyber-accent text-lg">✓</span>
                    <span><strong>Live Captions:</strong> Word-by-word highlighting synchronized with speech</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyber-accent text-lg">✓</span>
                    <span><strong>Multiple Personalities:</strong> Different interviewers with unique appearances</span>
                  </li>
                </ul>
              </div>

              {/* Audio Visualization */}
              {isSpeaking && (
                <motion.div
                  className="glass-morphism rounded-2xl p-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h4 className="font-bold text-sm mb-3 text-cyber-blue">Audio Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-20">Volume:</span>
                      <div className="flex-1 h-2 bg-cyber-gray rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
                          animate={{ width: `${(audioData?.volume || 0) * 100}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      <span className="text-xs font-mono text-cyber-blue">
                        {Math.round((audioData?.volume || 0) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-20">Frequency:</span>
                      <div className="flex-1 h-2 bg-cyber-gray rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyber-purple to-cyber-accent"
                          animate={{ width: `${((audioData?.frequency || 0) / 300) * 100}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      <span className="text-xs font-mono text-cyber-purple">
                        {Math.round(audioData?.frequency || 0)} Hz
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Back to Home */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <a
              href="/"
              className="text-cyber-blue-dim hover:text-cyber-blue transition-colors text-sm font-medium"
            >
              ← Back to Home
            </a>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
