'use client' // Required for using hooks

import { useState, useEffect } from 'react' // Import React hooks
import { Squircle } from '@squircle-js/react';

interface ImageDisplayProps {
  imageSrc?: string
  alt?: string
  className?: string
}

export default function ImageDisplay({
  imageSrc = '/profile3.avif',
  alt = 'Profile',
  className = '',
}: ImageDisplayProps) {

  // --- Mobile Detection Logic ---
  const [isMobile, setIsMobile] = useState(false)
  
  // We check if the component is mounted to avoid server/client mismatches
  const [isMounted, setIsMounted] = useState(false) 
  
  // This must match the breakpoint you use in Tailwind (md = 768px)
  const mdBreakpoint = 768 

  useEffect(() => {
    setIsMounted(true) // Mark as mounted

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < mdBreakpoint)
    }

    checkIsMobile() // Check on initial load
    window.addEventListener('resize', checkIsMobile) // Update on resize

    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  // --- End of Mobile Detection ---

  // You can now set your corner radius based on the user's example
  const cornerRadius = isMobile ? 4 : 7

  // To prevent hydration errors, we can return null (or a loader)
  // until the component has mounted and 'isMobile' is accurate.
  if (!isMounted) {
    return null 
  }

  return (
    <div className={`bg-black col-span-12 md:col-span-4 p-8 ${className}`}>
      <div className="w-full max-w-md">
        <Squircle
          cornerRadius={cornerRadius} // <-- Use the dynamic value here
          cornerSmoothing={1}
          className="w-full overflow-hidden shadow-2xl"
        >
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-auto"
          />
        </Squircle>
      </div>
    </div>
  )
}