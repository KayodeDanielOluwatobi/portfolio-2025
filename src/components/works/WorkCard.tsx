'use client';

import Link from 'next/link';
import { Squircle } from '@squircle-js/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { darkenColor } from './ColorUtils';
import { MarqueeText } from '@/components/ui/MarqueeText';

interface WorkCardProps {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  media: string | string[];
  type: 'image' | 'gif' | 'video';
  tags: string[];
  brandColor: string;
  activeCategory: string;
}

export default function WorkCard({ 
  slug,
  title, 
  tagline, 
  media, 
  type, 
  tags,
  brandColor,
  activeCategory
}: WorkCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Convert media to array if it's a string
  const mediaArray = Array.isArray(media) ? media : [media];
  const isCarousel = mediaArray.length > 1;

  // Preload next image
  useEffect(() => {
    if (!isCarousel || type !== 'image') return;

    const nextIndex = (currentImageIndex + 1) % mediaArray.length;
    const img = new Image();
    img.src = mediaArray[nextIndex];
  }, [currentImageIndex, mediaArray, isCarousel, type]);

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    if (!isCarousel) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % mediaArray.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [mediaArray.length, isCarousel]);

  const currentMedia = mediaArray[currentImageIndex];

  // Determine aspect ratio based on category
  const getAspectRatio = () => {
    switch(activeCategory) {
      case 'brands':
        return 'aspect-video'; // 16/9
      case 'socials':
        return 'aspect-square'; // 1/1
      case 'church':
        return 'aspect-[3/4]'; // 3/4
      default:
        return 'aspect-video';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Link wraps only Image and Title */}
      <Link href={`/works/${slug}`} className="cursor-pointer group">
        {/* Image Container */}
        <Squircle
          cornerRadius={30}
          cornerSmoothing={0.7}
          className={`relative overflow-hidden ${getAspectRatio()} bg-white/5 image-protected`}
        >
          {!isLoaded && <div className="absolute inset-0 bg-white/5 animate-pulse" />}

          {/* Carousel with crossfade transition */}
          <div className="relative w-full h-full">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
              {type === 'image' && (
                <img
                  src={currentMedia}
                  alt={title}
                  onLoad={() => setIsLoaded(true)}
                  className={`w-full h-full object-cover transition-all duration-700 select-none pointer-events-none ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  } group-hover:scale-105`}
                  draggable="false"
                />
              )}

              {type === 'gif' && (
                <img
                  src={currentMedia}
                  alt={title}
                  onLoad={() => setIsLoaded(true)}
                  className={`w-full h-full object-cover transition-all duration-700 select-none pointer-events-none ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  } group-hover:scale-110`}
                  draggable="false"
                />
              )}

              {type === 'video' && (
                <video
                  src={currentMedia}
                  autoPlay
                  muted
                  loop
                  onLoadedData={() => setIsLoaded(true)}
                  className={`w-full h-full object-cover transition-all duration-700 select-none pointer-events-none ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  } group-hover:scale-110`}
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </motion.div>
          </AnimatePresence>
          </div>

          {/* Indicator dots - only show if carousel */}
          {isCarousel && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
              {mediaArray.map((_, index) => (
                <motion.div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-white/40"
                  animate={{
                    backgroundColor: index === currentImageIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                    scale: index === currentImageIndex ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          )}
        </Squircle>

        {/* Title - Marquee version */}
        <div className="mt-4">
          <MarqueeText
            text={title}
            className="text-lg font-regular text-white/90 group-hover:text-white/100 transition-colors"
            speed={15}
            gap={30}
          />
        </div>
      </Link>

      {/* Tagline - Marquee version */}
      <MarqueeText
        text={tagline}
        className="text-sm font-extralight tracking-wide -mt-4 text-white/50"
        speed={20}
        gap={30}
      />

      {/* Chips - NOT clickable */}
      <div className="flex gap-2 flex-wrap">
        {tags.slice(0, 2).map((tag, index) => {
          const isFilled = index === 0;

          return (
            <span
              key={tag}
              className="pt-[8.7px] md:pt-[9px] -ml-0 px-3 py-1 flex items-center text-center uppercase rounded-full text-xs font-space tracking-wider transition-all"
              style={{
                ...(isFilled
                  ? {
                      color: darkenColor(brandColor),
                      backgroundColor: brandColor,
                      border: 'none',
                    }
                  : {
                      color: brandColor,
                      backgroundColor: 'transparent',
                      border: `1.5px solid ${brandColor}`,
                    }
                )
              }}
            >
              {tag}
            </span>
          );
        })}
      </div>
    </div>
  );
}