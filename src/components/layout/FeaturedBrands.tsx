'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProjectCard from '@/components/ui/ProjectCard';

interface Brands {
  id: number;
  title: string;
  slug: string;
  media: string;
  type: 'image' | 'gif' | 'video';
  order: number;
}

interface FeaturedBrandsProps {
  limit?: number; // Maximum number of projects to display (default: 6)
}

export default function FeaturedBrands({ limit = 6 }: FeaturedBrandsProps) {
  const [brands, setBrands] = useState<Brands[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/data/projects-brands.json');
        if (!response.ok) throw new Error('Failed to fetch featured brand projects');
        const data = await response.json();
        // Sort by order field, then limit results
        const sortedData = data
          .sort((a: Brands, b: Brands) => (a.order || Infinity) - (b.order || Infinity))
          .slice(0, limit);
        setBrands(sortedData);
      } catch (error) {
        console.error('Featured Brand Projects fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [limit]);

  return (
    <section className="w-full py-16 bg-black">
      <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
        {/* Header */}
        <h2 className="pl-3 font-space text-xl sm:text-2xl md:text-3xl lg:text-4xl uppercase text-white/100 mb-12">
          Featured Brands
        </h2>

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
            <div className="absolute -bottom-1 left-0 right-0 opacity-80 h-48 pointer-events-none bg-gradient-to-t from-black via-black/70 to-transparent rounded-xl" />
            
            {/* View All Button */}
            <div className="absolute scale-90 md:scale-100 bottom-2 md:bottom-5 left-0 right-0 flex justify-center z-10">
              <Link
                href="/projects"
                className="scale-70 md:scale-80 text-center  text-xs px-8 py-3 border-2 md:border-3 border-white/60 text-white font-space md:text-sm uppercase tracking-wider hover:border-white/90 hover:bg-white/5 hover:scale-75 md:hover:scale-85 transition-all duration-300 rounded-[12px]"
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