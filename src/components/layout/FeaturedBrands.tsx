'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import ProjectCard from '@/components/ui/ProjectCard';
import imagesLoaded from 'imagesloaded';
import TextPressure from '@/components/TextPressure';
import { darkenColor } from '@/utils/colorUtils';
// 👇 Import our new component
import TypewriterLink from '@/components/ui/TypewriterLink'; 

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
  extracted_color: string | null; 
}

interface FeaturedBrandsProps {
  limit?: number;
  onHoverColor?: (fill: string, stroke?: string) => void;
  onLeaveColor?: () => void;
}

export default function FeaturedBrands({ limit = 6, onHoverColor, onLeaveColor }: FeaturedBrandsProps) {
  const [brands, setBrands] = useState<Brands[]>([]);
  const [loading, setLoading] = useState(true);

  // Masonry & Layout State
  const [isBottomAligned, setIsBottomAligned] = useState(false);
  const [columnCount, setColumnCount] = useState(3); 
  const containerRef = useRef<HTMLDivElement>(null);
  const [pressureFontSize, setPressureFontSize] = useState(120);

  // --- Resize Handler ---
  useEffect(() => {
    const handleResize = () => {
      const breakpoint = 521;
      setPressureFontSize(window.innerWidth < breakpoint ? 50 : 120);
      if (window.innerWidth < 640) setColumnCount(2);        
      else if (window.innerWidth < 1024) setColumnCount(3); 
      else setColumnCount(3);                               
    };
    handleResize(); 
    window.addEventListener('resize', handleResize); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Fetch Data & Trigger Extraction ---
  useEffect(() => {
    const fetchAndProcessBrands = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('featuredbrands')
          .select('*')
          .order('order', { ascending: true })
          .limit(limit);

        if (error) throw error;

        if (data) {
          const fetchedBrands = data as Brands[];
          setBrands(fetchedBrands);

          fetchedBrands.forEach(async (brand) => {
            if (!brand.extracted_color && brand.media) {
              await extractAndSaveColor(brand.id, brand.media);
            }
          });
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setTimeout(() => setLoading(false), 50);
      }
    };

    fetchAndProcessBrands();
  }, [limit]);

  // 👇 HELPER: Extract from API -> Save to DB -> Update Local State
  const extractAndSaveColor = async (id: number, imageUrl: string) => {
    try {
      const res = await fetch(`/api/spotify/extract-color?imageUrl=${encodeURIComponent(imageUrl)}`);
      if (!res.ok) return;
      
      const { barColor } = await res.json(); 

      if (barColor) {
        await fetch('/api/save-color', {
            method: 'POST',
            body: JSON.stringify({ 
                table: 'featuredbrands', 
                id, 
                color: barColor 
            })
        });

        setBrands(prev => 
          prev.map(item => item.id === id ? { ...item, extracted_color: barColor } : item)
        );
      }
    } catch (err) {
      console.error('Extraction failed:', err);
    }
  };

  // --- Scroll Detection ---
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
          // 👇 Removing "relative" here so the link sits naturally in flow below the grid
          <div className="">
            {/* Masonry Container */}
            <div ref={containerRef} className="masonry-container">
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="masonry-column">
                  {column.map((brand) => (
                    <div 
                      key={brand.id} 
                      className="masonry-item"
                      // 👇 CURSOR HOVER LOGIC
                      onMouseEnter={() => {
                        const fillColor = brand.extracted_color || '#ffffff';
                        const strokeColor = darkenColor(fillColor, 60); 
                        onHoverColor?.(fillColor, strokeColor);
                      }}
                      onMouseLeave={() => onLeaveColor?.()}
                    >
                      <ProjectCard
                        title={brand.title}
                        slug={brand.slug}
                        media={brand.media}
                        type={brand.type}
                        aspectRatio="square" 
                        cornerRadius={30}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* 👇 NEW TYPING LINK (Left Aligned, No Absolute Positioning) */}
            <div onMouseEnter={() => onLeaveColor?.()}>
              <TypewriterLink 
                text="VIEW ALL BRAND PROJECTS" 
                href="/works?category=brands" 
              />
            </div>

          </div>
        )}
      </div>

      <style jsx>{`
        .masonry-container { display: flex; gap: 24px; width: 100%; align-items: flex-start; }
        .masonry-column { flex: 1; display: flex; flex-direction: column; gap: 24px; position: relative; transition: transform 0.7s ease, justify-content 0.7s ease; will-change: transform; }
        .masonry-item { margin-bottom: 0; }
        
        @media (max-width: 1024px) { 
          .masonry-container, .masonry-column { gap: 16px; } 
        }
        
        @media (max-width: 640px) { 
          .masonry-container, .masonry-column { gap: 12px; } 
        }
      `}</style>
    </section>
  );
}