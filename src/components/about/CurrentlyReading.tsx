'use client';

import { Squircle } from '@squircle-js/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import LinearWaveProgress from './LinearWaveProgress';
import CircularWaveProgress from '@/components/ui/CircularWaveProgress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarqueeText } from '@/components/ui/MarqueeText';
import { useSquircleRadius } from '@/hooks/useSquircleRadius'; // 👈 Hook import

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  progress: number;
}

interface ReadingItem {
  query: string;
  progress: number;
}

interface ExtractedColors {
  barColor: string;
  glowColor: string;
}

const DEFAULT_COLORS = { barColor: '#FFFFFF', glowColor: '#FFFFFF' };

// 👇 Props Interface
interface CurrentlyReadingProps {
  onHoverColor?: (fill: string, stroke?: string) => void;
  onLeaveColor?: () => void;
}

export default function CurrentlyReading({ onHoverColor, onLeaveColor }: CurrentlyReadingProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // 👇 Using the hook with DEFAULT values
  const squircleRadius = useSquircleRadius();
  const isMobile = squircleRadius <= 16;

  const [colorCache, setColorCache] = useState<Record<string, ExtractedColors>>({});

  const getHighResCover = (url: string | undefined) => {
    if (!url) return '/placeholder-book.jpg';
    return url
      .replace(/^http:\/\//i, 'https://')
      .replace('&zoom=1', '&zoom=0')
      .replace('&edge=curl', '');
  };

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoaderProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    const fetchLibraryData = async () => {
      setIsLoading(true);
      const fetchedBooks: Book[] = [];

      try {
        const listResponse = await fetch('/api/reading-list');
        const myReadingList: ReadingItem[] = await listResponse.json();

        if (!Array.isArray(myReadingList)) {
          throw new Error('Failed to fetch reading list from DB');
        }

        for (const item of myReadingList) {
          try {
            let searchQuery = item.query;
            const cleanQuery = item.query.replace(/[-\s]/g, '');
            const isISBN = /^[0-9,]+$/.test(cleanQuery);

            if (isISBN) {
              const firstISBN = item.query.split(',')[0].trim();
              searchQuery = `isbn:${firstISBN}`;
            }

            const response = await fetch(
              `/api/books?q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();

            if (data.items && data.items.length > 0) {
              const bookData = data.items[0].volumeInfo;
              const rawThumbnail =
                bookData.imageLinks?.thumbnail ||
                bookData.imageLinks?.smallThumbnail;

              fetchedBooks.push({
                id: data.items[0].id,
                title: bookData.title || 'Unknown Title',
                author: bookData.authors?.[0] || 'Unknown Author',
                cover: getHighResCover(rawThumbnail),
                progress: item.progress,
              });
            }
          } catch (err) {
            console.error(`Error fetching metadata for ${item.query}`, err);
          }
        }
      } catch (error) {
        console.error('Error loading library:', error);
      }

      setBooks(fetchedBooks);
      setFadeOut(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);

      // --- PREFETCH LOOP ---
      fetchedBooks.forEach((book) => {
        if (book.cover && !book.cover.includes('placeholder')) {
          prefetchColor(book.cover);
        }
      });
    };

    fetchLibraryData();
  }, []);

  const prefetchColor = async (imageUrl: string) => {
    if (colorCache[imageUrl]) return;

    try {
      const response = await fetch(
        `/api/spotify/extract-color?imageUrl=${encodeURIComponent(imageUrl)}`
      );
      if (response.ok) {
        const data = await response.json();
        setColorCache((prev) => ({
          ...prev,
          [imageUrl]: data,
        }));
      }
    } catch (error) {
      console.error('Color prefetch failed for book:', error);
    }
  };

  const hexToRgba = (hex: string, opacity: number) => {
    if (!hex || !hex.startsWith('#')) return `rgba(255, 255, 255, ${opacity})`;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  useEffect(() => {
    if (books.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % books.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [books.length]);

  const currentBook = books[currentIndex];

  // 👇 DETERMINE ACTIVE COLORS
  const activeColors =
    currentBook?.cover && colorCache[currentBook.cover]
      ? colorCache[currentBook.cover]
      : DEFAULT_COLORS;

  // 👇 HANDLE MOUSE HOVER
  const handleMouseEnter = () => {
    onHoverColor?.(activeColors.barColor, '#ffffff'); // Use barColor as fill, White stroke
  };

  const LoadingState = () => (
    <Squircle
      cornerRadius={squircleRadius}
      cornerSmoothing={0.7}
      className="w-full min-h-[350px] bg-zinc-900/50 p-6 md:p-8 text-white relative overflow-hidden"
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

  if (isLoading || books.length === 0) {
    return <LoadingState />;
  }

  return (
    // Wrapper to capture Hover Events
    <div
      className="w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => onLeaveColor?.()}
    >
      <Squircle
        cornerRadius={squircleRadius}
        cornerSmoothing={0.7}
        className="w-full bg-zinc-900/50 p-6 md:p-8 text-white relative overflow-hidden group"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBook.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={currentBook.cover}
              alt={currentBook.title}
              fill
              className="object-cover blur-none"
              unoptimized
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/60 z-10" />

        {books.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex(
                  (prev) => (prev - 1 + books.length) % books.length
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-sm 
                               opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
              aria-label="Previous book"
            >
              <ChevronLeft size={isMobile ? 15 : 20} className="text-zinc-300" />
            </button>

            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev + 1) % books.length)
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-sm 
                               opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
              aria-label="Next book"
            >
              <ChevronRight
                size={isMobile ? 15 : 20}
                className="text-zinc-300"
              />
            </button>
          </>
        )}

        <div className="relative z-10 space-y-12">
          <h3 className="text-xs md:text-sm opacity-80 font-extralight md:font-regular text-zinc-50 tracking-wider">
            Currently Reading . . .
          </h3>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentBook.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-20 md:w-16 md:h-24 rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
                  <Image
                    src={currentBook.cover}
                    alt={currentBook.title}
                    width={64}
                    height={96}
                    className="w-full h-full object-cover "
                    unoptimized
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-2 min-w-0 overflow-hidden">
                <div className="w-full overflow-hidden min-w-0">
                  <MarqueeText
                    text={currentBook.title}
                    className="text-base md:text-lg font-medium text-white leading-normal"
                    speed={15}
                    gap={32}
                  />
                </div>

                <p className="-mt-2 text-xs md:text-sm font-light text-zinc-50 opacity-55 line-clamp-1">
                  {currentBook.author}
                </p>

                <div className="pt-1 flex items-center gap-3">
                  <div className="flex-1">
                    <LinearWaveProgress
                      progress={currentBook.progress}
                      height={6}
                      trackHeight={isMobile ? 8 : 9}
                      waveHeight={isMobile ? 8 : 9}
                      trackColor={hexToRgba(activeColors.barColor, 0.2)}
                      waveColor={activeColors.barColor}
                      waveAmplitude={3}
                      maxWaveFrequency={isMobile ? 5 : 12}
                      undulationSpeed={1}
                      edgeGap={isMobile ? 9 : 10}
                    />
                  </div>
                  <span className="text-xs text-white/60 whitespace-nowrap font-light">
                    {currentBook.progress}%
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Squircle>
    </div>
  );
}