'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js'; // 1. Import Supabase
import ProjectCard from '@/components/ui/ProjectCard';
import imagesLoaded from 'imagesloaded';
import TextPressure from '@/components/TextPressure';

// 2. Initialize Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Socials {
  id: number;
  title: string;
  slug: string;
  media: string;
  type: 'image' | 'gif' | 'video';
  order: number;
}

interface FeaturedSocialsProps {
  limit?: number;
}

export default function FeaturedSocials({ limit = 15 }: FeaturedSocialsProps) {
  const [socials, setSocials] = useState<Socials[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(30);
  const [isBottomAligned, setIsBottomAligned] = useState(false);
  const [columnCount, setColumnCount] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [pressureFontSize, setPressureFontSize] = useState(120);

  // --- Resize Handler for TextPressure ---
  useEffect(() => {
    setIsMounted(true);
    
    const handleResize = () => {
      const mobileSize = 50;    
      const desktopSize = 120;  
      const breakpoint = 521;   

      setPressureFontSize(
        window.innerWidth < breakpoint ? mobileSize : desktopSize
      );
    };
  
    handleResize(); 
    window.addEventListener('resize', handleResize); 
  
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Resize Handler for Layout ---
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCornerRadius(window.innerWidth >= 1024 ? 0 : 0); 

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

  // --- Fetch Socials Data (UPDATED FOR SUPABASE) ---
  useEffect(() => {
    const fetchSocials = async () => {
      setLoading(true);
      try {
        // 3. Fetch from 'featuredsocials' table
        const { data, error } = await supabase
          .from('featuredsocials')
          .select('*')
          .order('order', { ascending: true }) // Sort by order in DB
          .limit(limit);                       // Limit in DB

        if (error) throw error;

        if (data) {
          setSocials(data as Socials[]);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setTimeout(() => setLoading(false), 50);
      }
    };

    fetchSocials();
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

    const imgLoad = imagesLoaded(container);

    const handleImagesLoaded = () => {
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
    };

    imgLoad.on('always', handleImagesLoaded);

    return () => {
      imgLoad.off('always', handleImagesLoaded);
    };
  }, [isBottomAligned, loading]);

  // --- Distribute into Columns ---
  const distributeIntoColumns = () => {
    const columns: Socials[][] = Array.from({ length: columnCount }, () => []);
    socials.forEach((social, index) => {
      columns[index % columnCount].push(social);
    });
    return columns;
  };

  const columns = distributeIntoColumns();

  return (
    <section className="w-full font-space py-16 bg-black">
      <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
        
        <TextPressure className='ml-2 mb-8'
          text="SOCIAL MEDIA DESIGNS"
          flex={false}
          alpha={false}
          stroke={false}
          width={true}
          weight={true}
          italic={true}
          textColor="#ffffff"
          strokeColor="#ff0000"
          minFontSize={36}
          fixedFontSize={pressureFontSize}
        />

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
                  {column.map((social) => (
                    <div key={social.id} className="masonry-item">
                      <ProjectCard
                        title={social.title}
                        slug={social.slug}
                        media={social.media}
                        type={social.type}
                        aspectRatio="auto"
                        cornerRadius={30}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute -bottom-1 left-0 opacity-50 -right-1 h-64 pointer-events-none bg-gradient-to-t from-black via-black/60 to-transparent" />

            {/* View All Button */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10">
              <a
                href="/works?category=socials"
                className="scale-70 md:scale-80 text-center text-xs px-8 py-3 border-2 md:border-3 border-white/60 text-white font-space md:text-sm uppercase tracking-wider hover:border-white/90 hover:bg-white/5 hover:scale-75 md:hover:scale-85 transition-all duration-300 rounded-[15px]"
              >
                View All Social Media Designs
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