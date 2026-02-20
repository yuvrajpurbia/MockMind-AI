import { motion } from 'framer-motion';

/**
 * Enhanced audio waveform visualization.
 *
 * Two variants:
 *   'simple'   — solid-color bars, center-weighted heights (original)
 *   'spectrum' — frequency-banded gradient bars with glow effects
 *
 * Props:
 *   audioData   - { volume: 0-1, frequency: 0-250 }
 *   barCount    - number of bars (default 9)
 *   maxHeight   - peak height in px (default 24)
 *   minHeight   - minimum height in px (default 3)
 *   color       - Tailwind class for simple variant (default 'bg-cyber-blue')
 *   variant     - 'simple' | 'spectrum'
 */
export default function AudioWaveform({
  audioData = { volume: 0, frequency: 0 },
  barCount = 9,
  className = '',
  color = 'bg-cyber-blue',
  maxHeight = 24,
  minHeight = 3,
  variant = 'simple',
}) {
  const volume = audioData?.volume || 0;
  const frequency = audioData?.frequency || 150;

  if (variant === 'spectrum') {
    return (
      <div className={`flex items-end gap-[2px] ${className}`} style={{ height: maxHeight }}>
        {[...Array(barCount)].map((_, i) => {
          const centerWeight = 1 - Math.abs(i - (barCount - 1) / 2) / ((barCount - 1) / 2);
          const barHeight = minHeight + volume * (maxHeight - minHeight) * (0.4 + centerWeight * 0.6);

          // Frequency-based hue: low freq = cyan, high freq = purple
          const freqNorm = Math.min(1, frequency / 250);
          const bandPos = i / (barCount - 1);
          const hue = 190 - bandPos * 60 - freqNorm * 30;
          const barColor = `hsl(${hue}, 80%, ${55 + volume * 20}%)`;
          const glowColor = `hsl(${hue}, 90%, 60%)`;

          return (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: 3,
                background: `linear-gradient(to top, ${barColor}, hsl(${hue + 30}, 85%, 70%))`,
                boxShadow: volume > 0.3 ? `0 0 ${4 + volume * 6}px ${glowColor}` : 'none',
              }}
              animate={{
                height: [
                  barHeight * 0.5,
                  barHeight,
                  barHeight * 0.4,
                  barHeight * 0.85,
                  barHeight * 0.5,
                ],
              }}
              transition={{
                duration: 0.35 + Math.random() * 0.15,
                repeat: Infinity,
                delay: i * 0.035,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </div>
    );
  }

  // --- Simple variant ---
  return (
    <div className={`flex items-end gap-[2px] ${className}`} style={{ height: maxHeight }}>
      {[...Array(barCount)].map((_, i) => {
        const centerWeight = 1 - Math.abs(i - (barCount - 1) / 2) / ((barCount - 1) / 2);
        const barHeight = minHeight + volume * (maxHeight - minHeight) * (0.4 + centerWeight * 0.6);

        return (
          <motion.div
            key={i}
            className={`w-[3px] rounded-full ${color}`}
            animate={{
              height: [
                barHeight * 0.6,
                barHeight,
                barHeight * 0.5,
                barHeight * 0.9,
                barHeight * 0.6,
              ],
            }}
            transition={{
              duration: 0.4 + Math.random() * 0.2,
              repeat: Infinity,
              delay: i * 0.04,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}
