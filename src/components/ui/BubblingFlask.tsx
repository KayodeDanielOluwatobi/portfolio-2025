'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BubblingFlask() {
  // Generate random bubbles to float up
  const [bubbles, setBubbles] = useState<number[]>([]);

  useEffect(() => {
    // Create static array for bubbles to avoid hydration mismatch
    setBubbles([...Array(8)].map((_, i) => i));
  }, []);

  return (
    <div className="relative w-48 h-64 flex items-center justify-center">
      {/* GLOW EFFECT BEHIND */}
      <div className="absolute inset-0 bg-[#39FF14]/5 blur-3xl rounded-full" />

      <svg
        viewBox="0 0 200 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full z-10"
      >
        {/* --- FLASK GLASS (Outline) --- */}
        <path
          d="M75 20 V100 L25 250 C20 265 30 280 45 280 H155 C170 280 180 265 175 250 L125 100 V20 H75 Z"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Flask Rim */}
        <path
          d="M65 20 H135"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* --- LIQUID (Masked Area) --- */}
        <defs>
          <clipPath id="flaskMask">
            <path d="M79 100 L33 248 C30 258 35 276 45 276 H155 C165 276 170 258 167 248 L121 100 V100 Z" />
          </clipPath>
        </defs>

        {/* Liquid Fill */}
        <g clipPath="url(#flaskMask)">
          {/* Base Color */}
          <rect x="0" y="140" width="200" height="160" fill="#39FF14" fillOpacity="0.1" />
          
          {/* Top Surface Line of Liquid */}
          <motion.path
            d="M20 140 Q 100 150 180 140"
            stroke="#39FF14"
            strokeWidth="3"
            strokeOpacity="0.8"
            animate={{ d: ["M20 140 Q 100 135 180 140", "M20 140 Q 100 145 180 140", "M20 140 Q 100 135 180 140"] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />

          {/* Bubbles */}
          {bubbles.map((i) => (
            <motion.circle
              key={i}
              r={Math.random() * 4 + 2} // Random size 2-6
              fill="#39FF14"
              initial={{ 
                x: 100 + (Math.random() * 60 - 30), // Random X position inside
                y: 280, // Start at bottom
                opacity: 0 
              }}
              animate={{ 
                y: 120, // Float to top
                opacity: [0, 0.8, 0] // Fade in then out
              }}
              transition={{
                duration: Math.random() * 2 + 2, // Random speed 2-4s
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear"
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}