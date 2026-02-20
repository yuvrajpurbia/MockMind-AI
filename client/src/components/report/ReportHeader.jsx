import { motion } from 'framer-motion';
import { Briefcase, Award, Calendar, Clock, Hash } from 'lucide-react';

/**
 * Interview metadata header for the report page.
 *
 * Props:
 *   session     - { role, level, topics, duration } or null
 *   generatedAt - timestamp (ms)
 *   questionCount - number of Q&A pairs
 */
export default function ReportHeader({ session, generatedAt, questionCount }) {
  const date = generatedAt
    ? new Date(generatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown date';

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <motion.div
      className="glass-morphism rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Title */}
      <h1 className="text-3xl font-black mb-4 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-accent bg-clip-text text-transparent">
        Interview Report
      </h1>

      {/* Metadata badges */}
      <div className="flex flex-wrap gap-3">
        {session?.role && (
          <Badge icon={Briefcase} label={session.role} />
        )}
        {session?.level && (
          <Badge icon={Award} label={session.level} />
        )}
        <Badge icon={Calendar} label={date} />
        {session?.duration && (
          <Badge icon={Clock} label={formatDuration(session.duration)} />
        )}
        {questionCount > 0 && (
          <Badge icon={Hash} label={`${questionCount} Questions`} />
        )}
      </div>

      {/* Topics */}
      {session?.topics?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {session.topics.map((topic) => (
            <span
              key={topic}
              className="text-xs px-2.5 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue font-medium"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Badge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-effect border border-white/10 text-sm text-gray-300">
      <Icon className="w-3.5 h-3.5 text-cyber-blue" />
      <span>{label}</span>
    </div>
  );
}
