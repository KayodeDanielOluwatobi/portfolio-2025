//this footer code is used for the about page --do not remove this comment

'use client'
import { useState, useEffect } from 'react'
import SpotifyWidget from '@/components/spotify/SpotifyWidget'
import WatchfaceWidget from '@/components/ui/WatchFaceWidget'
import SmoothWatchface from '@/components/ui/SmoothWatchface';

interface Footer3Props {
  className?: string;
}

export default function Footer3({ className = '' }: Footer3Props) {
  const [lagosTime, setLagosTime] = useState({ hours: 0, minutes: 0 });
  const [seoulTime, setSeoulTime] = useState({ hours: 0, minutes: 0 });
  const [tokyoTime, setTokyoTime] = useState({ hours: 0, minutes: 0 });
  const [watchfaceSize, setWatchfaceSize] = useState(220); // Default bumped up
  const [isMounted, setIsMounted] = useState(false);

  const timezones = {
    Lagos: 1,
    Seoul: 9,
    Tokyo: 9,
  };

  // Handle viewport resize
  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      const width = window.innerWidth;
      let newSize;
      
      const mdBreakpoint = 768; 
      
      // Target size for desktop
      const sizeAtMd = 320; 
      
      // Increased minimum size so it starts big
      const minSize = 220; 

      if (width < mdBreakpoint) {
        // --- MOBILE ---
        // Increased multiplier to 0.65 (65% of screen width)
        newSize = Math.max(width * 0.65, minSize);

      } else {
        // --- DESKTOP ---
        newSize = sizeAtMd; 
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

      const tokyoUTC = now.getTime() + (now.getTimezoneOffset() * 60000);
      const tokyoDate = new Date(tokyoUTC + (timezones.Tokyo * 3600000));
      setTokyoTime({
        hours: tokyoDate.getHours(),
        minutes: tokyoDate.getMinutes(),
      });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  return (
    // MERGED CLASSNAME HERE 👇
    <footer 
      data-section="after-keycaps" 
      className={`bg-black text-white border-t mb-0 border-white/0 overflow-x-hidden ${className}`}
    >
      <div className="container mx-auto px-2 py-2 max-w-none">
        
        {/* MOBILE LAYOUT - Only Lagos (Now Bigger) */}
        <div className="md:hidden">
          <div className="flex flex-col gap-6 w-full py-8"> {/* Added py-8 for breathing room */}
            <div className="flex gap-1 justify-center items-start w-full px-1">
              
              {/* Lagos Clock */}
              <div className="flex flex-col gap-4 justify-center items-center flex-1 min-w-0">
                <div className="flex flex-col gap-1 justify-center items-center">
                  <div className='font-space text-white/20 text-sm tracking-wider'>LAGOS</div>
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

            </div>            
          </div>
        </div>

        {/* DESKTOP LAYOUT - 3 Columns */}
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

          {/* MIDDLE COLUMN - South Korea Watchface */}
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

          {/* RIGHT COLUMN - Tokyo Watchface */}
          <div className="col-span-4 flex flex-col gap-4 justify-center items-center w-full">
            <div className="flex flex-col gap-0.5 items-center">
              <div className='font-space text-white/20 text-sm tracking-wider'>TOKYO</div>
              <div className='font-space pr-0.5 text-white/40 text-xs tracking-wider'>
                {String(tokyoTime.hours).padStart(2, '0')}:{String(tokyoTime.minutes).padStart(2, '0')}
              </div>
            </div>
            <SmoothWatchface 
              city="Tokyo" 
              country="Japan" 
              countryCode="JP" 
              size={320}
            />
          </div>

        </div>
      </div>
    </footer>
  )
}