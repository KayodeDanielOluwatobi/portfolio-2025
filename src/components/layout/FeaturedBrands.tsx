'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import ProjectCard from '@/components/ui/ProjectCard';
import imagesLoaded from 'imagesloaded';
import TextPressure from '@/components/TextPressure';

// 1. Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Brands {
  id: number;
  title: string;
  slug: string;
  media: string;
  type: 'image' | 'gif' | 'video';
  order: number;
}

interface FeaturedBrandsProps {
  limit?: number;
}

export default function FeaturedBrands({ limit = 6 }: FeaturedBrandsProps) {
  const [brands, setBrands] = useState<Brands[]>([]);
  const [loading, setLoading] = useState(true);

  // Masonry & Layout State
  const [isBottomAligned, setIsBottomAligned] = useState(false);
  const [columnCount, setColumnCount] = useState(3); // Start with 3 for brands
  const containerRef = useRef<HTMLDivElement>(null);
  const [pressureFontSize, setPressureFontSize] = useState(120);

  // --- Resize Handler ---
  useEffect(() => {
    const handleResize = () => {
      // 1. Text Size
      const breakpoint = 521;
      setPressureFontSize(window.innerWidth < breakpoint ? 50 : 120);

      // 2. Column Count (Adjusted for Brands - usually we want fewer, wider columns than socials)
      if (window.innerWidth < 640) setColumnCount(2);       // Mobile: 2 cols
      else if (window.innerWidth < 1024) setColumnCount(3); // Tablet: 3 cols
      else setColumnCount(3);                               // Desktop: 3 cols (Clean look for brands)
    };
  
    handleResize(); 
    window.addEventListener('resize', handleResize); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('featuredbrands')
          .select('*')
          .order('order', { ascending: true })
          .limit(limit);

        if (error) throw error;

        if (data) {
          setBrands(data as Brands[]);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setTimeout(() => setLoading(false), 50);
      }
    };

    fetchBrands();
  }, [limit]);

  // --- Scroll Detection (Parallax) ---
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
        const shouldAlignBottom = sectionRect.top < -TOP_THRESHOLD;

        if (shouldAlignBottom !== isBottomAligned) {
          setIsBottomAligned(shouldAlignBottom);
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

  // --- Masonry Animation ---
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
    return () => imgLoad.off('always', handleImagesLoaded);
  }, [isBottomAligned, loading, brands]);

  // --- Distribute Columns ---
  const columns = Array.from({ length: columnCount }, (_, i) => 
    brands.filter((_, index) => index % columnCount === i)
  );

  return (
    <section className="w-full font-space py-16 bg-black">
      <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
        
        <TextPressure className='ml-2 mb-8'
          text="FEATURED BRANDS"
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-white/5 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Masonry Container */}
            <div ref={containerRef} className="masonry-container">
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="masonry-column">
                  {column.map((brand) => (
                    <div key={brand.id} className="masonry-item">
                      <ProjectCard
                        title={brand.title}
                        slug={brand.slug}
                        media={brand.media}
                        type={brand.type}
                        // 👇 I kept this 'square' for consistency, but you can change to 'auto' if you have tall mockups!
                        aspectRatio="square" 
                        cornerRadius={30}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute -bottom-1 left-0 right-0 opacity-60 h-40 pointer-events-none bg-gradient-to-t from-black/60 to-transparent rounded-none" />

            {/* View All Button */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10">
              <a
                href="/works?category=brands"
                className="scale-70 md:scale-80 text-center text-xs px-8 py-3 border-2 md:border-3 border-white/60 text-white font-space md:text-sm uppercase tracking-wider hover:border-white/100 hover:bg-white/5 hover:scale-75 md:hover:scale-85 transition-all duration-300 rounded-[15px]"
              >
                View All Brand Projects
              </a>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .masonry-container { display: flex; gap: 24px; width: 100%; align-items: flex-start; }
        .masonry-column { flex: 1; display: flex; flex-direction: column; gap: 24px; position: relative; transition: transform 0.7s ease, justify-content 0.7s ease; will-change: transform; }
        .masonry-item { margin-bottom: 0; }
        
        /* Tablet Spacing */
        @media (max-width: 1024px) { 
          .masonry-container, .masonry-column { gap: 16px; } 
        }
        
        /* Mobile Spacing */
        @media (max-width: 640px) { 
          .masonry-container, .masonry-column { gap: 12px; } 
        }
      `}</style>
    </section>
  );
}