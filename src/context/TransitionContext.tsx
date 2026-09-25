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
  const routerPrefetched = useRef(false);

  const navigateWithTransition = useCallback((url: string, projectMeta?: TransitionMeta) => {
    if (isTransitioning) return;

    routerPrefetched.current = false;
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

    // Smooth continuous countup progression (easeInOut curve for liquid-smooth ticking)
    const duration = 2100;
    const startTime = performance.now();

    // Smooth countup animation using requestAnimationFrame
    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(1, elapsed / duration);

      // Pre-warm router navigation early during the countup
      if (t > 0.4 && !routerPrefetched.current) {
        routerPrefetched.current = true;
        try {
          router.prefetch(url);
        } catch {}
      }

      // Creamy easeInOutCubic: gentle start, silky acceleration, elegant landing at 100%
      const easedT = t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const currentPct = Math.min(100, Math.floor(easedT * 100));

      setProgress(currentPct);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        setPhase('holding');
        router.push(url);

        // Allow a smooth 320ms hold for Next.js to mount the page before sweeping reveal upwards
        setTimeout(() => {
          setPhase('revealing');
        }, 320);
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
