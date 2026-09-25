'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectTransition } from '@/context/TransitionContext';

export default function ProjectTransitionOverlay() {
  const { isTransitioning, phase, meta, progress, onRevealComplete } = useProjectTransition();

  if (!isTransitioning && phase === 'idle') return null;

  // Ultra-creamy, cinematic cubic bezier ease curve
  const kotoEase = [0.76, 0, 0.24, 1] as const;

  const variants = {
    initial: {
      y: '100%',
    },
    covering: {
      y: '0%',
      transition: {
        duration: 0.75,
        ease: [0.77, 0, 0.175, 1] as [number, number, number, number],
      },
    },
    holding: {
      y: '0%',
      transition: {
        duration: 0.15,
      },
    },
    revealing: {
      y: '-100%',
      transition: {
        duration: 1.1,
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key="project-transition-overlay"
          initial="initial"
          animate={phase === 'revealing' ? 'revealing' : phase === 'covering' ? 'covering' : 'holding'}
          variants={variants}
          onAnimationComplete={(definition) => {
            if (definition === 'revealing') {
              onRevealComplete();
            }
          }}
          className="fixed inset-0 z-[99999] pointer-events-auto bg-[#070707] text-white flex flex-col items-center justify-center p-6 select-none"
          style={{ willChange: 'transform' }}
        >
          {/* ── Centered Minimalist Monospace Typography ── */}
          <motion.div
            animate={phase === 'revealing' ? { opacity: 0, y: -25, transition: { duration: 0.4, ease: 'easeOut' } } : { opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center gap-2.5 max-w-lg px-4"
          >
            {/* Brand Name in Monoblock (Subtle / Dimmed, larger size) */}
            <h2 className="font-space text-sm sm:text-base md:text-lg uppercase tracking-wider text-white/50 font-normal">
              {meta?.title || 'Case Study'}
            </h2>

            {/* Small Greyed-Out Tagline in Monoblock */}
            {meta?.tagline && (
              <p className="font-space text-xs sm:text-sm text-white/30 tracking-normal font-light leading-relaxed max-w-sm sm:max-w-md mt-1">
                {meta.tagline}
              </p>
            )}

            {/* 100% Counter in Monoblock (Bright White, with generous spacing from brand name) */}
            <div className="font-space text-sm sm:text-base md:text-lg tracking-normal text-white font-medium tabular-nums mt-6 sm:mt-8">
              {progress}%
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
