'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MarqueeVerticalProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // pixels per second
  gap?: number; // gap between the two lists (optional)
}

/**
 * MarqueeVertical Component
 * * Scrolls content vertically (bottom-to-top) in an infinite loop.
 * Automatically handles duplication for the seamless effect.
 */
export function MarqueeVertical({
  children,
  className = '',
  speed = 30, // Default speed
  gap = 0,
}: MarqueeVerticalProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Measure the height of the content to know how far to animate
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
  }, [children]);

  // Calculate duration based on height and speed
  const duration = contentHeight > 0 ? contentHeight / speed : 10;

  return (
    <div 
      className={`relative overflow-hidden h-full ${className}`}
      style={{
        // Fade mask for top and bottom edges
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
      }}
    >
      <motion.div
        className="flex flex-col"
        style={{ gap: gap }}
        animate={{
          y: [0, -contentHeight - gap],
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop"
        }}
      >
        {/* Original Content - Measured for height */}
        <div ref={contentRef} className="flex flex-col shrink-0">
          {children}
        </div>

        {/* Duplicate Content - For seamless looping */}
        <div className="flex flex-col shrink-0">
          {children}
        </div>
      </motion.div>
    </div>
  );
}