'use client';

import { motion } from 'framer-motion';
import WorkCard from '@/components/works/WorkCard';
import { COLUMNS_CONFIG } from '@/data/workCategories';

interface WorksGridProps {
  works: any[];
  activeCategory: string;
  isLoading: boolean; // Added this prop
}

export default function WorksGrid({ works, activeCategory, isLoading }: WorksGridProps) {
  // Config for grid columns
  const config = COLUMNS_CONFIG[activeCategory as keyof typeof COLUMNS_CONFIG] || COLUMNS_CONFIG['brands'];

  return (
    <>
      <style>{`
        [data-work-grid="${activeCategory}"] {
          display: grid;
          gap: 3rem;
          grid-template-columns: repeat(${config.mobile}, minmax(0, 1fr));
        }
        @media (min-width: 768px) {
          [data-work-grid="${activeCategory}"] {
            grid-template-columns: repeat(${config.tablet}, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          [data-work-grid="${activeCategory}"] {
            grid-template-columns: repeat(${config.desktop}, minmax(0, 1fr));
          }
        }
      `}</style>

      {isLoading ? (
        // --- SKELETON LOADING STATE ---
        <div data-work-grid={activeCategory}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className={`w-full bg-white/5 animate-pulse rounded-lg ${
                activeCategory === 'socials' ? 'aspect-square' : 
                activeCategory === 'church' ? 'aspect-[3/4]' : 'aspect-video'
              }`} />
              <div className="h-6 w-3/4 bg-white/5 animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : (
        // --- REAL CONTENT ---
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          data-work-grid={activeCategory}
        >
          {works.map((work, index) => (
            <WorkCard 
              key={`${work.id}-${index}`} 
              {...work} 
              // IMPORTANT: Map Supabase snake_case to component camelCase
              brandColor={work.brand_color} 
              activeCategory={activeCategory} 
            />
          ))}
        </motion.div>
      )}
    </>
  );
}