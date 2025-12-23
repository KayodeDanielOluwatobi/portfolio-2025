'use client';

import { Squircle } from '@squircle-js/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import CircularWaveProgress from '@/components/ui/CircularWaveProgress';


interface Course {
  title: string;
  lang: string;
  xp: number;
  flag: string;
}

interface DuoData {
  name: string;
  username: string;
  streak: number;
  isLessonComplete: boolean;
  courses: Course[];
  dailyGradient: { from: string; to: string };
}

export default function DuolingoWidget() {
  const [data, setData] = useState<DuoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [duoCharacter, setDuoCharacter] = useState('/duolingo/duo1.svg');
  const [isMobile, setIsMobile] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // --- Loader State ---
  const [loaderProgress, setLoaderProgress] = useState(0);

  useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
        setLoaderProgress(prev => (prev >= 100 ? 0 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/duolingo');
        if (res.ok) {
          const json = await res.json();
          setData(json);
          
          const streakChars = ['duo1.svg', 'duo3.svg', 'duo4.svg', 'duo7.svg', 'duo8.png', 'duo9.png', 'duo10.png', 'duo11.png', 'duo12.gif', 'duo13.gif', 'duo14.gif'];
          const noStreakChars = ['duo2.svg', 'duo5.svg', 'duo6.svg', 'duo15.png'];
          
          const pool = json.isLessonComplete ? streakChars : noStreakChars;
          const randomChar = pool[Math.floor(Math.random() * pool.length)];
          setDuoCharacter(`/duolingo/${randomChar}`);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !data) {
    return (
      <Squircle cornerRadius={40} cornerSmoothing={0.7} className="w-full min-h-[320px] bg-zinc-900/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/85 to-zinc-900/90" />
          <div className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <CircularWaveProgress 
            progress={loaderProgress} 
            size={isMobile ? 50 : 70}
            trackWidth={isMobile ? 5 : 6}
            waveWidth={isMobile ? 5 : 6}
            trackColor="#475569" 
            waveColor="#cbd5e1"
            waveAmplitude={isMobile ? 2 : 3}
            maxWaveFrequency={6} 
            undulationSpeed={2} 
            rotationSpeed={7} 
            edgeGap={20} 
            relaxationDuration={0} 
            className="opacity-30" />
         </div>
      </Squircle>
    );
  }

  return (
    <Squircle
      cornerRadius={isMobile ? 40 : 50}
      cornerSmoothing={0.7}
      // CHANGE 1: Added min-h-[320px] so mobile always has a "card" height, even without parent height
      className="w-full min-h-[320px] md:h-full relative overflow-hidden group font-din bg-zinc-900" 
    >
      {/* 1. BACKGROUND GRADIENT LAYER (Shared) */}
      <div 
        className="absolute inset-0 transition-colors duration-1000 ease-in-out"
        style={{
            background: `linear-gradient(135deg, ${data.dailyGradient.from}, ${data.dailyGradient.to})`
        }}
      />

      <div className="relative z-10 w-full h-full p-6 md:p-8">
        
        {/* ======================= */}
        {/* MOBILE LAYOUT           */}
        {/* ======================= */}
        {/* CHANGE 2: Used justify-between to push them apart naturally */}
        <div className="md:hidden flex flex-col items-center justify-between h-full py-4">
            
            {/* Top Section: Streak Data + Text */}
            <div className="flex flex-col items-center gap-0 shrink-0 -mt-2">
                {/* Fire + Number */}
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                         <Image 
                            src={data.isLessonComplete ? '/duolingo/fire-stroke.svg' : '/duolingo/nofire.svg'} 
                            alt="Streak" 
                            fill 
                            className={`object-contain ${data.isLessonComplete ? 'animate-none' : 'opacity-80'}`} 
                        />
                    </div>
                    <span className="text-white/80 font-bold text-5xl tracking-wide">
                        {data.streak}
                    </span>
                </div>
                
                {/* Text Label */}
                <span className="text-white/70 font-bold text-2xl tracking-wide">
                    day streak!
                </span>
            </div>

            {/* Bottom Section: Dynamic Duo */}
            {/* CHANGE 3: Set a clear height (h-40) so the bird has room and doesn't clip */}
            <div className="relative w-full h-40 shrink-0 mt-7">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative w-full h-full"
                >
                    <Image 
                        src={duoCharacter} 
                        alt="Duo" 
                        fill 
                        // object-bottom ensures he sits on the 'floor' of his container
                        className="object-contain object-bottom drop-shadow-2xl" 
                        priority
                        unoptimized
                    />
                </motion.div>
            </div>
        </div>

        {/* ======================= */}
        {/* DESKTOP LAYOUT          */}
        {/* ======================= */}
        <div className="hidden md:flex flex-col justify-start gap-8 h-full">
            
            {/* --- TOP ROW --- */}
            <div className="flex items-center justify-between w-full">
                {/* LEFT: Avatar + Name */}
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden shadow-lg">
                        <Image src="/duolingo/profile.png" alt="Profile" fill className="object-cover" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-white font-semibold text-lg tracking-wide">{data.name}</span>
                        <span className="text-white/60 font-medium text-xs opacity-80">{data.username}</span>
                    </div>
                </div>

                {/* RIGHT: Streak Fire */}
                <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10">
                        <Image 
                            src={data.isLessonComplete ? '/duolingo/fire-stroke.svg' : '/duolingo/nofire.svg'} 
                            alt="Streak" 
                            fill 
                            className={`object-contain ${data.isLessonComplete ? 'animate-none' : 'opacity-80'}`} 
                        />
                    </div>
                    <span className="text-white/80 font-bold text-3xl tracking-normal">
                        {data.streak}
                    </span>
                </div>
            </div>

            {/* --- BOTTOM ROW --- */}
            <div className="flex items-end justify-between w-full h-[160px] relative">
                
                {/* LEFT: Vertical Scrollable Listview */}
                <div className="w-1/2 h-full -ml-3 relative">
                    <div 
                        className="h-full overflow-y-auto py-2 pr-2 pl-4 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        style={{
                            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
                        }}
                    >
                        {data.courses.map((course) => (
                            <div key={course.lang} className="flex items-center gap-3 group/lang cursor-default">
                                <div className="relative w-8 h-8 shrink-0 drop-shadow-md transition-transform duration-200 group-hover/lang:scale-110">
                                    <Image 
                                        src={`/duolingo/${course.flag}`} 
                                        alt={course.title} 
                                        fill 
                                        className="object-contain" 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/90 font-bold text-sm tracking-wide line-clamp-1 group-hover/lang:text-white transition-colors">
                                        {course.title}
                                    </span>
                                    <span className="text-white/60 text-[12px] font-medium group-hover/lang:text-white/70 transition-colors">
                                        {course.xp.toLocaleString()} XP
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Dynamic Duo Character */}
                <div className="relative w-32 h-32 right-0 bottom-0">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="relative translate-x-2 w-full h-full"
                    >
                        <Image 
                            src={duoCharacter} 
                            alt="Duo" 
                            fill 
                            className="object-contain drop-shadow-2xl" 
                            priority
                            unoptimized
                        />
                    </motion.div>
                </div>
            </div>
        </div>

      </div>
    </Squircle>
  );
}