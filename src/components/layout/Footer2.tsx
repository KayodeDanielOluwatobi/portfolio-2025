'use client'
import { useState, useEffect } from 'react'
import SpotifyWidget from '@/components/spotify/SpotifyWidget'
import WatchfaceWidget from '@/components/ui/WatchFaceWidget'
import SmoothWatchface from '@/components/ui/SmoothWatchface';

export default function Footer2() {
  const [lagosTime, setLagosTime] = useState({ hours: 0, minutes: 0 });
  const [seoulTime, setSeoulTime] = useState({ hours: 0, minutes: 0 });
  const [watchfaceSize, setWatchfaceSize] = useState(140);
  const [isMounted, setIsMounted] = useState(false);

  const timezones = {
    Lagos: 1,
    Seoul: 9,
  };

  // Handle viewport resize
  // Handle viewport resize
  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      const width = window.innerWidth;
      let newSize;
      
      // === Define our Breakpoints ===
      // Match these to your tailwind.config.js breakpoints
      const mdBreakpoint = 768; // Tailwind's default 'md' breakpoint
      
      // === Define our "Keyframe" Sizes ===
      // Size just before hitting md (at 767px)
      const sizeAtMobileMax = 767 * 0.35; // ~268px
      
      // Target size for when we hit the 'md' (desktop) breakpoint
      const sizeAtMd = 320; 
      
      const minSize = 120; 

      // === Calculate the Size ===
      if (width < mdBreakpoint) {
        // --- MOBILE (Below 768px) ---
        // Scale smoothly from 120px up to ~268px
        newSize = Math.max(width * 0.35, minSize);

      } else {
        // --- DESKTOP (768px and up) ---
        // Lock to the desktop size
        newSize = sizeAtMd; // This will be 320
      }
      
      setWatchfaceSize(Math.round(newSize));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle time updates
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();

      const lagosUTC = now.getTime() + (now.getTimezoneOffset() * 60000);
      const lagosDate = new Date(lagosUTC + (timezones.Lagos * 3600000));
      setLagosTime({
        hours: lagosDate.getHours(),
        minutes: lagosDate.getMinutes(),
      });

      const seoulUTC = now.getTime() + (now.getTimezoneOffset() * 60000);
      const seoulDate = new Date(seoulUTC + (timezones.Seoul * 3600000));
      setSeoulTime({
        hours: seoulDate.getHours(),
        minutes: seoulDate.getMinutes(),
      });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  return (
    <footer data-section="after-keycaps" className="bg-black text-white border-t mb-0 border-white/0 overflow-x-hidden">
      <div className="container mx-auto px-2 py-2 max-w-none">
        {/* MOBILE LAYOUT */}
        <div className="md:hidden">
          <div className="flex flex-col gap-6 w-full">
            {/* Two clocks side by side */}
            <div className="flex gap-1 justify-center items-start w-full px-1">
              {/* Lagos Clock */}
              <div className="flex flex-col gap-2 justify-center items-center flex-1 min-w-0">
                <div className="flex flex-col gap-0.5 justify-center items-center">
                  <div className='font-space text-white/20 text-xs tracking-wider'>LAGOS</div>
                  <div className='font-space text-white/40 text-xs tracking-wider'>
                    {String(lagosTime.hours).padStart(2, '0')}:{String(lagosTime.minutes).padStart(2, '0')}
                  </div>
                </div>
                <SmoothWatchface 
                  city="Lagos" 
                  country="Nigeria" 
                  countryCode="NG" 
                  size={watchfaceSize}
                />
              </div>

              {/* Seoul Clock */}
              <div className="flex flex-col gap-2 justify-center items-center flex-1 min-w-0">
                <div className="flex flex-col gap-0.5 items-center">
                  <div className='font-space text-white/20 text-xs tracking-wider'>SEOUL</div>
                  <div className='font-space text-white/40 text-xs tracking-wider'>
                    {String(seoulTime.hours).padStart(2, '0')}:{String(seoulTime.minutes).padStart(2, '0')}
                  </div>
                </div>
                <SmoothWatchface 
                  city="Seoul" 
                  country="South Korea" 
                  countryCode="KR" 
                  size={watchfaceSize}
                />
              </div>
            </div>

            {/* Spotify Widget below */}
            <div className="flex flex-col items-center justify-center w-full">
              <SpotifyWidget pollInterval={10000} />
            </div>
          </div>
        </div>

        {/* DESKTOP LAYOUT */}
        <div className="hidden md:grid grid-cols-12 gap-3">
          {/* LEFT COLUMN - Nigeria Watchface */}
          <div className="col-span-4 flex flex-col gap-4 justify-center items-center w-full">
            <div className="flex flex-col gap-0.5 justify-center items-center">
              <div className='font-space text-white/20 text-sm tracking-wider'>LAGOS</div>
              <div className='font-space pl-0 text-white/40 text-xs tracking-wider'>
                {String(lagosTime.hours).padStart(2, '0')}:{String(lagosTime.minutes).padStart(2, '0')}
              </div>
            </div>
            <SmoothWatchface 
              city="Lagos" 
              country="Nigeria" 
              countryCode="NG" 
              size={320}
            />
          </div>

          {/* CENTER COLUMN - Spotify Widget */}
          <div className="col-span-4 h-full flex flex-col items-center justify-center">
            <SpotifyWidget pollInterval={10000} />
          </div>

          {/* RIGHT COLUMN - South Korea Watchface */}
          <div className="col-span-4 flex flex-col gap-4 justify-center items-center w-full">
            <div className="flex flex-col gap-0.5 items-center">
              <div className='font-space text-white/20 text-sm tracking-wider'>SEOUL</div>
              <div className='font-space pr-0.5 text-white/40 text-xs tracking-wider'>
                {String(seoulTime.hours).padStart(2, '0')}:{String(seoulTime.minutes).padStart(2, '0')}
              </div>
            </div>
            <SmoothWatchface 
              city="Seoul" 
              country="South Korea" 
              countryCode="KR" 
              size={320}
            />
          </div>
        </div>
      </div>
    </footer>
  )
}