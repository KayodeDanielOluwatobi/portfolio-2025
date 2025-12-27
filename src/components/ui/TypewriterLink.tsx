'use client';

import { useState, useEffect, useRef } from 'react';
import { useInView, motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const MotionLink = motion(Link);

interface TypewriterLinkProps {
  text: string;
  href: string;
  cursorClass?: string;
}

export default function TypewriterLink({ 
  text, 
  href, 
  cursorClass = "bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" 
}: TypewriterLinkProps) {
  const [displayedText, setDisplayedText] = useState('');
  const containerRef = useRef<HTMLAnchorElement>(null);
  
  const isInView = useInView(containerRef, { once: true, amount: 1 });

  useEffect(() => {
    if (isInView && displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, 45); // 👈 30ms Speed (Faster/Snappier)
      return () => clearTimeout(timeout);
    }
  }, [isInView, displayedText, text]);

  const fluidTransition = { duration: 0.6, ease: [0.25, 1, 0.5, 1] as const };

  return (
    <MotionLink 
      ref={containerRef}
      href={href}
      initial="idle"
      whileHover="hover"
      // 👇 RESPONSIVE TEXT SIZING:
      // text-[10px]           = Base for tiny screens (<350px)
      // min-[350px]:text-xs   = Normal phones (12px)
      // sm:text-sm            = Tablets (14px)
      // md:text-base          = Desktop (16px)
      className="inline-flex items-center font-space text-[10px] min-[350px]:text-xs sm:text-sm md:text-base text-white/60 hover:text-white transition-colors duration-300 uppercase tracking-widest mt-6 md:mt-8 group relative"
    >
      <motion.span 
        variants={{ idle: { x: 0 }, hover: { x: -12 } }}
        transition={{ x: fluidTransition }}
        className="mr-2 text-white/40 group-hover:text-white/60 transition-colors"
      >
        [
      </motion.span>

      <div className="flex items-center whitespace-pre relative">
        <AnimatePresence>
          {displayedText.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, width: 0 }} 
              animate={{ opacity: 1, width: "auto" }} 
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <span 
        className={`ml-1 inline-block w-1 h-2.5 min-[350px]:w-1.5 min-[350px]:h-3 md:w-2 md:h-5 align-middle ${cursorClass} ${
          displayedText.length === text.length ? 'animate-pulse' : 'opacity-100'
        }`} 
      />

      <motion.span 
        layout 
        variants={{ idle: { x: 0 }, hover: { x: 12 } }}
        transition={{ 
          layout: { type: "spring", stiffness: 900, damping: 40 }, 
          x: fluidTransition 
        }}
        className="ml-2 text-white/40 group-hover:text-white/60 transition-colors"
      >
        ]
      </motion.span>
    </MotionLink>
  );
}