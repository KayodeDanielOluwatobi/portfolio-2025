'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TypewriterProps {
  lines: string[];
  wait?: number;
  speed?: number;
  pause?: number;
  className?: string;
  spacing?: string;
  withPrompt?: boolean;
}

// 1. Define Cursor Logic OUTSIDE so it is stable
const GlitchCursor = ({ shape }: { shape: 'line' | 'block' | 'underscore' }) => {
  return (
    <motion.span
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 1,
        repeat: Infinity,
        times: [0, 0.5, 0.5, 1],
        ease: "linear",
      }}
      className={`inline-block align-middle ml-1 bg-green-500 ${
        shape === 'line' ? 'w-[2.5px] h-[1.2em] translate-y-[-4px]' : 
        shape === 'block' ? 'w-[0.6em] h-[1.2em] translate-y-[-4px]' : 
        'w-[1.2em] h-[4px] translate-y-[4px]' 
      }`}
    />
  );
};

export const Typewriter = ({
  lines,
  wait = 4,
  speed = 40,
  pause = 1000,
  className,
  spacing = "mb-4",
  withPrompt = false,
}: TypewriterProps) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  
  const [isWaiting, setIsWaiting] = useState(true);
  const [isPausing, setIsPausing] = useState(false);

  // 2. Pick the cursor shape ONCE per Typewriter instance
  // This ensures it stays consistent across all lines for this specific card
  const [cursorShape] = useState<'line' | 'block' | 'underscore'>(() => {
    const shapes: ('line' | 'block' | 'underscore')[] = ['line', 'block', 'underscore'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  });

  const typeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Waiting Period
  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsWaiting(false);
      setDisplayedLines(['']); 
    }, wait * 1000);

    return () => clearTimeout(startTimeout);
  }, [wait]);

  // Typing Logic
  useEffect(() => {
    if (isWaiting || isPausing) return;
    if (activeLineIndex >= lines.length) return;

    const currentLineFullText = lines[activeLineIndex];
    const currentDisplayedText = displayedLines[activeLineIndex] || '';

    // Check if line finished
    if (currentDisplayedText.length === currentLineFullText.length) {
      if (activeLineIndex < lines.length - 1) {
        setDisplayedLines((prev) => [...prev, '']);
        setActiveLineIndex((prev) => prev + 1);
        
        setIsPausing(true);
        pauseTimeoutRef.current = setTimeout(() => {
          setIsPausing(false);
        }, pause);
      } 
      return; 
    }

    // Typing Algorithm
    const randomJitter = (Math.random() - 0.5) * speed * 1.5;
    let punctuationDelay = 0;
    const lastChar = currentDisplayedText.slice(-1);
    if (['.', ',', '!', '?'].includes(lastChar)) {
      punctuationDelay = 300;
    }

    const nextDelay = Math.max(5, speed + randomJitter + punctuationDelay);

    typeTimeoutRef.current = setTimeout(() => {
      const nextChar = currentLineFullText[currentDisplayedText.length];
      setDisplayedLines((prev) => {
        const newLines = [...prev];
        newLines[activeLineIndex] = currentDisplayedText + nextChar;
        return newLines;
      });
    }, nextDelay);

    return () => {
      if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
    };

  }, [isWaiting, isPausing, activeLineIndex, displayedLines, lines, speed, pause]);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  // --- STYLES ---

  const Prompt = () => (
    <span className="text-white mr-3 select-none font-mono font-normal text-xs md:text-sm tracking-tighter opacity-100">
      &gt;
    </span>
  );

  return (
    <div className={className}>
      <style jsx global>{`
        @keyframes hueCycle {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .animate-hue-cycle {
          animation: hueCycle 60s infinite linear;
        }
      `}</style>

      <div className="animate-hue-cycle">
        {displayedLines.map((line, index) => (
          <p key={index} className={`min-h-[1.5em] ${spacing} last:mb-0`}>
            {withPrompt && <Prompt />}
            
            <span className="whitespace-pre-wrap font-mono text-green-500">
              {line}
            </span>
            
            {index === activeLineIndex && (
               /* Pass the stable random shape down */
               <GlitchCursor shape={cursorShape} />
            )}
          </p>
        ))}
        
        {displayedLines.length === 0 && (
          <p className={`min-h-[1.5em] ${spacing}`}>
             {withPrompt && <Prompt />}
             <GlitchCursor shape={cursorShape} />
          </p>
        )}
      </div>
    </div>
  );
};