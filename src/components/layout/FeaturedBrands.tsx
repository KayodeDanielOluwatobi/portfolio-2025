'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js'; // 1. Import Supabase
import ProjectCard from '@/components/ui/ProjectCard';
import TextPressure from '@/components/TextPressure';

// 2. Initialize the Client
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
  const [isMobile, setIsMobile] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  const [pressureFontSize, setPressureFontSize] = useState(120); 

  // --- Resize Handler for Mobile Check ---
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Fetch Data from Supabase ---
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // 3. Fetch from 'featuredbrands' table
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
        console.error('Featured Brand Projects fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [limit]);

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

  return (
    <section className="w-full py-16 bg-black">
      <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
        
        {/* Header - TextPressure */}
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
        
        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-white/5 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
              {brands.map((brand) => (
                <ProjectCard
                  key={brand.id}
                  title={brand.title}
                  slug={brand.slug}
                  media={brand.media}
                  type={brand.type}
                  aspectRatio="square"
                  cornerRadius={isMobile ? 30 : 30} 
                />
              ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute -bottom-1 left-0 right-0 opacity-60 h-40 pointer-events-none bg-gradient-to-t from-black/60 to-transparent rounded-none" />
            
            {/* View All Button */}
            <div className="absolute scale-90 md:scale-100 bottom-2 md:bottom-5 left-0 right-0 flex justify-center z-10">
              <Link
                href="/works?category=brands"
                className="scale-70 md:scale-80 text-center text-xs px-8 py-3 border-2 md:border-3 border-white/60 text-white font-space md:text-sm uppercase tracking-wider hover:border-white/100 hover:bg-white/5 hover:scale-75 md:hover:scale-85 transition-all duration-300 rounded-[15px]"

              >
                View All Brand Projects
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}