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
  barCount?: number;
  pulsePattern?: PulsePattern;
  useSequentialPatterns?: boolean;
  sequenceId?: number | string;
  barWidth?: number;
  barSpacing?: number;
  maxHeight?: number;
  containerHeight?: number;
  containerWidth?: string;
  barColor?: string;
  animationSpeed?: number;
  restHeight?: number;
  frequencyData?: FrequencyFrame[];
  currentProgressMs?: number;
  className?: string;
  staggerAmount?: number;
  decayFactor?: number;
}

const FRAME_TIMING_MS = 11.6;
const MAX_BARS = 20;

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getPatternFromSequence(sequenceId?: number | string): PulsePattern {
  const patterns: PulsePattern[] = ['wave', 'mirror', 'random', 'bounce', 'uniform'];

  if (sequenceId === undefined || sequenceId === null) {
    return 'mirror';
  }

  const index = typeof sequenceId === 'number' ? sequenceId : hashCode(String(sequenceId));
  return patterns[index % patterns.length];
}

function splitBarsAmongFrequencies(barCount: number): {
  bass: number;
  mid: number;
  treble: number;
} {
  const bassRatio = 0.45;
  const midRatio = 0.35;
  const trebleRatio = 0.20;

  const bassBars = Math.max(1, Math.round(barCount * bassRatio));
  const midBars = Math.max(1, Math.round(barCount * midRatio));
  const trebleBars = Math.max(1, barCount - bassBars - midBars);

  return { bass: bassBars, mid: midBars, treble: trebleBars };
}

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

  return {
    bass: maxBass || 1,
    mid: maxMid || 1,
    treble: maxTreble || 1,
  };
}

function normalizeFrequency(value: number, max: number): number {
  if (max === 0) return 0;
  const normalized = value / max;
  return Math.max(0, Math.min(normalized, 1));
}

// Map frequency data to bar heights with staggering and decay effect
function mapFrequencyToBars(
  frequencyData: FrequencyFrame,
  barCount: number,
  maxHeight: number,
  restHeight: number,
  maxFrequencies: { bass: number; mid: number; treble: number },
  previousHeights: number[] = [],
  decayFactor: number = 0.15,
  staggerAmount: number = 0.3
): number[] {
  const { bass: bassBars, mid: midBars, treble: trebleBars } = splitBarsAmongFrequencies(
    barCount
  );

  const bassNorm = normalizeFrequency(frequencyData.bass, maxFrequencies.bass);
  const midNorm = normalizeFrequency(frequencyData.mid, maxFrequencies.mid);
  const trebleNorm = normalizeFrequency(frequencyData.treble, maxFrequencies.treble);

  const heights: number[] = [];
  let barIndex = 0;

  // Helper function to apply staggering and decay
  const applyStaggeringAndDecay = (
    frequencyNorm: number,
    barIndexInGroup: number,
    totalBarsInGroup: number,
    globalBarIndex: number
  ): number => {
    // Staggering: vary each bar slightly based on position
    const staggerVariation = (1 - staggerAmount / 2) + (barIndexInGroup / Math.max(1, totalBarsInGroup - 1)) * staggerAmount;
    const staggeredHeight = restHeight + (frequencyNorm * staggerVariation) * maxHeight;

    // Decay/lag effect: blend with previous height for smooth interpolation
    const previousHeight = previousHeights[globalBarIndex] || staggeredHeight;
    const decayedHeight = previousHeight * decayFactor + staggeredHeight * (1 - decayFactor);

    return Math.max(restHeight, Math.min(decayedHeight, maxHeight + restHeight));
  };

  // Bass bars
  for (let i = 0; i < bassBars; i++) {
    const height = applyStaggeringAndDecay(bassNorm, i, bassBars, barIndex);
    heights.push(height);
    barIndex++;
  }

  // Mid bars
  for (let i = 0; i < midBars; i++) {
    const height = applyStaggeringAndDecay(midNorm, i, midBars, barIndex);
    heights.push(height);
    barIndex++;
  }

  // Treble bars
  for (let i = 0; i < trebleBars; i++) {
    const height = applyStaggeringAndDecay(trebleNorm, i, trebleBars, barIndex);
    heights.push(height);
    barIndex++;
  }

  return heights;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  barCount = 8,
  pulsePattern = 'mirror',
  useSequentialPatterns = false,
  sequenceId,
  barWidth = 4,
  barSpacing = 4,
  maxHeight = 80,
  containerHeight = 100,
  containerWidth = undefined,
  barColor = '#1DB954',
  animationSpeed = 1,
  restHeight = 2,
  frequencyData,
  currentProgressMs = 0,
  className = '',
  staggerAmount = 0.3,
  decayFactor = 0.15,
}) => {
  const controls = Array.from({ length: MAX_BARS }, () => useAnimationControls());
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const previousHeightsRef = useRef<number[]>([]);

  const finalPattern = useSequentialPatterns
    ? getPatternFromSequence(sequenceId)
    : pulsePattern;

  const maxFrequencies = useMemo(() => {
    if (frequencyData && frequencyData.length > 0) {
      return getMaxFrequencies(frequencyData);
    }
    return { bass: 1, mid: 1, treble: 1 };
  }, [frequencyData]);

  const currentFrameIndex = useMemo(() => {
    if (!frequencyData || frequencyData.length === 0) return 0;
    const index = Math.floor(currentProgressMs / FRAME_TIMING_MS);
    return Math.min(index, frequencyData.length - 1);
  }, [currentProgressMs, frequencyData]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    
    const animateBars = () => {
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
      const hasFrequencyData = frequencyData && frequencyData.length > 0;

      const newHeights: number[] = [];

      controls.slice(0, barCount).forEach((control, index) => {
        let height = restHeight;

        if (hasFrequencyData) {
          const frameData = frequencyData![currentFrameIndex];
          if (frameData) {
            const heights = mapFrequencyToBars(
              frameData,
              barCount,
              maxHeight,
              restHeight,
              maxFrequencies,
              previousHeightsRef.current,
              decayFactor,
              staggerAmount
            );
            height = heights[index] || restHeight;
          }
        } else {
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

        height = Math.max(restHeight, Math.min(height, maxHeight + restHeight));
        newHeights.push(height);

        control.start({
          height,
          transition: { duration: 0.1, ease: 'easeOut' },
        });
      });

      // Store heights for next frame's decay calculation
      previousHeightsRef.current = newHeights;

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

  // Calculate dynamic width based on bars, barWidth, and barSpacing
  const dynamicWidth = containerWidth || `${barCount * barWidth + (barCount - 1) * barSpacing}px`;

  return (
    <div
      className={`flex items-center justify-start w-fit ${className}`}
      style={{
        height: `${containerHeight}px`,
        width: dynamicWidth,
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


