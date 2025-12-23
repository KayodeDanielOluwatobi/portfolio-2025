'use client';

import { useState, useEffect, Suspense } from 'react'; // Added Suspense import
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/layout/Header';
import { WORK_CATEGORIES } from '@/data/workCategories';
import CategoryNav from '@/components/works/CategoryNav';
import WorksGrid from '@/components/works/WorksGrid';
import { motion } from 'framer-motion';
import TextPressure from '@/components/TextPressure';
import ViewportIndicator from '@/components/layout/ViewportIndicator';
import Footer3 from '@/components/layout/Footer3';
import Bottom from '@/components/layout/Bottom';

// 1. Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- NEW COMPONENT: Holds all your original logic ---
function WorksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [activeCategory, setActiveCategory] = useState('brands');
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pressureFontSize, setPressureFontSize] = useState(192); // Default Desktop

  // Sync activeCategory with URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && ['brands', 'socials', 'church'].includes(categoryFromUrl)) {
      setActiveCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    router.push(`/works?category=${categoryId}`, { scroll: false });
  };

  // --- 2. FETCH DATA FROM SUPABASE ---
  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true);
      setWorks([]); // Clear current works to show loading skeleton

      try {
        let tableName = '';
        
        // Map category ID to Supabase Table Name
        switch (activeCategory) {
          case 'brands':
            tableName = 'works_brands';
            break;
          case 'socials':
            tableName = 'works_socials';
            break;
          case 'church':
            tableName = 'works_church';
            break;
          default:
            tableName = 'works_brands';
        }

        // Fetch from the correct table, sorted by rank
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('rank', { ascending: true });

        if (error) throw error;

        if (data) {
          setWorks(data);
        }
      } catch (error) {
        console.error(`Error loading ${activeCategory}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, [activeCategory]);

  // Handle responsive font sizing for Title
  useEffect(() => {
    const handleResize = () => {
      const mobileSize = 120;
      const desktopSize = 192;
      const breakpoint = 520;

      setPressureFontSize(
        window.innerWidth < breakpoint ? mobileSize : desktopSize
      );
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
          
          {/* MY WORK Title */}
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

          {/* Category Navigation */}
          <div className="mb-0 md:mb-6">
            <CategoryNav 
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Category Subtitle */}
          <motion.p 
            key={activeCategory}
            className="text-white/60 font-thin text-lg md:text-2xl tracking-wide mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {activeCategory_obj?.subtitle}
          </motion.p>

          {/* Works Grid with Loading Prop */}
          <WorksGrid 
            works={works} 
            activeCategory={activeCategory} 
            isLoading={loading} // Pass loading state to Grid
          />

        </div>
      </section>

      {/* <ViewportIndicator /> */}
      <Footer3 />
      <Bottom />

    </main>
  );
}

// --- MAIN PAGE COMPONENT: WRAPS CONTENT IN SUSPENSE ---
export default function Works() {
  return (
    // This fallback shows a black screen while the search params load
    <Suspense fallback={<div className="min-h-screen w-full bg-black" />}>
      <WorksContent />
    </Suspense>
  );
}