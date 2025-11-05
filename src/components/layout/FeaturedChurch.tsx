'use client';

import { useEffect, useState, useRef } from 'react';
import ProjectCard from '@/components/ui/ProjectCard';
import imagesLoaded from 'imagesloaded';

interface Church {
  id: number;
  title: string;
  slug: string;
  media: string;
  type: 'image' | 'gif' | 'video';
  order: number;
}

interface FeaturedChurchProps {
  limit?: number;
}

export default function FeaturedChurch({ limit = 15 }: FeaturedChurchProps) {
  const [church, setChurch] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(30);
  const [isBottomAligned, setIsBottomAligned] = useState(false);
  const [columnCount, setColumnCount] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Resize Handler ---
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCornerRadius(window.innerWidth >= 1024 ? 30 : 30);

      if (window.innerWidth < 640) setColumnCount(2);
      else if (window.innerWidth < 768) setColumnCount(3);
      else if (window.innerWidth < 1024) setColumnCount(4);
      else if (window.innerWidth < 1280) setColumnCount(5);
      else setColumnCount(5);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Fetch Church Data ---
  useEffect(() => {
    const fetchChurch = async () => {
      setLoading(true);
      try {
        const response = await fetch('/data/projects-church.json');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        const sortedData = data
          .sort((a: Church, b: Church) => (a.order || Infinity) - (b.order || Infinity))
          .slice(0, limit);

        setChurch(sortedData);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setTimeout(() => setLoading(false), 50);
      }
    };

    fetchChurch();
  }, [limit]);

  // --- Scroll Detection for Bottom Alignment ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (!containerRef.current) return;

      timeoutId = setTimeout(() => {
        const sectionElement = containerRef.current?.closest('section');
        if (!sectionElement) return;

        const sectionRect = sectionElement.getBoundingClientRect();
        const TOP_THRESHOLD = 500;

        const hasScrolledPastTop = sectionRect.top < -TOP_THRESHOLD;
        const shouldAlignBottom = hasScrolledPastTop;

        if (shouldAlignBottom && !isBottomAligned) {
          setIsBottomAligned(true);
        } else if (!shouldAlignBottom && isBottomAligned) {
          setIsBottomAligned(false);
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isBottomAligned]);

  // --- Apply Alignment Animation ---
  useEffect(() => {
    if (loading || !containerRef.current) return;
    const container = containerRef.current;

    const columns = Array.from(container.children).filter((el) =>
      el.classList.contains('masonry-column')
    ) as HTMLElement[];

    if (!columns.length) return;

    // Wait for images to load
    const imgLoad = imagesLoaded(container);

    imgLoad.on('always', () => {
      const heights = columns.map((col) => col.scrollHeight);
      const maxHeight = Math.max(...heights);

      columns.forEach((col) => {
        col.style.transition = 'transform 1s ease, justify-content 1s ease';

        if (isBottomAligned) {
          const diff = maxHeight - col.scrollHeight;
          col.style.justifyContent = 'flex-end';
          col.style.transform = `translateY(${diff}px)`;
        } else {
          col.style.justifyContent = 'flex-start';
          col.style.transform = 'translateY(0px)';
        }
      });
    });

    return () => {
      if (imgLoad && typeof imgLoad.off === 'function') {
        imgLoad.off('always');
      }
    };
  }, [isBottomAligned, loading]);

  // --- Distribute into Columns ---
  const distributeIntoColumns = () => {
    const columns: Church[][] = Array.from({ length: columnCount }, () => []);
    church.forEach((item, index) => {
      columns[index % columnCount].push(item);
    });
    return columns;
  };

  const columns = distributeIntoColumns();

  return (
    <section className="w-full py-16 bg-black">
      <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
        <h2 className="font-space pl-3  text-xl sm:text-2xl md:text-3xl lg:text-4xl uppercase text-white/100 mb-12">
          Church media Designs
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white/5 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="relative">
            <div ref={containerRef} className="masonry-container">
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="masonry-column">
                  {column.map((item) => (
                    <div key={item.id} className="masonry-item">
                      <ProjectCard
                        title={item.title}
                        slug={item.slug}
                        media={item.media}
                        type={item.type}
                        aspectRatio="auto"
                        cornerRadius={cornerRadius}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute -bottom-1 left-0 opacity-90 -right-1 h-64 pointer-events-none bg-gradient-to-t from-black via-black/70 to-transparent" />

            {/* View All Button */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10">
              <a
                href="/church-media"
                className="scale-70 md:scale-80 text-center text-xs px-8 py-3 border-2 md:border-3 border-white/60 text-white font-space md:text-sm uppercase tracking-wider hover:border-white/90 hover:bg-white/5 hover:scale-75 md:hover:scale-85 transition-all duration-300 rounded-[12px]"
              >
                View All Church Media Designs
              </a>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .masonry-container {
          display: flex;
          gap: 24px;
          width: 100%;
          align-items: flex-start;
        }

        .masonry-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          transition: transform 0.7s ease, justify-content 0.7s ease;
          will-change: transform;
        }

        .masonry-item {
          margin-bottom: 0;
        }

        @media (max-width: 1024px) {
          .masonry-container {
            gap: 16px;
          }
          .masonry-column {
            gap: 16px;
          }
        }

        @media (max-width: 640px) {
          .masonry-container {
            gap: 12px;
          }
          .masonry-column {
            gap: 12px;
          }
        }
      `}</style>
    </section>
  );
}