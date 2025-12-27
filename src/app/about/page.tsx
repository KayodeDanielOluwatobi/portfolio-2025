'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Bottom from '@/components/layout/Bottom';
import ViewportIndicator from '@/components/layout/ViewportIndicator';
import AboutHero from '@/components/about/AboutHero';
import AboutContent from '@/components/about/AboutContent';
import Footer3 from '@/components/layout/Footer3';
import { SmoothCursor } from '@/components/layout/SmoothCursor';

export default function About() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Default cursor color (Black/White theme)
    // FIX 1: Initial state set to Black fill / White stroke to match your design
    const [cursorColor, setCursorColor] = useState('#000000'); 
    const [cursorStrokeColor, setCursorStrokeColor] = useState('#ffffff'); 

    // Helper to change color on hover
    const handleColorChange = (fill: string, stroke: string = '#ffffff') => {
        setCursorColor(fill);
        setCursorStrokeColor(stroke);
    };

    // Helper to reset to default (Bio/Background)
    // FIX 2: Reset function matches the initial Black/White state
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

            <AboutHero />
            
            {/* Pass the handlers down to the content */}
            <AboutContent 
                onHoverColor={handleColorChange} 
                onLeaveColor={handleResetColor} 
            />
            
            <Footer3 />
            <Bottom />
            {/* <ViewportIndicator /> */}
        </main>
    );
}