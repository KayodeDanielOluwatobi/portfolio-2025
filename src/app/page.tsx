'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Hero from '@/components/layout/Hero';
import Bio from '@/components/layout/Bio';
import ViewportIndicator from '@/components/layout/ViewportIndicator';



// Brand showcase data - centralized for both Header and Hero
export const brandShowcases = [
  {
    id: 'tripadvisor',
    brandName: 'Tripadvisor',
    tagline: 'Every type of traveler, every type of trip',
    chips: ['BRAND IDENTITY DESIGN', 'TRAVEL BRAND'],
    textColor: '#F4D9CA',
    everdannLogo: '/logos/logo-tripadvisor-full.svg',
    //backgroundImage: '/backgrounds/tripadvisor-bg.png',
    logoVariant: 'tripadvisor'
  },
  //Add more brands here as you develop them
  {
    id: 'jael',
    brandName: 'Jael',
    tagline: 'Confidence tailored in every stitch',
    chips: ['BRAND IDENTITY DESIGN', 'FASHION BRAND'],
    textColor: '#EDCAF4',
    everdannLogo: '/logos/everdann-jael-full.svg',
    //backgroundImage: '/backgrounds/jael-bg.png',
    logoVariant: 'jael'
  },

  {
    id: 'conces',
    brandName: 'CONCES',
    tagline: 'Christ at the core of every innovation',
    chips: ['BRAND IDENTITY DESIGN', 'ORGANIZATION'],
    textColor: '#B8FB3C',
    everdannLogo: '/logos/everdann-conces-full.svg',
    //backgroundImage: '/backgrounds/conces-bg.png',
    logoVariant: 'conces'
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentBrand = brandShowcases[currentIndex];

  // Auto-rotate brands every 5 seconds
  useEffect(() => {
    // Only rotate if there's more than one brand
    if (brandShowcases.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % brandShowcases.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      {/* Pass current brand to Header */}
      <Header currentBrand={currentBrand.logoVariant} />
      
      {/* Pass current brand state to Hero */}
      <Hero 
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        brandShowcases={brandShowcases}
      />

      <Bio/>
      <ViewportIndicator/>
    </main>
  );
}