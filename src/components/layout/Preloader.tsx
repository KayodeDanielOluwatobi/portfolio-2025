'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SECTIONS = [
  "INITIALIZING...",
  "EVERDANN_DESIGNS",
  "HEADER",
  "HERO_SECTION",
  "BIO_DATA",
  "BRAND_SHOWCASE",
  "SOCIAL_MEDIA_DESIGNS",
  "CHURCH_MEDIA_DESIGNS",
  "KEYCAP_MAPPER",
  "FOOTER_FINALIZING",
  "SYSTEM_READY"
];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Determine which section text to show based on percentage
  const sectionIndex = Math.min(
    Math.floor((count / 100) * SECTIONS.length),
    SECTIONS.length - 1
  );

  useEffect(() => {
    let currentCount = 0;
    let timeoutId: NodeJS.Timeout;

    const updateCount = () => {
      if (currentCount >= 100) {
        setIsFinished(true);
        return;
      }

      currentCount += 1;
      setCount(currentCount);

      let delay = 10; 
      const rand = Math.random();

      if (currentCount > 90) {
        delay = Math.random() * 80 + 30; 
      } else if (rand > 0.95) {
        delay = Math.random() * 300 + 50;
      } else if (rand > 0.8) {
        delay = Math.random() * 40 + 10;
      } else {
        delay = Math.random() * 8 + 2;
      }

      timeoutId = setTimeout(updateCount, delay);
    };

    updateCount();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (isFinished) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [isFinished, onComplete]);

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ 
        y: "-100%", 
        transition: { duration: 0.8, ease: [0.7, 0, 0.3, 1] } 
      }}
      className="fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center cursor-none"
    >
      {/* TOP LEFT TEXT */}
      <div className="absolute top-4 left-4 md:top-4 md:left-4">
        <span className="font-space text-[10px] md:text-xs text-zinc-500 uppercase tracking-[0em]">
          FAKE LOADER
        </span>
      </div>

      {/* CENTER NUMBER */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-space text-8xl md:text-9xl text-white leading-none select-none tracking-0">
          {count}%
        </h1>
      </div>
      
      {/* BOTTOM RIGHT INFO */}
      <div className="absolute bottom-4 right-4 md:bottom-4 md:right-4 text-[7.5px] md:text-[10px] text-zinc-500 font-mono text-right uppercase tracking-[0.1em] space-y-0.5">
        <p>Status: <span className="text-zinc-300">Online</span></p>
        <p>Processing: <span className="text-green-500">{SECTIONS[sectionIndex]}</span></p>
      </div>
    </motion.div>
  );
}