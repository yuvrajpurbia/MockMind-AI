import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import FloatingCard from '../ui/FloatingCard';
import GlowButton from '../ui/GlowButton';
import { startInterview, checkOllamaHealth } from '../../services/api';

const roles = [
  { value: 'Frontend Developer', icon: '🖥️', label: 'Frontend Developer', description: 'UI & Interfaces', gradient: 'from-cyan-500 to-blue-500' },
  { value: 'Backend Developer', icon: '⚙️', label: 'Backend Developer', description: 'APIs & Systems', gradient: 'from-green-500 to-emerald-500' },
  { value: 'Full Stack Developer', icon: '🔗', label: 'Full Stack Developer', description: 'End-to-End', gradient: 'from-blue-500 to-purple-500' },
  { value: 'Salesforce Developer', icon: '☁️', label: 'Salesforce Developer', description: 'CRM & Cloud', gradient: 'from-sky-500 to-indigo-500' },
  { value: 'Software Engineer', icon: '💻', label: 'Software Engineer', description: 'Build & Optimize', gradient: 'from-violet-500 to-fuchsia-500' },
  { value: 'Data Scientist', icon: '📈', label: 'Data Scientist', description: 'Analyze & Predict', gradient: 'from-purple-500 to-pink-500' },
  { value: 'Product Manager', icon: '📊', label: 'Product Manager', description: 'Strategy & Vision', gradient: 'from-orange-500 to-yellow-500' },
  { value: 'Designer', icon: '🎨', label: 'Designer', description: 'Create & Innovate', gradient: 'from-teal-500 to-lime-500' },
];

const levels = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Principal'];

// Role-specific topics — strictly separated, no cross-role overlap
const roleTopicsMap = {
  'Frontend Developer': [
    'HTML & CSS', 'JavaScript (ES6+)', 'React', 'Angular / Vue',
    'State Management', 'Component Lifecycle', 'Responsive Design',
    'Performance Optimization', 'Accessibility (a11y)', 'Browser Rendering',
    'API Integration', 'CSS Frameworks & Preprocessors',
  ],
  'Backend Developer': [
    'Node.js / Express', 'REST API Design', 'Authentication (JWT / OAuth)',
    'Database Design (SQL)', 'NoSQL Databases', 'Caching Strategies',
    'Microservices Architecture', 'System Design Basics', 'Error Handling & Logging',
    'Performance & Scaling', 'Message Queues', 'Server Security',
  ],
  'Full Stack Developer': [
    'Frontend-Backend Integration', 'REST / GraphQL APIs', 'Database + UI Workflow',
    'Authentication Flow (End-to-End)', 'Deployment & CI/CD', 'System Design (Moderate)',
    'Performance Across Stack', 'State Management & Data Flow', 'Monorepo & Project Structure',
    'Testing (Unit + Integration)', 'WebSockets & Real-time', 'Cloud Services Basics',
  ],
  'Salesforce Developer': [
    'Apex Programming', 'SOQL / SOSL', 'Triggers & Trigger Handlers',
    'Lightning Web Components (LWC)', 'Salesforce Architecture', 'Governor Limits',
    'Flows & Process Builder', 'Integration (REST / SOAP)', 'Security & Sharing Rules',
    'Salesforce Data Model', 'Batch & Scheduled Apex', 'Visualforce Basics',
  ],
  'Software Engineer': [
    'Data Structures', 'Algorithms', 'Object-Oriented Design', 'System Design',
    'Concurrency & Threading', 'Design Patterns', 'Code Quality & Refactoring',
    'Version Control (Git)', 'Testing Strategies', 'Complexity Analysis',
    'Memory Management', 'Distributed Systems Basics',
  ],
  'Data Scientist': [
    'Python for Data Science', 'Machine Learning', 'Statistics & Probability',
    'Deep Learning', 'Data Analysis & Pandas', 'SQL for Analytics',
    'TensorFlow / PyTorch', 'Data Visualization', 'Feature Engineering',
    'Model Evaluation & Tuning', 'Big Data Concepts', 'NLP Basics',
  ],
  'Product Manager': [
    'Product Strategy', 'Roadmap Planning', 'User Research', 'Market Analysis',
    'Agile & Scrum', 'Stakeholder Management', 'Metrics & KPIs',
    'Go-to-Market Strategy', 'Competitive Analysis', 'Product Lifecycle',
    'Prioritization Frameworks', 'A/B Testing & Experimentation',
  ],
  'Designer': [
    'UI/UX Principles', 'Figma & Design Tools', 'User Research Methods',
    'Wireframing & Prototyping', 'Design Systems', 'Accessibility Standards',
    'Visual Hierarchy & Typography', 'Interaction Design', 'Responsive Layouts',
    'Design Thinking Process', 'Usability Testing', 'Motion & Micro-interactions',
  ],
};

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get topics based on selected role
  const availableTopics = useMemo(() => {
    if (!role) return [];
    return roleTopicsMap[role] || [];
  }, [role]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole.value);
    setSelectedTopics([]); // Clear topics when role changes
  };

  const handleTopicToggle = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : prev.length < 5
        ? [...prev, topic]
        : prev
    );
  };

  const handleSubmit = async () => {
    if (!userName || !currentCompany || !role || !level || selectedTopics.length === 0) {
      setError('Please complete all steps before starting the interview');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Pre-flight: check Ollama is reachable before starting
      try {
        await checkOllamaHealth();
      } catch {
        setError('AI service is unavailable. Please make sure Ollama is running (ollama serve) and try again.');
        setLoading(false);
        return;
      }

      const response = await startInterview({
        userName,
        currentCompany,
        role,
        level,
        topics: selectedTopics,
      });

      const { sessionId, question } = response.data.data;
      navigate(`/interview/${sessionId}`, {
        state: {
          firstQuestion: question,
          userName,
          role,
          level,
          topics: selectedTopics,
        }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      {/* Step Indicator */}
      <div className="flex justify-center items-center gap-4">
        {['Info', 'Role', 'Level', 'Topics'].map((step, index) => {
          const isComplete =
            (index === 0 && userName && currentCompany) ||
            (index === 1 && role) ||
            (index === 2 && level) ||
            (index === 3 && selectedTopics.length > 0);

          return (
            <motion.div
              key={step}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  isComplete
                    ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white glow-pulse'
                    : 'glass-morphism text-gray-400'
                }`}
                whileHover={{ scale: 1.15, rotate: 5 }}
                animate={isComplete ? { rotate: [0, 360], transition: { duration: 0.5 } } : {}}
              >
                {isComplete ? '✓' : index + 1}
              </motion.div>
              <span className="text-sm font-semibold text-gray-300">{step}</span>
              {index < 3 && <ArrowRight className="w-4 h-4 text-gray-600" />}
            </motion.div>
          );
        })}
      </div>

      {/* STEP 1: User Information */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FloatingCard>
          <div className="text-center mb-8">
            <motion.h2
              className="text-4xl font-black mb-3 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-accent bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            >
              Welcome! Let's Get Started
            </motion.h2>
            <motion.p
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Tell us a bit about yourself
            </motion.p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Name Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-bold text-cyber-blue mb-2">
                Your Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-6 py-4 rounded-xl bg-cyber-darker/50 border-2 border-cyber-gray focus:border-cyber-blue focus:outline-none text-white placeholder-gray-500 transition-all"
              />
            </motion.div>

            {/* Company Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-bold text-cyber-blue mb-2">
                Currently Working At <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="Enter your company name (or 'Student' if not working)"
                className="w-full px-6 py-4 rounded-xl bg-cyber-darker/50 border-2 border-cyber-gray focus:border-cyber-blue focus:outline-none text-white placeholder-gray-500 transition-all"
              />
            </motion.div>

            {/* Greeting Preview */}
            {userName && (
              <motion.div
                className="mt-6 p-4 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-cyber-blue text-center">
                  👋 Hey <span className="font-bold">{userName}</span>
                  {currentCompany && (
                    <> from <span className="font-bold">{currentCompany}</span></>
                  )}
                  ! Ready to ace your interview?
                </p>
              </motion.div>
            )}
          </div>
        </FloatingCard>
      </motion.div>

      {/* STEP 2: Role Selection - Clean Grid */}
      <AnimatePresence>
        {userName && currentCompany && (
          <motion.div
            initial={{ opacity: 0, y: 50, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 50, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
          <motion.h2
            className="text-4xl font-black mb-3 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            style={{
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 3s ease infinite',
            }}
          >
            Choose Your Role
          </motion.h2>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Select the position you're preparing for
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 px-4">
          {roles.map((roleItem, index) => (
            <motion.button
              key={roleItem.value}
              onClick={() => handleRoleSelect(roleItem)}
              className={`
                relative p-8 rounded-3xl transition-all duration-300 perspective-1000
                ${role === roleItem.value
                  ? 'animated-border glow-pulse bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20'
                  : 'glass-morphism holographic hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]'
                }
              `}
              initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 200, damping: 12 }}
              whileHover={{
                scale: 1.08,
                y: -15,
                rotateY: 5,
                rotateX: 5,
                transition: { type: 'spring', stiffness: 300, damping: 10 }
              }}
              whileTap={{ scale: 0.92 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Selection Checkmark */}
              <AnimatePresence>
                {role === roleItem.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-3 -right-3 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full p-2"
                  >
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon */}
              <motion.div
                className="text-7xl mb-4"
                animate={role === roleItem.value ? {
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1],
                  y: [0, -10, 0]
                } : {}}
                transition={{ duration: 0.8, type: 'spring' }}
                style={{
                  filter: role === roleItem.value
                    ? 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.8))'
                    : 'none',
                  transform: 'translateZ(30px)'
                }}
              >
                {roleItem.icon}
              </motion.div>

              {/* Label */}
              <h3 className={`text-lg font-bold mb-2 ${
                role === roleItem.value ? 'neon-text' : 'text-white'
              }`}>
                {roleItem.label}
              </h3>
              <p className="text-xs text-gray-400">{roleItem.description}</p>

              {/* Gradient Line */}
              <div className={`h-1 w-full rounded-full mt-4 bg-gradient-to-r ${roleItem.gradient} ${
                role === roleItem.value ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-300`} />
            </motion.button>
          ))}
        </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 3: Level Selection */}
      <AnimatePresence>
        {role && (
          <motion.div
            initial={{ opacity: 0, y: 50, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 50, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FloatingCard>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-3 bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
                  Experience Level
                </h2>
                <p className="text-gray-400">How experienced are you as a {role}?</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {levels.map((lvl, index) => (
                  <motion.button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`
                      p-5 rounded-2xl font-bold text-lg transition-all relative overflow-hidden
                      ${level === lvl
                        ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white glow-pulse shimmer'
                        : 'glass-morphism text-gray-300 hover:text-white holographic'
                      }
                    `}
                    initial={{ opacity: 0, scale: 0.5, rotateX: -20 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ delay: index * 0.08, type: 'spring', stiffness: 200 }}
                    whileHover={{
                      scale: 1.12,
                      y: -8,
                      rotateZ: level === lvl ? 0 : 3,
                      transition: { type: 'spring', stiffness: 400 }
                    }}
                    whileTap={{ scale: 0.92 }}
                  >
                    {lvl}
                    {level === lvl && (
                      <motion.div
                        layoutId="levelIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 rounded-2xl"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </FloatingCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 3: Topic Selection */}
      <AnimatePresence>
        {role && level && (
          <motion.div
            initial={{ opacity: 0, y: 50, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 50, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FloatingCard>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-3 bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
                  Focus Topics
                </h2>
                <p className="text-gray-400">
                  Select 1-5 topics for your {role} interview
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div
                        key={num}
                        className={`w-3 h-3 rounded-full transition-all ${
                          selectedTopics.length >= num
                            ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple'
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-cyber-blue font-semibold ml-2">
                    {selectedTopics.length}/5
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableTopics.map((topic, index) => (
                  <motion.button
                    key={topic}
                    onClick={() => handleTopicToggle(topic)}
                    className={`
                      p-4 rounded-xl font-medium text-sm transition-all relative overflow-hidden
                      ${selectedTopics.includes(topic)
                        ? 'bg-gradient-to-r from-cyber-accent to-green-400 text-cyber-darker border-2 border-cyber-accent shimmer'
                        : 'glass-morphism text-gray-300 border border-cyber-gray/50 hover:border-cyber-accent hover:text-white holographic'
                      }
                    `}
                    initial={{ opacity: 0, scale: 0.7, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.03, type: 'spring', stiffness: 250 }}
                    whileHover={{
                      scale: 1.1,
                      y: -5,
                      rotate: selectedTopics.includes(topic) ? 0 : 2,
                      boxShadow: selectedTopics.includes(topic)
                        ? '0 10px 40px rgba(0, 255, 136, 0.4)'
                        : '0 10px 30px rgba(0, 212, 255, 0.3)',
                      transition: { type: 'spring', stiffness: 400 }
                    }}
                    whileTap={{ scale: 0.9, rotate: 0 }}
                  >
                    <span className="relative z-10">{topic}</span>
                    {selectedTopics.includes(topic) && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2 text-lg"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </div>
            </FloatingCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/20 border-2 border-red-500 rounded-2xl p-6 text-center backdrop-blur-sm"
          >
            <p className="text-red-200 font-semibold">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Button - Always Visible */}
      <motion.div
        className="text-center pt-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
      >
        <GlowButton
          onClick={handleSubmit}
          loading={loading}
          disabled={!userName || !currentCompany || !role || !level || selectedTopics.length === 0}
          className="text-2xl px-20 py-7 shadow-2xl"
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                ⚡
              </motion.div>
              Initializing AI...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              Start Interview
              <ArrowRight className="w-6 h-6" />
            </span>
          )}
        </GlowButton>

        {/* Helpful hint */}
        {!role && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-sm mt-6"
          >
            👆 Choose your role above to get started
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
