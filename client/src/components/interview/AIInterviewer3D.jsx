import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import * as THREE from 'three';

/**
 * Emotion state targets for micro-expressions.
 * Each emotion defines target offsets smoothly interpolated in the animation loop.
 */
const EMOTION_TARGETS = {
  neutral: { browOffset: 0, smileAmount: 0, eyeWiden: 0, headTiltX: 0, headTiltZ: 0 },
  interested: { browOffset: 0.02, smileAmount: 0.01, eyeWiden: 0.015, headTiltX: 0.02, headTiltZ: 0 },
  approving: { browOffset: 0.015, smileAmount: 0.04, eyeWiden: 0.01, headTiltX: 0.01, headTiltZ: 0.02 },
  thinking: { browOffset: -0.02, smileAmount: -0.01, eyeWiden: -0.01, headTiltX: -0.02, headTiltZ: -0.015 },
  concerned: { browOffset: -0.025, smileAmount: -0.02, eyeWiden: 0.005, headTiltX: -0.01, headTiltZ: 0.01 },
};

/**
 * Enhanced 3D AI Avatar — professional woman with brown bob, gray blazer, cream blouse.
 */
function AvatarHead({ isSpeaking, isListening, audioData, personality, emotionState = 'neutral' }) {
  const headRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const leftPupilRef = useRef();
  const rightPupilRef = useRef();
  const upperLipRef = useRef();
  const lowerLipRef = useRef();
  const leftBrowRef = useRef();
  const rightBrowRef = useRef();
  const shouldersRef = useRef();
  const rightArmRef = useRef();
  const leftEyelidRef = useRef();
  const rightEyelidRef = useRef();
  const [blinkState, setBlinkState] = useState(1);
  const saccadeRef = useRef({ x: 0, y: 0 });
  const nextSaccadeRef = useRef(0);
  const noteCheckRef = useRef(0);
  const isCheckingNotesRef = useRef(false);

  // Smooth emotion interpolation
  const emotionRef = useRef({ ...EMOTION_TARGETS.neutral });

  // Color palette matching reference: brown bob, gray blazer, cream blouse, warm skin
  const colors = {
    professional: {
      skin: '#F0B897',
      hair: '#4A2C17',
      hairHighlight: '#6B3D22',
      outfit: '#5B6370',
      outfitDark: '#4A5260',
      blouse: '#F0E6D3',
      lip: '#C4727F',
      iris: '#5C3317',
      cheek: '#E8A090',
      brow: '#3D2213',
      earring: '#D4A853',
    },
    technical: {
      skin: '#F0B897',
      hair: '#4A2C17',
      hairHighlight: '#6B3D22',
      outfit: '#3D4550',
      outfitDark: '#2E353D',
      blouse: '#E8DCC8',
      lip: '#B5636F',
      iris: '#3D5C17',
      cheek: '#E8A090',
      brow: '#3D2213',
      earring: '#C0C0C0',
    },
    startup: {
      skin: '#F0B897',
      hair: '#4A2C17',
      hairHighlight: '#6B3D22',
      outfit: '#4A5568',
      outfitDark: '#3D4757',
      blouse: '#F5EDD8',
      lip: '#C4727F',
      iris: '#4A2C50',
      cheek: '#E8A090',
      brow: '#3D2213',
      earring: '#E8C170',
    },
  };

  const c = colors[personality] || colors.professional;

  // Blinking — random 3-5s, occasional double blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(0.06);
      setTimeout(() => setBlinkState(1), 130);
      if (Math.random() < 0.2) {
        setTimeout(() => {
          setBlinkState(0.06);
          setTimeout(() => setBlinkState(1), 100);
        }, 300);
      }
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  useFrame((state) => {
    if (!headRef.current) return;
    const time = state.clock.elapsedTime;

    // --- Smooth emotion interpolation ---
    const target = EMOTION_TARGETS[emotionState] || EMOTION_TARGETS.neutral;
    const emo = emotionRef.current;
    const lerpRate = 0.04;
    emo.browOffset += (target.browOffset - emo.browOffset) * lerpRate;
    emo.smileAmount += (target.smileAmount - emo.smileAmount) * lerpRate;
    emo.eyeWiden += (target.eyeWiden - emo.eyeWiden) * lerpRate;
    emo.headTiltX += (target.headTiltX - emo.headTiltX) * lerpRate;
    emo.headTiltZ += (target.headTiltZ - emo.headTiltZ) * lerpRate;

    // --- HEAD BEHAVIOR by state + emotion micro-expression offset ---
    if (isListening) {
      const nodCycle = Math.sin(time * 1.8) * 0.04 + 0.03;
      headRef.current.rotation.x = nodCycle + emo.headTiltX;
      headRef.current.rotation.y = Math.sin(time * 0.4) * 0.03;
      headRef.current.rotation.z = emo.headTiltZ;
      headRef.current.position.z = 0.08;
      headRef.current.position.y = Math.sin(time * 0.6) * 0.01;
    } else if (isSpeaking) {
      headRef.current.rotation.x = Math.sin(time * 1.8) * 0.035 + 0.015 + emo.headTiltX;
      headRef.current.rotation.y = Math.sin(time * 1.3) * 0.05;
      headRef.current.rotation.z = Math.sin(time * 0.9) * 0.015 + emo.headTiltZ;
      headRef.current.position.y = Math.sin(time * 2.5) * 0.02;
      headRef.current.position.z = 0;
    } else {
      headRef.current.rotation.x = Math.sin(time * 0.5) * 0.03 + emo.headTiltX;
      headRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
      headRef.current.rotation.z = emo.headTiltZ;
      headRef.current.position.y = Math.sin(time * 0.8) * 0.012;
      headRef.current.position.z = 0;
    }

    // --- GAZE: "checking notes" every 8-15s during listening ---
    if (isListening && time > noteCheckRef.current) {
      isCheckingNotesRef.current = true;
      setTimeout(() => { isCheckingNotesRef.current = false; }, 1200);
      noteCheckRef.current = time + 8 + Math.random() * 7;
    }

    // --- LIP-SYNC + emotion smile ---
    if (isSpeaking) {
      const volume = audioData?.volume || 0;
      const mouthOpen = 0.08 + volume * 0.35;
      if (upperLipRef.current) {
        upperLipRef.current.position.y = -0.18 + mouthOpen * 0.12 + emo.smileAmount * 0.5;
      }
      if (lowerLipRef.current) {
        lowerLipRef.current.position.y = -0.22 - mouthOpen * 0.15;
        lowerLipRef.current.scale.x = 1 + volume * 0.15;
      }
    } else {
      const smileBase = isListening ? 0.02 : 0;
      const smile = smileBase + emo.smileAmount;
      if (upperLipRef.current) upperLipRef.current.position.y = -0.18 + smile * 0.5;
      if (lowerLipRef.current) {
        lowerLipRef.current.position.y = -0.22 + smile;
        lowerLipRef.current.scale.x = 1 + Math.abs(smile) * 3;
      }
    }

    // --- EYES + emotion eye widening ---
    if (leftEyeRef.current && rightEyeRef.current) {
      const eyeScale = blinkState + emo.eyeWiden;
      leftEyeRef.current.scale.y = Math.max(0.06, eyeScale);
      rightEyeRef.current.scale.y = Math.max(0.06, eyeScale);
    }

    // --- EYELIDS — follow blink and emotion ---
    if (leftEyelidRef.current && rightEyelidRef.current) {
      const lidDrop = (1 - blinkState) * 0.08 - emo.eyeWiden * 0.5;
      leftEyelidRef.current.position.y = 0.07 - Math.max(0, lidDrop);
      rightEyelidRef.current.position.y = 0.07 - Math.max(0, lidDrop);
      leftEyelidRef.current.scale.y = Math.max(0.3, 1 - emo.eyeWiden * 3);
      rightEyelidRef.current.scale.y = Math.max(0.3, 1 - emo.eyeWiden * 3);
    }

    // Micro-saccades + note-checking gaze
    if (time > nextSaccadeRef.current) {
      if (isCheckingNotesRef.current) {
        saccadeRef.current = { x: 0.04, y: -0.04 };
      } else {
        saccadeRef.current = {
          x: (Math.random() - 0.5) * 0.03,
          y: (Math.random() - 0.5) * 0.02,
        };
      }
      nextSaccadeRef.current = time + 0.8 + Math.random() * 1.2;
    }
    if (leftPupilRef.current && rightPupilRef.current) {
      const lerpSpeed = 0.08;
      leftPupilRef.current.position.x += (saccadeRef.current.x - leftPupilRef.current.position.x) * lerpSpeed;
      leftPupilRef.current.position.y += (saccadeRef.current.y - leftPupilRef.current.position.y) * lerpSpeed;
      rightPupilRef.current.position.x += (saccadeRef.current.x - rightPupilRef.current.position.x) * lerpSpeed;
      rightPupilRef.current.position.y += (saccadeRef.current.y - rightPupilRef.current.position.y) * lerpSpeed;
    }

    // --- EYEBROWS + emotion offset ---
    const browBase = 0.38;
    if (isSpeaking) {
      const browRaise = Math.sin(time * 2.5) * 0.03 + 0.02 + emo.browOffset;
      if (leftBrowRef.current) leftBrowRef.current.position.y = browBase + browRaise;
      if (rightBrowRef.current) rightBrowRef.current.position.y = browBase + browRaise;
    } else if (isListening) {
      const attentive = 0.015 + Math.sin(time * 0.8) * 0.005 + emo.browOffset;
      if (leftBrowRef.current) leftBrowRef.current.position.y = browBase + attentive;
      if (rightBrowRef.current) rightBrowRef.current.position.y = browBase + attentive;
    } else {
      if (leftBrowRef.current) leftBrowRef.current.position.y = browBase + emo.browOffset;
      if (rightBrowRef.current) rightBrowRef.current.position.y = browBase + emo.browOffset;
    }

    // Asymmetric brow for 'thinking' — left brow higher = quizzical
    if (emotionState === 'thinking' && leftBrowRef.current) {
      leftBrowRef.current.position.y += 0.01;
    }

    // --- SHOULDER BREATHING ---
    if (shouldersRef.current) {
      shouldersRef.current.position.y = -1.3 + Math.sin(time * 1.2) * 0.012;
    }

    // --- RIGHT ARM: note-taking gesture during listening ---
    if (rightArmRef.current) {
      if (isListening && isCheckingNotesRef.current) {
        rightArmRef.current.rotation.x = -0.3 + Math.sin(time * 6) * 0.05;
        rightArmRef.current.position.y = -1.15;
      } else {
        rightArmRef.current.rotation.x = 0;
        rightArmRef.current.position.y = -1.3;
      }
    }
  });

  return (
    <group ref={headRef} position={[0, 0, 0]}>
      {/* Head */}
      <mesh castShadow scale={[1, 1.15, 1]}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
        <meshPhysicalMaterial
          color={c.skin}
          roughness={0.45}
          metalness={0.02}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
          sheen={0.5}
          sheenColor={new THREE.Color(c.skin).multiplyScalar(1.12)}
        />
      </mesh>

      {/* Chin — softer jaw definition */}
      <mesh position={[0, -0.55, 0.45]} castShadow>
        <sphereGeometry args={[0.36, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshPhysicalMaterial color={c.skin} roughness={0.5} metalness={0.02} clearcoat={0.35} />
      </mesh>

      {/* Cheek highlights — warmer */}
      <mesh position={[-0.55, 0, 0.7]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color={c.cheek} transparent opacity={0.18} roughness={0.7} />
      </mesh>
      <mesh position={[0.55, 0, 0.7]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color={c.cheek} transparent opacity={0.18} roughness={0.7} />
      </mesh>

      {/* === HAIR — Brown bob cut === */}
      {/* Main hair cap */}
      <mesh position={[0, 0.5, -0.05]} castShadow scale={[1.05, 1.1, 1.05]}>
        <sphereGeometry args={[1.05, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <meshStandardMaterial color={c.hair} roughness={0.7} metalness={0.08} />
      </mesh>
      {/* Hair volume — back */}
      <mesh position={[0, 0.1, -0.65]} castShadow scale={[1.1, 1.3, 0.6]}>
        <sphereGeometry args={[0.85, 16, 16]} />
        <meshStandardMaterial color={c.hair} roughness={0.75} metalness={0.06} />
      </mesh>
      {/* Left side panel — bob length to chin */}
      <mesh position={[-0.88, -0.15, 0.05]} castShadow scale={[0.38, 0.75, 0.45]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={c.hair} roughness={0.72} metalness={0.08} />
      </mesh>
      {/* Right side panel — bob length to chin */}
      <mesh position={[0.88, -0.15, 0.05]} castShadow scale={[0.38, 0.75, 0.45]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={c.hair} roughness={0.72} metalness={0.08} />
      </mesh>
      {/* Fringe / bangs — side-swept */}
      <mesh position={[-0.25, 0.72, 0.7]} castShadow scale={[0.75, 0.18, 0.3]} rotation={[0.15, 0, -0.1]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={c.hairHighlight} roughness={0.65} metalness={0.1} />
      </mesh>
      {/* Hair highlight streak */}
      <mesh position={[0.4, 0.55, 0.45]} scale={[0.25, 0.35, 0.2]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color={c.hairHighlight} roughness={0.6} metalness={0.12} transparent opacity={0.7} />
      </mesh>

      {/* Left Eye */}
      <group position={[-0.3, 0.22, 0.82]}>
        <mesh ref={leftEyeRef}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.15} />
        </mesh>
        <mesh ref={leftEyelidRef} position={[0, 0.07, 0.04]}>
          <boxGeometry args={[0.28, 0.04, 0.12]} />
          <meshPhysicalMaterial color={c.skin} roughness={0.5} />
        </mesh>
        <group ref={leftPupilRef}>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshStandardMaterial color={c.iris} roughness={0.2} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#0D0D0D" roughness={0.1} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.135, 16, 16]} />
          <meshPhysicalMaterial color="#FFFFFF" transparent opacity={0.1} roughness={0} metalness={0.1} clearcoat={1} />
        </mesh>
        <mesh position={[0.03, 0.03, 0.14]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Right Eye */}
      <group position={[0.3, 0.22, 0.82]}>
        <mesh ref={rightEyeRef}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.15} />
        </mesh>
        <mesh ref={rightEyelidRef} position={[0, 0.07, 0.04]}>
          <boxGeometry args={[0.28, 0.04, 0.12]} />
          <meshPhysicalMaterial color={c.skin} roughness={0.5} />
        </mesh>
        <group ref={rightPupilRef}>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshStandardMaterial color={c.iris} roughness={0.2} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#0D0D0D" roughness={0.1} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.135, 16, 16]} />
          <meshPhysicalMaterial color="#FFFFFF" transparent opacity={0.1} roughness={0} metalness={0.1} clearcoat={1} />
        </mesh>
        <mesh position={[-0.03, 0.03, 0.14]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Eyebrows — thinner, more arched, darker brown */}
      <mesh ref={leftBrowRef} position={[-0.3, 0.38, 0.87]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[0.24, 0.035, 0.04]} />
        <meshStandardMaterial color={c.brow} />
      </mesh>
      <mesh ref={rightBrowRef} position={[0.3, 0.38, 0.87]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.24, 0.035, 0.04]} />
        <meshStandardMaterial color={c.brow} />
      </mesh>

      {/* Nose — bridge + tip + nostrils */}
      <mesh position={[0, 0.12, 0.93]}>
        <boxGeometry args={[0.07, 0.18, 0.05]} />
        <meshPhysicalMaterial color={c.skin} roughness={0.55} clearcoat={0.25} />
      </mesh>
      <mesh position={[0, 0.02, 0.97]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshPhysicalMaterial color={c.skin} roughness={0.45} clearcoat={0.35} />
      </mesh>
      <mesh position={[-0.035, -0.02, 0.96]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={new THREE.Color(c.skin).multiplyScalar(0.82)} roughness={0.7} />
      </mesh>
      <mesh position={[0.035, -0.02, 0.96]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={new THREE.Color(c.skin).multiplyScalar(0.82)} roughness={0.7} />
      </mesh>

      {/* Upper Lip — softer pink */}
      <mesh ref={upperLipRef} position={[0, -0.18, 0.92]}>
        <boxGeometry args={[0.26, 0.035, 0.06]} />
        <meshStandardMaterial color={c.lip} roughness={0.3} />
      </mesh>
      {/* Lower Lip */}
      <mesh ref={lowerLipRef} position={[0, -0.22, 0.92]}>
        <boxGeometry args={[0.22, 0.045, 0.06]} />
        <meshStandardMaterial color={c.lip} roughness={0.3} />
      </mesh>

      {/* Ears — with small earring studs */}
      <mesh position={[-0.95, 0.15, 0.1]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.11, 0.035, 8, 12, Math.PI]} />
        <meshPhysicalMaterial color={c.skin} roughness={0.55} clearcoat={0.2} />
      </mesh>
      <mesh position={[0.95, 0.15, 0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <torusGeometry args={[0.11, 0.035, 8, 12, Math.PI]} />
        <meshPhysicalMaterial color={c.skin} roughness={0.55} clearcoat={0.2} />
      </mesh>
      {/* Earring studs */}
      <mesh position={[-0.98, 0.05, 0.12]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color={c.earring} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0.98, 0.05, 0.12]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color={c.earring} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Neck — slightly slimmer */}
      <mesh position={[0, -0.85, 0.1]}>
        <cylinderGeometry args={[0.28, 0.34, 0.55, 16]} />
        <meshPhysicalMaterial color={c.skin} roughness={0.5} clearcoat={0.2} />
      </mesh>

      {/* Shoulders + Gray blazer with cream blouse */}
      <group ref={shouldersRef}>
        {/* Main shoulders — gray blazer */}
        <mesh position={[0, -1.3, 0]}>
          <boxGeometry args={[1.8, 0.45, 0.65]} />
          <meshStandardMaterial color={c.outfit} roughness={0.55} metalness={0.05} />
        </mesh>
        {/* Cream blouse / inner shirt — V-neckline */}
        <mesh position={[0, -1.02, 0.24]}>
          <boxGeometry args={[0.45, 0.16, 0.2]} />
          <meshStandardMaterial color={c.blouse} roughness={0.4} />
        </mesh>
        {/* Blouse neckline extension */}
        <mesh position={[0, -1.15, 0.26]}>
          <boxGeometry args={[0.35, 0.12, 0.16]} />
          <meshStandardMaterial color={c.blouse} roughness={0.4} />
        </mesh>
        {/* Lapel accents — darker gray */}
        <mesh position={[-0.18, -1.12, 0.3]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.14, 0.22, 0.04]} />
          <meshStandardMaterial color={c.outfitDark} roughness={0.45} metalness={0.08} />
        </mesh>
        <mesh position={[0.18, -1.12, 0.3]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.14, 0.22, 0.04]} />
          <meshStandardMaterial color={c.outfitDark} roughness={0.45} metalness={0.08} />
        </mesh>
        {/* Right arm for note-taking */}
        <group ref={rightArmRef} position={[0.7, -1.3, 0.2]}>
          <mesh>
            <boxGeometry args={[0.14, 0.35, 0.14]} />
            <meshStandardMaterial color={c.outfit} roughness={0.55} metalness={0.05} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * Professional office background — warm tones, city window, bookshelf
 */
function OfficeBackground() {
  return (
    <group position={[0, 0, -4]}>
      {/* Back wall — warm gray */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#2A2520" roughness={0.9} />
      </mesh>

      {/* Window — city view (right side) */}
      <mesh position={[2.5, 0.8, -0.9]}>
        <planeGeometry args={[2.2, 2.8]} />
        <meshStandardMaterial color="#4A6080" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Window frame */}
      <mesh position={[2.5, 0.8, -0.88]}>
        <boxGeometry args={[2.3, 0.04, 0.08]} />
        <meshStandardMaterial color="#8B8178" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[2.5, 0.8, -0.88]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[2.9, 0.04, 0.08]} />
        <meshStandardMaterial color="#8B8178" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Window horizontal divider */}
      <mesh position={[2.5, 0.2, -0.87]}>
        <boxGeometry args={[2.2, 0.03, 0.06]} />
        <meshStandardMaterial color="#8B8178" roughness={0.5} />
      </mesh>
      {/* City glow through window */}
      <pointLight position={[2.5, 0.8, -0.5]} intensity={0.3} color="#B8C4D8" distance={5} />

      {/* Bookshelf — left side */}
      <mesh position={[-2.8, 1.2, -0.6]}>
        <boxGeometry args={[2, 0.06, 0.35]} />
        <meshStandardMaterial color="#5C4033" roughness={0.65} />
      </mesh>
      <mesh position={[-2.8, 0.4, -0.6]}>
        <boxGeometry args={[2, 0.06, 0.35]} />
        <meshStandardMaterial color="#5C4033" roughness={0.65} />
      </mesh>
      {/* Books on upper shelf */}
      <mesh position={[-3.4, 1.55, -0.5]}>
        <boxGeometry args={[0.12, 0.32, 0.22]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      <mesh position={[-3.2, 1.52, -0.5]}>
        <boxGeometry args={[0.1, 0.28, 0.22]} />
        <meshStandardMaterial color="#2F4F4F" roughness={0.8} />
      </mesh>
      <mesh position={[-3.05, 1.54, -0.5]}>
        <boxGeometry args={[0.12, 0.3, 0.22]} />
        <meshStandardMaterial color="#8B0000" roughness={0.8} />
      </mesh>
      <mesh position={[-2.85, 1.5, -0.5]}>
        <boxGeometry args={[0.14, 0.26, 0.22]} />
        <meshStandardMaterial color="#2E4057" roughness={0.8} />
      </mesh>
      <mesh position={[-2.65, 1.53, -0.5]}>
        <boxGeometry args={[0.1, 0.3, 0.22]} />
        <meshStandardMaterial color="#556B2F" roughness={0.8} />
      </mesh>
      {/* Books on lower shelf */}
      <mesh position={[-3.3, 0.72, -0.5]}>
        <boxGeometry args={[0.14, 0.25, 0.22]} />
        <meshStandardMaterial color="#4A3728" roughness={0.8} />
      </mesh>
      <mesh position={[-3.1, 0.74, -0.5]}>
        <boxGeometry args={[0.12, 0.28, 0.22]} />
        <meshStandardMaterial color="#1C3A5C" roughness={0.8} />
      </mesh>
      <mesh position={[-2.9, 0.7, -0.5]}>
        <boxGeometry args={[0.1, 0.24, 0.22]} />
        <meshStandardMaterial color="#704214" roughness={0.8} />
      </mesh>

      {/* Plant — right side */}
      <mesh position={[3.5, -1.2, -0.3]}>
        <cylinderGeometry args={[0.18, 0.14, 0.35, 12]} />
        <meshStandardMaterial color="#8B7355" roughness={0.8} />
      </mesh>
      <mesh position={[3.5, -0.85, -0.3]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#2D5016" roughness={0.85} />
      </mesh>

      {/* Desk — warm wood */}
      <mesh position={[0, -2, 0.5]}>
        <boxGeometry args={[5, 0.08, 1.5]} />
        <meshStandardMaterial color="#4A3728" roughness={0.55} metalness={0.03} />
      </mesh>

      {/* Desk items — pen holder */}
      <mesh position={[-1.5, -1.6, 0.3]}>
        <cylinderGeometry args={[0.06, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Desk pad */}
      <mesh position={[0, -1.95, 0.6]}>
        <boxGeometry args={[1.5, 0.02, 0.8]} />
        <meshStandardMaterial color="#2A2520" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Subtle floating particles — warmer tones
 */
function FloatingParticles() {
  const particlesRef = useRef();
  const particleCount = 20;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 10;
      pos[i + 1] = (Math.random() - 0.5) * 10;
      pos[i + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#D4A853" transparent opacity={0.25} sizeAttenuation />
    </points>
  );
}

/**
 * Main 3D AI Interviewer Component
 *
 * @param {string} emotionState — 'neutral' | 'interested' | 'approving' | 'thinking' | 'concerned'
 */
export default function AIInterviewer3D({
  isSpeaking = false,
  isListening = false,
  audioData = { volume: 0, frequency: 0 },
  personality = 'professional',
  emotionState = 'neutral',
  onMuteToggle,
}) {
  const [isMuted, setIsMuted] = useState(false);

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (onMuteToggle) onMuteToggle(newMuted);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#1e2230] via-[#252a35] to-[#1a1e28] rounded-2xl overflow-hidden">
      <Canvas shadows className="w-full h-full" dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={[0, 0.3, 7.8]} fov={40} />

        <ambientLight intensity={0.55} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={0.85} castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-5, 3, -2]} intensity={0.3} color="#D4A853" />
        <pointLight position={[5, -3, -2]} intensity={0.2} color="#B8C4D8" />
        <pointLight position={[0, -2, 3]} intensity={0.2} color="#FFF5E6" />
        <pointLight position={[0, 2, 4]} intensity={0.15} color="#FFFFFF" />

        <Environment preset="city" />

        <OfficeBackground />

        <AvatarHead
          isSpeaking={isSpeaking}
          isListening={isListening}
          audioData={audioData}
          personality={personality}
          emotionState={emotionState}
        />

        <FloatingParticles />

        <ContactShadows position={[0, -1.6, 0]} opacity={0.3} scale={10} blur={2} far={4} />
      </Canvas>

      {/* Mute Button */}
      <motion.button
        onClick={handleMuteToggle}
        className="absolute top-3 right-3 p-2.5 rounded-full glass-morphism border border-white/10 hover:border-white/30 transition-all z-20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-red-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-cyber-blue" />
        )}
      </motion.button>

      {/* Speaking Indicator */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-blue/20 border border-cyber-blue/40 backdrop-blur-sm z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="flex gap-0.5 items-end h-4">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-cyber-blue rounded-full"
                  animate={{
                    height: [3, 6 + (audioData?.volume || 0) * 10, 3, 8 + (audioData?.volume || 0) * 8, 3],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.06 }}
                />
              ))}
            </div>
            <span className="text-xs text-cyber-blue font-medium">Speaking</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && !isSpeaking && (
          <motion.div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/40 backdrop-blur-sm z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-green-400"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-green-400 font-medium">Listening</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
