'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  yOffset?: number;
}

export default function FadeUp({ 
  children, 
  delay = 0, 
  duration = 0.8, // 👈 Slower duration (was 0.5)
  className = "",
  yOffset = 20    // 👈 Smaller jump (was 40) - clearer "float"
}: FadeUpProps) {
  const ref = useRef(null);
  
  // margin: "-100px" means it won't trigger until you are decently scrolling past it
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{ 
        duration: duration, 
        delay: delay,
        // 👇 This is the "Graceful" curve. 
        // Starts with momentum, slows down very smoothly at the end. No bounce.
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}