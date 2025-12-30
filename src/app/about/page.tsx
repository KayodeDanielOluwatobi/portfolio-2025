'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Bottom from '@/components/layout/Bottom';
import AboutHero from '@/components/about/AboutHero';
import AboutContent from '@/components/about/AboutContent';
import Footer3 from '@/components/layout/Footer3';
import { SmoothCursor } from '@/components/layout/SmoothCursor';
// 👇 1. Import the color utility
import { darkenColor } from '@/utils/colorUtils'; 
import FadeUp from '@/components/animations/FadeUp';


export default function About() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Default: Black Fill / White Stroke
    const [cursorColor, setCursorColor] = useState('#000000'); 
    const [cursorStrokeColor, setCursorStrokeColor] = useState('#ffffff'); 

    // 👇 2. Update this handler to Auto-Darken
    const handleColorChange = (fill: string, stroke?: string) => {
        setCursorColor(fill);
        // If 'stroke' is provided, use it. If NOT, darken the fill by 40%.
        setCursorStrokeColor(stroke || darkenColor(fill, 40)); 
    };

    const handleResetColor = () => {
        setCursorColor('#000000'); 
        setCursorStrokeColor('#ffffff');
    };

    return (
        <main className="bg-black min-h-screen">
            <Header
                currentBrand="default"
                onMobileMenuToggle={setIsMobileMenuOpen}
            />

            <SmoothCursor 
                cursorColor={cursorColor} 
                cursorStrokeColor={cursorStrokeColor} 
            />

            <FadeUp delay={0.4}>
                <AboutHero />
            </FadeUp>
            
            <FadeUp delay={0.4}>
                <AboutContent 
                onHoverColor={handleColorChange} 
                onLeaveColor={handleResetColor} 
                />
            </FadeUp>
            
            <FadeUp delay={0.4}>
                <Footer3 />
            </FadeUp>

            <FadeUp delay={0.4}>
                <Bottom />
            </FadeUp>
        </main>
    );
}