'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typewriter } from '@/components/ui/Typewriter';

// --- DATA ---
const SECTIONS = [
  {
    id: 'origin',
    title: '+ THE ORIGIN',
    lines: [
      "I did not arrive at design by choice.",
      "It surfaced.",
      "Long before tools or titles, there was an instinct to notice. To question structure. To care about how things feel, not just how they work.",
      "Design became the language my mind defaulted to. A way of thinking. A way of resolving chaos into meaning."
    ]
  },
  {
    id: 'evolution',
    title: '+ THE EVOLUTION',
    lines: [
      "I did not start with fancy tools. I started with curiosity, stubbornness, and software that had no business producing good design (Microsoft Word and Paint, Lol.)",
      "It was a war of attrition against the Adobe Pen Tool (a battle I almost lost, but eventually won).", 
      "The Pen Tool almost broke our friendship. Almost.",
      "What kept me going was that moment when a concept clicks. When everything aligns and you just know this is it.",
      "When people later describe the work as elegant, atmospheric, or full of presence, I smile quietly. Because I know where it came from."
    ]
  },
  {
    id: 'frequency',
    title: '+ THE FREQUENCY',
    lines: [
      "Design and code are not separate in my mind. They hum together. Each amplifying the other.",
      "I chase that perfect moment when a concept clicks, the aura is just right and the work feels alive.",
      "Good design has a frequency. It’s subtle, almost spiritual. You may not name it, but you feel it: people notice it without knowing why."
    ]
  },
];

// --- INDIVIDUAL CARD COMPONENT ---
const BioSectionCard = ({
  title,
  lines,
  isOpen,
  onToggle,
}: {
  title: string;
  lines: string[];
  isOpen: boolean;
  onToggle: () => void;
}) => {
  
  return (
    <div
      className={`w-full rounded-lg md:rounded-xl relative overflow-hidden transition-all duration-500 border border-white/5 border-t-white/10 ${
        isOpen
          ? 'bg-zinc-900/20 shadow-2xl'
          : 'bg-zinc-900/20 hover:bg-zinc-900/40'
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-b from-white/3 via-transparent to-black/60 pointer-events-none transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-60'
        }`}
      />

      <div className="relative z-10 p-5 md:p-6">
        <button
          onClick={onToggle}
          className="flex items-center justify-between w-full text-left group"
        >
          <span
            className={`font-space text-xs sm:text-sm tracking-widest uppercase transition-colors duration-300 ${
              isOpen ? 'text-white/20' : 'text-white/20 group-hover:text-zinc-200/40'
            }`}
          >
            {title}
          </span>
          <span
            className={`transition-colors duration-300 ${
              isOpen ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
            }`}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ 
                height: 'auto',
                transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
              }}
              exit={{ 
                height: 0,
                transition: { duration: 0.4, ease: "easeInOut" } 
              }}
              className="overflow-hidden"
            >
              <div className="pt-6 text-sm sm:text-base leading-relaxed font-light tracking-wide text-zinc-300">
                <motion.div
                  initial={{ 
                    WebkitMaskPosition: "100% 100%", 
                    maskPosition: "100% 100%" 
                  } as any}
                  animate={{ 
                    WebkitMaskPosition: "0% 0%", 
                    maskPosition: "0% 0%" 
                  } as any}
                  transition={{ 
                    duration: 3, 
                    ease: "easeOut",
                    delay: 0.2 
                  }}
                  style={{
                    WebkitMaskImage: "linear-gradient(170deg, black 40%, transparent 60%)",
                    maskImage: "linear-gradient(170deg, black 40%, transparent 60%)",
                    WebkitMaskSize: "250% 250%",
                    maskSize: "250% 250%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat"
                  }}
                >
                  {lines.map((line, index) => (
                    <p key={index} className="mb-6 last:mb-0">
                      {line}
                    </p>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- MAIN PARENT COMPONENT ---
export default function BioStack() {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const BIO_LINES = [
    "I design the way some people pray",
    "Slowly.",
    "Intentionally..",
    "With attention to what others overlook..."
  ];

  useEffect(() => {
    setIsMounted(true);
    const saved = sessionStorage.getItem('bio_sections_state');
    if (saved) {
      setOpenSections(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem(
        'bio_sections_state',
        JSON.stringify(openSections)
      );
    }
  }, [openSections, isMounted]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (openSections.length === SECTIONS.length) {
      setOpenSections([]);
    } else {
      setOpenSections(SECTIONS.map((s) => s.id));
    }
  };

  const allOpen = openSections.length === SECTIONS.length;

  return (
    <div className="w-full space-y-3">
      {/* HEADER CARD */}
      <div className="w-full rounded-xl md:rounded-2xl p-6 md:p-8 relative overflow-hidden border border-white/5 border-t-white/10 bg-zinc-900/40">
        <div className="absolute inset-0 bg-gradient-to-b from-white/3 via-transparent to-black/100 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs md:text-sm opacity-55 font-extralight text-zinc-50 tracking-wider">
              Bio
            </h3>
            
            {/* 👇 BUTTON WITH COORDINATED FADE FOR ICON + TEXT */}
            <button
              onClick={toggleAll}
              className="font-space group flex items-center text-[10px] sm:text-xs tracking-wider uppercase text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <div className="relative h-4 flex items-center gap-1 sm:gap-1.5 min-w-[100px] sm:min-w-[120px] justify-end">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={allOpen ? 'collapse' : 'expand'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    // 👇 Increased duration to 0.6s for more atmosphere
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
                  >
                    <ChevronsUpDown className="w-2.5 h-2.5 sm:w-3.3 sm:h-3.3 mb-0.5" />
                    <span>{allOpen ? 'Collapse All' : 'Expand All'}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </button>
          </div>
          
          <div className="text-sm sm:text-base md:text-base font-space font-extralight uppercase tracking-wide leading-tight min-h-[160px] sm:min-h-[140px]">
            <Typewriter 
              lines={BIO_LINES}
              wait={3} 
              speed={40}
              pause={1000} 
              spacing="mb-1"
              withPrompt={true}
            />
          </div>
        </div>
      </div>

      {/* STACK */}
      <div className="flex flex-col gap-2">
        {SECTIONS.map((section) => (
          <BioSectionCard
            key={section.id}
            title={section.title}
            lines={section.lines}
            isOpen={openSections.includes(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </div>
    </div>
  );
}