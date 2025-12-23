'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORK_CATEGORIES } from '@/data/workCategories';
import { ChevronDown } from 'lucide-react';

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeCategory_obj = WORK_CATEGORIES.find(cat => cat.id === activeCategory);
  const hiddenCategories = WORK_CATEGORIES.filter(cat => cat.id !== activeCategory);

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

  return (
    <>
      {/* MOBILE: Dropdown */}
      <div ref={dropdownRef} className="md:hidden relative w-full">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 pb-3"
        >
          <h2 className="text-white font-regular text-2xl">
            {activeCategory_obj?.label}
          </h2>
          <div className="relative w-5 h-5">
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
                    className={`px-4 py-3 text-left font-regular text-lg transition-colors duration-200 border-b border-white/5 last:border-b-0 ${
                      activeCategory === category.id
                        ? 'text-white bg-white/10'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP: Fancy Horizontal Layout */}
      <div 
        className="hidden md:flex items-center gap-4"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Active Category Text with underline */}
        <div className="relative cursor-pointer">
          
          {/* --- CHANGE 1 --- */}
          <motion.h2
            key={activeCategory_obj.id} // Give it a key
            layoutId={activeCategory_obj.id} // Give it the magic link
            className="font-regular text-3xl text-white hover:text-white/80 transition-colors duration-300 pb-1 whitespace-nowrap"
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 25,
              mass: 0.8,
            }} // Add a smooth transition
          >
            {activeCategory_obj?.label}
          </motion.h2>

          {/* Underline - 80% of text width */}
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
                
                // --- CHANGE 2 ---
                <motion.button
                  key={category.id}
                  layoutId={category.id} // Give it the magic link
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
                  className="font-extralight text-3xl text-white/40 hover:text-white/70 transition-colors duration-300 whitespace-nowrap"
                >
                  {category.label}
                </motion.button>

              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}