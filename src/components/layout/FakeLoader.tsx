'use client';

import { useState, useEffect } from 'react';
import CircularWaveProgress from '@/components/ui/CircularWaveProgress';

const FakeLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Initializing...');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const tasks = [
      { label: 'Loading Design Stack', target: 20 },
      { label: 'Compiling Pixels', target: 40 },
      { label: 'Brewing Coffee ☕', target: 60 },
      { label: 'Animating Keycaps', target: 75 },
      { label: 'Polishing Details', target: 90 },
    ];

    const runLoader = async () => {
      // Run through tasks
      for (const task of tasks) {
        if (!isMounted) return;
        setCurrentTask(task.label);

        // Increment progress smoothly
        while (progress < task.target && isMounted) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setProgress(prev => {
            const next = prev + Math.random() * 5;
            return Math.min(next, task.target);
          });
        }
      }

      if (!isMounted) return;

      // Final push to 100
      setCurrentTask('Ready!');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!isMounted) return;
      setProgress(100);

      // Wait then fade out
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (!isMounted) return;
      setFadeOut(true);

      // Wait for fade
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!isMounted) return;
      onComplete();
    };

    runLoader();

    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 pointer-events-none ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Circular Wave Progress */}
        <div className="w-[120px] h-[120px]">
          <CircularWaveProgress
            progress={Math.round(progress)}
            size={120}
            trackWidth={6}
            waveWidth={7}
            trackColor="#2d3748"
            waveColor="#7c3aed"
            waveAmplitude={1}
            maxWaveFrequency={4}
            undulationSpeed={1}
            rotationSpeed={3}
            edgeGap={20}
          />
        </div>

        {/* Task Label */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/70 font-space text-sm tracking-wider uppercase">
            {currentTask}
          </p>
          <p className="text-white/40 font-space text-xs tracking-wider">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-3 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white/50 rounded-full"
              style={{
                animation: `pulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default FakeLoader;