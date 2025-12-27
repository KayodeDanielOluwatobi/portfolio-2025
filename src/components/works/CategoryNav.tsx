'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORK_CATEGORIES } from '@/data/workCategories';
import { ChevronDown } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // State to store counts
  const [counts, setCounts] = useState<Record<string, number>>({
    all: 0,
    brands: 0,
    church: 0,
    socials: 0
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeCategory_obj = WORK_CATEGORIES.find(cat => cat.id === activeCategory);
  const hiddenCategories = WORK_CATEGORIES.filter(cat => cat.id !== activeCategory);

  // --- FETCH COUNTS FROM THE CORRECT TABLES ---
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Run queries in parallel for 'works_brands', 'works_church', 'works_socials'
        const [brands, church, socials] = await Promise.all([
          supabase.from('works_brands').select('*', { count: 'exact', head: true }),
          supabase.from('works_church').select('*', { count: 'exact', head: true }),
          supabase.from('works_socials').select('*', { count: 'exact', head: true }),
        ]);

        const brandCount = brands.count || 0;
        const churchCount = church.count || 0;
        const socialCount = socials.count || 0;

        setCounts({
          brands: brandCount,
          church: churchCount,
          socials: socialCount,
          all: brandCount + churchCount + socialCount // Sum all for the 'All' category
        });
      } catch (error) {
        console.error('Error fetching project counts:', error);
      }
    };

    fetchCounts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Helper component for the Number Tag
  const NumberTag = ({ count }: { count: number }) => (
    <span className="align-top text-[0.6em] font-thin text-white/50 ml-1 -mt-1 inline-block">
      {count}
    </span>
  );

  return (
    <>
      {/* MOBILE: Dropdown */}
      <div ref={dropdownRef} className="md:hidden relative w-full select-none">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 pb-3"
        >
          <h2 className="text-white font-regular text-2xl flex items-start">
            {activeCategory_obj?.label}
            {/* Mobile Number Tag */}
            <NumberTag count={counts[activeCategory] || 0} />
          </h2>
          <div className="relative w-5 h-5 mt-1">
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isDropdownOpen ? 0 : 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isDropdownOpen ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ChevronDown className="w-5 h-5 text-white rotate-180" />
            </motion.div>
          </div>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 right-0 bg-black/80 backdrop-blur-md border border-white/10 mt-2 z-50 rounded-lg overflow-hidden"
            >
              <div className="flex flex-col">
                {WORK_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      onCategoryChange(category.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-3 text-left font-regular text-lg transition-colors duration-200 border-b border-white/5 last:border-b-0 select-none flex items-start ${
                      activeCategory === category.id
                        ? 'text-white bg-white/10'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {category.label}
                    {/* Dropdown List Number Tag */}
                    <span className="align-top text-[0.6em] font-thin ml-1 opacity-60">
                      {counts[category.id] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP: Fancy Horizontal Layout */}
      <div 
        className="hidden md:flex items-center gap-4 select-none"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Active Category Text with underline */}
        <div className="relative cursor-pointer">
          
          <motion.h2
            key={activeCategory_obj?.id}
            layoutId={activeCategory_obj?.id} 
            className="font-regular text-3xl text-white hover:text-white/80 transition-colors duration-300 pb-1 whitespace-nowrap flex items-start"
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 25,
              mass: 0.8,
            }} 
          >
            {activeCategory_obj?.label}
            {/* Desktop Active Number Tag */}
            <NumberTag count={counts[activeCategory] || 0} />
          </motion.h2>

          {/* Underline */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-white origin-left"
            style={{ width: '80%' }}
            layoutId="underline"
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 25,
              mass: 0.8,
              bounce: 0.5,
            }}
          />
        </div>

        {/* Hidden Categories - Animate out on hover */}
        <AnimatePresence>
          {isHovering && (
            <motion.div className="flex gap-16 items-center ml-16">
              {hiddenCategories.map((category, index) => (
                
                <motion.button
                  key={category.id}
                  layoutId={category.id} 
                  onClick={() => {
                    onCategoryChange(category.id);
                    setIsHovering(false);
                  }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: 'easeOut',
                  }}
                  className="font-extralight text-3xl text-white/40 hover:text-white/70 transition-colors duration-300 whitespace-nowrap select-none flex items-start"
                >
                  {category.label}
                  {/* Desktop Hover Item Number Tag */}
                  <NumberTag count={counts[category.id] || 0} />
                </motion.button>

              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}