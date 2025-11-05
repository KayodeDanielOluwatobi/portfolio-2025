import { useState, useEffect } from 'react';

interface UseBrandRotationProps {
  totalBrands: number;
  intervalDuration?: number;
  fadeDuration?: number;
}

export function useBrandRotation({ 
  totalBrands, 
  intervalDuration = 10000,
  fadeDuration = 500 // Match Framer Motion duration
}: UseBrandRotationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Only rotate if there's more than one brand
    if (totalBrands <= 1) return;

    const interval = setInterval(() => {
      // Mark transition as starting
      setIsTransitioning(true);
      
      // Change index immediately - Framer Motion will handle the animation
      setCurrentIndex((prev) => (prev + 1) % totalBrands);
      
      // Mark transition as complete after animation finishes
      setTimeout(() => {
        setIsTransitioning(false);
      }, fadeDuration);
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [totalBrands, intervalDuration, fadeDuration]);

  return { currentIndex, setCurrentIndex, isTransitioning };
}