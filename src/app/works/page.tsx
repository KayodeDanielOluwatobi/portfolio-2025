'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/layout/Header';
import { WORK_CATEGORIES } from '@/data/workCategories';
import CategoryNav from '@/components/works/CategoryNav';
import WorksGrid from '@/components/works/WorksGrid';
import { motion } from 'framer-motion';
import TextPressure from '@/components/TextPressure';
import Footer3 from '@/components/layout/Footer3';
import Bottom from '@/components/layout/Bottom';
// 👇 NEW IMPORTS FOR CURSOR
import { CursorProvider, useCursor } from '@/context/CursorContext';
import { SmoothCursor } from '@/components/layout/SmoothCursor';

// 1. Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 👇 CURSOR CONTROLLER: Reads context and passes colors to SmoothCursor
function CursorController() {
  const { cursorColor, cursorStrokeColor } = useCursor();
  return <SmoothCursor cursorColor={cursorColor} cursorStrokeColor={cursorStrokeColor} />;
}

// 👇 MAIN CONTENT LOGIC
function WorksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeCategory, setActiveCategory] = useState('brands');
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pressureFontSize, setPressureFontSize] = useState(192);

  // Sync URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && ['brands', 'socials', 'church'].includes(categoryFromUrl)) {
      setActiveCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    router.push(`/works?category=${categoryId}`, { scroll: false });
  };

  // FETCH DATA & AUTO-FIX COLORS
  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true);
      setWorks([]); 

      try {
        let tableName = '';
        switch (activeCategory) {
          case 'brands': tableName = 'works_brands'; break;
          case 'socials': tableName = 'works_socials'; break;
          case 'church': tableName = 'works_church'; break;
          default: tableName = 'works_brands';
        }

        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('rank', { ascending: true });

        if (error) throw error;

        if (data) {
          setWorks(data);

          // AUTO-FIX MISSING COLORS
          const missingColors = data.filter((item: any) => !item.brand_color || item.brand_color === '');
          
          if (missingColors.length > 0) {
            console.log(`🎨 Auto-fixing ${missingColors.length} colors in ${tableName}...`);
            
            missingColors.forEach(async (item: any) => {
              const mediaUrl = Array.isArray(item.media) ? item.media[0] : item.media;
              
              if (mediaUrl) {
                try {
                  const response = await fetch('/api/works/update-color', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: item.id,
                      imageUrl: mediaUrl,
                      tableName: tableName
                    })
                  });

                  const result = await response.json();

                  if (result.success && result.color) {
                    setWorks(prevWorks => 
                      prevWorks.map(work => 
                        work.id === item.id 
                          ? { ...work, brand_color: result.color } 
                          : work
                      )
                    );
                  }
                } catch (err) {
                  console.error('Auto-fix failed for item', item.id, err);
                }
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error loading ${activeCategory}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, [activeCategory]);

  useEffect(() => {
    const handleResize = () => {
      setPressureFontSize(window.innerWidth < 520 ? 120 : 192);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeCategory_obj = WORK_CATEGORIES.find(cat => cat.id === activeCategory);

  return (
    <main>
      <Header onMobileMenuToggle={setIsMobileMenuOpen} />

      <section className="w-full py-32 bg-black min-h-screen">
        <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
          
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TextPressure
              text="My Works!"
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
          </motion.div>

          <div className="mb-0 md:mb-6">
            <CategoryNav 
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          <motion.p 
            key={activeCategory}
            className="text-white/60 font-thin text-lg md:text-2xl tracking-wide mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {activeCategory_obj?.subtitle}
          </motion.p>

          <WorksGrid 
            works={works} 
            activeCategory={activeCategory} 
            isLoading={loading} 
          />

        </div>
      </section>

      <Footer3 />
      <Bottom />

    </main>
  );
}

// 👇 ROOT EXPORT: Wraps everything in Context & Suspense
export default function Works() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-black" />}>
      <CursorProvider>
        {/* The Controller sits here to grab the context values */}
        <CursorController />
        
        {/* The Page Content sits here to trigger context updates */}
        <WorksContent />
      </CursorProvider>
    </Suspense>
  );
}