'use client';

import { useState, useEffect } from 'react';

export function useSquircleRadius(
  desktopRadius: number = 30, // > 1024px (Laptops/Desktops)
  tabletRadius: number = 22,  // 640px - 1024px (Tablets/Large Phones)
  mobileRadius: number = 16,  // 380px - 640px (Standard Phones)
  tinyRadius: number = 12     // < 380px (Small Phones like iPhone SE/Fold)
) {
  // Initialize with desktopRadius to match Server Side Rendering
  const [radius, setRadius] = useState(desktopRadius);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 380) {
        // Tiny Screens
        setRadius(tinyRadius);
      } else if (width < 640) {
        // Mobile Screens
        setRadius(mobileRadius);
      } else if (width < 1024) {
        // 👇 NEW: Tablet Screens (iPad Portrait, Large Foldables)
        setRadius(tabletRadius);
      } else {
        // Desktop / Laptop
        setRadius(desktopRadius);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [desktopRadius, tabletRadius, mobileRadius, tinyRadius]);

  return radius;
}