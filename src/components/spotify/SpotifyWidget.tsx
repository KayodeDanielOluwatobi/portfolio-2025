// src/components/spotify/SpotifyWidget.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MarqueeText } from '@/components/ui/MarqueeText';
import AudioVisualizer from '@/components/spotify/AudioVisualizer';
import CircularWaveProgress from '@/components/ui/CircularWaveProgress';
import { useFrequencyData } from '@/hooks/useFrequencyData';
import { Squircle } from '@squircle-js/react';

interface SpotifyTrackData {
  track: {
    id: string;
    name: string;
    artist: string;
    albumArt: string;
    duration: number;
  };
  isPlaying: boolean;
  progressMs: number;
  colors: {
    barColor: string;
    glowColor: string;
    mood: 'dark' | 'light' | 'vibrant' | 'muted';
  };
  timestamp: number;
}

interface SpotifyWidgetProps {
  className?: string;
  pollInterval?: number;
  size?: 'small' | 'medium' | 'large';
  width?: number;
  height?: number;
}

export default function SpotifyWidget({
  className = '',
  pollInterval = 10000,
  size = 'medium',
  width,
  height,
}: SpotifyWidgetProps) {
  const [track, setTrack] = useState<SpotifyTrackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [progressMs, setProgressMs] = useState(0);

  const { frequencyData } = useFrequencyData(track?.track?.id || null);

  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768); // 768px is md breakpoint
  };

  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

  useEffect(() => {
    if (isLoading && !fadeOut) {
      const interval = setInterval(() => {
        setLoaderProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isLoading, fadeOut]);

  useEffect(() => {
    if (!track?.isPlaying) return;

    const interval = setInterval(() => {
      setProgressMs(prev => prev + 50);
    }, 50);

    return () => clearInterval(interval);
  }, [track?.isPlaying]);

  const fetchTrackData = async () => {
    try {
      const response = await fetch('/api/spotify/currently-playing');

      if (!response.ok) {
        throw new Error('Failed to fetch track data');
      }

      const data: SpotifyTrackData = await response.json();
      setTrack(data);
      setProgressMs(data.progressMs);

      setFadeOut(true);

      setTimeout(() => {
        setIsLoading(false);
      }, 500);

    } catch (error) {
      console.error('Spotify widget error:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackData();
    const interval = setInterval(fetchTrackData, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  return (
    <Squircle
      cornerRadius={isMobile ? 30 : 50} //16 for mobile, 30 for desktop
      cornerSmoothing={0.7}
      className={`relative w-full h-full overflow-hidden shadow-xl shadow-black/50 border-white/0  ${className}`}
      style={width || height ? {
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : undefined,
      } : undefined}
    >
      {/* Background: Album Art */}
      {track && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${track.track.albumArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Gradient Overlay for text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />

      {/* Loader - Fades out when data arrives */}
      {isLoading && (
        <div
          className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-500 ${
            fadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <CircularWaveProgress
            progress={loaderProgress}
            size={isMobile ? 50 : 70}              // Smaller on mobile
            trackWidth={isMobile ? 5 : 6}          // Scale proportionally
            waveWidth={isMobile ? 5 : 6}           // Scale proportionally
            trackColor="#475569"
            waveColor="#cbd5e1"
            waveAmplitude={isMobile ? 2 : 3}
            maxWaveFrequency={6}
            undulationSpeed={2}
            rotationSpeed={7}
            edgeGap={20}
            relaxationDuration={0}
            className="opacity-30"
          />
        </div>
      )}

      {/* Widget Content - Fades in when data arrives */}
      <div
        className={`relative z-5 transition-opacity duration-500 p-6 md:p-8 flex flex-col h-full ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ minHeight: height ? `${height}px` : undefined }}
      >
        
        {/* Top: "Currently listening to" text */}
        <div className="mb-5 md:mb-auto -mt-1 md:-mt-1">
          <span className="text-xs md:text-sm opacity-55 font-light md:font-regular  text-zinc-50 tracking-wider">
            I'm Currently listening to...
          </span>
        </div>

        {/* Middle: Title/Artist (Left) + Spotify Logo (Right) */}
        <div className="opacity-90 flex items-center gap-7 mb-6">
          {/* Left: Title & Artist with Marquee */}
          <div className="flex-1 min-w-0">
            <MarqueeText
              text={track?.track.name || 'Loading...'}
              className="text-base font-bold text-white mb-1 leading-tight"
              speed={20}
              gap={20}
            />
            <MarqueeText
              text={track?.track.artist || 'Loading...'}
              className="text-sm text-zinc-50 leading-tight"
              speed={20}
              gap={20}
            />
          </div>

          {/* Right: Spotify Logo */}
          <div className="flex-shrink-0 -mt-1 relative scale-110 origin-top-right">
            <Image
              src="/logos/spotify.svg"
              alt="Spotify"
              width={32}
              height={32}
              className="text-green-500"
            />

            {/* Subtle playback indicator - positioned at top-right of Spotify logo */}
            {track?.isPlaying && (
              <motion.div
                className="absolute w-2 h-2 rounded-full z-20"
                style={{ 
                  backgroundColor: track.colors.barColor,
                  top: '0.7px',
                  right: '0.7px',
                }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
        </div>

        {/* Bottom: Audio Visualizers (Side-by-side, one mirrored) */}
        {track && (
          <div className="mt-auto flex flex-row justify-start items-center gap-1 ">
            
            {/* This is the FIRST visualizer (normal) */}
            <AudioVisualizer
              barCount={3}
              pulsePattern="mirror"
              barColor={track.colors.barColor}
              barWidth={6}
              barSpacing={4}
              maxHeight={100}
              containerHeight={50}
              staggerAmount={0.2}  // More stagger
              decayFactor={0.3}    // More lag
              //containerWidth="40px"
              animationSpeed={1.2}
              restHeight={2}
              frequencyData={frequencyData || undefined}
              currentProgressMs={progressMs}
            />      

            <AudioVisualizer
              //className="scale-x-[-1] " 
              barCount={3}
              pulsePattern="mirror"
              barColor={track.colors.barColor}
              barWidth={6}
              barSpacing={4}
              maxHeight={75}
              containerHeight={50}
              staggerAmount={0.6}  // More stagger
              decayFactor={0.7}    // More lag
              //containerWidth="40px"
              animationSpeed={0.3}
              restHeight={2}
              frequencyData={frequencyData || undefined}
              currentProgressMs={progressMs}
            />

          </div>
        )}
      </div>
    </Squircle>
  );
}