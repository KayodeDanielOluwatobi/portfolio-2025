'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Bottom from '@/components/layout/Bottom';
import ViewportIndicator from '@/components/layout/ViewportIndicator';
import AboutHero from '@/components/about/AboutHero';
import AboutContent from '@/components/about/AboutContent';
import Footer3 from '@/components/layout/Footer3';

export default function About() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <main className="bg-black min-h-screen">
            <Header
                currentBrand="default"
                onMobileMenuToggle={setIsMobileMenuOpen}
            />

            <AboutHero />
            <AboutContent />
            <Footer3 />
            <Bottom />
            {/* <ViewportIndicator /> */}
        </main>
    );
}
