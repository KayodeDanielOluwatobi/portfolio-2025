'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import BubblingFlask from '@/components/ui/BubblingFlask';
import { useState } from 'react';

export default function NotFound() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="bg-black min-h-screen flex flex-col">
      {/* Keep the Header so they can navigate away */}
      <Header onMobileMenuToggle={setIsMobileMenuOpen} />

      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-32 relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#39FF14]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* The Animation */}
        <div className="mb-8 scale-125">
          <BubblingFlask />
        </div>

        {/* The Text */}
        <div className="relative z-10 max-w-2xl flex flex-col gap-8 items-center">
          
          {/* Changed gap-2 to gap-4 for more space */}
          <div className="flex flex-col items-center gap-4">
            
            {/* The Big Error Code */}
            {/* Changed text-white/10 to text-white/20 for better visibility */}
            <span className="font-space font-bold text-8xl md:text-9xl text-white/20 tracking-widest select-none">
              404
            </span>
            
            {/* The Creative Context */}
            {/* Removed the negative margin (-mt) so it sits below the 404 properly */}
            <h1 className="text-2xl md:text-4xl font-space font-bold text-white tracking-tight">
              Formula <span className="text-[#39FF14]">Incomplete</span>
            </h1>
          </div>
          
          <p className="text-white/60 font-thin text-lg md:text-xl tracking-wide leading-relaxed max-w-lg">
            Either this page doesn't exist, or the case study you're looking for is still bubbling in the lab.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mt-2 w-full md:w-auto">
            <Link 
              href="/" 
              className="px-8 py-3 rounded-full border border-white/20 text-white font-space text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all text-center"
            >
              Return Home
            </Link>
            <Link 
              href="/works" 
              className="px-8 py-3 rounded-full bg-[#39FF14] text-black font-space text-xs uppercase tracking-widest font-bold hover:bg-[#39FF14]/80 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] text-center"
            >
              View Finished Works
            </Link>
          </div>
        </div>

      </section>

    </main>
  );
}