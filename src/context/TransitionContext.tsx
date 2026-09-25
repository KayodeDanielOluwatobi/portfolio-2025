'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface TransitionMeta {
  title: string;
  tagline?: string;
  brandColor?: string;
}

interface TransitionContextType {
  isTransitioning: boolean;
  phase: 'idle' | 'covering' | 'holding' | 'revealing';
  meta: TransitionMeta | null;
  progress: number;
  navigateWithTransition: (url: string, meta?: TransitionMeta) => void;
  onRevealComplete: () => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'covering' | 'holding' | 'revealing'>('idle');
  const [meta, setMeta] = useState<TransitionMeta | null>(null);
  const [progress, setProgress] = useState(0);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  const animFrameRef = useRef<number | null>(null);

  const navigateWithTransition = useCallback((url: string, projectMeta?: TransitionMeta) => {
    if (isTransitioning) return;

    try {
      router.prefetch(url);
    } catch {
      // ignore
    }

    setMeta(projectMeta || { title: 'Case Study' });
    setTargetUrl(url);
    setIsTransitioning(true);
    setPhase('covering');
    setProgress(0);

    // Exact 2.5 seconds (2500ms) timeframe
    const duration = 2500;
    const startTime = performance.now();

    // Smooth countup animation using requestAnimationFrame
    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(1, elapsed / duration);

      // Smooth cubic-bezier countup progression: slow start, quick glide, precise finish
      // EaseOutCubic: 1 - Math.pow(1 - t, 3)
      const easedT = 1 - Math.pow(1 - t, 3);
      const currentPct = Math.min(100, Math.floor(easedT * 100));

      setProgress(currentPct);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        setPhase('holding');
        router.push(url);

        // Allow a brief moment at 100% then trigger upward reveal
        setTimeout(() => {
          setPhase('revealing');
        }, 150);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, [isTransitioning, router]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const onRevealComplete = useCallback(() => {
    setIsTransitioning(false);
    setPhase('idle');
    setMeta(null);
    setTargetUrl(null);
    setProgress(0);
  }, []);

  return (
    <TransitionContext.Provider
      value={{
        isTransitioning,
        phase,
        meta,
        progress,
        navigateWithTransition,
        onRevealComplete,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export function useProjectTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useProjectTransition must be used within a TransitionProvider');
  }
  return context;
}
