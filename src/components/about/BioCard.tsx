'use client';

import { Squircle } from '@squircle-js/react';
import { useSquircleRadius } from '@/hooks/useSquircleRadius'; // 👈 Hook import

// 👇 Props Interface
interface BioCardProps {
    onHoverColor?: (fill: string, stroke?: string) => void;
    onLeaveColor?: () => void;
}

export default function BioCard({ onHoverColor, onLeaveColor }: BioCardProps) {
    // 👇 Use Hook with Defaults
    const squircleRadius = useSquircleRadius();

    return (
        // Wrapper to capture Hover Events
        <div 
            className="w-full h-full"
            onMouseEnter={() => onHoverColor?.('#000000', '#ffffff')} // Black Fill, White Stroke
            onMouseLeave={() => onLeaveColor?.()}
        >
            <Squircle
                cornerRadius={squircleRadius}
                cornerSmoothing={0.7}
                className="w-full bg-zinc-900/50 px-6 py-8 md:p-10 relative overflow-hidden"
            >
                {/* Dark Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black opacity-100" />

                {/* Content */}
                <div className="relative text-justify z-10 space-y-6">
                    <h3 className="text-xs md:text-sm opacity-55 font-extralight md:font-regular text-zinc-50 tracking-wider">
                        Bio
                    </h3>
                    <div className="font-extralight tracking-wide leading-normal text-zinc-100/90">
                        <p className="text-sm sm:text-base md:text-lg">
                            I'm Daniel, a multidisciplinary designer and frontend engineer who blends technical expertise with artistic vision. I'm passionate about building brands that stand out, creating socials that engage, and crafting spirit-led church media that uplifts, delivering immersive digital experiences with lasting impact.
                        </p>
                    </div>
                </div>
            </Squircle>
        </div>
    );
}