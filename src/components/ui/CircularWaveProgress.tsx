'use client';

import React, { useState, useEffect } from 'react';

/**
 * CircularWaveProgress - A beautiful circular progress indicator with animated wave effects
 * * @component
 * @example
 * ```jsx
 * <CircularWaveProgress 
 * progress={75} 
 * size={120}
 * waveColor="#6366f1"
 * />
 * ```
 */
const CircularWaveProgress = ({ 
  progress = 0,
  size = 120,
  trackWidth = 9,
  waveWidth = 9,
  trackColor = '#d1d5db',
  waveColor = '#ffffff',
  waveAmplitude = 5,
  maxWaveFrequency = 9,
  undulationSpeed = 3,
  rotationSpeed = 0,
  edgeGap = 12,
  relaxationDuration = 1000,
  isLoading = false,
  className = ''
}) => {
  const [phase, setPhase] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [relaxProgress, setRelaxProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  // Undulation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(prev => (prev + 0.1 * undulationSpeed) % (Math.PI * 2));
    }, 16);
    
    return () => clearInterval(interval);
  }, [undulationSpeed]);
  
  // Rotation animation
  useEffect(() => {
    if (rotationSpeed !== 0) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + rotationSpeed * 0.5) % 360);
      }, 16);
      
      return () => clearInterval(interval);
    }
  }, [rotationSpeed]);
  
  // Relaxation animation when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && !hasCompleted) {
      setHasCompleted(true);
      setRelaxProgress(0);
      
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / relaxationDuration, 1);
        setRelaxProgress(p);
        
        if (p < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    } else if (progress < 100) {
      setHasCompleted(false);
      setRelaxProgress(0);
    }
  }, [progress, relaxationDuration, hasCompleted]);
  
  const center = size / 2;
  const radius = (size - Math.max(trackWidth, waveWidth) - waveAmplitude * 2) / 2;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  const currentWaveFrequency = (clampedProgress / 100) * maxWaveFrequency;
  
  // Calculate relaxed amplitude (gradually reduces to 0)
  const currentAmplitude = waveAmplitude * (1 - relaxProgress);
  
  // Create the wavy progress path
  const createWavePath = () => {
    if (clampedProgress === 0) return '';
    
    const points = [];
    const segments = 300;
    const progressAngle = (clampedProgress / 100) * 360;
    
    const minSegments = 20;
    const actualSegments = Math.max(minSegments, Math.floor(segments * clampedProgress / 100));
    
    for (let i = 0; i <= actualSegments; i++) {
      const t = i / actualSegments;
      const angle = t * progressAngle;
      const radian = (angle - 90) * Math.PI / 180;
      
      const waveOffset = Math.sin(t * currentWaveFrequency * Math.PI * 2 + phase) * currentAmplitude;
      const currentRadius = radius + waveOffset;
      
      const x = center + currentRadius * Math.cos(radian);
      const y = center + currentRadius * Math.sin(radian);
      
      points.push(`${x},${y}`);
    }
    
    return points.length > 1 ? `M ${points.join(' L ')}` : '';
  };
  
  // Create the remaining track path
  const createTrackPath = () => {
    const progressAngle = (clampedProgress / 100) * 360;

    // --- FIX START ---
    // This is the key fix. Your intuition was correct.
    // We check if the remaining angle for the track is less than the combined gaps.
    // If it is, the wave has effectively "eaten" the track, so we draw nothing.
    const remainingAngle = 360 - progressAngle;
    if (clampedProgress > 0 && remainingAngle <= edgeGap * 2) {
      return '';
    }
    // --- FIX END ---
    
    if (clampedProgress >= 100) {
      // No track visible when complete
      return '';
    }
    
    if (clampedProgress === 0) {
      // Full circle when no progress
      return `M ${center},${center - radius}
              A ${radius} ${radius} 0 1 1 ${center},${center + radius}
              A ${radius} ${radius} 0 1 1 ${center},${center - radius}`;
    }
    
    // Calculate angles for the remaining track
    // Track starts after the wave ends (with gap) and goes back to just before wave start (with gap)
    const startAngle = progressAngle + edgeGap;
    const endAngle = 360 - edgeGap;
    
    // Calculate actual arc length
    const arcLength = endAngle - startAngle;
    
    // Convert to radians (offset by 90 degrees to start at top)
    const startRadian = (startAngle - 90) * Math.PI / 180;
    const endRadian = (endAngle - 90) * Math.PI / 180;
    
    const startX = center + radius * Math.cos(startRadian);
    const startY = center + radius * Math.sin(startRadian);
    const endX = center + radius * Math.cos(endRadian);
    const endY = center + radius * Math.sin(endRadian);
    
    // Determine if we need the large arc flag
    // Large arc when the arc spans more than 180 degrees
    const largeArc = arcLength > 180 ? 1 : 0;
    
    return `M ${startX},${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX},${endY}`;
  };
  
  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: `rotate(${rotation}deg)` }}>
        <path
          d={createTrackPath()}
          fill="none"
          stroke={trackColor}
          strokeWidth={trackWidth}
          strokeLinecap="round"
        />
        
        {clampedProgress > 0 && (
          <path
            d={createWavePath()}
            fill="none"
            stroke={waveColor}
            strokeWidth={waveWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
};

export default CircularWaveProgress;
