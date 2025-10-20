// src/app/test-visualizer/page.tsx

'use client';

import { useState, useEffect } from 'react';
import AudioVisualizer from '@/components/spotify/AudioVisualizer';
import { useFrequencyData } from '@/hooks/useFrequencyData';

const FRAME_TIMING_MS = 10.607; // Each frame is 11.6ms

export default function TestVisualizer() {
  const trackId = '2DbDefRFJ5YOfXCKOeCJJh'; // Igloo
  const [progressMs, setProgressMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [maxDuration, setMaxDuration] = useState(0);

  const { frequencyData, loading, error } = useFrequencyData(trackId);

  // Calculate max duration based on number of frames
  useEffect(() => {
    if (frequencyData && frequencyData.length > 0) {
      const duration = frequencyData.length * FRAME_TIMING_MS;
      setMaxDuration(duration);
    }
  }, [frequencyData]);

  // Auto-play animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgressMs(prev => {
        const next = prev + 50; // Increment by 50ms every 50ms = real-time playback
        
        // Loop back to start when song ends
        if (next >= maxDuration) {
          return 0;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, maxDuration]);

  // Format milliseconds to MM:SS
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '2rem', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>Igloo - Visualizer Test</h1>

      {/* Status Info */}
      <div style={{ marginBottom: '2rem', opacity: 0.7 }}>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>Total Frames: {frequencyData?.length || 0}</p>
        <p>Total Duration: {formatTime(maxDuration)}</p>
      </div>

      {/* Visualizer */}
      <div
        style={{
          margin: '2rem 0',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <AudioVisualizer
          barCount={6}
          frequencyData={frequencyData || undefined}
          currentProgressMs={progressMs}
          barColor="#1DB954"
          barWidth={6}
          barSpacing={8}
          containerHeight={120}
        />
      </div>

      {/* Controls */}
      <div style={{ marginTop: '2rem' }}>
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '10px 20px',
            marginRight: '1rem',
            background: '#1DB954',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Reset Button */}
        <button
          onClick={() => setProgressMs(0)}
          style={{
            padding: '10px 20px',
            background: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '1rem',
          }}
        >
          ↻ Reset
        </button>
      </div>

      {/* Timeline */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>{formatTime(progressMs)}</span>
          <span>{formatTime(maxDuration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={maxDuration}
          value={progressMs}
          onChange={(e) => {
            setProgressMs(parseInt(e.target.value));
            setIsPlaying(false); // Pause when user drags
          }}
          style={{
            width: '100%',
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
}