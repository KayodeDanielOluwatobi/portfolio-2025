// components/spotify/AudioVisualizer.tsx

import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

type PulsePattern = 'wave' | 'mirror' | 'random' | 'bounce' | 'uniform';

interface FrequencyFrame {
  frame: number;
  bass: number;
  mid: number;
  treble: number;
}

interface AudioVisualizerProps {
  // Pattern Configuration
  barCount?: number;
  pulsePattern?: PulsePattern;
  useSequentialPatterns?: boolean;
  sequenceId?: number | string;

  // Visual Configuration
  barWidth?: number;
  barSpacing?: number;
  maxHeight?: number;
  containerHeight?: number;
  containerWidth?: string;

  // Color Configuration
  barColor?: string;

  // Animation Configuration
  animationSpeed?: number;
  restHeight?: number;

  // Frequency Data (optional)
  frequencyData?: FrequencyFrame[];
  currentProgressMs?: number; // Spotify progress in milliseconds

  // Styling
  className?: string;
}

// Constants
const FRAME_TIMING_MS = 11.6; // From librosa: hop_length / sr = 512 / 44100
const MAX_BARS = 20;

// Hash function for sequential patterns
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get pattern from sequence
function getPatternFromSequence(sequenceId?: number | string): PulsePattern {
  const patterns: PulsePattern[] = ['wave', 'mirror', 'random', 'bounce', 'uniform'];

  if (sequenceId === undefined || sequenceId === null) {
    return 'mirror';
  }

  const index = typeof sequenceId === 'number' ? sequenceId : hashCode(String(sequenceId));
  return patterns[index % patterns.length];
}

// Split bars among frequency bands dynamically
function splitBarsAmongFrequencies(barCount: number): {
  bass: number;
  mid: number;
  treble: number;
} {
  // Golden ratio distribution (humans hear bass better)
  const bassRatio = 0.45; // 45% to bass
  const midRatio = 0.35; // 35% to mid
  const trebleRatio = 0.20; // 20% to treble

  const bassBars = Math.max(1, Math.round(barCount * bassRatio));
  const midBars = Math.max(1, Math.round(barCount * midRatio));
  const trebleBars = Math.max(1, barCount - bassBars - midBars);

  return { bass: bassBars, mid: midBars, treble: trebleBars };
}

// Get max frequencies from entire dataset (for normalization)
function getMaxFrequencies(frequencyData: FrequencyFrame[]): {
  bass: number;
  mid: number;
  treble: number;
} {
  let maxBass = 0;
  let maxMid = 0;
  let maxTreble = 0;

  frequencyData.forEach((frame) => {
    maxBass = Math.max(maxBass, frame.bass);
    maxMid = Math.max(maxMid, frame.mid);
    maxTreble = Math.max(maxTreble, frame.treble);
  });

  // Fallback to 1 if all zeros
  return {
    bass: maxBass || 1,
    mid: maxMid || 1,
    treble: maxTreble || 1,
  };
}

// Normalize frequency value to 0-1 range
function normalizeFrequency(value: number, max: number): number {
  if (max === 0) return 0;
  const normalized = value / max;
  return Math.max(0, Math.min(normalized, 1));
}

// Map frequency data to bar heights
function mapFrequencyToBars(
  frequencyData: FrequencyFrame,
  barCount: number,
  maxHeight: number,
  restHeight: number,
  maxFrequencies: { bass: number; mid: number; treble: number }
): number[] {
  const { bass: bassBars, mid: midBars, treble: trebleBars } = splitBarsAmongFrequencies(
    barCount
  );

  // Normalize frequencies
  const bassNorm = normalizeFrequency(frequencyData.bass, maxFrequencies.bass);
  const midNorm = normalizeFrequency(frequencyData.mid, maxFrequencies.mid);
  const trebleNorm = normalizeFrequency(frequencyData.treble, maxFrequencies.treble);

  const heights: number[] = [];
  let barIndex = 0;

  // Bass bars
  for (let i = 0; i < bassBars; i++) {
    const height = restHeight + bassNorm * maxHeight;
    heights.push(Math.max(restHeight, Math.min(height, maxHeight + restHeight)));
    barIndex++;
  }

  // Mid bars
  for (let i = 0; i < midBars; i++) {
    const height = restHeight + midNorm * maxHeight;
    heights.push(Math.max(restHeight, Math.min(height, maxHeight + restHeight)));
    barIndex++;
  }

  // Treble bars
  for (let i = 0; i < trebleBars; i++) {
    const height = restHeight + trebleNorm * maxHeight;
    heights.push(Math.max(restHeight, Math.min(height, maxHeight + restHeight)));
    barIndex++;
  }

  return heights;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  // Pattern
  barCount = 8,
  pulsePattern = 'mirror',
  useSequentialPatterns = false,
  sequenceId,

  // Visual
  barWidth = 4,
  barSpacing = 4,
  maxHeight = 80,
  containerHeight = 100,
  containerWidth = '100%',

  // Color
  barColor = '#1DB954',

  // Animation
  animationSpeed = 1,
  restHeight = 2,

  // Frequency data
  frequencyData,
  currentProgressMs = 0,

  // Styling
  className = '',
}) => {
  const controls = Array.from({ length: MAX_BARS }, () => useAnimationControls());
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  // Determine final pattern
  const finalPattern = useSequentialPatterns
    ? getPatternFromSequence(sequenceId)
    : pulsePattern;

  // Pre-calculate max frequencies for normalization (memoized)
  const maxFrequencies = useMemo(() => {
    if (frequencyData && frequencyData.length > 0) {
      return getMaxFrequencies(frequencyData);
    }
    return { bass: 1, mid: 1, treble: 1 };
  }, [frequencyData]);

  // Calculate current frame index from progress
  const currentFrameIndex = useMemo(() => {
    if (!frequencyData || frequencyData.length === 0) return 0;
    const index = Math.floor(currentProgressMs / FRAME_TIMING_MS);
    return Math.min(index, frequencyData.length - 1);
  }, [currentProgressMs, frequencyData]);

  useEffect(() => {
    startTimeRef.current = Date.now(); // Reset start time on mount
    
    const animateBars = () => {
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
      const hasFrequencyData = frequencyData && frequencyData.length > 0;

      controls.slice(0, barCount).forEach((control, index) => {
        let height = restHeight;

        // If frequency data exists, use it
        if (hasFrequencyData) {
          const frameData = frequencyData![currentFrameIndex];
          if (frameData) {
            const heights = mapFrequencyToBars(
              frameData,
              barCount,
              maxHeight,
              restHeight,
              maxFrequencies
            );
            height = heights[index] || restHeight;
          }
        } else {
          // Fallback to sine wave patterns
          const baseFreq = 0.005 * animationSpeed;

          switch (finalPattern) {
            case 'wave':
              height =
                restHeight +
                (Math.sin(elapsedTime * baseFreq + index * 0.5) * 0.5 + 0.5) * maxHeight;
              break;

            case 'mirror':
              const center = barCount / 2;
              const dist = Math.abs(index - center);
              height =
                restHeight +
                (Math.sin(elapsedTime * baseFreq + dist * 0.3) * 0.5 + 0.5) * maxHeight;
              break;

            case 'random':
              height =
                restHeight +
                (Math.sin(elapsedTime * baseFreq * (1 + index * 0.1)) * 0.3 +
                  Math.sin(elapsedTime * baseFreq * 2 * (1 + index * 0.05)) * 0.3 +
                  Math.random() * 0.4) *
                  maxHeight;
              break;

            case 'bounce':
              height =
                restHeight +
                Math.abs(Math.sin(elapsedTime * baseFreq + index * Math.PI)) * maxHeight;
              break;

            case 'uniform':
              height =
                restHeight + (Math.sin(elapsedTime * baseFreq) * 0.5 + 0.5) * maxHeight;
              break;

            default:
              height =
                restHeight +
                (Math.sin(elapsedTime * baseFreq + index * 0.5) * 0.5 + 0.5) * maxHeight;
          }
        }

        // Clamp height
        height = Math.max(restHeight, Math.min(height, maxHeight + restHeight));

        // Animate to new height
        control.start({
          height,
          transition: { duration: 0.1, ease: 'easeOut' },
        });
      });

      frameRef.current = requestAnimationFrame(animateBars);
    };

    frameRef.current = requestAnimationFrame(animateBars);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [
    barCount,
    maxHeight,
    animationSpeed,
    finalPattern,
    frequencyData,
    currentFrameIndex,
    restHeight,
    maxFrequencies,
  ]);

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        height: `${containerHeight}px`,
        width: containerWidth,
      }}
    >
      {Array.from({ length: barCount }).map((_, index) => (
        <motion.div
          key={index}
          animate={controls[index]}
          style={{
            width: `${barWidth}px`,
            backgroundColor: barColor,
            marginLeft: index > 0 ? `${barSpacing}px` : 0,
            borderRadius: `${barWidth / 2}px`,
            transformOrigin: 'center',
          }}
          initial={{ height: restHeight }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;