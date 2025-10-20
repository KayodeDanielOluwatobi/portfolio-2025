// app/page.tsx
'use client';

import { CircularWavyProgress } from '@/components/ui/WavyProgressBar'; 

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-16 bg-gray-900 p-24">
      
      {/* Test 1: Default Props */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-400 font-mono">Default</p>
        <CircularWavyProgress />
      </div>

      {/* Test 2: Thicker, Slower, Fewer Waves */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-400 font-mono">Thick & Slow</p>
        <CircularWavyProgress
          size={100}
          trackColor="#444"
          trackWidth={10}
          progressColor="cyan"
          progressWidth={10}
          waveLength={4}
          waveAmplitude={6}
          speed={2}
        />
      </div>

      {/* Test 3: Thin, Fast, High Frequency */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-400 font-mono">Thin & Fast</p>
        <CircularWavyProgress
          size={80}
          trackColor="#330000"
          trackWidth={2}
          progressColor="#FF5555"
          progressWidth={3}
          waveLength={20}
          waveAmplitude={2}
          speed={10}
        />
      </div>

    </main>
  );
}