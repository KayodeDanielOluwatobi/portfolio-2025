'use client';

import { Squircle } from '@squircle-js/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import LinearWaveProgress from './LinearWaveProgress';
import CircularWaveProgress from '@/components/ui/CircularWaveProgress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarqueeText } from '@/components/ui/MarqueeText';
import { useSquircleRadius } from '@/hooks/useSquircleRadius';

interface Show {
  id: number;
  title: string;
  backdrop: string | null;
  logo: string | null;
  provider_logo: string | null;
  progress: number;
  myrating: number | null;
  extracted_color: string | null;
}

interface ExtractedColors {
  barColor: string;
  glowColor: string;
}

const DEFAULT_COLORS = { barColor: '#1DB954', glowColor: '#2EE86E' };

interface CurrentlyWatchingProps {
  onHoverColor?: (fill: string, stroke?: string) => void;
  onLeaveColor?: () => void;
}

export default function CurrentlyWatching({ onHoverColor, onLeaveColor }: CurrentlyWatchingProps) {
  const [shows, setShows] = useState<Show[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // 👇 Dynamic Sizing Flags based on your Hook
  const squircleRadius = useSquircleRadius();
  const isTiny = squircleRadius <= 12;   // < 380px
  const isMobile = squircleRadius <= 16;  // < 640px
  const isTablet = squircleRadius <= 22;  // < 1024px

  const [colorCache, setColorCache] = useState<Record<string, ExtractedColors>>({});

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoaderProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    const fetchWatchList = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/watch-list');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        const validShows = data.filter((s: Show) => s.backdrop) as Show[];

        setShows(validShows);
        setFadeOut(true);
        setTimeout(() => setIsLoading(false), 500);

        const initialCache: Record<string, ExtractedColors> = {};
        
        validShows.forEach((show) => {
          if (show.backdrop) {
            if (show.extracted_color) {
              initialCache[show.backdrop] = { 
                barColor: show.extracted_color, 
                glowColor: show.extracted_color 
              };
            } else {
              extractAndSaveColor(show.id, show.backdrop, show.title);
            }
          }
        });

        if (Object.keys(initialCache).length > 0) {
            setColorCache(prev => ({ ...prev, ...initialCache }));
        }

      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    fetchWatchList();
  }, []);

  const extractAndSaveColor = async (id: number, backdropUrl: string, title: string) => {
    try {
      if (colorCache[backdropUrl]) return;

      const res = await fetch(`/api/spotify/extract-color?imageUrl=${encodeURIComponent(backdropUrl)}`);
      if (!res.ok) return;
      
      const { barColor } = await res.json(); 

      if (barColor) {
        await fetch('/api/save-color', {
            method: 'POST',
            body: JSON.stringify({ 
                table: 'watch_list', 
                id, 
                title: title,
                color: barColor 
            })
        });

        setColorCache(prev => ({
          ...prev,
          [backdropUrl]: { barColor, glowColor: barColor }
        }));
        
        setShows(prev => prev.map(s => s.id === id ? { ...s, extracted_color: barColor } : s));
      }
    } catch (err) {
      console.error('Extraction failed:', err);
    }
  };

  useEffect(() => {
    if (shows.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shows.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [shows.length]);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % shows.length);
  const goToPrevious = () => setCurrentIndex((prev) => (prev - 1 + shows.length) % shows.length);

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const currentShow = shows[currentIndex];

  const activeColors =
    currentShow?.backdrop && colorCache[currentShow.backdrop]
      ? colorCache[currentShow.backdrop]
      : DEFAULT_COLORS;

  const handleMouseEnter = () => {
    // Passing only the color to allow parent auto-darkening for stroke
    onHoverColor?.(activeColors.barColor, '#ffffff'); 
  };

  const LoadingState = () => (
    <Squircle
      cornerRadius={squircleRadius}
      cornerSmoothing={0.7}
      className="w-full min-h-[350px] bg-zinc-900/50 p-6 text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/85 to-zinc-900/90" />
      <div
        className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-500 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <CircularWaveProgress
          progress={loaderProgress}
          size={isMobile ? 50 : 70}
          trackWidth={isMobile ? 5 : 6}
          waveWidth={isMobile ? 5 : 6}
          trackColor="#475569"
          waveColor="#cbd5e1"
          waveAmplitude={isMobile ? 2 : 3}
          maxWaveFrequency={6}
          undulationSpeed={2}
          rotationSpeed={7}
          edgeGap={20}
          relaxationDuration={0}
          className="opacity-30"
        />
      </div>
    </Squircle>
  );

  if (isLoading || shows.length === 0) {
    return <LoadingState />;
  }

  return (
    <div
      className="w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => onLeaveColor?.()}
    >
      <Squircle
        cornerRadius={squircleRadius}
        cornerSmoothing={0.7}
        className="w-full bg-zinc-900 p-0 text-white relative overflow-hidden group"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentShow.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={currentShow.backdrop!}
              alt={currentShow.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent z-10" />

        {shows.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/50 border border-white/10 backdrop-blur-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
            >
              <ChevronLeft size={isMobile ? 15 : 20} className="text-white/70" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/50 border border-white/10 backdrop-blur-sm opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
            >
              <ChevronRight size={isMobile ? 15 : 20} className="text-white/70" />
            </button>
          </>
        )}

        <div className="relative z-10 h-full flex flex-col justify-center gap-16 py-8 px-8 md:px-10">
          <h3 className="text-xs md:text-sm opacity-55 font-extralight md:font-regular text-zinc-50 tracking-wider shrink-0 max-w-[75%]">
            Currently Watching . . .
          </h3>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentShow.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col gap-12"
            >
              <div className="flex flex-col gap-2 md:gap-4 justify-center">
                <div className="h-16 md:h-20 flex items-center justify-start shrink-0 max-w-[75%]">
                  {currentShow.logo ? (
                    <div className="relative w-40 md:w-48 h-full origin-left scale-100 md:scale-125">
                      <Image
                        src={currentShow.logo}
                        alt={currentShow.title}
                        fill
                        className="object-contain object-left"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-[200px]">
                      <MarqueeText
                        text={currentShow.title}
                        className="text-2xl md:text-3xl font-bold text-white leading-tight"
                        speed={15}
                        gap={32}
                      />
                    </div>
                  )}
                </div>

                {currentShow.myrating !== null && currentShow.myrating !== undefined && (
                  <div className="group/rating relative flex items-center gap-1 cursor-default w-fit">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-zinc-800/40 border border-zinc-700/50 backdrop-blur-xl text-[10px] font-medium uppercase tracking-widest text-zinc-300 rounded-full shadow-xl opacity-0 translate-y-2 group-hover/rating:opacity-100 group-hover/rating:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap z-20">
                      My Rating
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800/40" />
                    </div>
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="relative w-3 h-3 md:w-4 md:h-4">
                        <Image
                          src={
                            i < (currentShow.myrating as number)
                              ? '/starfilled.png'
                              : '/starblack.png'
                          }
                          alt="star"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-6 w-full">
                <div className="flex items-center gap-3 flex-1 max-w-[70%] md:max-w-[50%]">
                  <div className="flex-1">
                    <LinearWaveProgress
                      progress={currentShow.progress}
                      height={isTiny ? 2.5 : 4}
                      trackHeight={isTiny ?8 : isMobile ? 8 : 9}
                      waveHeight={isTiny ? 8 : isMobile ? 8 : 9}
                      trackColor={hexToRgba(activeColors.barColor, 0.2)}
                      waveColor={activeColors.barColor}
                      // 👇 Optimized Wave Density for Tiny Phones
                      waveAmplitude={isTiny ? 3 : isMobile ? 2 : 3}
                      maxWaveFrequency={isTiny ? 5 : isMobile ? 9 : 9}
                      undulationSpeed={isTiny ? 0.2 : isMobile ? 0.3 : 0.3}
                      edgeGap={isTiny ? 8 : 10}
                    />
                  </div>
                  <span className="text-xs text-white/60 font-light whitespace-nowrap">
                    {currentShow.progress}%
                  </span>
                </div>
                {currentShow.provider_logo && (
                  <div className="relative scale-[1.75] md:scale-[3] md:mb-4 origin-right w-6 h-6 shrink-0 rounded-full overflow-hidden shadow-sm">
                    <Image
                      src={currentShow.provider_logo}
                      alt="Provider"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Squircle>
    </div>
  );
}