// Hero.tsx

'use client'

import { useEffect, useState, TouchEvent } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import CircularWaveProgress from '@/components/ui/CircularWaveProgress';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BrandShowcase {
  id: string;
  brandName: string;
  tagline: string;
  chips: string[];
  textColor: string;
  everdannLogo: string;
  backgroundImage: string;
  backgroundColor: string;
  logoVariant: string;
  // New optional property: if set to false in your data, the overlay hides
  hasOverlay?: boolean;
  // Added safety for snake_case coming from DB
  has_overlay?: boolean; 
}

interface HeroSectionProps {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  brandShowcases: BrandShowcase[];
  isTransitioning: boolean;
}

// --- HELPER FUNCTIONS ---

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// THE NEW LOGIC: Calculates the best text color based on background brightness
function getContrastingTextColor(color: string): string {
  let hex = color.replace('#', '').replace('0x', '');
  
  if (hex.length === 6 || hex.length === 3) {
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    const rgb = hexToRgb('#' + hex);
    if (!rgb) return color;
    
    // Calculate Perceived Brightness (Standard Formula)
    // < 128 is Dark, >= 128 is Light
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    const isDarkBackground = brightness < 128;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    if (isDarkBackground) {
      // Logic for DARK backgrounds: Make text Pastel/Light
      hsl.l = 92; // Very high lightness
      hsl.s = Math.max(20, hsl.s - 20); // Lower saturation slightly for a "soft/pastel" look
    } else {
      // Logic for LIGHT backgrounds: Make text Dark (Your original logic)
      hsl.l = 15; // Low lightness
      hsl.s = Math.min(100, hsl.s + 10); // Increase saturation slightly
    }
    
    const finalRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b);
  }
  
  return color;
}

export default function Hero({ 
  currentIndex, 
  setCurrentIndex, 
  brandShowcases,
  isTransitioning 
}: HeroSectionProps) {
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const currentBrand = brandShowcases[currentIndex];

  // --- RESPONSIVE STATE FOR LOADER ---
  const [isMobile, setIsMobile] = useState(false);

  // --- NATIVE SWIPE STATE ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50; // Threshold in pixels

  // Manual Navigation Handlers
  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + brandShowcases.length) % brandShowcases.length);
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % brandShowcases.length);
  };

  // --- NATIVE SWIPE HANDLERS ---
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  // Check screen size for loader scaling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px matches Tailwind 'md'
    };
    
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload ALL background images and logos on mount
  useEffect(() => {
    const imagesToPreload: string[] = [];
    
    // Collect all unique images
    brandShowcases.forEach(brand => {
      if (brand.backgroundImage) imagesToPreload.push(brand.backgroundImage);
      if (brand.everdannLogo) imagesToPreload.push(brand.everdannLogo);
    });

    // Remove duplicates
    const uniqueImages = [...new Set(imagesToPreload)];

    // Preload all images with progress
    let loadedCount = 0;
    Promise.all(
      uniqueImages.map(url => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
            loadedCount++;
            setLoaderProgress(Math.round((loadedCount / uniqueImages.length) * 100));
            resolve(null);
          };
          img.onerror = () => {
            loadedCount++;
            setLoaderProgress(Math.round((loadedCount / uniqueImages.length) * 100));
            resolve(null);
          };
          img.src = url;
        });
      })
    ).then(() => {
      setImagesPreloaded(true);
    });
  }, [brandShowcases]);

  // Preload next and previous images when index changes
  useEffect(() => {
    if (!imagesPreloaded) return;

    const nextIndex = (currentIndex + 1) % brandShowcases.length;
    const prevIndex = (currentIndex - 1 + brandShowcases.length) % brandShowcases.length;

    // Preload adjacent images for instant transitions
    [nextIndex, prevIndex].forEach(index => {
      const brand = brandShowcases[index];
      if (brand.backgroundImage) {
        const img = new window.Image();
        img.src = brand.backgroundImage;
      }
    });
  }, [currentIndex, brandShowcases, imagesPreloaded]);

  // Show loading state while preloading
  if (!imagesPreloaded) {
    return (
      <div 
        className="relative w-full overflow-hidden flex items-center justify-center"
        style={{ 
          height: 'calc(100vh + 8px)',
          minHeight: '600px',
          maxHeight: '1080px',
          backgroundColor: currentBrand.backgroundColor,
        }}
      >
        <CircularWaveProgress className='opacity-50'
          progress={loaderProgress}
          // RESPONSIVE SIZING LOGIC APPLIED HERE
          size={isMobile ? 50 : 70}
          trackWidth={isMobile ? 5 : 5}
          waveWidth={isMobile ? 5 : 6}
          trackColor="#475569"
          waveColor="#cbd5e1"
          waveAmplitude={isMobile ? 2 : 3}
          maxWaveFrequency={6}
          undulationSpeed={2}
          rotationSpeed={1}
          edgeGap={20}
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="
        relative w-full overflow-hidden 
        h-[85vh] 
        md:h-[calc(95vh-0px)] 
        min-h-[600px] 
        max-h-[1080px]
        group
      "
      animate={{ backgroundColor: currentBrand.backgroundColor }}
      transition={{ duration: 0.5 }}
      data-cursor-brand={brandShowcases[currentIndex].id}

      // --- NATIVE SWIPE EVENT LISTENERS ---
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0">
        {/* Background images with AnimatePresence for smooth crossfade */}
        <AnimatePresence mode="sync">
          <motion.div
            key={currentIndex}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${currentBrand.backgroundImage})`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* --- Linear Gradient Overlay --- */}
        {/* Supports checking both hasOverlay (camelCase) and has_overlay (snake_case) */}
        {(currentBrand.hasOverlay !== false && currentBrand.has_overlay !== false) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity" />
        )}

        {/* --- Navigation Chevrons with Glassmorphism --- */}
        <button 
            onClick={handlePrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2 rounded-full bg-black/10 hover:bg-black/15 border border-white/20 backdrop-blur-[2px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
            aria-label="Previous Brand"
        >
            <ChevronLeft 
                className="w-4 h-4 md:w-6 md:h-6" 
                style={{ color: currentBrand.textColor }} 
            />
        </button>

        <button 
            onClick={handleNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2 rounded-full bg-black/10 hover:bg-black/15 border border-white/20 backdrop-blur-[2px] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
            aria-label="Next Brand"
        >
            <ChevronRight 
                className="w-4 h-4 md:w-6 md:h-6" 
                style={{ color: currentBrand.textColor }} 
            />
        </button>

        {/* --- Pagination Indicators --- */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2 md:space-x-2 items-center">
            {brandShowcases.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`
                        rounded-full transition-all duration-300
                        ${currentIndex === index ? 'w-2 h-2 opacity-100' : 'w-1.5 h-1.5 opacity-50 hover:opacity-75'}
                    `}
                    style={{ backgroundColor: currentBrand.textColor }}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>

        {/* Content container */}
        <div className="relative h-full container mx-auto max-w-none px-8 flex flex-col justify-end pb-12 pt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-end">
            {/* Left: everdann designs SVG - hidden on mobile, visible on desktop */}
            <div className="invisible relative w-full max-w-sm aspect-[2.53/1] translate-y-5">
              <Image
                src={currentBrand.everdannLogo}
                alt="everdann designs"
                fill
                className="object-contain object-left-bottom"
                priority
              />
            </div>

            {/* Right: Brand info with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="space-y-4 pl-0 md:pl-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <h2 
                  // PRESERVED: Your custom text-[46px] and padding tweaks
                  className="text-[46px] sm:text-5xl md:text-6xl lg:text-6xl font-light -translate-y-17 leading-tight line-clamp-2 pr-2 pb-1"
                  style={{ 
                    color: currentBrand.textColor
                  }}
                >
                  {currentBrand.brandName}
                </h2>
                
                <p 
                  className="whitespace-pre-line text-2xl md:text-2xl lg:text-3xl font-extralight -translate-y-17 leading-tight"
                  style={{ color: currentBrand.textColor }}
                >
                  {currentBrand.tagline}
                </p>

                {/* Chips - Alternating filled and bordered */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {currentBrand.chips.map((chip, index) => {
                    const isFilled = index % 2 === 0;

                    return (
                      <span
                        key={chip}
                        className={`
                            px-4 rounded-full text-xs font-space tracking-wider transition-all flex items-center justify-center py-[6px] md:py-1
                            ${isFilled ? 'font-normal' : 'font-normal'} 
                            leading-none pt-[9px] md:pt-[9.5px]
                        `}
                        style={{
                          ...(isFilled
                            ? {
                                // NEW LOGIC APPLIED HERE
                                color: getContrastingTextColor(currentBrand.textColor),
                                backgroundColor: currentBrand.textColor,
                                border: 'none',
                              }
                            : {
                                color: currentBrand.textColor,
                                backgroundColor: 'transparent',
                                border: `2px solid ${currentBrand.textColor}`,
                              }
                          )
                        }}
                      >
                        {chip}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}