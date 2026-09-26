//src/app/works/[slug]/page.tsx <--fgs dont remove this comment

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer3 from '@/components/layout/Footer3';
import Bottom from '@/components/layout/Bottom';
import { SmoothCursor } from '@/components/layout/SmoothCursor';
import { getProjectBySlug } from '@/utils/projectFetcher';
import BentoRenderer from '@/components/works/BentoRenderer';
import RelatedProjects from '@/components/works/RelatedProjects';
import ViewCounter from '@/components/works/ViewCounter';
import { darkenColor } from '@/utils/colorUtils';
import { renderFormattedText, isBulletLine, cleanBulletLine } from '@/utils/textFormatter';

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
        router.replace('/404');
        return;
      }

      setProject(data);
      setLoading(false);
    }
    loadData();
  }, [slug, router]);

  if (loading) return <div className="min-h-screen bg-black" />;

  // Mapping DB columns
  const brandName = project.brand_name || project.title || 'Case Study';
  const heroImage =
    project.case_study_data?.hero_image ||
    (Array.isArray(project.media) ? project.media[0] : project.media) ||
    project.background_image ||
    '';
  const brandLogo =
    project.case_study_data?.brand_logo ||
    project.case_study_data?.logo ||
    project.logo_variant ||
    project.logo ||
    '';
  const tagline = project.tagline || '';
  const description = project.description || project.about_brand;
  const bentoRows = project.case_study_data?.rows || [];
  const brandColor = project.brand_color || project.text_color || '#FFFFFF';
  const backgroundColor = project.background_color || '#070707';
  const chips: string[] = project.chips || project.tags || [];

  return (
    <main className="bg-black min-h-screen text-white">
      <SmoothCursor cursorColor="var(--white-val)" cursorStrokeColor="var(--zinc-800-val)" />
      <Header onMobileMenuToggle={() => { }} />

      {/* ── 1. IMMERSIVE HERO SECTION (65% Desktop Viewport Height) ── */}
      <section
        data-case-study-hero="true"
        className="group relative w-full overflow-hidden h-[55vh] md:h-[65vh] min-h-[380px] max-h-[720px] flex flex-col justify-end"
        style={{ backgroundColor }}
      >
        {/* Background Image with Shared Layout Animation & Zoom on Hover */}
        <motion.div
          layoutId={`project-media-${slug}`}
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
          style={{
            backgroundImage: heroImage ? `url(${heroImage})` : undefined,
            backgroundColor,
          }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* ── Centered Brand Logo over Hero Image ── */}
        {brandLogo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-6"
          >
            <div className="relative w-full max-w-[240px] sm:max-w-[360px] md:max-w-[480px] lg:max-w-[560px] h-28 sm:h-40 md:h-52 lg:h-60 flex items-center justify-center">
              <img
                src={brandLogo}
                alt={`${brandName} Logo`}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
                className="max-w-full max-h-full object-contain filter drop-shadow-[0_12px_32px_rgba(0,0,0,0.85)] pointer-events-none select-none"
              />
            </div>
          </motion.div>
        )}

        {/* Gradient Overlay for Cinematic Depth and Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/25 pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 w-full px-8 pb-8 pt-28 flex items-end justify-between">
          <div className="flex flex-col gap-4 w-full">
            {/* Top row: Brand Title & Actions Cluster */}
            <div className="flex items-end justify-between gap-6 flex-wrap">
              {/* [TEMPORARILY HIDDEN] Brand Title & Tagline
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2 max-w-3xl"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-wide leading-tight">
                  {brandName}
                </h1>
                {tagline && (
                  <p className="text-base sm:text-lg md:text-2xl font-extralight text-white/80 tracking-wide leading-snug">
                    {tagline}
                  </p>
                )}
              </motion.div>
              */}

              {/* Actions Cluster (Views Counter & Share Button - center aligned) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-3.5 ml-auto flex-shrink-0 h-8"
              >
                {/* View Counter with Custom Animated 3-Bar Graph */}
                <ViewCounterBadge brandColor={brandColor} views={project?.views || 0} />

                {/* Share Button (Borderless 3 connected circles share icon, center-aligned) */}
                <button
                  onClick={async () => {
                    const shareData = {
                      title: brandName,
                      text: tagline,
                      url: window.location.href,
                    };

                    try {
                      if (navigator.share && navigator.canShare?.(shareData)) {
                        await navigator.share(shareData);
                      } else {
                        throw new Error('Share not supported');
                      }
                    } catch {
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard');
                      }
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center p-0 rounded-full bg-transparent border-0 text-white/80 hover:text-white transition-all cursor-pointer group"
                  title="Share Case Study"
                  aria-label="Share Case Study"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 transition-transform group-hover:scale-110"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </motion.div>
            </div>

            {/* [TEMPORARILY HIDDEN] Chips / Tags
            {chips.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <CaseStudyPillGroup chips={chips} brandColor={brandColor} />
              </motion.div>
            )}
            */}
          </div>
        </div>
      </section>

      {/* ── 2. EDITORIAL DESCRIPTION SECTION (Fallback only when no Bento rows exist) ── */}
      {description && bentoRows.length === 0 && (
        <section className="pt-8 pb-4 px-4 sm:px-6">
          <div className="container mx-auto max-w-6xl flex flex-col gap-2">
            {description
              .split(/\r?\n/)
              .map((line: string, i: number) => {
                if (line.trim() === '') {
                  return <div key={i} className="h-3 sm:h-4 w-full" aria-hidden="true" />;
                }

                const isBullet = isBulletLine(line);
                const txt = isBullet ? cleanBulletLine(line) : line;

                if (isBullet) {
                  return (
                    <div key={i} className="flex items-start gap-3 pl-2 w-full text-justify font-light text-zinc-200">
                      <span className="w-2 h-2 rounded-full bg-white/70 mt-2 flex-shrink-0" />
                      <div
                        className="flex-1 text-base sm:text-lg md:text-xl font-light text-zinc-200 leading-relaxed text-justify"
                        style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                      >
                        {renderFormattedText(txt)}
                      </div>
                    </div>
                  );
                }

                return (
                  <p
                    key={i}
                    className="text-base sm:text-lg md:text-xl font-light text-zinc-200 leading-relaxed max-w-3xl text-justify"
                    style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                  >
                    {renderFormattedText(txt)}
                  </p>
                );
              })}
          </div>
        </section>
      )}

      {/* ── 3. BENTO RENDERER GRID (Follows hero section with comfortable top spacing) ── */}
      {bentoRows.length > 0 && (
        <section className="pt-8 sm:pt-10 md:pt-12 pb-32 px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <BentoRenderer rows={bentoRows} />
          </div>
        </section>
      )}

      <RelatedProjects
        currentSlug={slug}
        categoryTable={project?.originTable}
      />

      {project?.originTable && (
        <ViewCounter
          slug={slug}
          table={project.originTable}
          onUpdate={(newCount) => {
            setProject((prev: any) => ({ ...prev, views: newCount }));
          }}
        />
      )}
    </main>
  );
}

function CaseStudyPillGroup({
  chips,
  brandColor,
}: {
  chips: string[];
  brandColor: string;
}) {
  const [isGroupHovered, setIsGroupHovered] = useState(false);

  return (
    <>
      <style>{`
        @keyframes liquid-wave-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes liquid-wave-slow {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <div
        onMouseEnter={() => setIsGroupHovered(true)}
        onMouseLeave={() => setIsGroupHovered(false)}
        className="flex flex-wrap gap-2.5 pt-2"
      >
        {chips.map((chip, index) => {
          const defaultFilled = index % 2 === 0;
          const activeFilled = isGroupHovered ? !defaultFilled : defaultFilled;

          return (
            <span
              key={chip}
              className="relative overflow-hidden px-3.5 pt-[8.5px] md:pt-[9px] pb-[6.5px] md:pb-[7px] rounded-full text-xs font-space tracking-wider uppercase leading-none flex items-center justify-center cursor-pointer select-none transition-colors duration-300"
              style={{
                border: `1.5px solid ${brandColor}`,
              }}
            >
              {/* ── Liquid Water Tank Reservoir ── */}
              <div
                className="absolute inset-x-0 bottom-0 pointer-events-none transition-all duration-600 ease-out overflow-visible"
                style={{
                  height: activeFilled ? '115%' : '0%',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.15, 0.64, 1)',
                }}
              >
                {/* Solid Body of Water */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: brandColor }}
                />

                {/* Subsurface Water Layer 2 (Back wave moving in reverse) */}
                <div className="absolute -top-3 inset-x-0 h-3.5 pointer-events-none opacity-45 overflow-visible">
                  <svg
                    viewBox="0 0 900 60"
                    preserveAspectRatio="none"
                    className="w-[200%] h-full"
                    style={{
                      animation: 'liquid-wave-slow 2.4s linear infinite',
                      fill: brandColor,
                    }}
                  >
                    <path d="M 0 20 C 37.5 35, 75 5, 112.5 20 C 150 35, 187.5 5, 225 20 C 262.5 35, 300 5, 337.5 20 C 375 35, 412.5 5, 450 20 C 487.5 35, 525 5, 562.5 20 C 600 35, 637.5 5, 675 20 C 712.5 35, 750 5, 787.5 20 C 825 35, 862.5 5, 900 20 L 900 60 L 0 60 Z" />
                  </svg>
                </div>

                {/* Surface Water Layer 1 (Front crisp undulating crest) */}
                <div className="absolute -top-2.5 inset-x-0 h-3.5 pointer-events-none overflow-visible">
                  <svg
                    viewBox="0 0 900 60"
                    preserveAspectRatio="none"
                    className="w-[200%] h-full"
                    style={{
                      animation: 'liquid-wave-fast 1.6s linear infinite',
                      fill: brandColor,
                    }}
                  >
                    <path d="M 0 20 C 37.5 5, 75 35, 112.5 20 C 150 5, 187.5 35, 225 20 C 262.5 5, 300 35, 337.5 20 C 375 5, 412.5 35, 450 20 C 487.5 5, 525 35, 562.5 20 C 600 5, 637.5 35, 675 20 C 712.5 5, 750 35, 787.5 20 C 825 5, 862.5 35, 900 20 L 900 60 L 0 60 Z" />
                  </svg>
                </div>
              </div>

              {/* Text Label */}
              <span
                className="relative z-10 transition-colors duration-300 font-normal"
                style={{
                  color: activeFilled ? '#000000' : brandColor,
                }}
              >
                {chip}
              </span>
            </span>
          );
        })}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Animated 3-Bar Graph View Counter Badge
// ─────────────────────────────────────────────────────────────────────────────

function ViewCounterBadge({
  brandColor: _brandColor,
  views,
}: {
  brandColor?: string;
  views: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center justify-center gap-2 h-8 px-0 bg-transparent border-0 text-white/80 hover:text-white transition-colors duration-200 cursor-pointer select-none group"
      title={`${views} Views`}
    >
      {/* 3-Bar Static Graph (styled matching the share icon, center-aligned) */}
      <div className="flex items-end justify-center gap-[2.5px] w-3.5 h-[14px] flex-shrink-0">
        {/* Bar 1 (Left - 7px static) */}
        <motion.span
          className="w-[2.5px] rounded-full origin-bottom bg-white/80 group-hover:bg-white transition-colors duration-200"
          initial={{ height: 0 }}
          animate={
            isHovered
              ? {
                  height: [7, 11, 7],
                  transition: { duration: 1.1, ease: [0.25, 1, 0.5, 1] },
                }
              : {
                  height: 7,
                  transition: { duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
                }
          }
        />

        {/* Bar 2 (Center - 14px static, reduced from 18px) */}
        <motion.span
          className="w-[2.5px] rounded-full origin-bottom bg-white/80 group-hover:bg-white transition-colors duration-200"
          initial={{ height: 0 }}
          animate={
            isHovered
              ? {
                  height: [14, 9, 14],
                  transition: { duration: 1.1, delay: 0.1, ease: [0.25, 1, 0.5, 1] },
                }
              : {
                  height: 14,
                  transition: { duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] },
                }
          }
        />

        {/* Bar 3 (Right - 10px static) */}
        <motion.span
          className="w-[2.5px] rounded-full origin-bottom bg-white/80 group-hover:bg-white transition-colors duration-200"
          initial={{ height: 0 }}
          animate={
            isHovered
              ? {
                  height: [10, 13, 10],
                  transition: { duration: 1.1, delay: 0.2, ease: [0.25, 1, 0.5, 1] },
                }
              : {
                  height: 10,
                  transition: { duration: 0.6, delay: 0.36, ease: [0.16, 1, 0.3, 1] },
                }
          }
        />
      </div>

      {/* View count text matching the share icon color */}
      <span
        className="font-space text-xs sm:text-sm tracking-tight leading-none text-white/80 group-hover:text-white transition-colors duration-200 select-none flex items-center translate-y-[1.5px]"
      >
        {views}
      </span>
    </div>
  );
}