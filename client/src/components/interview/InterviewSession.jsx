import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2, Clock, Volume2, VolumeX } from 'lucide-react';
import VideoCallLayout from './VideoCallLayout';
import QuestionDisplay from './QuestionDisplay';
import CandidateListeningOverlay from './CandidateListeningOverlay';
import IntegritySummary from './IntegritySummary';
import GlowButton from '../ui/GlowButton';
import useCamera from '../../hooks/useCamera';
import useInterviewMonitor from '../../hooks/useInterviewMonitor';
import useSpeechMetrics from '../../hooks/useSpeechMetrics';
import useAmbientSound from '../../hooks/useAmbientSound';
import { submitAnswer, endInterview } from '../../services/api';

/**
 * Interview states:
 *   INTRO              — AI greets candidate, settling time
 *   ASKING_QUESTION    — AI speaks the question, avatar lip-syncs
 *   LISTENING          — user speaks, VoiceRecorder active, 2-min timer running
 *   PROCESSING         — answer submitted, waiting for evaluation
 *   SPEAKING_FEEDBACK  — AI speaks evaluation feedback verbally
 *   TRANSITIONING      — brief pause before next question
 */
const STATES = {
  INTRO: 'INTRO',
  ASKING_QUESTION: 'ASKING_QUESTION',
  LISTENING: 'LISTENING',
  PROCESSING: 'PROCESSING',
  SPEAKING_FEEDBACK: 'SPEAKING_FEEDBACK',
  TRANSITIONING: 'TRANSITIONING',
  COMPLETED: 'COMPLETED',
};

const ANSWER_TIME_LIMIT = 120; // 2 minutes in seconds
const WARNING_THRESHOLD = 15;  // show warning at 15 seconds

// --- Filler phrases for natural transitions ---
const QUESTION_FILLERS = [
  'Alright.',
  'Okay, next one.',
  "Let's move on.",
  'Right.',
  'Okay.',
  "Here's the next one.",
  "Let's continue.",
];

const POSITIVE_REACTIONS = [
  'Great answer.',
  'Well said.',
  'Good points.',
  'Nice explanation.',
  'That was thorough.',
  'Solid answer.',
];

const NEUTRAL_REACTIONS = [
  'I see.',
  'Okay.',
  'Understood.',
  'Thank you for that.',
  'Alright.',
];

const WEAK_REACTIONS = [
  'Let me give you some feedback.',
  'Interesting perspective.',
  'I appreciate the effort.',
  'Let me share some thoughts.',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Role-specific section label prefixes for a professional feel
const ROLE_SECTION_PREFIX = {
  'Frontend Developer': 'Frontend',
  'Backend Developer': 'Backend',
  'Full Stack Developer': 'Full Stack',
  'Salesforce Developer': 'Salesforce',
  'Software Engineer': 'Engineering',
  'Data Scientist': 'Data Science',
  'Product Manager': 'Product',
  'Designer': 'Design',
};

// --- Section mapping based on question number and role ---
function getSectionLabel(questionNumber, totalQuestions, interviewState, role) {
  const prefix = ROLE_SECTION_PREFIX[role] || 'Technical';
  if (interviewState === STATES.INTRO) return 'Introduction';
  if (questionNumber <= Math.ceil(totalQuestions * 0.2)) return 'Introduction';
  if (questionNumber <= Math.ceil(totalQuestions * 0.7)) return `${prefix} Technical Round`;
  if (questionNumber <= totalQuestions) return `${prefix} Behavioral Round`;
  return 'Closing';
}

// Map section labels to interview type for tone variation
function getInterviewType(section) {
  if (section === 'Introduction') return 'hr';
  if (section.includes('Technical')) return 'technical';
  if (section.includes('Behavioral')) return 'behavioral';
  if (section === 'Closing') return 'hr';
  return 'default';
}

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Router state from InterviewSetup
  const routerState = location.state || {};
  const userName = routerState.userName || 'Candidate';
  const interviewRole = routerState.role || '';
  const interviewLevel = routerState.level || '';

  // --- Core interview state ---
  const [interviewState, setInterviewState] = useState(STATES.INTRO);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcript, setTranscript] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  // --- TTS / avatar state ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioData, setAudioData] = useState({ volume: 0, frequency: 0 });
  const [isAIMuted, setIsAIMuted] = useState(false);
  const [currentTTSText, setCurrentTTSText] = useState('');
  const [currentFiller, setCurrentFiller] = useState('');
  const [captionLabel, setCaptionLabel] = useState('Introduction');

  // --- Camera & monitoring ---
  const { stream: cameraStream, isActive: cameraActive, error: cameraError, startCamera, stopCamera } = useCamera();
  const [isMicOn, setIsMicOn] = useState(true);
  const cameraVideoRef = useRef(null);
  const monitor = useInterviewMonitor(cameraVideoRef, null);

  // --- Speech metrics (real-time psychological feedback) ---
  const { metrics: speechMetrics, updateMetrics: updateSpeechMetrics, reset: resetSpeechMetrics } = useSpeechMetrics();

  // --- Ambient sound ---
  const ambientSound = useAmbientSound();

  // --- Emotion state for AI avatar micro-expressions ---
  const [emotionState, setEmotionState] = useState('neutral');

  // --- Current question difficulty (1-5, from backend) ---
  const [currentDifficulty, setCurrentDifficulty] = useState(null);

  const feedbackRef = useRef(null);
  const firstQuestionRef = useRef(null);
  const introTimerRef = useRef(null);
  const reportIdRef = useRef(null);
  const voiceRecorderRef = useRef(null);
  const transcriptRef = useRef('');

  // --- Countdown timer state ---
  const [timeRemaining, setTimeRemaining] = useState(ANSWER_TIME_LIMIT);
  const timerRef = useRef(null);
  const autoSubmittedRef = useRef(false);

  // Integrity summary data (captured at end of interview)
  const [integritySummary, setIntegritySummary] = useState(null);

  // Derive isListening for the avatar
  const isListening = interviewState === STATES.LISTENING;

  // Derive section label and interview type for voice tone
  const sectionLabel = useMemo(
    () => getSectionLabel(questionNumber, totalQuestions, interviewState, interviewRole),
    [questionNumber, totalQuestions, interviewState, interviewRole]
  );
  const interviewType = useMemo(() => getInterviewType(sectionLabel), [sectionLabel]);

  // Build the intro greeting
  const personalityNames = {
    professional: 'Sarah Mitchell',
    technical: 'Alex Rivera',
    startup: 'Jordan Chen',
  };
  const aiName = personalityNames['professional'];

  const buildIntroText = () => {
    const rolePart = interviewRole
      ? ` for the ${interviewLevel} ${interviewRole} position`
      : '';
    return `Hello ${userName}, welcome to your interview${rolePart}. I'm ${aiName}, and I'll be your interviewer today. Take a moment to adjust your camera and get comfortable. When you're ready, I'll begin with the first question. Good luck!`;
  };

  // --- Initialize: start camera, monitoring, and intro ---
  useEffect(() => {
    if (routerState.firstQuestion?.question) {
      firstQuestionRef.current = routerState.firstQuestion.question;
      setCurrentDifficulty(routerState.firstQuestion.difficulty || null);
    } else if (!routerState.firstQuestion) {
      setError('No question loaded. Please start a new interview from the home page.');
    }

    startCamera();
    monitor.startMonitoring();

    const introText = buildIntroText();
    setCurrentTTSText(introText);
    setCurrentFiller('');
    setCaptionLabel('Introduction');

    return () => {
      stopCamera();
      monitor.stopMonitoring();
      ambientSound.stop();
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Sync a hidden video element for monitoring hook ---
  useEffect(() => {
    if (!cameraVideoRef.current) {
      const el = document.createElement('video');
      el.autoplay = true;
      el.playsInline = true;
      el.muted = true;
      el.style.position = 'fixed';
      el.style.top = '-9999px';
      el.style.left = '-9999px';
      el.style.width = '1px';
      el.style.height = '1px';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      document.body.appendChild(el);
      cameraVideoRef.current = el;
    }

    if (cameraStream && cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = cameraStream;
    }

    return () => {
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = null;
      }
    };
  }, [cameraStream]);

  // Cleanup hidden video element on unmount
  useEffect(() => {
    return () => {
      if (cameraVideoRef.current && cameraVideoRef.current.parentNode) {
        cameraVideoRef.current.parentNode.removeChild(cameraVideoRef.current);
      }
    };
  }, []);

  // Keep a ref in sync with transcript for timer callback
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // --- Derive emotion state from interview state + last feedback score ---
  useEffect(() => {
    switch (interviewState) {
      case STATES.INTRO:
        setEmotionState('interested');
        break;
      case STATES.ASKING_QUESTION:
        setEmotionState('neutral');
        break;
      case STATES.LISTENING:
        setEmotionState('interested');
        break;
      case STATES.PROCESSING:
        setEmotionState('thinking');
        break;
      case STATES.SPEAKING_FEEDBACK: {
        const score = feedback?.score || 0;
        setEmotionState(score >= 70 ? 'approving' : score >= 40 ? 'neutral' : 'concerned');
        break;
      }
      case STATES.TRANSITIONING:
        setEmotionState('neutral');
        break;
      default:
        setEmotionState('neutral');
    }
  }, [interviewState, feedback]);

  // =============================================
  // COUNTDOWN TIMER — start/stop with LISTENING
  // =============================================
  useEffect(() => {
    if (interviewState === STATES.LISTENING) {
      // Reset timer each time we enter LISTENING
      setTimeRemaining(ANSWER_TIME_LIMIT);
      autoSubmittedRef.current = false;

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up — auto-submit
            clearInterval(timerRef.current);
            timerRef.current = null;
            autoSubmittedRef.current = true;

            // Force-stop the voice recorder
            voiceRecorderRef.current?.stop();

            // Submit after a brief pause for the final transcript to finalize
            setTimeout(() => {
              doSubmitAnswer(transcriptRef.current, true);
            }, 600);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Clear timer when leaving LISTENING
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [interviewState]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- TTS speaking state callback ---
  const handleSpeakingChange = useCallback((speaking, data) => {
    setIsSpeaking(speaking);
    setAudioData(data || { volume: 0, frequency: 0 });
  }, []);

  // --- When AI finishes speaking intro, settle then start first question ---
  const handleIntroSpeechEnd = useCallback(() => {
    if (interviewState !== STATES.INTRO) return;

    introTimerRef.current = setTimeout(() => {
      if (firstQuestionRef.current) {
        setCurrentQuestion(firstQuestionRef.current);
        setCurrentTTSText(firstQuestionRef.current);
        setCurrentFiller('');
        setCaptionLabel('Question');
        setInterviewState(STATES.ASKING_QUESTION);
      }
    }, 2000);
  }, [interviewState]);

  // --- When AI finishes speaking the question, move to LISTENING ---
  const handleQuestionSpeechEnd = useCallback(() => {
    if (interviewState === STATES.ASKING_QUESTION) {
      setInterviewState(STATES.LISTENING);
    }
  }, [interviewState]);

  // --- When AI finishes speaking feedback, move to TRANSITIONING ---
  const handleFeedbackSpeechEnd = useCallback(() => {
    if (interviewState === STATES.SPEAKING_FEEDBACK) {
      setInterviewState(STATES.TRANSITIONING);

      const nextData = feedbackRef.current;
      if (nextData?.shouldContinue && questionNumber < totalQuestions) {
        const transitionDelay = 1500 + Math.random() * 1000;
        setTimeout(() => {
          const next = nextData.nextQuestion;
          const nextQ = next?.question || next;
          setCurrentQuestion(nextQ);
          setCurrentTTSText(nextQ);
          setCurrentFiller(pickRandom(QUESTION_FILLERS));
          setCaptionLabel('Question');
          setQuestionNumber((prev) => prev + 1);
          setTranscript('');
          setFeedback(null);
          setFeedbackText('');
          setCurrentDifficulty(next?.difficulty || null);
          resetSpeechMetrics();
          setInterviewState(STATES.ASKING_QUESTION);
        }, transitionDelay);
      } else {
        setTimeout(() => handleEndInterview(), 1000);
      }
    }
  }, [interviewState, questionNumber, totalQuestions]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Voice recorder handler (read-only, no editing) + speech metrics ---
  const handleTranscriptChange = (newTranscript) => {
    setTranscript(newTranscript);
    updateSpeechMetrics(newTranscript);
  };

  // --- Build natural feedback speech with dynamic reactions ---
  const buildFeedbackSpeech = (result, wasAutoSubmitted = false) => {
    const score = result.evaluation?.score || 0;
    const fb = result.evaluation?.feedback || '';
    const strengths = result.evaluation?.strengths || [];
    const shouldContinue = result.shouldContinue && questionNumber < totalQuestions;

    let speech = '';

    // Prepend "Time's up" if auto-submitted by timer
    if (wasAutoSubmitted) {
      speech = "Time's up. ";
    }

    // Pick reaction based on score
    let reaction;
    if (score >= 80) {
      reaction = pickRandom(POSITIVE_REACTIONS);
    } else if (score >= 50) {
      reaction = pickRandom(NEUTRAL_REACTIONS);
    } else {
      reaction = pickRandom(WEAK_REACTIONS);
    }

    speech += reaction;
    if (fb) speech += ` ${fb}`;
    if (strengths.length > 0 && score >= 60) {
      speech += ` I particularly liked that you mentioned ${strengths[0]}.`;
    }

    if (shouldContinue) {
      const bridges = [
        "Let's move on to the next question.",
        "Now, let me ask you something else.",
        "Moving on.",
        "Let's continue with the next topic.",
      ];
      speech += ` ${pickRandom(bridges)}`;
    } else {
      speech += " That concludes our interview today. Thank you for your time, and let's review your results.";
    }

    return speech;
  };

  // --- Submit answer (shared by manual "Finish" and auto-submit) ---
  const doSubmitAnswer = async (answerText, wasAutoSubmitted = false) => {
    if (!answerText || !answerText.trim()) {
      if (wasAutoSubmitted) {
        answerText = 'No answer provided within the time limit.';
      } else {
        setError('Please speak your answer before finishing.');
        return;
      }
    }

    setInterviewState(STATES.PROCESSING);
    setLoading(true);
    setError('');

    try {
      const response = await submitAnswer(sessionId, { answer: answerText });
      const result = response.data.data;

      setFeedback(result.evaluation);
      feedbackRef.current = result;

      const speech = buildFeedbackSpeech(result, wasAutoSubmitted);
      setFeedbackText(speech);
      setCurrentTTSText(speech);
      setCurrentFiller('');
      setCaptionLabel('Feedback');
      setInterviewState(STATES.SPEAKING_FEEDBACK);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit answer.');
      setInterviewState(STATES.LISTENING);
    } finally {
      setLoading(false);
    }
  };

  // Manual "Finish Answer" button
  const handleFinishAnswer = () => {
    // Stop recording
    voiceRecorderRef.current?.stop();
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Submit with current transcript
    doSubmitAnswer(transcript, false);
  };

  // --- End interview ---
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportError, setReportError] = useState('');

  const handleEndInterview = async () => {
    setLoading(true);
    setReportGenerating(true);
    setReportError('');

    const counters = monitor.getCounters();
    const eventLog = monitor.getEventLog();
    const score = monitor.focusScore;
    monitor.stopMonitoring();

    setIntegritySummary({ focusScore: score, counters, eventLog });
    setInterviewState(STATES.COMPLETED);

    try {
      const response = await endInterview(sessionId);
      reportIdRef.current = response.data.data.reportId;
    } catch (err) {
      console.error('Error ending interview:', err);
      reportIdRef.current = null;
      setReportError('Failed to generate report. Please retry.');
    } finally {
      setLoading(false);
      setReportGenerating(false);
    }
  };

  const handleRetryReport = async () => {
    setLoading(true);
    setReportGenerating(true);
    setReportError('');

    try {
      const response = await endInterview(sessionId);
      reportIdRef.current = response.data.data.reportId;
    } catch (err) {
      console.error('Error retrying report generation:', err);
      reportIdRef.current = null;
      setReportError('Report generation failed again. Please try once more or start a new interview.');
    } finally {
      setLoading(false);
      setReportGenerating(false);
    }
  };

  const handleViewReport = () => {
    if (reportIdRef.current) {
      navigate(`/report/${reportIdRef.current}`);
    }
  };

  // --- Controls ---
  const toggleMic = () => setIsMicOn((prev) => !prev);
  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };
  const toggleAIMute = () => setIsAIMuted((prev) => !prev);
  const retryCamera = () => startCamera();

  // --- TTS auto-play logic ---
  const shouldAutoPlay =
    interviewState === STATES.INTRO ||
    interviewState === STATES.ASKING_QUESTION ||
    interviewState === STATES.SPEAKING_FEEDBACK;

  const speechEndHandler =
    interviewState === STATES.INTRO
      ? handleIntroSpeechEnd
      : interviewState === STATES.ASKING_QUESTION
      ? handleQuestionSpeechEnd
      : interviewState === STATES.SPEAKING_FEEDBACK
      ? handleFeedbackSpeechEnd
      : undefined;

  const isWarning = timeRemaining <= WARNING_THRESHOLD;

  // ========================================
  // ZONE RENDER FUNCTIONS
  // ========================================

  // Content overlaid inside the candidate panel
  const renderCandidateOverlay = () => {
    // INTRO state: compact settling message
    if (interviewState === STATES.INTRO) {
      return (
        <motion.div
          className="flex items-end justify-center h-full pb-4 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-black/50 backdrop-blur-xl rounded-2xl px-5 py-3.5 border border-white/[0.08] max-w-md shadow-lg shadow-black/20">
            <p className="text-gray-300 text-xs text-center leading-relaxed">
              Check your camera framing and get comfortable. The first question begins shortly.
            </p>
          </div>
        </motion.div>
      );
    }

    // LISTENING state: timer + voice recorder + finish button
    if (interviewState === STATES.LISTENING) {
      return (
        <CandidateListeningOverlay
          timeRemaining={timeRemaining}
          totalTime={ANSWER_TIME_LIMIT}
          isWarning={isWarning}
          isMicOn={isMicOn}
          voiceRecorderRef={voiceRecorderRef}
          onTranscriptChange={handleTranscriptChange}
          onStop={(finalTranscript) => setTranscript(finalTranscript)}
          transcript={transcript}
          onFinishAnswer={handleFinishAnswer}
          loading={loading}
        />
      );
    }

    return null;
  };

  // Feedback card overlaid inside the AI panel
  const renderFeedbackOverlay = () => {
    if (!feedback) return null;
    if (interviewState !== STATES.SPEAKING_FEEDBACK && interviewState !== STATES.TRANSITIONING) return null;

    return (
      <motion.div
        className="bg-black/60 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] max-w-sm w-full shadow-xl shadow-black/30"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-cyber-accent">Evaluation</h4>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black ${
              feedback.score >= 80 ? 'text-green-400'
                : feedback.score >= 50 ? 'text-yellow-400'
                : 'text-red-400'
            }`}>{feedback.score}</span>
            <span className="text-gray-500 text-xs">/100</span>
          </div>
        </div>

        <p className="text-gray-300 leading-relaxed mb-4 text-xs" style={{
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}>
          {feedback.feedback}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {feedback.strengths?.length > 0 && (
            <div>
              <h5 className="text-[10px] font-bold text-green-400 mb-1">Strengths</h5>
              <ul className="text-[10px] text-gray-300 space-y-0.5">
                {feedback.strengths.slice(0, 2).map((s, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-green-400 mt-0.5">+</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {feedback.improvements?.length > 0 && (
            <div>
              <h5 className="text-[10px] font-bold text-yellow-400 mb-1">Improve</h5>
              <ul className="text-[10px] text-gray-300 space-y-0.5">
                {feedback.improvements.slice(0, 2).map((imp, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-yellow-400 mt-0.5">-</span> {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {interviewState === STATES.TRANSITIONING && (
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            Moving to next question...
          </p>
        )}
      </motion.div>
    );
  };

  // Processing indicator in AI panel
  const renderProcessingIndicator = () => {
    if (interviewState !== STATES.PROCESSING) return null;

    return (
      <motion.div
        className="flex flex-col items-center gap-3 bg-black/50 backdrop-blur-xl rounded-2xl px-5 py-4 border border-white/[0.06]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader2 className="w-5 h-5 text-cyber-blue animate-spin" />
        <span className="text-gray-400 text-xs font-medium">Evaluating...</span>
      </motion.div>
    );
  };

  // Full-page content for COMPLETED state
  const renderFullPageContent = () => {
    if (interviewState !== STATES.COMPLETED || !integritySummary) return null;

    return (
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <IntegritySummary
            focusScore={integritySummary.focusScore}
            counters={integritySummary.counters}
            eventLog={integritySummary.eventLog}
          />

          {reportGenerating && (
            <motion.div
              className="flex items-center justify-center gap-3 p-4 rounded-xl glass-effect border border-cyber-blue/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-5 h-5 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-300 font-medium">Generating your report...</span>
            </motion.div>
          )}

          {reportError && !reportGenerating && (
            <motion.div
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-red-300 text-sm text-center">{reportError}</p>
              <div className="flex gap-3 justify-center">
                <GlowButton onClick={handleRetryReport} className="px-6">
                  Retry Report Generation
                </GlowButton>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 rounded-xl glass-effect border border-white/10 text-gray-300 text-sm hover:bg-white/5 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          )}

          {reportIdRef.current && !reportGenerating && !reportError && (
            <GlowButton
              onClick={handleViewReport}
              loading={loading}
              className="w-full text-lg py-5"
            >
              View Interview Report
            </GlowButton>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-dark relative overflow-hidden flex flex-col">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto px-4 py-3">
        {/* Slim Header */}
        <motion.div
          className="rounded-2xl py-2.5 px-5 mb-3 flex-shrink-0 bg-black/30 backdrop-blur-md border border-white/[0.06]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            {/* Left: Progress + inline timer */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-cyber-blue">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="font-bold text-xs">
                  {interviewState === STATES.INTRO ? 'Welcome' : `Q${questionNumber}/${totalQuestions}`}
                </span>
              </div>
              {interviewState !== STATES.INTRO && (
                <div className="w-24 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
              {/* Inline countdown — during LISTENING */}
              {interviewState === STATES.LISTENING && (
                <motion.div
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                    isWarning
                      ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                      : 'bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue'
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isWarning ? { opacity: [1, 0.6, 1], scale: 1 } : { opacity: 1, scale: 1 }}
                  transition={isWarning ? { duration: 0.8, repeat: Infinity } : {}}
                >
                  <Clock className="w-3 h-3" />
                  <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                </motion.div>
              )}
            </div>

            {/* Right: Role + ambient toggle */}
            <div className="flex items-center gap-2.5">
              {interviewRole && (
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-400 font-medium hidden sm:inline-block">
                  {interviewLevel} {interviewRole}
                </span>
              )}

              {/* Ambient sound toggle */}
              <motion.button
                onClick={ambientSound.toggle}
                className={`p-1.5 rounded-full border transition-all ${
                  ambientSound.isPlaying
                    ? 'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue'
                    : 'bg-white/[0.04] border-white/[0.08] text-gray-500'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={ambientSound.isPlaying ? 'Mute ambient sound' : 'Play ambient sound'}
              >
                {ambientSound.isPlaying ? (
                  <Volume2 className="w-3 h-3" />
                ) : (
                  <VolumeX className="w-3 h-3" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Headless TTS Controller */}
        <QuestionDisplay
          text={currentTTSText}
          filler={currentFiller}
          delay={interviewState === STATES.INTRO ? 600 : 400}
          autoPlay={shouldAutoPlay}
          personality="professional"
          interviewType={interviewType}
          onSpeakingChange={handleSpeakingChange}
          onSpeechEnd={speechEndHandler}
          muted={isAIMuted}
        />

        {/* Video Call Layout — fills remaining viewport */}
        <div className="flex-1 min-h-0">
          <VideoCallLayout
            isSpeaking={isSpeaking}
            isListening={isListening}
            audioData={audioData}
            personality="professional"
            captionText={currentTTSText}
            captionLabel={captionLabel}
            emotionState={emotionState}
            cameraStream={cameraStream}
            cameraActive={cameraActive}
            cameraError={cameraError}
            onRetryCamera={retryCamera}
            userName={userName}
            monitorData={monitor}
            speechMetrics={speechMetrics}
            isMicOn={isMicOn}
            isCameraOn={cameraActive}
            isAIMuted={isAIMuted}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleAIMute={toggleAIMute}
            onEndInterview={handleEndInterview}
            controlsDisabled={loading}
            interviewState={interviewState}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            sectionLabel={sectionLabel}
            difficulty={currentDifficulty}
            candidateOverlay={renderCandidateOverlay()}
            feedbackOverlay={renderFeedbackOverlay()}
            processingIndicator={renderProcessingIndicator()}
            fullPageContent={renderFullPageContent()}
          />
        </div>

        {/* Error Message — floating at bottom */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 border-2 border-red-500 rounded-xl p-3 max-w-md backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <p className="text-red-200 font-semibold text-center text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
