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
        duration: 0.46,
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
        duration: 0.48,
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      },
    },
  };

  const brandColor = meta?.brandColor || '#FFFFFF';

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
          className="fixed inset-0 z-[99999] pointer-events-auto bg-[#070707] text-white flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-hidden select-none"
          style={{ willChange: 'transform' }}
        >
          {/* Subtle Ambient Brand Glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 blur-3xl transition-colors duration-500"
            style={{
              background: `radial-gradient(circle at 75% 80%, ${brandColor}44 0%, transparent 60%)`,
            }}
          />

          {/* Top Glowing Edge Accent Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* ── Top Header Micro-Meta ── */}
          <div className="relative z-10 w-full flex items-center justify-between text-[10px] sm:text-xs font-mono tracking-widest text-white/40 uppercase">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>EVERDANN / CASE STUDY</span>
            </div>
            <div className="flex items-center gap-2">
              <span>LOADING ARCHIVE</span>
              <span className="text-white/20">/</span>
              <span className="text-white/60">01</span>
            </div>
          </div>

          {/* ── Main Center / Bottom Staggered Layout ── */}
          <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-8 my-auto md:my-0">
            {/* Brand Title & Tagline Info */}
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/40">
                PROJECT
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white font-space uppercase">
                {meta?.title || 'Case Study'}
              </h2>
              {meta?.tagline && (
                <p className="text-xs sm:text-sm md:text-base font-extralight text-white/60 tracking-wider font-space line-clamp-2 mt-1">
                  {meta.tagline}
                </p>
              )}
            </div>

            {/* ── 100% Progress Number Only Animation ── */}
            <div className="flex flex-col items-start md:items-end flex-shrink-0">
              <div className="font-space text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight tracking-tighter text-white tabular-nums leading-none">
                {String(progress).padStart(2, '0')}
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white/40 font-mono ml-1">
                  %
                </span>
              </div>
              <div className="w-full mt-3 h-[2px] bg-white/10 overflow-hidden rounded-full max-w-[200px] md:max-w-[240px]">
                <div
                  className="h-full bg-white transition-all duration-75 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Bottom Micro Footer ── */}
          <div className="relative z-10 w-full flex items-center justify-between text-[10px] font-mono tracking-widest text-white/30 uppercase">
            <span>TRANSITION ENGINE</span>
            <span>SYSTEM READY · 2025</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
