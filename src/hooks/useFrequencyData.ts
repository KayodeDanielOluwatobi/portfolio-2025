// src/hooks/useFrequencyData.ts

import { useEffect, useState } from 'react';
import trackIndex from '@/data/trackIndex.json';

interface FrequencyFrame {
  frame: number;
  bass: number;
  mid: number;
  treble: number;
}

interface TrackIndexEntry {
  title: string;
  id: string | null;
  dataFile: string;
}

// Helper function to get a random track from the index
function getRandomTrack(): TrackIndexEntry | null {
  if (trackIndex.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * trackIndex.length);
  return trackIndex[randomIndex];
}

// Helper function to load frequency data from a dataFile
async function loadFrequencyDataFromFile(dataFile: string): Promise<FrequencyFrame[]> {
  const response = await fetch(`/frequency-data/${dataFile}`);
  if (!response.ok) throw new Error('Failed to load frequency data');
  const data = await response.json();
  // Handle both array and object with frames property
  const frames = Array.isArray(data) ? data : data.frames;
  return frames;
}

export function useFrequencyData(trackId: string | null) {
  const [frequencyData, setFrequencyData] = useState<FrequencyFrame[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!trackId) {
      setFrequencyData(null);
      setIsFallback(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // Find track in the index
    const track = trackIndex.find((t: TrackIndexEntry) => t.id === trackId);

    if (!track) {
      // Track not found in library, use random fallback
      console.warn(`Track ID ${trackId} not found in library, using random fallback`);
      
      const randomTrack = getRandomTrack();
      if (!randomTrack) {
        setError('No frequency data available');
        setLoading(false);
        return;
      }

      // Load random track's frequency data
      loadFrequencyDataFromFile(randomTrack.dataFile)
        .then(frames => {
          setFrequencyData(frames);
          setIsFallback(true);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading fallback frequency data:', err);
          setError(err.message);
          setLoading(false);
        });
      return;
    }

    // Track found, try to load its frequency data
    loadFrequencyDataFromFile(track.dataFile)
      .then(frames => {
        setFrequencyData(frames);
        setIsFallback(false);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading frequency data for track, using random fallback:', err);
        
        // Fallback to random track if this one fails
        const randomTrack = getRandomTrack();
        if (!randomTrack) {
          setError('Failed to load frequency data');
          setLoading(false);
          return;
        }

        loadFrequencyDataFromFile(randomTrack.dataFile)
          .then(frames => {
            setFrequencyData(frames);
            setIsFallback(true);
            setLoading(false);
          })
          .catch(fallbackErr => {
            console.error('Error loading fallback frequency data:', fallbackErr);
            setError(fallbackErr.message);
            setLoading(false);
          });
      });
  }, [trackId]);

  return { frequencyData, loading, error, isFallback };
}