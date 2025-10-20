'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Hero from '@/components/layout/Hero';
import Bio from '@/components/layout/Bio';
import ViewportIndicator from '@/components/layout/ViewportIndicator';
import { brandShowcases, DEFAULT_CURSOR_COLOR, DEFAULT_CURSOR_STROKE } from '@/data/brandShowcases';
import { darkenColor } from '@/utils/colorUtils';
import { useBrandRotation } from '@/hooks/useBrandRotation';
import { useCursorPosition } from '@/hooks/useCursorPosition';
import MoreBio from '@/components/layout/MoreBio';
import Footer from '@/components/layout/Footer';
import AudioVisualizer from '@/components/spotify/AudioVisualizer';
import { MarqueeText } from '@/components/ui/MarqueeText';



// Dynamic import to prevent hydration issues
const SmoothCursor = dynamic(
  () => import('@/components/layout/SmoothCursor').then(mod => ({ default: mod.SmoothCursor })),
  { ssr: false }
);

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Custom hooks for cleaner logic
  const { currentIndex, setCurrentIndex, isTransitioning } = useBrandRotation({ 
    totalBrands: brandShowcases.length,
    intervalDuration: 7000,
    fadeDuration: 400 
  });
  const cursorInHeroHeader = useCursorPosition();
  
  const currentBrand = brandShowcases[currentIndex];

  // Determine cursor colors based on section and mobile menu state
  const cursorFillColor = isMobileMenuOpen 
    ? DEFAULT_CURSOR_COLOR 
    : (cursorInHeroHeader ? currentBrand.cursorColor : DEFAULT_CURSOR_COLOR);

  const cursorStrokeColor = isMobileMenuOpen 
    ? DEFAULT_CURSOR_STROKE 
    : (cursorInHeroHeader ? darkenColor(currentBrand.cursorColor) : DEFAULT_CURSOR_STROKE);






  return (
    <main>
      {/* SmoothCursor with dynamic colors */}
      <SmoothCursor 
        cursorColor={cursorFillColor}
        cursorStrokeColor={cursorStrokeColor}
      />
      
      {/* Header with current brand theme */}
      <Header 
        currentBrand={currentBrand.logoVariant}
        onMobileMenuToggle={setIsMobileMenuOpen}
      />
      
      {/* Hero with brand showcase rotation */}
      <Hero 
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        brandShowcases={brandShowcases}
        isTransitioning={isTransitioning}
      />

      <Bio />
      
      <MoreBio />
      
      <Footer />
      
      <ViewportIndicator />
    </main>
  );
}