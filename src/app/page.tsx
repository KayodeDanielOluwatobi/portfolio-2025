'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
// 👇 New Import for Animations
import { AnimatePresence } from 'framer-motion';

import Header from '@/components/layout/Header';
import Hero from '@/components/layout/Hero';
import Bio from '@/components/layout/Bio';
import ViewportIndicator from '@/components/layout/ViewportIndicator';
import { DEFAULT_CURSOR_COLOR, DEFAULT_CURSOR_STROKE, type BrandShowcase } from '@/data/brandShowcases';
import { darkenColor } from '@/utils/colorUtils';
import { useBrandRotation } from '@/hooks/useBrandRotation';
import { useCursorPosition } from '@/hooks/useCursorPosition';
import MoreBio from '@/components/layout/MoreBio';
import FeaturedBrands from '@/components/layout/FeaturedBrands';
import FeaturedSocials from '@/components/layout/FeaturedSocials';
import FeaturedChurch from '@/components/layout/FeaturedChurch';
import KeycapMapper from '@/components/ui/KeyCaps';
import Footer3 from '@/components/layout/Footer3';
import Bottom from '@/components/layout/Bottom';
import { supabase } from '@/utils/supabase/client';
import FadeUp from '@/components/animations/FadeUp';
import Preloader from '@/components/layout/Preloader';

// Dynamic import for the cursor
// const SmoothCursor = dynamic(
//   () => import('@/components/layout/SmoothCursor').then(mod => ({ default: mod.SmoothCursor })),
//   { ssr: false }
// );

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 1. Data State
  const [showcases, setShowcases] = useState<BrandShowcase[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Preloader State 🛑
  // FIX: Initialized with a function to check sessionStorage BEFORE the first render
  // This prevents the "split second" flash on return visits.
  const [isPreloaderActive, setIsPreloaderActive] = useState(() => {
    if (typeof window !== 'undefined') {
      const hasSeen = sessionStorage.getItem('hasSeenPreloader');
      return !hasSeen;
    }
    return true;
  });

  // 3. Cursor Override State (For Hover Interactions)
  const [hoverCursorColor, setHoverCursorColor] = useState<{ fill: string; stroke: string } | null>(null);

  // 4. Scroll Lock Effect 🔒
  // Prevents scrolling while the "System Boot" is active
  useEffect(() => {
    if (isPreloaderActive) {
      document.body.style.overflow = 'hidden';
      // Optional: scroll to top to ensure clean start
      window.scrollTo(0, 0); 
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isPreloaderActive]);

  // 5. Handlers for Child Components
  const handleHoverColor = (fill: string, stroke?: string) => {
    setHoverCursorColor({
      fill,
      stroke: stroke || darkenColor(fill, 40) // Auto-darken if no stroke provided
    });
  };

  const handleResetColor = () => {
    setHoverCursorColor(null);
  };

  // 6. Fetch Data
  useEffect(() => {
    const fetchShowcases = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_showcases')
          .select('*')
          .order('rank', { ascending: true });

        if (error) throw error;

        if (data) {
          const formattedData: BrandShowcase[] = data.map((item) => ({
            id: item.id,
            brandName: item.brand_name,
            tagline: item.tagline,
            chips: item.chips,
            textColor: item.text_color,
            everdannLogo: item.everdann_logo,
            backgroundImage: item.background_image,
            backgroundColor: item.background_color,
            logoVariant: item.logo_variant,
            cursorColor: item.cursor_color,
            hasOverlay: item.has_overlay
          }));
          setShowcases(formattedData);
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowcases();
  }, []);

  // 7. Hero Rotation Logic
  const { currentIndex, setCurrentIndex, isTransitioning } = useBrandRotation({ 
    totalBrands: showcases.length > 0 ? showcases.length : 1,
    intervalDuration: 15000,
    fadeDuration: 400 
  });
  
  const cursorInHeroHeader = useCursorPosition();
  
  const currentBrand = showcases.length > 0 
    ? showcases[currentIndex] 
    : { // Fallback
        id: 'loading',
        brandName: '',
        tagline: '',
        chips: [],
        textColor: '#ffffff',
        everdannLogo: '',
        backgroundImage: '',
        backgroundColor: '#000000',
        logoVariant: 'default',
        cursorColor: DEFAULT_CURSOR_COLOR
      };

  // 8. MASTER CURSOR LOGIC 🧠
  let cursorFillColor = DEFAULT_CURSOR_COLOR;
  let cursorStrokeColor = DEFAULT_CURSOR_STROKE;

  if (isMobileMenuOpen) {
    cursorFillColor = DEFAULT_CURSOR_COLOR;
    cursorStrokeColor = DEFAULT_CURSOR_STROKE;
  } else if (hoverCursorColor) {
    cursorFillColor = hoverCursorColor.fill;
    cursorStrokeColor = hoverCursorColor.stroke;
  } else if (cursorInHeroHeader) {
    cursorFillColor = currentBrand.cursorColor;
    cursorStrokeColor = darkenColor(currentBrand.cursorColor);
  } else {
    cursorFillColor = '#000000';
    cursorStrokeColor = '#ffffff';
  }

  // Handler passed to Preloader to save session
  const handlePreloaderComplete = () => {
    sessionStorage.setItem('hasSeenPreloader', 'true');
    setIsPreloaderActive(false);
  };
  
  // NOTE: We don't return early for loading anymore, 
  // because we want the Preloader to render on top instead.
  
  return (
    <main className="bg-black min-h-screen">
      
      {/* 🛑 PRELOADER LAYER */}
      <AnimatePresence mode="wait">
        {isPreloaderActive && (
          <Preloader onComplete={handlePreloaderComplete} />
        )}
      </AnimatePresence>

      {/* 🚀 MAIN CONTENT LAYER */}
      {/* Only render the heavy stuff once data is loaded (or render behind preloader) */}
      {!loading && (
        <>
          {/* <SmoothCursor 
            cursorColor={cursorFillColor}
            cursorStrokeColor={cursorStrokeColor}
          /> */}
          
          <Header 
            currentBrand={currentBrand.logoVariant}
            onMobileMenuToggle={setIsMobileMenuOpen}
          />
          
          <Hero 
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            brandShowcases={showcases}
            isTransitioning={isTransitioning}
          />

          {/* 👇 Animated Sections Start Here */}
          
          {/* 1. Bio (Resets cursor) */}
          <FadeUp delay={0.4}>
            <div onMouseEnter={handleResetColor}>
              <Bio />
            </div>
          </FadeUp>

          {/* 2. More Bio */}
          <FadeUp delay={0.4}>
            <MoreBio />
          </FadeUp>

          {/* 3. Featured Work Sections */}
          <FadeUp delay={0.4}>
            <FeaturedBrands 
              onHoverColor={handleHoverColor} 
              onLeaveColor={handleResetColor} 
            />
          </FadeUp>

          <FadeUp delay={0.4}>
            <FeaturedSocials 
              onHoverColor={handleHoverColor} 
              onLeaveColor={handleResetColor} 
            />
          </FadeUp>

          <FadeUp delay={0.4}>
            <FeaturedChurch 
              onHoverColor={handleHoverColor} 
              onLeaveColor={handleResetColor} 
            />
          </FadeUp>
          
          {/* 4. Keycaps */}
          <FadeUp delay={0.4}>
            <KeycapMapper 
              onHoverColor={handleHoverColor} 
              onLeaveColor={handleResetColor} 
            /> 
          </FadeUp>
          
          {/* 5. Footer (Resets cursor) */}
          <FadeUp delay={0.4}>
            <div onMouseEnter={handleResetColor}>
              <Footer3 />
            </div>
          </FadeUp>

          <FadeUp delay={0.4}>
            <div onMouseEnter={handleResetColor}>
              <Bottom />
            </div>
          </FadeUp>
          
          {/* <ViewportIndicator /> */}
        </>
      )}

      {/* Fallback background while Supabase loads (if Preloader finishes early) */}
      {loading && !isPreloaderActive && (
        <div className="h-screen w-full bg-black" />
      )}
    </main>
  );
}