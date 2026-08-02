'use client';

import { Squircle } from '@squircle-js/react';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import LinearWaveProgress from './LinearWaveProgress';
import { useSquircleRadius } from '@/hooks/useSquircleRadius';
import { Share2, Check } from 'lucide-react';

// Helper Hook for smooth easing animation
const useProgressAnimation = (targetValue: number, duration: number = 1500) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = value;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
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

interface PresentSchoolProps {
    onHoverColor?: (fill: string, stroke?: string) => void;
    onLeaveColor?: () => void;
}

export default function PresentSchool({ onHoverColor, onLeaveColor }: PresentSchoolProps) {
    const progress = useProgressAnimation(94);
    
    // 👇 Dynamic Sizing Flags based on your Hook
    const squircleRadius = useSquircleRadius();
    const isTiny = squircleRadius <= 12;   // < 380px
    const isMobile = squircleRadius <= 16;  // < 640px

    const CYAN_COLOR = '#3BA2DE';

    const cardRef = useRef<HTMLDivElement>(null);
    const [shouldGlow, setShouldGlow] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('card') === 'presentschool') {
                const timer = setTimeout(() => {
                    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setShouldGlow(true);
                    const glowTimer = setTimeout(() => {
                        setShouldGlow(false);
                    }, 3000);
                    return () => clearTimeout(glowTimer);
                }, 800);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const shareUrl = `${window.location.origin}/about?card=presentschool`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Daniel studying @ FUTA | Everdann Designs',
                    text: 'Currently studying Electrical & Electronics Engineering at FUTA (5th year).',
                    url: shareUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy link:', err);
            }
        }
    };

    return (
        <div 
            ref={cardRef}
            className="w-full h-full"
            onMouseEnter={() => onHoverColor?.(CYAN_COLOR, '#ffffff')}
            onMouseLeave={() => onLeaveColor?.()}
        >
            <Squircle
                cornerRadius={squircleRadius}
                cornerSmoothing={0.7}
                className={`w-full bg-zinc-900/50 px-6 py-8 md:p-10 text-white/70 relative overflow-hidden transition-all duration-700 ${
                    shouldGlow ? 'ring-2 ring-[#3BA2DE] shadow-[0_0_30px_rgba(59,162,222,0.4)] scale-[1.01]' : ''
                }`}
            >
                <Image
                    src="/logos/futapic.webp"
                    alt=""
                    fill
                    className="object-cover scale-103 " 
                />

                <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/90 via-[#000000]/70 to-[#000000]/90" />

                <div className="relative z-10 space-y-12 md:space-y-12">
                    <div className="flex justify-between items-center w-full">
                        <h3 className="text-xs md:text-sm opacity-55 font-extralight md:font-regular text-zinc-50 tracking-wider">
                            Currently studying . . .
                        </h3>
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center p-2 rounded-full bg-white/5 hover:bg-[#3BA2DE]/10 hover:text-[#3BA2DE] text-zinc-400 hover:border-[#3BA2DE]/20 border border-transparent transition-all duration-300 pointer-events-auto cursor-pointer z-20"
                            title="Share this card"
                        >
                            {copied ? <Check size={14} className="text-[#3BA2DE]" /> : <Share2 size={14} />}
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
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

                        <div className="flex-1 space-y-1.5">
                            <h4 className="text-sm md:text-base text-zinc-100 font-light leading-tight">
                                Electrical & Electronics Engineering
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-space md:text-sm text-white">
                                    <span style={{ fontFamily: 'var(--font-space-mono)' }}>@</span>FUTA
                                </span>
                                <span className="pt-[7px] md:pt-[7px] px-3 py-0.5 font-space uppercase bg-[#3BA2DE]/10 text-[#3BA2DE] font-medium text-xs rounded-full border border-[#3BA2DE]/20">
                                    5th year
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <LinearWaveProgress 
                            progress={progress}
                            // 👇 EXACT SETTINGS AS REQUESTED
                            height={isTiny ? 2.5 : 4}
                            trackHeight={isTiny ? 8 : isMobile ? 8 : 9}
                            waveHeight={isTiny ? 8 : isMobile ? 8 : 9}
                            trackColor="#ffffff4D"
                            waveColor={CYAN_COLOR}
                            waveAmplitude={isTiny ? 3 : isMobile ? 2 : 3}
                            maxWaveFrequency={isTiny ? 9 : isMobile ? 12 : 12}
                            undulationSpeed={isTiny ? 0.2 : isMobile ? 0.3 : 0.3}
                            edgeGap={isTiny ? 8 : 10}
                        />
                    </div>
                </div>
            </Squircle>
        </div>
    );
}