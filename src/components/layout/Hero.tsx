'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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
}

interface HeroSectionProps {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  brandShowcases: BrandShowcase[];
  isTransitioning: boolean;
}

// Helper functions remain the same...
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

function darkenColor(color: string): string {
  let hex = color.replace('#', '').replace('0x', '');
  
  if (hex.length === 6 || hex.length === 3) {
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    const rgb = hexToRgb('#' + hex);
    if (!rgb) return color;
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    hsl.l = 15;
    hsl.s = Math.min(100, hsl.s + 10);
    
    const darkRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    const result = `#${[darkRgb.r, darkRgb.g, darkRgb.b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')}`;
    
    return result;
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
  const currentBrand = brandShowcases[currentIndex];

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

    // Preload all images
    Promise.all(
      uniqueImages.map(url => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = resolve;
          img.onerror = resolve; // Still resolve on error to not block
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
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="
        relative w-full overflow-hidden 
        h-[95vh] 
        md:h-[calc(100vh+8px)] 
        min-h-[600px] 
        max-h-[1080px]
      "
      animate={{ backgroundColor: currentBrand.backgroundColor }}
      transition={{ duration: 0.5 }}
      data-cursor-brand={brandShowcases[currentIndex].id}
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

        {/* Optional dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />

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
                  className="text-5xl md:text-6xl lg:text-6xl font-light -translate-y-17 leading-tight line-clamp-2"
                  style={{ 
                    color: currentBrand.textColor
                  }}
                >
                  {currentBrand.brandName}
                </h2>
                
                <p 
                  className="text-2xl md:text-2xl lg:text-3xl font-extralight -translate-y-17 leading-tight"
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
                        className="px-4 rounded-full text-xs font-sohne-mono-2 tracking-wider transition-all flex items-center justify-center py-[6px] md:py-1"
                        style={{
                          ...(isFilled
                            ? {
                                color: darkenColor(currentBrand.textColor),
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