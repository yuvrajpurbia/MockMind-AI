import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, VideoOff, RefreshCw } from 'lucide-react';
import AIInterviewer3D from './AIInterviewer3D';
import MonitoringOverlay from './MonitoringOverlay';
import ControlsBar from './ControlsBar';
import InterviewOverlay from './InterviewOverlay';
import AudioWaveform from './AudioWaveform';
import FaceFrameGuide from './FaceFrameGuide';
import SpeechMetricsPanel from './SpeechMetricsPanel';
import useLightDetection from '../../hooks/useLightDetection';

/**
 * Zoom/Meet-style split-screen video call layout.
 * AI interviewer on the left (40%), candidate camera on the right (60%).
 *
 * Uses zone-based render props instead of children:
 *   candidateOverlay    — overlaid inside the candidate panel (timer, transcript, etc.)
 *   feedbackOverlay     — overlaid inside the AI panel (evaluation card)
 *   processingIndicator — centered in the AI panel during PROCESSING
 *   fullPageContent     — replaces the entire layout (COMPLETED state)
 */
export default function VideoCallLayout({
  // AI panel props
  isSpeaking,
  isListening,
  audioData,
  personality,
  captionText,
  captionLabel,
  emotionState,

  // Candidate panel props
  cameraStream,
  cameraActive,
  cameraError,
  onRetryCamera,
  userName,

  // Monitoring
  monitorData,

  // Speech metrics
  speechMetrics,

  // Controls
  isMicOn,
  isCameraOn,
  isAIMuted,
  onToggleMic,
  onToggleCamera,
  onToggleAIMute,
  onEndInterview,
  controlsDisabled,

  // Interview state
  interviewState,
  questionNumber,
  totalQuestions,
  sectionLabel,
  difficulty,

  // Zone-based render slots
  candidateOverlay,
  feedbackOverlay,
  processingIndicator,
  fullPageContent,
}) {
  const videoElRef = useRef(null);

  // Light detection for candidate camera
  const { isLowLight, brightnessFilter } = useLightDetection(videoElRef, cameraActive);

  // Mouse parallax on panels
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setParallax({ x: x * 3, y: y * 2 });
  };

  const handleMouseLeave = () => setParallax({ x: 0, y: 0 });

  // Attach the MediaStream to the <video> element
  useEffect(() => {
    if (videoElRef.current) {
      videoElRef.current.srcObject = cameraStream || null;
    }
  }, [cameraStream]);

  // AI interviewer display name
  const aiNames = {
    professional: 'Sarah Mitchell',
    technical: 'Alex Rivera',
    startup: 'Jordan Chen',
  };
  const aiName = aiNames[personality] || aiNames.professional;

  // Difficulty label color
  const difficultyStyle = (() => {
    if (!difficulty) return null;
    if (difficulty <= 2) return { label: 'Easy', cls: 'text-green-400 bg-green-500/10 border-green-500/20' };
    if (difficulty <= 3) return { label: 'Medium', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
    return { label: 'Hard', cls: 'text-red-400 bg-red-500/10 border-red-500/20' };
  })();

  // --- COMPLETED state: full-page takeover ---
  if (fullPageContent && interviewState === 'COMPLETED') {
    return (
      <div className="min-h-0 overflow-y-auto flex-1">
        {fullPageContent}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Environment Overlay Bar */}
      <div className="flex items-center justify-between flex-shrink-0 mb-3">
        <div className="flex items-center gap-3">
          <InterviewOverlay
            interviewState={interviewState}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            sectionLabel={sectionLabel}
          />
          {/* Difficulty badge */}
          {difficultyStyle && interviewState !== 'INTRO' && (
            <motion.div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${difficultyStyle.cls}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              key={difficulty}
            >
              {difficultyStyle.label}
            </motion.div>
          )}
        </div>
      </div>

      {/* Video Panels — 40% AI / 60% Candidate */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4 flex-1 min-h-0">
        {/* Left Panel: AI Interviewer (40%) */}
        <motion.div
          className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-cyber-darker min-h-[180px] lg:min-h-0 shadow-lg shadow-black/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            transform: `perspective(800px) rotateY(${parallax.x * 0.3}deg) rotateX(${-parallax.y * 0.3}deg)`,
          }}
        >
          {/* 10% padding container with 50/50 vertical split */}
          <div className="absolute inset-0 flex flex-col" style={{ padding: '6%' }}>
            {/* Top 50% — 3D Avatar */}
            <div className="relative rounded-2xl overflow-hidden" style={{ height: '55%' }}>
              <AIInterviewer3D
                isSpeaking={isSpeaking}
                isListening={isListening}
                audioData={audioData}
                personality={personality}
                emotionState={emotionState}
                onMuteToggle={onToggleAIMute}
              />

              {/* AI Name badge — inside avatar area */}
              <div className="absolute top-3 left-3 z-10">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.08]">
                  <div className={`w-2 h-2 rounded-full ${
                    isSpeaking ? 'bg-green-400 animate-pulse'
                      : isListening ? 'bg-blue-400'
                      : 'bg-gray-500'
                  }`} />
                  <span className="text-[11px] text-gray-300 font-medium">{aiName}</span>
                  <span className="text-[10px] text-gray-500">
                    {interviewState === 'INTRO' && '— Welcome'}
                    {interviewState === 'ASKING_QUESTION' && '— Speaking'}
                    {interviewState === 'LISTENING' && '— Listening'}
                    {interviewState === 'PROCESSING' && '— Thinking'}
                    {interviewState === 'SPEAKING_FEEDBACK' && '— Feedback'}
                    {interviewState === 'TRANSITIONING' && '— Next...'}
                  </span>
                </div>
              </div>

              {/* Audio waveform when speaking */}
              {isSpeaking && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-cyber-blue/20">
                    <AudioWaveform
                      audioData={audioData}
                      barCount={9}
                      maxHeight={18}
                      minHeight={2}
                      variant="spectrum"
                    />
                  </div>
                </div>
              )}

              {/* Feedback overlay — evaluation card during SPEAKING_FEEDBACK */}
              {feedbackOverlay && (
                <div className="absolute inset-0 z-10 flex items-center justify-center p-3">
                  {feedbackOverlay}
                </div>
              )}

              {/* Processing indicator — centered in avatar area */}
              {processingIndicator && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  {processingIndicator}
                </div>
              )}
            </div>

            {/* Bottom 45% — Captions */}
            <div className="mt-3 flex flex-col" style={{ height: '40%' }}>
              {captionText ? (
                <motion.div
                  className="bg-black/30 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/[0.06] h-full flex flex-col"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={captionLabel}
                >
                  {captionLabel && (
                    <span className={`text-[9px] uppercase tracking-wider font-semibold mb-1.5 block ${
                      captionLabel === 'Feedback' ? 'text-cyber-accent'
                        : captionLabel === 'Introduction' ? 'text-purple-400'
                        : 'text-cyber-blue'
                    }`}>
                      {captionLabel}
                    </span>
                  )}
                  <p className="text-[11px] text-white/85 leading-relaxed flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                    {captionText}
                  </p>
                </motion.div>
              ) : (
                <div className="bg-black/20 rounded-2xl border border-white/[0.04] h-full flex items-center justify-center">
                  <span className="text-[10px] text-gray-600 italic">Waiting for AI to speak...</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Panel: Candidate Camera (60%) */}
        <motion.div
          className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-cyber-darker min-h-[280px] lg:min-h-0 shadow-xl shadow-black/30"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            transform: `perspective(800px) rotateY(${parallax.x * 0.2}deg) rotateX(${-parallax.y * 0.2}deg)`,
          }}
        >
          {cameraActive && cameraStream ? (
            <>
              <video
                ref={videoElRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{
                  transform: 'scaleX(-1)',
                  filter: brightnessFilter !== 1 ? `brightness(${brightnessFilter})` : undefined,
                }}
              />
              {/* Face framing guide */}
              <FaceFrameGuide visible={interviewState === 'INTRO'} isLowLight={isLowLight} />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-cyber-darker gap-4">
              <VideoOff className="w-16 h-16 text-gray-600" />
              {cameraError ? (
                <>
                  <p className="text-gray-400 text-sm text-center px-6 max-w-xs">
                    {cameraError}
                  </p>
                  {onRetryCamera && (
                    <motion.button
                      onClick={onRetryCamera}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-blue/20 border border-cyber-blue/40 text-cyber-blue text-sm font-medium hover:bg-cyber-blue/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry Camera
                    </motion.button>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm">Camera off</p>
              )}
            </div>
          )}

          {/* Candidate name badge — top left */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.08]">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-white font-medium">{userName || 'You'}</span>
            {isMicOn && (
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
          </div>

          {/* REC indicator — top right area near name badge (moved from InterviewOverlay) */}
          {interviewState === 'LISTENING' && (
            <motion.div
              className="absolute top-4 right-20 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/25 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">Rec</span>
            </motion.div>
          )}

          {/* Speech metrics panel — below name badge during LISTENING */}
          {interviewState === 'LISTENING' && speechMetrics && (
            <div className="absolute top-12 right-4 z-10">
              <SpeechMetricsPanel metrics={speechMetrics} visible={true} />
            </div>
          )}

          {/* Low light warning (when not in INTRO — guide already shows it) */}
          {isLowLight && interviewState !== 'INTRO' && (
            <motion.div
              className="absolute top-14 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-[10px] text-yellow-300 font-bold uppercase tracking-wider">
                Low Light
              </span>
            </motion.div>
          )}

          {/* State-dependent overlay content (timer, transcript, submit, etc.) */}
          {candidateOverlay && (
            <div className="absolute inset-x-0 top-14 bottom-20 z-[15] flex flex-col">
              {candidateOverlay}
            </div>
          )}

          {/* Monitoring Overlay */}
          {monitorData && (
            <MonitoringOverlay
              focusScore={monitorData.focusScore}
              warnings={monitorData.warnings}
            />
          )}

          {/* Controls bar — pinned at bottom center, inside candidate panel */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-4 px-5">
            <ControlsBar
              isMicOn={isMicOn}
              isCameraOn={isCameraOn}
              isAIMuted={isAIMuted}
              onToggleMic={onToggleMic}
              onToggleCamera={onToggleCamera}
              onToggleAIMute={onToggleAIMute}
              onEndInterview={onEndInterview}
              disabled={controlsDisabled}
              compact={true}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
