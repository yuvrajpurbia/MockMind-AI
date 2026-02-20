import { useState, useEffect, useRef } from 'react';

/**
 * Analyzes webcam brightness by sampling a small canvas.
 * Returns brightness level (0-255), low-light flag, and a CSS brightness filter.
 *
 * @param {React.RefObject} videoRef — ref to a <video> element with the camera stream
 * @param {boolean} enabled — toggle detection on/off
 */
export default function useLightDetection(videoRef, enabled = true) {
  const [brightness, setBrightness] = useState(128);
  const [isLowLight, setIsLowLight] = useState(false);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Tiny offscreen canvas for fast luminance sampling
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    canvasRef.current = canvas;
    ctxRef.current = canvas.getContext('2d', { willReadFrequently: true });

    const checkBrightness = () => {
      const video = videoRef?.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      try {
        ctxRef.current.drawImage(video, 0, 0, 64, 48);
        const imageData = ctxRef.current.getImageData(0, 0, 64, 48);
        const data = imageData.data;

        // ITU-R BT.601 weighted luminance
        let total = 0;
        const pixelCount = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        }
        const avg = total / pixelCount;

        setBrightness(Math.round(avg));
        setIsLowLight(avg < 55);
      } catch {
        // Canvas tainted or similar — assume normal light
      }
    };

    const id = setInterval(checkBrightness, 3000);
    return () => clearInterval(id);
  }, [videoRef, enabled]);

  // Auto brightness boost: increase CSS filter when dark
  const brightnessFilter = isLowLight
    ? Math.min(1.6, 1 + (55 - brightness) / 80)
    : 1;

  return { brightness, isLowLight, brightnessFilter };
}
