'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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

    // Fast high-tech counter animation: 0% to 100% over 480ms
    const startTime = performance.now();
    const duration = 480;

    const timer = setInterval(() => {
      const now = performance.now();
      const elapsed = now - startTime;
      const rawPct = (elapsed / duration) * 100;
      const nextProgress = Math.min(100, Math.floor(rawPct));
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(timer);
        setPhase('holding');
        router.push(url);
      }
    }, 16);
  }, [isTransitioning, router]);

  // When pathname changes to the new page while transitioning, trigger the exit sweep reveal
  useEffect(() => {
    if (isTransitioning && targetUrl) {
      if (pathname === targetUrl || (targetUrl.startsWith('/works/') && pathname.startsWith('/works/'))) {
        const revealTimer = setTimeout(() => {
          setPhase('revealing');
        }, 120);
        return () => clearTimeout(revealTimer);
      }
    }
  }, [pathname, targetUrl, isTransitioning]);

  // Safety fallback if page change takes longer or fails
  useEffect(() => {
    if (isTransitioning && phase === 'holding') {
      const fallbackTimer = setTimeout(() => {
        setPhase('revealing');
      }, 1500);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isTransitioning, phase]);

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
