import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, Home, Sparkles, Printer, FileText } from 'lucide-react';
import { CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import ParticleBackground from '../components/ui/ParticleBackground';
import Footer from '../components/layout/Footer';
import GlowButton from '../components/ui/GlowButton';
import ReportHeader from '../components/report/ReportHeader';
import ScoreRing from '../components/report/ScoreRing';
import CategoryBars from '../components/report/CategoryBars';
import FeedbackList from '../components/report/FeedbackList';
import QAAccordion from '../components/report/QAAccordion';
import { getReport } from '../services/api';
import '../components/report/PrintStyles.css';

export default function Report() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWithRetry = async (retries = 3, delay = 1500) => {
    setLoading(true);
    setError('');

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await getReport(reportId);
        setReport(response.data.data);
        setLoading(false);
        return;
      } catch (err) {
        const isNotFound =
          err.response?.status === 404 ||
          (err.response?.data?.error || '').toLowerCase().includes('not found');

        // Retry only on "not found" (report may not be persisted yet)
        if (isNotFound && attempt < retries) {
          await new Promise((r) => setTimeout(r, delay * attempt));
          continue;
        }

        setError(
          err.response?.data?.error ||
            'Failed to load report. It may have expired or been deleted.'
        );
        setLoading(false);
        return;
      }
    }
  };

  useEffect(() => {
    fetchWithRetry();
  }, [reportId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrint = () => window.print();

  // --- Loading State ---
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <motion.div
            className="glass-morphism rounded-2xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Loader2 className="w-10 h-10 text-cyber-blue animate-spin mx-auto mb-4" />
            <p className="text-gray-300 font-medium">Loading your report...</p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <motion.div
            className="glass-morphism rounded-2xl p-12 text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Report Unavailable</h2>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <GlowButton onClick={() => fetchWithRetry()} className="px-8">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4" /> Retry
                </span>
              </GlowButton>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-8 py-3 rounded-xl glass-effect border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/5 transition-colors"
              >
                <Home className="w-4 h-4" /> Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // --- Success State ---
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
        {/* Background effects */}
        <ParticleBackground />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-cyber-blue/5 rounded-full blur-3xl no-print"
          animate={{ y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-40 right-10 w-80 h-80 bg-cyber-purple/5 rounded-full blur-3xl no-print"
          animate={{ y: [0, -25, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-6">

          {/* 1. Report Header */}
          <ReportHeader
            session={report.session}
            generatedAt={report.generatedAt}
            questionCount={report.qaPairs?.length || 0}
          />

          {/* 2. Score row — ring + category bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className="glass-morphism rounded-2xl p-8 flex items-center justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ScoreRing score={report.overallScore || 0} />
            </motion.div>

            <motion.div
              className="glass-morphism rounded-2xl p-8 flex flex-col justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyber-blue" />
                Category Breakdown
              </h3>
              <CategoryBars scores={report.categoryScores} />
            </motion.div>
          </div>

          {/* 3. Summary */}
          {report.summary && (
            <motion.div
              className="glass-morphism rounded-2xl p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <h3 className="text-base font-bold text-white mb-3">Performance Summary</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{report.summary}</p>
            </motion.div>
          )}

          {/* 4. Strengths / Improvements / Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeedbackList
              title="Strengths"
              items={report.strengths}
              icon={CheckCircle2}
              accentColor="green"
              delay={0.4}
            />
            <FeedbackList
              title="Areas to Improve"
              items={report.improvements}
              icon={TrendingUp}
              accentColor="yellow"
              delay={0.5}
            />
            <FeedbackList
              title="Recommendations"
              items={report.recommendations}
              icon={Lightbulb}
              accentColor="blue"
              delay={0.6}
            />
          </div>

          {/* 5. Q&A Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            <QAAccordion qaPairs={report.qaPairs} />
          </motion.div>

          {/* 6. Action buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 pt-4 no-print"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
          >
            <GlowButton onClick={() => navigate('/')} className="px-6">
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4" /> Back to Home
              </span>
            </GlowButton>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass-effect border border-cyber-purple/30 text-cyber-purple font-medium text-sm hover:bg-cyber-purple/10 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> New Interview
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass-effect border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Report
            </button>
          </motion.div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
}
