'use client';

import { useState, useEffect } from 'react';
import { Squircle } from '@squircle-js/react';
import { Plus, Minus, ChevronsUpDown } from 'lucide-react';
import { useSquircleRadius } from '@/hooks/useSquircleRadius';
import { motion, AnimatePresence } from 'framer-motion';

interface BioCardProps {
  onHoverColor?: (fill: string, stroke?: string) => void;
  onLeaveColor?: () => void;
}

// 1. CONTENT CONFIGURATION
const SECTIONS = [
  {
    id: 'origin',
    title: '+ THE ORIGIN',
    content: (
      <>
        <p>
          I come from a place where the definition of success is narrow: Medicine
          or nothing. I chose the third option.
        </p>
        <p>
          As a child, I didn't play with toys; I dismantled them. I wanted to
          know how the ghost in the machine worked. That curiosity cost me every
          gadget in my house, but it bought me a way of seeing the world that
          schools couldn't teach.
        </p>
      </>
    ),
  },
  {
    id: 'evolution',
    title: '+ THE EVOLUTION',
    content: (
      <>
        <p>
          My path wasn't paved with MacBooks. It was carved through Microsoft
          Word and Paint. It was a war of attrition against the Adobe Pen Tool
          (a battle I almost lost, but eventually won).
        </p>
        <p>
          I learned design in the trenches of low specs. This taught me the most
          valuable lesson: Great art doesn't come from the equipment. It comes
          from the intent.
        </p>
      </>
    ),
  },
  {
    id: 'synthesis',
    title: '+ THE SYNTHESIS',
    content: (
      <>
        <p>
          I am a final-year EEE student. My left brain deals in circuits and
          logic. My right brain deals in rhythm and the "Spirit."
        </p>
        <p>
          A broken form without an error message isn't just a bug; it is a lack
          of empathy. I code to ensure the user never feels lost. I design to
          ensure they feel understood.
        </p>
      </>
    ),
  },
  {
    id: 'frequency',
    title: '+ THE FREQUENCY',
    content: (
      <>
        <p>
          My workflow is powered by heavy bass K-Pop (which shifts the
          atmosphere) and a pursuit of the 'Eureka.'
        </p>
        <p>
          I don't force design. I wait for the alignment. That specific moment
          when a concept stops being a file and starts being a feeling. Some call
          it "user experience." I call it stewardship.
        </p>
      </>
    ),
  },
  {
    id: 'reality',
    title: '+ THE REALITY',
    content: (
      <>
        <p>
          I do not create from a glass office. I create from the edge of unstable
          connectivity and improvisation.
        </p>
        <p>
          My toxic trait is a perfectionism that sometimes demands too much time,
          but refuses to let a single pixel drift out of place. I am comfortable
          with the difficult. I am obsessed with the exceptional.
        </p>
      </>
    ),
  },
];

export default function BioCard({ onHoverColor, onLeaveColor }: BioCardProps) {
  const squircleRadius = useSquircleRadius();
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // 2. PERSISTENCE LOGIC
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

  // 3. HANDLERS
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
    <div
      // CRITICAL FIX: Changed from h-full to h-auto (or just remove height).
      // This forces the container to grow with the Framer Motion animation.
      className="w-full h-auto"
      onMouseEnter={() => onHoverColor?.('#000000', '#ffffff')}
      onMouseLeave={() => onLeaveColor?.()}
    >
      <Squircle
        cornerRadius={squircleRadius}
        cornerSmoothing={0.7}
        // CRITICAL FIX: The Squircle itself must also be h-auto (or fit-content).
        className="w-full h-auto min-h-full bg-zinc-900/50 px-6 py-8 md:p-10 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black opacity-100" />

        <div className="relative z-10 space-y-8 text-justify">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs md:text-sm opacity-55 font-extralight text-zinc-50 tracking-wider">
              Bio
            </h3>
            <button
              onClick={toggleAll}
              className="flex items-center gap-1.5 text-[10px] sm:text-xs tracking-wider uppercase text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <ChevronsUpDown size={12} />
              {allOpen ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {/* Intro Text */}
          <div className="text-sm sm:text-base md:text-lg font-extralight tracking-wide leading-relaxed text-zinc-100/90">
            <p>
              I speak two languages that usually don't talk to each other: The
              rigid logic of code, and the fluid intuition of design.
            </p>
            <p className="mt-2 text-zinc-400">
              I don't just build interfaces; I orchestrate how they feel.
            </p>
          </div>

          {/* 4. SECTIONS WITH FRAMER MOTION */}
          <div className="space-y-6">
            {SECTIONS.map((section) => {
              const isOpen = openSections.includes(section.id);

              return (
                <div key={section.id} className="space-y-3 group">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center gap-3 text-left w-full"
                  >
                    <span
                      className={`text-zinc-400 group-hover:text-white transition-colors duration-300 ${
                        isOpen ? 'text-white' : ''
                      }`}
                    >
                      {isOpen ? (
                        <Minus size={16} strokeWidth={1.5} />
                      ) : (
                        <Plus size={16} strokeWidth={1.5} />
                      )}
                    </span>
                    <span className="font-space font-mono text-xs sm:text-sm tracking-widest uppercase text-zinc-100/80 group-hover:text-white transition-colors duration-300">
                      {section.title}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pl-7 text-sm sm:text-base leading-relaxed font-extralight tracking-wide text-zinc-300 space-y-3 pb-2">
                          {section.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Squircle>
    </div>
  );
}