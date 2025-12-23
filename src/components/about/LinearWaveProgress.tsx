'use client';

import React, { useState, useEffect, useRef } from 'react';

const LinearWaveProgress = ({ 
  progress = 0,
  height = 8,
  trackHeight = 8,
  waveHeight = 8,        
  trackColor = '#27272a',
  waveColor = '#6366f1',
  waveAmplitude = 6,
  maxWaveFrequency = 2,
  undulationSpeed = 3,
  edgeGap = 5,
  relaxationDuration = 1000,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [phase, setPhase] = useState(0);
  const [relaxProgress, setRelaxProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Measure Width
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  // Animation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(prev => (prev + 0.1 * undulationSpeed) % (Math.PI * 2));
    }, 16);
    return () => clearInterval(interval);
  }, [undulationSpeed]);
  
  // Relaxation Logic
  useEffect(() => {
    if (progress >= 100 && !hasCompleted) {
      setHasCompleted(true);
      setRelaxProgress(0);
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / relaxationDuration, 1);
        setRelaxProgress(p);
        if (p < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    } else if (progress < 100) {
      setHasCompleted(false);
      setRelaxProgress(0);
    }
  }, [progress, relaxationDuration, hasCompleted]);
  
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const currentAmplitude = waveAmplitude * (1 - relaxProgress);
  
  const viewBoxHeight = height + (waveAmplitude * 4);
  const containerHeight = height + (waveAmplitude * 2);
  const radius = waveHeight / 2;
  
  // Generate Path
  const createWavePath = () => {
    if (clampedProgress === 0 || width === 0) return '';
    
    const points = [];
    const internalWidth = width - (radius * 2);
    const progressWidth = (clampedProgress / 100) * internalWidth;
    
    const segments = Math.max(10, Math.floor(progressWidth / 2)); 
    const centerY = viewBoxHeight / 2;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = radius + (t * progressWidth);
      
      const relativeX = x / width; 
      const waveOffset = Math.sin(relativeX * maxWaveFrequency * Math.PI * 2 + phase) * currentAmplitude;
      const y = centerY + waveOffset;
      
      points.push(`${x},${y}`);
    }
    
    return points.length > 1 ? `M ${points.join(' L ')}` : '';
  };

  const internalWidth = width - (radius * 2);
  const trackStartX = radius + ((clampedProgress / 100) * internalWidth) + edgeGap;
  const trackWidth = Math.max(0, (width - radius) - trackStartX);
  const shouldShowTrack = clampedProgress < 100 && trackWidth > 0 && width > 0;

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full ${className}`} 
      style={{ height: `${containerHeight}px` }}
    >
      {width > 0 && (
        <svg 
          width="100%"
          height={containerHeight}
          className="absolute inset-0 block" 
          viewBox={`0 0 ${width} ${viewBoxHeight}`}
          preserveAspectRatio="none"
        >
          {shouldShowTrack && (
            <rect
              x={trackStartX}
              y={(viewBoxHeight - trackHeight) / 2}
              width={trackWidth}
              height={trackHeight}
              fill={trackColor}
              rx={trackHeight / 2}
            />
          )}
          
          {clampedProgress > 0 && (
            <path
              d={createWavePath()}
              fill="none"
              stroke={waveColor}
              strokeWidth={waveHeight}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      )}
    </div>
  );
};

export default LinearWaveProgress;