'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MarqueeText } from '@/components/ui/MarqueeText';
import AudioVisualizer from '@/components/spotify/AudioVisualizer';
import CircularWaveProgress from '@/components/ui/CircularWaveProgress';
import { useFrequencyData } from '@/hooks/useFrequencyData';
import { Squircle } from '@squircle-js/react';
import { useSquircleRadius } from '@/hooks/useSquircleRadius';

interface SpotifyTrackData {
  track: {
    id: string;
    name: string;
    artist: string;
    albumArt: string;
    duration: number;
  };
  isPlaying: boolean;
  isLastPlayed?: boolean;
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
  // 👇 New Props for Cursor Control
  onHoverColor?: (fill: string, stroke?: string) => void;
  onLeaveColor?: () => void;
}

export default function SpotifyWidget({
  className = '',
  pollInterval = 10000,
  size = 'medium',
  width,
  height,
  onHoverColor,
  onLeaveColor
}: SpotifyWidgetProps) {
  const [track, setTrack] = useState<SpotifyTrackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [progressMs, setProgressMs] = useState(0);

  // Hook for frequency data - only active if actually playing
  const { frequencyData } = useFrequencyData(track?.isPlaying ? track?.track?.id : null);

  // 👇 Smart Radius Hook
  const squircleRadius = useSquircleRadius();
  const isMobile = squircleRadius <= 40;

  // Loader animation loop
  useEffect(() => {
    if (isLoading && !fadeOut) {
      const interval = setInterval(() => {
        setLoaderProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isLoading, fadeOut]);

  // Progress Bar ticker (Only runs if playing)
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
      
      // Update progress
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

  useEffect(() => {
    // console.log(`🎵 Widget Polling set to: ${pollInterval}ms`);
  }, [pollInterval]);

  // 👇 Handle Hover Logic
  const handleMouseEnter = () => {
    if (track?.colors?.barColor) {
      // Use the extracted vibrant color from the album art
      onHoverColor?.(track.colors.barColor, '#ffffff');
    } else {
      // Fallback to Spotify Green
      onHoverColor?.('#1DB954', '#ffffff');
    }
  };

  return (
    // Wrapper div to capture hover events cleanly outside the Squircle
    <div 
        className={`w-full h-full ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => onLeaveColor?.()}
        style={width || height ? {
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : undefined,
        } : undefined}
    >
        <Squircle
        cornerRadius={squircleRadius}
        cornerSmoothing={0.7}
        className="relative w-full h-full overflow-hidden shadow-xl shadow-black/50 border-white/0"
        >
        {/* Background: Album Art */}
        {track && (
            <div 
            className="absolute inset-0 transition-all duration-700 ease-in-out"
            style={{
                backgroundImage: `url(${track.track.albumArt})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                // GREYSCALE LOGIC: Only greyscale if it is Last Played history. If just paused, keep color.
                filter: track.isLastPlayed ? 'grayscale(100%) brightness(0.8)' : 'none',
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
                size={isMobile ? 50 : 70}
                trackWidth={isMobile ? 5 : 6}
                waveWidth={isMobile ? 5 : 6}
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
        >
            
            {/* Top: Status Text */}
            <div className="mb-5 md:mb-auto -mt-1 md:-mt-1">
            <span className="text-xs md:text-sm opacity-55 font-extralight md:font-regular text-zinc-50 tracking-wider">
                {/* TEXT LABEL LOGIC */}
                {track?.isPlaying 
                ? "I'm Currently listening to . . ." 
                : track?.isLastPlayed 
                    ? "Last played . . ." 
                    : "Paused . . ." 
                }
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
                // Optional: Pause marquee if song is not playing
                play={true} 
                />
                <MarqueeText
                text={track?.track.artist || 'Loading...'}
                className="text-sm text-zinc-50 leading-tight"
                speed={20}
                gap={20}
                play={true}
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

                {/* Subtle playback indicator - Only show if playing */}
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

            {/* Bottom: Audio Visualizers */}
            {track && (
            <div 
                className={`mt-auto flex flex-row justify-start items-center gap-1 transition-all duration-500
                ${track.isLastPlayed ? 'opacity-50 grayscale' : 'opacity-100'} 
                `}
            >
                {/* Visualizer 1 */}
                <AudioVisualizer
                barCount={3}
                pulsePattern="wave"
                barColor={track.colors.barColor}
                barWidth={6}
                barSpacing={4}
                maxHeight={100}
                containerHeight={50}
                staggerAmount={0.2} 
                decayFactor={0.3} 
                animationSpeed={1.2}
                restHeight={2}
                frequencyData={frequencyData || undefined}
                currentProgressMs={progressMs}
                />      

                {/* Visualizer 2 (Atmosphere) */}
                <AudioVisualizer
                barCount={3}
                pulsePattern="mirror"
                barColor={track.colors.barColor}
                barWidth={6}
                barSpacing={4}
                maxHeight={75}
                containerHeight={50}
                staggerAmount={0.6}
                decayFactor={0.7} 
                animationSpeed={0.3}
                restHeight={2}
                frequencyData={frequencyData || undefined}
                currentProgressMs={progressMs}
                />
            </div>
            )}
        </div>
        </Squircle>
    </div>
  );
}