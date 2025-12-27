'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import ProjectCard from '@/components/ui/ProjectCard';
import imagesLoaded from 'imagesloaded';
import TextPressure from '@/components/TextPressure';
import { darkenColor } from '@/utils/colorUtils'; 
// 👇 Import the new component
import TypewriterLink from '@/components/ui/TypewriterLink';

// 1. Initialize Supabase
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
  extracted_color: string | null; 
}

interface FeaturedSocialsProps {
  limit?: number;
  onHoverColor?: (fill: string, stroke?: string) => void;
  onLeaveColor?: () => void;
}

export default function FeaturedSocials({ limit = 15, onHoverColor, onLeaveColor }: FeaturedSocialsProps) {
  const [socials, setSocials] = useState<Socials[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Masonry & Layout State
  const [isBottomAligned, setIsBottomAligned] = useState(false);
  const [columnCount, setColumnCount] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pressureFontSize, setPressureFontSize] = useState(120);

  // --- Resize Handler ---
  useEffect(() => {
    const handleResize = () => {
      const breakpoint = 521;   
      setPressureFontSize(window.innerWidth < breakpoint ? 50 : 120);

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

  // --- Fetch Data & Trigger Extraction ---
  useEffect(() => {
    const fetchAndProcessSocials = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('featuredsocials')
          .select('*')
          .order('order', { ascending: true })
          .limit(limit);

        if (error) throw error;

        if (data) {
          const fetchedItems = data as Socials[];
          setSocials(fetchedItems);

          fetchedItems.forEach(async (item) => {
            if (!item.extracted_color && item.media) {
              await extractAndSaveColor(item.id, item.media);
            }
          });
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setTimeout(() => setLoading(false), 50);
      }
    };

    fetchAndProcessSocials();
  }, [limit]);

  // 👇 HELPER: Extract -> Save -> Update State
  const extractAndSaveColor = async (id: number, imageUrl: string) => {
    try {
      const res = await fetch(`/api/spotify/extract-color?imageUrl=${encodeURIComponent(imageUrl)}`);
      if (!res.ok) return;
      
      const { barColor } = await res.json(); 

      if (barColor) {
        await fetch('/api/save-color', {
            method: 'POST',
            body: JSON.stringify({ 
                table: 'featuredsocials', 
                id, 
                color: barColor 
            })
        });

        setSocials(prev => 
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
  }, [isBottomAligned, loading, socials]);

  // --- Columns ---
  const columns = Array.from({ length: columnCount }, (_, i) => 
    socials.filter((_, index) => index % columnCount === i)
  );

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
          <div className="">
            {/* Masonry Container with MASK applied */}
            <div 
              ref={containerRef} 
              className="masonry-container"
              style={{
                maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              }}
            >
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="masonry-column">
                  {column.map((social) => (
                    <div 
                      key={social.id} 
                      className="masonry-item"
                      // 👇 CURSOR HOVER LOGIC
                      onMouseEnter={() => {
                        const fillColor = social.extracted_color || '#ffffff';
                        const strokeColor = darkenColor(fillColor, 60);
                        onHoverColor?.(fillColor, strokeColor);
                      }}
                      onMouseLeave={() => onLeaveColor?.()}
                    >
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

            {/* 👇 NEW TYPING LINK */}
            <div onMouseEnter={() => onLeaveColor?.()}>
              <TypewriterLink 
                text="VIEW ALL SOCIAL MEDIA DESIGNS" 
                href="/works?category=socials" 
                cursorClass="bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .masonry-container { display: flex; gap: 24px; width: 100%; align-items: flex-start; }
        .masonry-column { flex: 1; display: flex; flex-direction: column; gap: 24px; position: relative; transition: transform 0.7s ease, justify-content 0.7s ease; will-change: transform; }
        .masonry-item { margin-bottom: 0; }
        @media (max-width: 1024px) { .masonry-container, .masonry-column { gap: 16px; } }
        @media (max-width: 640px) { .masonry-container, .masonry-column { gap: 12px; } }
      `}</style>
    </section>
  );
}