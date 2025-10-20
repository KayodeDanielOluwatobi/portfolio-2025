'use client';

import { useState, useEffect } from 'react';

export default function MoreBio() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    // Detect if user is on a mobile device (not just mobile screen size)
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 'mobile'];
      return mobileKeywords.some(keyword => userAgent.includes(keyword));
    };

    setIsMobileDevice(checkMobileDevice());
  }, []);

  // Don't render on mobile devices
  if (isMobileDevice) {
    return null;
  }

  return (
    <section className="bg-black text-white py-16 md:py-24">
      <div className="container mx-auto px-8 max-w-none">
        
        {/* 12 column grid - content starts at column 7 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 lg:gap-8">
          {/* Empty space - columns 1-6 on desktop */}
          <div className="hidden md:block md:col-span-6"></div>
          
          {/* First text - columns 7-9 on desktop */}
          <div className="space-y-4 md:col-span-3">
            <p className="text-xs md:text-xs lg:text-xs font-extralight tracking-wider leading-tight">
              Every swipe, every scroll is an opportunity to make someone stop and feel something. 
              I approach design like a storyteller obsessed with details, crafting visuals 
              that actually connect.
            </p>
          </div>
          
          {/* Second text - columns 10-12 on desktop */}
          <div className="space-y-4 md:col-span-3">
            <p className="text-xs md:text-xs lg:text-xs font-extralight leading-tight tracking-wider">
              What drives me most is purpose-driven work. 
              I'm drawn to projects where design becomes a bridge 
              between intention and impact, between a brand's heartbeat 
              and the people who need to hear it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}