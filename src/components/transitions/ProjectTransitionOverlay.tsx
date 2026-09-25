'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectTransition } from '@/context/TransitionContext';

export default function ProjectTransitionOverlay() {
  const { isTransitioning, phase, meta, progress, onRevealComplete } = useProjectTransition();

  if (!isTransitioning && phase === 'idle') return null;

  // Custom Koto-style cubic bezier ease curve
  const kotoEase = [0.76, 0, 0.24, 1] as const;

  const variants = {
    initial: {
      y: '100%',
    },
    covering: {
      y: '0%',
      transition: {
        duration: 0.35,
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      },
    },
    holding: {
      y: '0%',
      transition: {
        duration: 0.1,
      },
    },
    revealing: {
      y: '-100%',
      transition: {
        duration: 0.45,
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
          className="fixed inset-0 z-[99999] pointer-events-auto bg-black text-white flex flex-col items-center justify-center p-6 select-none"
          style={{ willChange: 'transform' }}
        >
          {/* ── Centered Minimalist Typography ── */}
          <div className="flex flex-col items-center justify-center text-center gap-2 max-w-lg px-4">
            {/* Small Brand Name in Monospace */}
            <h2 className="font-mono text-xs sm:text-sm uppercase tracking-[0.22em] text-white font-medium">
              {meta?.title || 'Case Study'}
            </h2>

            {/* Small Greyed-Out Tagline in Monospace */}
            {meta?.tagline && (
              <p className="font-mono text-[11px] sm:text-xs text-white/40 tracking-wider font-light leading-relaxed max-w-sm sm:max-w-md">
                {meta.tagline}
              </p>
            )}

            {/* Small 100% Counter in Monospace */}
            <div className="font-mono text-xs sm:text-sm tracking-widest text-white/90 tabular-nums mt-3">
              {progress}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
