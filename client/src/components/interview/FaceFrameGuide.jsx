import { motion } from 'framer-motion';

/**
 * SVG face-framing guide overlay for the candidate camera panel.
 * Shows a dashed oval with corner brackets to help the candidate
 * center their face in the frame.
 *
 * Also shows a low-light warning badge when lighting is poor.
 */
export default function FaceFrameGuide({ visible = true, isLowLight = false }) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <svg
        viewBox="0 0 640 480"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Center oval guide — gentle dashed line */}
        <motion.ellipse
          cx="320"
          cy="210"
          rx="105"
          ry="140"
          fill="none"
          stroke="rgba(0,212,255,0.2)"
          strokeWidth="1.5"
          strokeDasharray="8 5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Corner brackets — top-left */}
        <path
          d="M 215 70 L 215 95 M 215 70 L 240 70"
          stroke="rgba(0,212,255,0.25)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Top-right */}
        <path
          d="M 425 70 L 425 95 M 425 70 L 400 70"
          stroke="rgba(0,212,255,0.25)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Bottom-left */}
        <path
          d="M 215 350 L 215 325 M 215 350 L 240 350"
          stroke="rgba(0,212,255,0.25)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Bottom-right */}
        <path
          d="M 425 350 L 425 325 M 425 350 L 400 350"
          stroke="rgba(0,212,255,0.25)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Low light warning */}
      {isLowLight && (
        <motion.div
          className="absolute top-14 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 backdrop-blur-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-[10px] text-yellow-300 font-bold uppercase tracking-wider">
            Low Light Detected
          </span>
        </motion.div>
      )}
    </div>
  );
}
