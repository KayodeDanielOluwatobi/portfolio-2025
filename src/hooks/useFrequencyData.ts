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

export function useFrequencyData(trackId: string | null) {
  const [frequencyData, setFrequencyData] = useState<FrequencyFrame[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackId) {
      setFrequencyData(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Find track in the index
    const track = trackIndex.find((t: TrackIndexEntry) => t.id === trackId);

    if (!track) {
      setError('Track not found in library');
      setLoading(false);
      return;
    }

    // Load the frequency data file
    fetch(`/frequency-data/${track.dataFile}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load frequency data');
        return res.json();
      })
      .then(data => {
        // Handle both array and object with frames property
        const frames = Array.isArray(data) ? data : data.frames;
        setFrequencyData(frames);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading frequency data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [trackId]);

  return { frequencyData, loading, error };
}