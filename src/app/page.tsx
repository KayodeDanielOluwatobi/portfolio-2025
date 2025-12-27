//main page.tsx

'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Hero from '@/components/layout/Hero';
import Bio from '@/components/layout/Bio';
import ViewportIndicator from '@/components/layout/ViewportIndicator';
// Import interface but NOT the static array
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
import ImageDisplay from '@/components/layout/ImageDisplay';
import { supabase } from '@/utils/supabase/client'; // Import the client
import Footer2 from '@/components/layout/Footer2';
import Footer from '@/components/layout/Footer';
import WatchfaceWidget from '@/components/ui/WatchFaceWidget';

// Dynamic import to prevent hydration issues
const SmoothCursor = dynamic(
  () => import('@/components/layout/SmoothCursor').then(mod => ({ default: mod.SmoothCursor })),
  { ssr: false }
);

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 1. New State for Supabase Data
  const [showcases, setShowcases] = useState<BrandShowcase[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch from Supabase
  useEffect(() => {
    const fetchShowcases = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_showcases')
          .select('*')
          .order('rank', { ascending: true });

        if (error) throw error;

        if (data) {
          // Map DB columns (snake_case) to Frontend props (camelCase)
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

  // Custom hooks logic (Dependent on showcases length)
  const { currentIndex, setCurrentIndex, isTransitioning } = useBrandRotation({ 
    totalBrands: showcases.length > 0 ? showcases.length : 1, // Prevent divide by zero
    intervalDuration: 15000,
    fadeDuration: 400 
  });
  
  const cursorInHeroHeader = useCursorPosition();
  
  // Safety check: Ensure we have data before accessing currentBrand
  const currentBrand = showcases.length > 0 
    ? showcases[currentIndex] 
    : { // Fallback/Loading state placeholder
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

  const cursorFillColor = isMobileMenuOpen 
    ? DEFAULT_CURSOR_COLOR 
    : (cursorInHeroHeader ? currentBrand.cursorColor : DEFAULT_CURSOR_COLOR);

  const cursorStrokeColor = isMobileMenuOpen 
    ? DEFAULT_CURSOR_STROKE 
    : (cursorInHeroHeader ? darkenColor(currentBrand.cursorColor) : DEFAULT_CURSOR_STROKE);

  // 3. Loading Screen (Optional - prevents empty flash)
  if (loading) {
    return <div className="h-screen w-full bg-black" />; // Or your FakeLoader component
  }

  return (
    <main>
      {/* <SmoothCursor 
        cursorColor={cursorFillColor}
        cursorStrokeColor={cursorStrokeColor}
      /> */}
      
      <Header 
        currentBrand={currentBrand.logoVariant}
        onMobileMenuToggle={setIsMobileMenuOpen}
      />
      
      {/* Pass fetched showcases to Hero */}
      <Hero 
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        brandShowcases={showcases}
        isTransitioning={isTransitioning}
      />

      <Bio />
      {/* <ImageDisplay className='hidden md:block'/> */}
      <MoreBio />
      <FeaturedBrands />
      <FeaturedSocials />
      <FeaturedChurch />
      <KeycapMapper /> 
      {/* <Footer />
      <Footer2 />  */}
      
      <Footer3 />
      <Bottom />
      <ViewportIndicator />
    </main>
  );
}