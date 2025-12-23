'use client';

import { Squircle } from '@squircle-js/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import LinearWaveProgress from './LinearWaveProgress';

// Hook for smooth easing animation
const useProgressAnimation = (targetValue: number, duration: number = 1500) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = value;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out quart function for a smooth "landing"
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setValue(startValue + (targetValue - startValue) * ease);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [targetValue]); 

  return value;
};

export default function PresentSchool() {
    // Smoothly animate to 80%
    const progress = useProgressAnimation(80);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
          const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // 768px is md breakpoint
          };
        
          checkMobile();
          window.addEventListener('resize', checkMobile);
          return () => window.removeEventListener('resize', checkMobile);
        }, []);

    return (
        <Squircle
            cornerRadius={isMobile ? 40 : 50}
            cornerSmoothing={0.7}
            className="w-full bg-zinc-900/50 px-6 py-8 md:p-10 text-white/70 relative overflow-hidden"
        >
            
            <Image
                src="/logos/futapic.webp"
                alt=""
                fill
                className="object-cover scale-103 " 
            />

            {/* Gradient Overlay for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />
            

            {/* Dark Gradient Background */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-800 to-black opacity-100" /> */}

            {/* Content */}
            <div className="relative z-10 space-y-12 md:space-y-12">
                {/* Header */}
                <h3 className="text-xs md:text-sm opacity-55 font-extralight md:font-regular  text-zinc-50 tracking-wider">
                    Currently studying . . .
                </h3>

                {/* School Info Row */}
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 md:w-12 md:h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                            <Image
                                src="/logos/futa.jpg"
                                alt="FUTA Logo"
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 space-y-1.5">
                        <h4 className="text-sm md:text-base text-zinc-100 font-light leading-tight">
                            Electrical & Electronics Engineering
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-space md:text-sm text-zinc-400">
                                {/* 👇 SILENT FIX: Wrapped @ in span with Space Mono variable */}
                                <span style={{ fontFamily: 'var(--font-space-mono)' }}>@</span>FUTA
                            </span>
                            <span className=" pt-[7px] md:pt-[7px] px-3 py-0.5 font-space uppercase bg-[#3BA2DE]/10 text-[#3BA2DE] font-medium text-xs rounded-full border border-[#3BA2DE]/20">
                            5th year
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar (Animation is passed here) */}
                <div className="space-y-2">
                    <LinearWaveProgress 
                        progress={progress}
                        height={6}
                        trackHeight={isMobile ? 8 : 9}
                        waveHeight={isMobile ? 8 : 9}
                        trackColor="#ffffff4D"
                        waveColor="#3BA2DE"
                        waveAmplitude={3}
                        maxWaveFrequency={isMobile ? 9 : 14}
                        undulationSpeed={1}
                        edgeGap={isMobile ? 7 : 9}
                    />
                </div>
            </div>
        </Squircle>
    );
}