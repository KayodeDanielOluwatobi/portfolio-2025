'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/layout/Header';
import { WORK_CATEGORIES } from '@/data/workCategories';
import CategoryNav from '@/components/works/CategoryNav';
import WorksGrid from '@/components/works/WorksGrid';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import TextPressure from '@/components/TextPressure';
import Footer3 from '@/components/layout/Footer3';
import Bottom from '@/components/layout/Bottom';
import { CursorProvider, useCursor } from '@/context/CursorContext';
import { SmoothCursor } from '@/components/layout/SmoothCursor';
import FadeUp from '@/components/animations/FadeUp';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function CursorController() {
  const { cursorColor, cursorStrokeColor } = useCursor();
  return <SmoothCursor cursorColor={cursorColor} cursorStrokeColor={cursorStrokeColor} />;
}

function WorksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState('brands');
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pressureFontSize, setPressureFontSize] = useState(192);

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
        if (data) setWorks(data);

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

  // 👇 Animation Variants for the Typing Effect
  const charVariants = {
    hidden: { opacity: 0 },
    reveal: { opacity: 1 },
  };

  return (
    <main>
      <Header onMobileMenuToggle={setIsMobileMenuOpen} />

      <section className="w-full py-32 bg-[var(--background)] min-h-screen transition-colors duration-400">
        <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">

          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TextPressure
              text="My Works!"
              flex={false} alpha={false} stroke={false} width={true} weight={true} italic={true}
              textColor="var(--white-val)" minFontSize={36} fixedFontSize={pressureFontSize}
            />
          </motion.div>

          <div className="mb-0 md:mb-6">
            <CategoryNav
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* 👇 BUTTERY SMOOTH TYPING SUBTITLE */}
          <div className="min-h-[2em] mb-12"> {/* Height anchor to prevent layout jump */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeCategory}
                className="text-white/60 font-thin text-lg md:text-2xl tracking-wide leading-relaxed"
                initial="hidden"
                animate="reveal"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  reveal: { opacity: 1, transition: { staggerChildren: 0.02, delayChildren: 0.1 } }
                }}
              >
                {activeCategory_obj?.subtitle.split("").map((char, index) => (
                  <motion.span
                    key={`${activeCategory}-${index}`}
                    variants={charVariants}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.p>
            </AnimatePresence>
          </div>

          <WorksGrid
            works={works}
            activeCategory={activeCategory}
            isLoading={loading}
          />

        </div>
      </section>

      <FadeUp delay={0.4}>
        <Footer3 />
      </FadeUp>

      <FadeUp delay={0.4}>
        <Bottom />
      </FadeUp>

    </main>
  );
}

export default function Works() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-[var(--background)]" />}>
      <CursorProvider>
        <CursorController />
        <WorksContent />
      </CursorProvider>
    </Suspense>
  );
}