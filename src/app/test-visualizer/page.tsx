'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from '@/components/layout/Preloader';

export default function PreloaderTestPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // Used to force re-mount

  const handleReplay = () => {
    setIsLoading(true);
    setKey(prev => prev + 1); // Force a complete remount of the component
  };

  return (
    <div className="min-h-screen w-full bg-zinc-200 text-black flex flex-col items-center justify-center font-mono relative">
      
      {/* 1. THE PRELOADER */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <Preloader 
            key={key} // Key change forces React to treat it as a new instance
            onComplete={() => setIsLoading(false)} 
          />
        )}
      </AnimatePresence>

      {/* 2. DUMMY CONTENT (What hides behind the curtain) */}
      <div className="text-center space-y-6 p-10 z-0">
        <h1 className="text-6xl font-bold tracking-tighter">
          SYSTEM UNLOCKED
        </h1>
        <p className="text-xl text-zinc-600">
          The preloader has successfully slid up.
        </p>
        
        <button 
          onClick={handleReplay}
          className="px-6 py-3 bg-black text-white hover:bg-zinc-800 transition-colors uppercase tracking-widest text-sm"
        >
          Replay Boot Sequence
        </button>
      </div>

      {/* Grid Background to visualize transparency/sliding better */}
      <div className="absolute inset-0 z-[-1] opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
      />
    </div>
  );
}