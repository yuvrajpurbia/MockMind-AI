import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Generates subtle pink-noise office ambiance via Web Audio API.
 * Very low volume — just enough to reduce silence anxiety.
 */
export default function useAmbientSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);

  const start = useCallback(() => {
    if (ctxRef.current) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;

      // Master gain — barely audible
      const gain = ctx.createGain();
      gain.gain.value = 0.025;
      gain.connect(ctx.destination);

      // Pink noise buffer (Paul Kellet algorithm)
      const len = 2 * ctx.sampleRate;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        ch[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }

      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      // Warm low-pass for cozy office feel
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 350;
      lp.Q.value = 0.7;

      src.connect(lp);
      lp.connect(gain);
      src.start(0);

      nodesRef.current = [src, lp, gain];
      setIsPlaying(true);
    } catch {
      // Web Audio not available
    }
  }, []);

  const stop = useCallback(() => {
    nodesRef.current.forEach((n) => {
      try { n.disconnect(); } catch {}
    });
    nodesRef.current = [];
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else start();
  }, [isPlaying, start, stop]);

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return { isPlaying, toggle, start, stop };
}
