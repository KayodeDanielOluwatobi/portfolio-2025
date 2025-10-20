import { useEffect, useState } from 'react';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
  duration: number;
}

interface SpotifyData {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  progressMs: number;
  error: string | null;
  loading: boolean;
}

export function useSpotifyCurrentlyPlaying() {
  const [data, setData] = useState<SpotifyData>({
    track: null,
    isPlaying: false,
    progressMs: 0,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        const response = await fetch('/api/spotify/currently-playing');
        if (!response.ok) throw new Error('Failed to fetch Spotify data');
        
        const result = await response.json();
        setData({
          track: result.track,
          isPlaying: result.isPlaying,
          progressMs: result.progressMs,
          error: null,
          loading: false,
        });
      } catch (err) {
        setData(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Unknown error',
          loading: false,
        }));
      }
    };

    // Fetch immediately
    fetchSpotifyData();

    // Then refresh every 5 seconds
    const interval = setInterval(fetchSpotifyData, 5000);
    return () => clearInterval(interval);
  }, []);

  return data;
}