// components/CircularWavyProgress.tsx
'use client';

import React from 'react';
import { motion, useTime, useTransform } from 'framer-motion';

// --- Component Props ---
interface CircularWavyProgressProps {
  /** The overall size (width and height) of the SVG component in pixels. */
  size?: number;
  /** The color of the background track. */
  trackColor?: string;
  /** The stroke width of the background track. */
  trackWidth?: number;
  /** The color of the active wavy progress indicator. */
  progressColor?: string;
  /** The stroke width of the active wavy progress indicator. */
  progressWidth?: number;
  /** The number of waves visible on the circle at one time. */
  waveLength?: number;
  /** The height of the waves (crest and trough) from the baseline, in pixels. */
  waveAmplitude?: number;
  /** The speed of the wave flow. Higher is faster. */
  speed?: number;
  /** Optional className to apply to the SVG element. */
  className?: string;
}

/**
 * Generates the 'd' attribute for a wavy circular SVG path.
 * @param size - The total size of the SVG.
 * @param strokeWidth - The width of the line (to calculate the radius).
 * @param amplitude - The height of the wave.
 * @param length - The number of waves.
 * @param phase - The animation offset, driven by time.
 * @returns An SVG path string.
 */
const generateWavyPath = (
  size: number,
  strokeWidth: number,
  amplitude: number,
  length: number,
  phase: number
): string => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const points = 360; // How many points to draw (more = smoother)
  let path = '';

  for (let angle = 0; angle <= points; angle++) {
    // 1. Calculate the angle in radians
    const rad = (angle * Math.PI) / 180;
    
    // 2. Calculate the wave offset
    // This creates a sine wave that varies *radially* (in and out)
    // `angle * length` = how many waves
    // `phase` = moves the wave
    const waveOffset =
      amplitude * Math.sin((angle * length * Math.PI) / 180 + phase);
    
    // 3. Calculate the total radius for this point
    const currentRadius = radius + waveOffset;

    // 4. Convert polar coordinates (angle, radius) to Cartesian (x, y)
    const x = center + currentRadius * Math.cos(rad);
    const y = center + currentRadius * Math.sin(rad);

    // 5. Add to the path string
    if (angle === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  path += ' Z'; // Close the path
  return path;
};

// --- The Component ---

export const CircularWavyProgress: React.FC<CircularWavyProgressProps> = ({
  size = 60,
  trackColor = '#E0BBE4', // Light purple
  trackWidth = 6,
  progressColor = '#957DAD', // Deep purple
  progressWidth = 6,
  waveLength = 10,
  waveAmplitude = 3,
  speed = 5,
  className,
}) => {
  const center = size / 2;
  // Calculate radius based on the track's width, so it's centered
  const trackRadius = (size - trackWidth) / 2;

  // 1. Get a continuous time value from Framer Motion
  const time = useTime();
  
  // 2. Transform the time into a looping phase for the sine wave
  // This creates the "flow" effect. We use `clamp: false` to let it loop.
  const phase = useTransform(time, [0, 1000], [0, speed * Math.PI * 2], {
    clamp: false,
  });

  // 3. Transform the phase into the actual SVG 'd' path string
  // This recalculates the path on every frame
  const d = useTransform(phase, (p) =>
    generateWavyPath(size, progressWidth, waveAmplitude, waveLength, p)
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label="Loading"
      role="progressbar"
    >
      {/* 1. The Track */}
      <circle
        cx={center}
        cy={center}
        r={trackRadius}
        fill="none"
        stroke={trackColor}
        strokeWidth={trackWidth}
      />
      
      {/* 2. The Wavy Progress Indicator */}
      <motion.path
        d={d}
        fill="none"
        stroke={progressColor}
        strokeWidth={progressWidth}
        strokeLinecap="round" // Makes the line ends smooth
        strokeLinejoin="round" // Makes the wave corners smooth
      />
    </svg>
  );
};