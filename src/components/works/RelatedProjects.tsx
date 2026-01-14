'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import FadeUp from '@/components/animations/FadeUp';

export default function RelatedProjects({ 
  currentSlug, 
  categoryTable 
}: { 
  currentSlug: string; 
  categoryTable: string; 
}) {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRelated() {
      // Use the passed table name, or default to works_brands if empty
      const targetTable = categoryTable || 'works_brands';

      const { data, error } = await supabase
        .from(targetTable)
        .select('title, slug, media')
        .neq('slug', currentSlug)
        .limit(6);

      if (error) {
        console.error("RelatedProjects Logic Error:", error.message);
        return;
      }

      if (data && data.length > 0) {
        // Shuffle the results to keep it fresh
        const shuffled = [...data].sort(() => 0.5 - Math.random()).slice(0, 2);
        setProjects(shuffled);
      }
    }

    fetchRelated();
  }, [currentSlug, categoryTable]);

  if (projects.length === 0) return null;

  return (
    <section className="pt-4 pb-8 md:pt-24 border-t border-white/5 bg-black">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="mb-5">
          <span className="pl-1 font-space text-xs md:text-lg uppercase tracking-widest text-white/70">
            Related Projects
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {projects.map((project) => {
            // Your DB has 'media' as an array [text[]], so we take the first item
            const thumbnail = project.media && project.media.length > 0 ? project.media[0] : null;

            return (
              <Link key={project.slug} href={`/works/${project.slug}`} className="group block">
                <FadeUp>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg md:rounded-2xl border border-white/5 bg-zinc-900/40">
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                      />
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-4">
                      <span className="font-space text-[10px] md:text-sm uppercase tracking-widest text-white text-center">
                        {project.title}
                      </span>
                    </div>
                  </div>
                </FadeUp>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}