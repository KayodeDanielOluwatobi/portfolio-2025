'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Removed notFound
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer3 from '@/components/layout/Footer3';
import Bottom from '@/components/layout/Bottom';
import { SmoothCursor } from '@/components/layout/SmoothCursor';
import { getProjectBySlug } from '@/utils/projectFetcher'; 
import  BentoRenderer from '@/components/works/BentoRenderer'
import  RelatedProjects from '@/components/works/RelatedProjects'
import { supabase } from '@/utils/supabase/client';
import ViewCounter from '@/components/works/ViewCounter';

export default function CaseStudyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getProjectBySlug(slug);
      
      if (!data) {
        console.error("Project not found for slug:", slug);
        // MANUALLY PUSH TO 404
        // Next.js will catch this and show your not-found.tsx
        router.replace('/404'); 
        return;
      }

      setProject(data);
      setLoading(false);

      // await supabase.rpc('increment_views', { 
      //   table_name: data.originTable, 
      //   row_slug: slug 
      // });

    }
    loadData();
  }, [slug, router]);

  if (loading) return <div className="min-h-screen bg-black" />;

  // Mapping DB columns to our UI needs
  // Adjust these keys based on your actual Supabase column names
  const brandName = project.brand_name || project.title;
  const heroImage = Array.isArray(project.media) ? project.media[0] : project.media;
  const tagline = project.tagline || "Brand Identity";
  const description = project.description || project.about_brand;
  // This is the JSONB column we'll create for the Bento Rows
  const bentoRows = project.case_study_data?.rows || [];

  return (
    <main className="bg-black min-h-screen">
      {/* <SmoothCursor cursorColor="#ffffff" cursorStrokeColor="#333333" /> */}
      <Header onMobileMenuToggle={() => {}} />

      {/* 1. HERO IMAGE SECTION (16/9) */}
      <section className="pt-24 px-0.5 sm:px-4 md:px-4 lg:px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-video w-full overflow-hidden rounded-xl md:rounded-2xl border border-white/5 bg-zinc-900"
          >
            <img 
              src={heroImage} 
              alt={brandName}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* 2. BRAND HEADER SECTION */}
      <section className="pt-16 pb-8 px-0.5 sm:px-4 md:px-4 lg:px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-2xl md:text-5xl font-light text-white tracking-wide"
              >
                {brandName}
              </motion.h1>

              {/* Actions Cluster */}
              <div className="flex items-center gap-3 md:gap-6">
                
                {/* View Counter with Dynamic Eye Icon */}
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border transition-colors duration-500"
                  style={{ borderColor: `${project?.brand_color}40` || '#39FF1440' }}
                >
                  <svg 
                    width="18" height="18" viewBox="0 0 24 24" fill="none" 
                    stroke={project?.brand_color || '#39FF14'} 
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span 
                    className="font-space text-sm md:text-base font-bold tracking-tighter"
                    style={{ color: project?.brand_color || '#ffffff' }}
                  >
                    {project?.views || 0}
                  </span>
                </div>

                {/* Fail-Safe Share Button */}
                <button 
                  onClick={async () => {
                    const shareData = {
                      title: brandName,
                      text: tagline,
                      url: window.location.href,
                    };

                    try {
                      // Try Native Share first (Works on mobile HTTPS)
                      if (navigator.share && navigator.canShare?.(shareData)) {
                        await navigator.share(shareData);
                      } else {
                        throw new Error('Share not supported');
                      }
                    } catch (err) {
                      // Fallback: Manual Copy to Clipboard
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard');
                      } else {
                        // Final Fallback for non-secure contexts (HTTP/IP testing)
                        const textArea = document.createElement("textarea");
                        textArea.value = window.location.href;
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {
                          document.execCommand('copy');
                          alert('Link copied to clipboard');
                        } catch (e) {
                          console.error('Final copy fallback failed', e);
                        }
                        document.body.removeChild(textArea);
                      }
                    }
                  }}
                  className="p-2.5 md:p-3 rounded-full border border-white/20 bg-white/5 transition-all duration-300 group"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = project?.brand_color || '#39FF14';
                    e.currentTarget.style.borderColor = project?.brand_color || '#39FF14';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  <svg 
                    width="20" height="20" viewBox="0 0 24 24" fill="none" 
                    stroke="white" strokeWidth="2" 
                    className="group-hover:stroke-black transition-colors"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
                  </svg>
                </button>
              </div>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-lg md:text-xl font-thin tracking-wider text-white/60"
            >
              {tagline}
            </motion.p>
          </div>
        </div>
      </section>

      {/* 3. BENTO RENDERER */}
      <section className="pb-32 px-0.5 sm:px-4 md:px-4 lg:px-4">
        <div className="container mx-auto max-w-6xl">
           <BentoRenderer rows={bentoRows} />
        </div>
      </section>

      <RelatedProjects 
        currentSlug={slug} 
        categoryTable={project?.originTable} // Ensure your project data includes which table it came from
      />

      <ViewCounter 
        slug={slug} 
        table={project?.originTable} 
      />

      {/* <Footer3 /> */}
      {/* <Bottom /> */}
    </main>
  );
}