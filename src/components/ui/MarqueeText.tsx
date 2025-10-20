// src/components/ui/MarqueeText.tsx

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MarqueeTextProps {
  text: string;
  className?: string;
  speed?: number; // pixels per second
  gap?: number; // gap between repeated text in pixels
  direction?: 'left' | 'right';
}

/**
 * MarqueeText Component
 * 
 * Scrolls text horizontally if it overflows its container.
 * If text fits within the container, it displays statically.
 * 
 * @param text - The text to display and scroll
 * @param className - Additional CSS classes for the container
 * @param speed - Animation speed in pixels per second (default: 50)
 * @param gap - Gap between text repeats in pixels (default: 32)
 * @param direction - Scroll direction: 'left' or 'right' (default: 'left')
 * 
 * @example
 * <MarqueeText 
 *   text="Long song title here"
 *   speed={40}
 *   className="text-lg font-bold"
 * />
 */
export function MarqueeText({
  text,
  className = '',
  speed = 50,
  gap = 32,
  direction = 'left',
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [textWidth, setTextWidth] = useState(0);

  // Measure container and text dimensions to determine if scrolling is needed
  useEffect(() => {
    const measureDimensions = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.offsetWidth;

        setTextWidth(textWidth);
        const overflow = textWidth > containerWidth;
        setIsOverflowing(overflow);

        console.log(
          `[MarqueeText] Container: ${containerWidth}px, Text: ${textWidth}px, Overflow: ${overflow}`
        );
      }
    };

    // Wait for fonts to load and layout to settle
    const timeoutId = setTimeout(measureDimensions, 100);

    // Remeasure when window is resized
    window.addEventListener('resize', measureDimensions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measureDimensions);
    };
  }, [text]);

  const totalDistance = textWidth + gap;
  const duration = totalDistance / speed;

  // --- STATIC STATE ---
  // Text fits in container, no animation needed
  if (!isOverflowing) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ overflow: 'hidden' }}
      >
        <span
          ref={textRef}
          style={{
            display: 'inline-block',
            whiteSpace: 'nowrap', // Critical: Ensures accurate text width measurement
          }}
        >
          {text}
        </span>
      </div>
    );
  }

  // --- ANIMATED STATE ---
  // Text overflows container, animate the scroll
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        overflow: 'hidden',
        // Fade effect: text fades at edges (10% and 90% of width)
        maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}
    >
      <motion.div
        animate={{
          // Direction: 'left' moves text right-to-left, 'right' moves text left-to-right
          x: direction === 'left' ? [0, -totalDistance] : [-totalDistance, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
        }}
      >
        {/* First text copy */}
        <span ref={textRef} style={{ display: 'inline-block', flexShrink: 0 }}>
          {text}
        </span>

        {/* Gap between repeats */}
        <div style={{ width: gap, flexShrink: 0 }} />

        {/* Second text copy for seamless looping */}
        <span style={{ display: 'inline-block', flexShrink: 0 }}>
          {text}
        </span>
      </motion.div>
    </div>
  );
}