# MockMind AI - Complete Project Documentation

**Created by:** Yuvraj Purbia
**Last Updated:** February 20, 2026
**Status:** All 6 Phases Complete - Production Ready
**Repository:** https://github.com/yuvrajpurbia/MockMind-AI

---

## Table of Contents

1. [What is MockMind AI?](#what-is-mockmind-ai)
2. [How It Works (Plain English)](#how-it-works-plain-english)
3. [User Journey Walkthrough](#user-journey-walkthrough)
4. [Tech Stack Explained](#tech-stack-explained)
5. [Architecture & How the Pieces Fit Together](#architecture--how-the-pieces-fit-together)
6. [Complete Feature List](#complete-feature-list)
7. [Project File Structure](#project-file-structure)
8. [Development Phases (What Was Built When)](#development-phases-what-was-built-when)
9. [Technical Deep Dives](#technical-deep-dives)
10. [Setup & Running the Project](#setup--running-the-project)
11. [Known Limitations](#known-limitations)
12. [Resources & References](#resources--references)

---

## What is MockMind AI?

MockMind AI is an **AI-powered interview practice tool** that runs entirely on your own computer. Think of it like having a personal interview coach that:

- **Talks to you** like a real interviewer (asks questions out loud)
- **Listens to your answers** through your microphone
- **Shows a 3D animated interviewer** on screen that moves its lips when speaking and looks at you while listening
- **Evaluates your answers** in real-time and gives feedback after each question
- **Monitors your behavior** (are you looking at the camera? did you switch tabs to look up answers?)
- **Generates a detailed report** at the end showing how you performed

**The key difference from other tools:** Everything runs on YOUR computer. Your interview data, your voice recordings, your scores - nothing ever leaves your machine. There are no monthly fees, no cloud APIs, and no privacy concerns.

**Who is it for?**
- Job seekers preparing for technical interviews
- Developers wanting to practice coding questions verbally
- Anyone who wants to improve their interview skills in a realistic environment

---

## How It Works (Plain English)

Imagine a video call with an interviewer, similar to Zoom or Google Meet:

```
+-----------------------------+------------------------------------------+
|                             |                                          |
|   AI INTERVIEWER (40%)      |        YOU / CANDIDATE (60%)             |
|                             |                                          |
|   +-------------------+    |    +----------------------------------+   |
|   |                   |    |    |                                  |   |
|   |   3D Avatar       |    |    |       Your Webcam Feed           |   |
|   |   (lip-syncing)   |    |    |       (mirrored view)            |   |
|   |                   |    |    |                                  |   |
|   +-------------------+    |    |                                  |   |
|                             |    |                                  |   |
|   +-------------------+    |    |   [Name Badge]  [Integrity Score]|   |
|   |  Live captions of |    |    |                                  |   |
|   |  what the AI is   |    |    |   [Recording Timer]              |   |
|   |  saying right now |    |    |   [Live Transcript]              |   |
|   +-------------------+    |    |   [Finish Answer Button]         |   |
|                             |    |                                  |   |
|                             |    |  [Mic] [Camera] [Mute] [End]    |   |
+-----------------------------+------------------------------------------+
```

**The flow goes like this:**

1. You fill out a quick setup form (your name, the role you're interviewing for, topics you want to practice)
2. The AI greets you by name and introduces itself
3. It asks you a question (you hear it speak and see lip-syncing on the 3D avatar)
4. You speak your answer into the microphone (a 2-minute timer counts down)
5. The AI evaluates your answer and tells you what was good and what could improve
6. It moves to the next question (difficulty increases as you go)
7. After all questions, you get a comprehensive performance report

**Behind the scenes**, three systems work together:

1. **Your Browser** - Handles the 3D graphics, voice recognition (turning your speech into text), text-to-speech (making the AI talk), and the camera feed
2. **The Backend Server** - A small program running on your computer that manages the interview session and talks to the AI
3. **Ollama** - An AI program that runs locally on your machine (similar to ChatGPT, but running on your own computer instead of the cloud)

---

## User Journey Walkthrough

### Step 1: Landing Page
You arrive at a dark, futuristic-looking page with floating particles in the background. A welcome popup greets you.

### Step 2: Interview Setup (4-Step Wizard)

**Step 2a - Your Info:**
Enter your name and current company. The AI will use your name during the interview ("Great answer, Vijay!").

**Step 2b - Choose Your Role (8 options):**
- Frontend Developer
- Backend Developer
- Full Stack Developer
- Salesforce Developer
- Software Engineer
- Data Scientist
- Product Manager
- Designer

Each role changes what questions the AI asks. A Frontend Developer gets React and CSS questions; a Backend Developer gets database and API questions.

**Step 2c - Experience Level (5 options):**
- Junior (0-2 years)
- Mid-level (2-5 years)
- Senior (5-8 years)
- Lead (8-12 years)
- Principal (12+ years)

Higher levels get harder questions.

**Step 2d - Focus Topics:**
Pick 1-5 specific topics you want to practice. These change based on the role you chose. For a Frontend Developer, you might see: JavaScript, React, CSS, TypeScript, Performance, etc.

### Step 3: The Interview Begins

Before it starts, the system checks if the AI (Ollama) is running and accessible. If not, you get a clear error message.

**The interview screen looks like a video call:**
- Left side (40%): The 3D AI interviewer (a professional-looking woman named Sarah Mitchell, sitting in an office with a bookshelf and city window behind her)
- Right side (60%): Your webcam feed with controls at the bottom (mic, camera, mute AI, end interview)

### Step 4: Question & Answer Loop

The interview follows this cycle for each question:

```
INTRO (AI greets you)
  |
  v
ASKING QUESTION (AI speaks the question, avatar lip-syncs)
  |
  v
LISTENING (You speak your answer, 2-min timer running)
  |
  v
PROCESSING (AI evaluates your answer, shows "Evaluating..." spinner)
  |
  v
SPEAKING FEEDBACK (AI tells you what was good/bad, gives a score)
  |
  v
TRANSITIONING (Brief pause)
  |
  v
ASKING QUESTION (Next question, may be harder)
  ...repeats...
  |
  v
COMPLETED (Interview ends, report shown)
```

**During the LISTENING phase:**
- A circular countdown timer (2 minutes) appears in the corner
- Your voice is transcribed live on screen
- Audio visualization bars show your voice level
- Speech metrics appear: Words Per Minute, Confidence score, Clarity score
- A red "REC" indicator shows you're being recorded
- A "Finish Answer" button lets you submit early

**During the entire interview, the system monitors:**
- Are you looking at the camera? (face detection)
- Did you switch tabs? (tab/window monitoring)
- Did you copy-paste something? (clipboard monitoring)
- Is there another person in the frame? (multiple face detection)
- These are tracked as an "Integrity Score" (like a proctored exam)

### Step 5: Interview Complete

After all questions, the interview ends and you see:
- An **Integrity Summary** showing your behavior score (were you honest?)
- A **Performance Report** with:
  - Overall score (displayed as a circular ring)
  - Category breakdowns (technical knowledge, communication, problem-solving)
  - Feedback for each question (strengths and areas to improve)
  - Expandable Q&A review (see exactly what you said and how it was scored)

### Step 6: Report Page

You can also access your report later via a unique URL. The report is printable with dedicated print styles.

---

## Tech Stack Explained

### What Each Technology Does (In Simple Terms)

**Frontend (What You See in the Browser):**

| Technology | What It Does | Version |
|-----------|-------------|---------|
| **React** | The main framework that builds the user interface. Think of it as the engine that makes the website interactive. | 19.2.0 |
| **Vite** | The tool that packages all the code together and serves the website during development. Like a compiler for web apps. | 7.3.1 |
| **Tailwind CSS** | A styling system that makes everything look good. Instead of writing custom CSS files, you add classes like `text-blue-500` directly to elements. | 3.4.17 |
| **Three.js** | A 3D graphics library that renders the AI interviewer avatar. Same technology used in 3D web games. | 0.182.0 |
| **React Three Fiber** | A bridge between React and Three.js that makes 3D rendering work seamlessly with the rest of the app. | 9.5.0 |
| **Framer Motion** | Handles all the smooth animations (page transitions, button effects, fading elements). | 12.34.0 |
| **React Router** | Manages navigation between pages (Home, Interview, Report, etc.) without full page reloads. | 7.13.0 |
| **Axios** | Sends HTTP requests to the backend server (like making phone calls to the server to get questions or submit answers). | 1.13.5 |
| **Lucide React** | Provides all the icons used throughout the app (microphone icon, camera icon, etc.). | 0.564.0 |

**Built-in Browser APIs (No Installation Needed):**

| API | What It Does |
|-----|-------------|
| **Web Speech API** | Converts your spoken words into text (speech-to-text). Built into Chrome and Edge. |
| **SpeechSynthesis API** | Makes the AI interviewer speak out loud (text-to-speech). Built into all modern browsers. |
| **Web Audio API** | Generates the subtle office background noise and analyzes audio levels for lip-sync. |
| **FaceDetector API** | Detects faces in the webcam feed for integrity monitoring. Available in Chrome. |
| **MediaDevices API** | Accesses your camera and microphone. |

**Backend (The Server Running on Your Computer):**

| Technology | What It Does | Version |
|-----------|-------------|---------|
| **Node.js** | The runtime that lets JavaScript run outside the browser, powering the backend server. | 18+ |
| **Express** | A web framework that creates the API endpoints the frontend talks to. | 4.18.2 |
| **Helmet** | Adds security headers to protect the server from common web attacks. | 7.1.0 |
| **CORS** | Allows the frontend (running on port 5173) to talk to the backend (running on port 5000). | 2.8.5 |
| **Joi** | Validates incoming data to make sure it's in the right format before processing. | 17.11.0 |
| **Winston** | Logs what the server is doing for debugging purposes. | 3.11.0 |
| **UUID** | Generates unique session IDs (like `a1b2c3d4-e5f6-...`) for each interview. | 9.0.1 |

**AI Engine:**

| Technology | What It Does |
|-----------|-------------|
| **Ollama** | A program that runs AI language models locally on your computer. Similar to running ChatGPT on your own machine. |
| **llama3.2:3b** | The specific AI model used. It has 3 billion parameters (think of parameters as the AI's "brain cells"). Smaller than GPT-4 but runs locally for free. |

---

## Architecture & How the Pieces Fit Together

### High-Level Overview

```
YOU (Browser on your computer)
  |
  |  You speak into microphone
  |  You see 3D avatar on screen
  |  You see your camera feed
  |
  v
+------------------------------------------------------------------+
|                    FRONTEND (React App)                            |
|                                                                    |
|  Your Browser handles:                                             |
|  - 3D avatar rendering (Three.js)                                  |
|  - Voice recognition (Web Speech API)                              |
|  - Text-to-speech (SpeechSynthesis API)                            |
|  - Camera feed + face detection                                    |
|  - Interview monitoring (tab switches, copy-paste, etc.)           |
|  - Speech analytics (WPM, confidence, clarity)                     |
|  - Ambient office sound generation                                 |
|  - All animations and UI                                           |
|                                                                    |
|  Sends HTTP requests to backend for:                               |
|  - Starting an interview                                           |
|  - Submitting answers for evaluation                               |
|  - Ending the interview and getting the report                     |
+----------------------------+---------------------------------------+
                             |
                    HTTP Requests (localhost)
                             |
+----------------------------v---------------------------------------+
|                   BACKEND (Express Server)                          |
|                   Running on port 5000                              |
|                                                                    |
|  Handles:                                                          |
|  - Interview session management (tracks which question you're on)  |
|  - Sends your answers to Ollama for evaluation                     |
|  - Receives AI-generated questions and feedback                    |
|  - Stores session data (in memory + JSON files)                    |
|  - Input validation and error handling                             |
+----------------------------+---------------------------------------+
                             |
                    HTTP Requests (localhost)
                             |
+----------------------------v---------------------------------------+
|                    OLLAMA (Local AI)                                |
|                    Running on port 11434                            |
|                                                                    |
|  The AI brain that:                                                |
|  - Generates interview questions based on role/level/topics        |
|  - Evaluates your answers and produces scores                      |
|  - Creates feedback (strengths, improvements, recommendations)     |
|  - Adapts difficulty based on your performance                     |
|                                                                    |
|  Model: llama3.2:3b (3 billion parameters)                         |
+--------------------------------------------------------------------+
```

### What Happens When You Answer a Question

```
1. You speak: "I would use React's useEffect hook for side effects..."
                    |
2. Browser's Web Speech API converts your voice to text
                    |
3. You click "Finish Answer" (or timer runs out)
                    |
4. Frontend sends your text answer to Backend:
   POST /api/interviews/{sessionId}/answer
   Body: { answer: "I would use React's useEffect hook..." }
                    |
5. Backend sends your answer + the question to Ollama:
   "Evaluate this answer for a Mid-level Frontend Developer..."
                    |
6. Ollama thinks for 2-5 seconds and returns:
   {
     score: 78,
     feedback: "Good understanding of useEffect...",
     strengths: ["Correct use case identification"],
     improvements: ["Could mention cleanup functions"],
     nextQuestion: "What is the difference between..."
   }
                    |
7. Backend sends this back to the Frontend
                    |
8. Frontend shows the evaluation:
   - AI avatar speaks the feedback aloud (lip-syncing)
   - Score appears in the UI
   - Then transitions to the next question
```

### API Endpoints (How Frontend Talks to Backend)

| Endpoint | What It Does | When It's Called |
|----------|-------------|-----------------|
| `POST /api/interviews/start` | Creates a new interview session | When you click "Start Interview" |
| `POST /api/interviews/:id/answer` | Submits your answer, gets evaluation + next question | After each answer |
| `POST /api/interviews/:id/end` | Ends the interview, generates final report | When you finish or click "End" |
| `GET /api/interviews/:id/status` | Checks current session status | For reconnection/status checks |
| `GET /api/reports/:id` | Gets the final performance report | On the Report page |
| `GET /api/health/ollama` | Checks if Ollama is running | Before starting an interview |
| `GET /api/stats` | Server statistics | Admin/debugging |

---

## Complete Feature List

### Interview Features
- 4-step setup wizard (info, role, level, topics)
- 8 job roles with role-specific question domains
- 5 experience levels with difficulty scaling
- 3 AI interviewer personalities (Sarah Mitchell, Alex Rivera, Jordan Chen)
- Real-time voice-to-voice interaction
- 2-minute answer timer with visual countdown
- Live speech transcription
- Question-by-question feedback with scores
- Difficulty progression (Easy -> Medium -> Hard)
- Early exit handling

### 3D Avatar
- Realistic 3D female interviewer (professional woman)
- Brown bob cut hair with side-swept fringe
- Gray blazer with cream blouse
- Lip-sync animation driven by audio analysis
- Natural blinking (every 3-5 seconds)
- Breathing and idle animations
- Head movements when speaking
- Professional office background (bookshelf, city window, wood desk)
- Warm cinematic lighting
- Floating gold particle effects

### Video Call Layout
- Zoom/Meet-style split screen (40% AI / 60% candidate)
- AI panel: 3D avatar (55% top) + live captions (40% bottom), 6% internal padding
- Candidate panel: webcam feed with overlaid controls
- Controls bar at bottom (microphone, camera, mute AI, end interview)
- Mouse parallax effect on panels
- Single viewport design (no scrolling during active interview)
- Responsive: stacks vertically on mobile

### Speech Analytics
- Words Per Minute (WPM) calculation
- Confidence score (0-100) based on filler word frequency
- Clarity score (0-100) based on vocabulary variety
- Filler word detection (um, uh, like, basically, etc.)
- Pace classification (slow, steady, fast)

### Integrity Monitoring
- Face presence detection via FaceDetector API
- Multiple face detection (is someone helping you?)
- Tab/window switching detection
- Copy-paste attempt detection
- Screen resize detection
- Audio anomaly detection (background voices)
- Composite focus score (0-100)
- Non-intrusive warnings with cooldown periods
- End-of-interview integrity summary with event log

### Camera & Environment
- Webcam access with permission handling
- Ambient light detection with brightness correction
- Low light warning overlay
- Face framing guide during intro
- Camera error recovery with retry button

### Audio
- Enhanced text-to-speech with voice profiles
- Ambient office sound (pink noise, barely audible)
- Audio waveform visualization when AI speaks
- Toggleable AI mute and ambient sound

### Report System
- Overall score ring visualization
- Category breakdown bars (technical, communication, problem-solving)
- Feedback list (strengths and improvements)
- Collapsible Q&A accordion (review every question and answer)
- Integrity summary with color-coded severity
- Print-friendly layout with dedicated styles

### Error Handling & Performance
- React Error Boundary (catches crashes, shows recovery UI)
- 404 page for invalid routes
- Ollama health check before starting interview
- API retry logic (2 retries with exponential backoff for transient failures)
- Code splitting (each page loads separately, Three.js only loads when needed)
- Lazy route loading with Suspense fallback
- Animation frame leak prevention (ParticleBackground cancelAnimationFrame cleanup)
- WCAG-compliant touch targets (44px minimum)
- Responsive grids for mobile/tablet

### Branding & SEO
- Custom title: "MockMind AI - AI-Powered Interview Simulator"
- Custom favicon using project logo
- Meta description for search engines
- Open Graph tags for social media sharing
- Theme color matching the dark UI

---

## Project File Structure

```
MockMind AI/
|
|-- client/                              # FRONTEND (what runs in your browser)
|   |-- public/
|   |   |-- logo.png                     # App logo (used as favicon too)
|   |
|   |-- src/
|   |   |-- components/
|   |   |   |-- interview/               # 18 components for the interview experience
|   |   |   |   |-- AIInterviewer.jsx        # Basic 2D avatar (legacy, unused)
|   |   |   |   |-- AIInterviewer3D.jsx      # 3D avatar with lip-sync + office scene
|   |   |   |   |-- AudioWaveform.jsx        # Sound wave bars when AI speaks
|   |   |   |   |-- CandidateListeningOverlay.jsx  # Timer + recorder + finish button
|   |   |   |   |-- ControlsBar.jsx          # Mic/Camera/Mute/End buttons
|   |   |   |   |-- CountdownTimer.jsx       # Circular SVG countdown clock
|   |   |   |   |-- FaceFrameGuide.jsx       # "Position your face here" guide
|   |   |   |   |-- IntegritySummary.jsx     # End-of-interview behavior report
|   |   |   |   |-- InterviewOverlay.jsx     # Top bar (timer + section label)
|   |   |   |   |-- InterviewSession.jsx     # THE BRAIN - orchestrates entire interview
|   |   |   |   |-- InterviewSetup.jsx       # 4-step setup wizard
|   |   |   |   |-- MonitoringOverlay.jsx    # Focus score badge + warning toasts
|   |   |   |   |-- QuestionDisplay.jsx      # Shows question text + triggers TTS
|   |   |   |   |-- SpeechMetricsPanel.jsx   # WPM / Confidence / Clarity display
|   |   |   |   |-- SynchronizedCaption.jsx  # Word-by-word caption highlighting
|   |   |   |   |-- TranscriptionDisplay.jsx # Shows what you said (speech-to-text)
|   |   |   |   |-- VideoCallLayout.jsx      # The 40/60 split screen layout
|   |   |   |   |-- VoiceRecorder.jsx        # Microphone capture + audio bars
|   |   |   |
|   |   |   |-- report/                  # 5 components for the performance report
|   |   |   |   |-- CategoryBars.jsx         # Score bars per category
|   |   |   |   |-- FeedbackList.jsx         # Strengths + improvements list
|   |   |   |   |-- PrintStyles.css          # Styles for printing the report
|   |   |   |   |-- QAAccordion.jsx          # Expandable question/answer review
|   |   |   |   |-- ReportHeader.jsx         # Report title + metadata
|   |   |   |   |-- ScoreRing.jsx            # Circular overall score display
|   |   |   |
|   |   |   |-- ui/                      # 9 reusable UI components
|   |   |   |   |-- Carousel3D.jsx           # 3D rotating carousel
|   |   |   |   |-- CustomCursor.jsx         # Custom mouse cursor effect
|   |   |   |   |-- ErrorBoundary.jsx        # Catches crashes, shows recovery UI
|   |   |   |   |-- FloatingCard.jsx         # Card with 3D tilt effect
|   |   |   |   |-- GlowButton.jsx           # Glowing animated button
|   |   |   |   |-- LoadingFallback.jsx      # Spinner shown while pages load
|   |   |   |   |-- PageTransition.jsx       # Smooth fade between pages
|   |   |   |   |-- ParticleBackground.jsx   # Floating dots background animation
|   |   |   |   |-- WelcomePopup.jsx         # "Welcome to MockMind" popup
|   |   |   |
|   |   |   |-- layout/
|   |   |       |-- Footer.jsx              # Page footer
|   |   |
|   |   |-- hooks/                       # 8 custom React hooks (reusable logic)
|   |   |   |-- useAmbientSound.js           # Generates subtle office background noise
|   |   |   |-- useCamera.js                 # Manages webcam access
|   |   |   |-- useEnhancedTTS.js            # Advanced text-to-speech with lip-sync data
|   |   |   |-- useInterviewMonitor.js       # Detects cheating (tab switches, face absence)
|   |   |   |-- useLightDetection.js         # Checks if room lighting is too dark
|   |   |   |-- useSpeechMetrics.js          # Calculates WPM, confidence, clarity
|   |   |   |-- useTextToSpeech.js           # Basic text-to-speech
|   |   |   |-- useVoiceRecognition.js       # Converts speech to text
|   |   |
|   |   |-- pages/                       # 5 page-level components (one per route)
|   |   |   |-- AIDemo.jsx                   # Interactive demo of the 3D avatar
|   |   |   |-- Home.jsx                     # Landing page with setup wizard
|   |   |   |-- Interview.jsx                # Wrapper for the interview session
|   |   |   |-- NotFound.jsx                 # 404 "Page Not Found" page
|   |   |   |-- Report.jsx                   # Performance report page
|   |   |
|   |   |-- services/
|   |   |   |-- api.js                       # HTTP client with retry logic
|   |   |
|   |   |-- App.jsx                      # Route definitions + error boundary
|   |   |-- main.jsx                     # App entry point
|   |   |-- index.css                    # Global styles + Tailwind imports
|   |
|   |-- index.html                       # HTML shell with meta tags + favicon
|   |-- tailwind.config.js              # Color scheme + animation definitions
|   |-- vite.config.js                  # Build config with chunk splitting
|   |-- package.json                    # Frontend dependencies
|
|-- server/                              # BACKEND (runs as a separate process)
|   |-- src/
|   |   |-- config/
|   |   |   |-- prompts.js                  # AI prompt templates for each role
|   |   |
|   |   |-- controllers/
|   |   |   |-- interviewController.js      # Handles all API requests
|   |   |
|   |   |-- middleware/
|   |   |   |-- errorHandler.js             # Catches server errors gracefully
|   |   |   |-- validation.js               # Validates request data format
|   |   |
|   |   |-- routes/
|   |   |   |-- interviewRoutes.js          # Defines URL endpoints
|   |   |
|   |   |-- services/
|   |   |   |-- ollamaService.js            # Talks to Ollama AI
|   |   |   |-- sessionManager.js           # Tracks active interview sessions
|   |   |   |-- evaluationService.js        # Scores answers using AI
|   |   |
|   |   |-- utils/
|   |   |   |-- logger.js                   # Logging utility
|   |   |
|   |   |-- server.js                    # Server entry point
|   |
|   |-- data/sessions/                   # Saved interview sessions (JSON files)
|   |-- .env                             # Server configuration
|   |-- package.json                     # Backend dependencies
|
|-- CONTEXT.md                           # This documentation file
|-- README.md                            # Quick-start guide
|-- .gitignore                           # Files excluded from version control (node_modules, .env, dist, .claude/, etc.)
```

**By the numbers:**
- 45 React components total
- 8 custom hooks
- 5 pages
- 18 interview-specific components
- 5 report components
- 9 UI utility components

---

## Development Phases (What Was Built When)

### Phase 1: Backend Foundation

Built the server that the AI runs on:
- Express web server on port 5000
- Connection to Ollama (local AI)
- All 8 API endpoints
- Session management (remembers which question you're on)
- AI prompt templates customized per role (Frontend, Backend, etc.)
- Input validation (rejects bad data)
- Logging (for debugging)
- Security headers

### Phase 2: Premium Frontend UI

Built the visual interface:
- Dark futuristic "cyber" theme with custom colors
- 4-step interview setup wizard
- Floating particle background animation
- Glass morphism design (frosted glass effects)
- Smooth page transition animations
- 3D parallax tilt effects on cards
- Welcome popup and custom cursor
- Responsive layout for different screen sizes

### Phase 3: Voice Integration + 3D Avatar

Made the AI talk and listen:
- Text-to-speech with premium voice profiles
- Speech recognition that converts your voice to text
- 3D animated interviewer avatar:
  - Professional woman with brown bob hair and gray blazer
  - Lip-sync driven by real-time audio analysis
  - Natural blinking, breathing, and head movements
  - Office background with bookshelf, city window, and desk
  - Warm cinematic lighting
- Three interviewer personalities (Sarah, Alex, Jordan)
- Interactive demo page to showcase the avatar

### Phase 4: Full Interview Flow

Connected everything into a working interview:
- Complete interview state machine (7 states from intro to completion)
- Voice-to-voice question/answer/feedback loop
- Behavioral integrity monitoring (6 detection vectors)
- Real-time speech analytics (WPM, confidence, clarity)
- Zoom-style video call layout (40/60 split)
- Camera with light detection and face framing guide
- Ambient office background sound
- Countdown timer with warning states
- Compact controls bar overlaid on video

### Phase 5: Reports

Built the post-interview analysis:
- Overall score ring visualization
- Category breakdown bar charts
- Detailed feedback per question
- Expandable Q&A review accordion
- Integrity summary with behavior event log
- Print-friendly styles for PDF export

### Phase 6: Polish & Optimization

Made everything production-ready:
- React Error Boundary (catches crashes gracefully)
- 404 "Page Not Found" page
- Ollama health check before starting interviews
- API retry logic with exponential backoff
- Code splitting: pages load separately, Three.js (1.1MB) only loads when entering the interview
- Proper HTML meta tags, favicon, and Open Graph tags for social sharing
- Responsive design fixes (mobile-friendly grids, 44px touch targets)
- Animation frame leak fixes (ParticleBackground rAF cleanup)
- R3F Canvas relies on built-in disposal (manual SceneCleanup removed — conflicts with React StrictMode double-mount)

---

## Technical Deep Dives

### The Interview State Machine

The interview flows through 7 states. Think of it like a traffic light system that controls what happens on screen:

| State | What's Happening | What You See |
|-------|-----------------|-------------|
| **INTRO** | AI greets you, camera settling time | Face framing guide, "Welcome" label |
| **ASKING_QUESTION** | AI speaks the question aloud | Avatar lip-syncing, question text in captions |
| **LISTENING** | Your turn to answer | 2-min countdown timer, audio bars, transcript, "Finish Answer" button |
| **PROCESSING** | AI is thinking about your answer | "Evaluating..." spinner |
| **SPEAKING_FEEDBACK** | AI tells you how you did | Score card overlay, avatar speaking feedback |
| **TRANSITIONING** | Brief pause before next question | "Next..." label |
| **COMPLETED** | Interview finished | Integrity summary + report |

### Integrity Monitoring - How Cheating is Detected

The system watches for suspicious behavior using 6 "detection vectors":

| What It Watches | How It Works | Cooldown |
|----------------|-------------|----------|
| **Face absence** | Uses browser's FaceDetector API to check if your face is visible. Requires 4 consecutive misses before flagging. | 30 seconds |
| **Multiple faces** | Detects if someone else is in the camera frame helping you. | 30 seconds |
| **Tab switching** | Listens for `visibilitychange` events (you switching to another tab). | 10 seconds |
| **Window blur** | Detects when you click away from the browser window. | 15 seconds |
| **Copy-paste** | Monitors clipboard events (you copying text from somewhere). | 10 seconds |
| **Screen resize** | Detects significant window size changes (possibly rearranging windows). | 20 seconds |

**Design principle:** The system uses generous thresholds and long cooldowns to avoid false positives. It's meant to be a gentle integrity check, not an aggressive proctor.

### Code Splitting - How the App Loads Fast

Instead of loading all 1.5MB of JavaScript at once, the app is split into chunks:

| Chunk | Size | When It Loads |
|-------|------|--------------|
| **index** (core) | 6.5 KB | Always (immediately) |
| **router-vendor** | 83 KB | Always (immediately) |
| **animation-vendor** | 129 KB | Always (immediately) |
| **Home** (landing page) | 35 KB | When you visit `/` |
| **Interview** (session) | 56 KB | When you start an interview |
| **three-vendor** (3D) | 1,123 KB | When you start an interview or visit demo |
| **Report** | 16 KB | When you view a report |
| **NotFound** (404) | 2 KB | When you visit an invalid URL |

This means the landing page loads in ~250KB instead of 1.5MB. The heavy 3D graphics only load when needed.

### The 3D Avatar

The AI interviewer is a fully 3D character rendered using WebGL (the same technology used in browser-based 3D games):

- **Head & Face:** Spheres and custom shapes for head, eyes, nose, mouth, ears
- **Hair:** Brown bob cut built from multiple overlapping shapes (main cap, side panels, back volume, fringe)
- **Body:** Gray blazer with darker lapels, cream V-neckline blouse
- **Accessories:** Small gold earring studs
- **Background:** Warm gray wall, framed city window with dividers, bookshelf with colorful books, wooden desk with pen holder
- **Lighting:** Three-light setup (warm gold fill, cool city glow, warm key light)
- **Animations:** Lip-sync from audio volume, blinking every 3-5 seconds, subtle breathing, head movement when speaking

### Role-Specific AI Prompts

The AI is constrained to only ask questions relevant to your chosen role:

- **Frontend Developer:** HTML, CSS, JavaScript, React, responsive design, accessibility
- **Backend Developer:** Node.js, databases, REST APIs, authentication, microservices
- **Full Stack Developer:** Cross-layer integration, system design, both frontend and backend
- **Salesforce Developer:** Apex, SOQL, Lightning Web Components, Salesforce architecture

Each role definition includes "forbidden" topics to prevent irrelevant questions (e.g., a Frontend Developer won't get database schema questions).

---

## Setup & Running the Project

### Prerequisites

1. **Node.js 18+** - JavaScript runtime ([nodejs.org](https://nodejs.org))
2. **8GB+ RAM** (16GB recommended) - The AI model needs memory
3. **Ollama** - Local AI runner ([ollama.ai](https://ollama.ai))
4. **Chrome or Edge** - For best speech recognition support

### Installation

```bash
# 1. Install the AI model
ollama pull llama3.2:3b

# 2. Start Ollama (keep this running)
ollama serve

# 3. Install backend dependencies
cd server
npm install

# 4. Start the backend server
npm run dev

# 5. In a new terminal, install frontend dependencies
cd client
npm install

# 6. Start the frontend
npm run dev
```

### Environment Variables

**Backend** (`server/.env`):
```
PORT=5000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
MAX_SESSION_AGE_MS=7200000
NODE_ENV=development
```

**Frontend** (`client/.env`):
```
VITE_API_BASE_URL=http://localhost:5000
```

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Ollama | http://localhost:11434 |

### App Routes

| URL | Page | Description |
|-----|------|-------------|
| `/` | Home | Landing page with interview setup wizard |
| `/demo` | AI Demo | Interactive 3D avatar showcase |
| `/interview/:sessionId` | Interview | Live interview session |
| `/report/:reportId` | Report | Performance report after interview |
| Any other URL | 404 | "Page Not Found" with navigation options |

---

## Known Limitations

1. **AI Quality:** The local llama3.2:3b model is less capable than cloud services like GPT-4 or Claude. Questions and evaluations are good but not as nuanced as premium AI.

2. **Speech Recognition:** Browser-based speech recognition accuracy varies with background noise, accents, and microphone quality. Works best in quiet environments with Chrome/Edge.

3. **Voice Analysis:** The confidence and clarity scores are based on text analysis (filler words, vocabulary). The system cannot analyze actual vocal tone, pitch, or nervousness.

4. **Response Time:** AI responses take 2-5 seconds (sometimes longer on first request due to model loading). Cloud APIs are typically faster.

5. **RAM Usage:** The AI model needs significant memory. 8GB minimum, 16GB recommended. Other heavy programs running simultaneously may cause slowdowns.

6. **Browser Support:** Full features work in Chrome 80+ and Edge 80+. Firefox and Safari have limited speech recognition support.

7. **Face Detection:** The FaceDetector API is not available in all browsers. When unavailable, face-based integrity monitoring is disabled (other detection vectors still work).

8. **Single User:** Designed for one user at a time on one machine. Not a multi-user web service.

---

## Resources & References

| Resource | URL |
|----------|-----|
| Ollama Documentation | https://ollama.ai/docs |
| React Three Fiber (3D) | https://docs.pmnd.rs/react-three-fiber |
| Web Speech API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API |
| Tailwind CSS | https://tailwindcss.com/docs |
| Framer Motion | https://www.framer.com/motion/ |
| Three.js | https://threejs.org/docs/ |
| Express.js | https://expressjs.com/ |

---

**Created by Yuvraj Purbia**
**GitHub:** https://github.com/yuvrajpurbia/MockMind-AI
