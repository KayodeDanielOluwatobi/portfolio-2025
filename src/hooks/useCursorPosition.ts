import { useState, useEffect } from 'react';

export function useCursorPosition() {
  const [cursorInHeroHeader, setCursorInHeroHeader] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Get the Hero section which has the data-cursor-brand attribute
      const heroSection = document.querySelector('[data-cursor-brand]');
      
      // Calculate the boundary - where hero ends
      let heroEndPosition = window.innerHeight * 1.5; // Default fallback
      
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        // heroRect.bottom is the bottom edge of hero, convert to absolute position
        heroEndPosition = window.scrollY + heroRect.bottom;
      }
      
      // Current cursor absolute position
      const cursorAbsoluteY = window.scrollY + e.clientY;
      
      // Check if cursor is above the end of hero section (in hero/header area)
      setCursorInHeroHeader(cursorAbsoluteY < heroEndPosition);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return cursorInHeroHeader;
}