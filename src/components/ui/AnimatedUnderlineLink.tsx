// components/ui/AnimatedUnderlineLink.tsx
'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface AnimatedUnderlineLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string; // For passing specific link styles
  underlineClassName?: string; // For controlling underline thickness/offset
}

export default function AnimatedUnderlineLink({
  href,
  children,
  className = '',
  underlineClassName = 'h-[2px] md:h-[4px] bottom-[-0px] sm:bottom-[-0px] md:bottom-[-1px] lg:bottom-[-2px]', // Default thickness & offset
}: AnimatedUnderlineLinkProps) {
  const ref = useRef(null);
  // Trigger animation once when it enters the viewport
  const isInView = useInView(ref, {amount: 0.5}); 

  const underlineVariants = {
    hidden: { width: '0%' },
    visible: { width: '100%' },
  };

  return (
    <Link
      href={href}
      ref={ref}
      // Base styles for the link container
      className={`relative inline-block transition-opacity ${className}`}
    >
      {children}
      {/* The animated underline pseudo-element */}
      <motion.span
        className={`absolute left-0 bg-current ${underlineClassName}`} // Apply thickness/offset styles
        variants={underlineVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        transition={{ duration: 1.5, ease: 'circInOut' }} // Adjust duration/easing
      />
    </Link>
  );
}