import AudioVisualizer from '@/components/spotify/AudioVisualizer';
import { useFrequencyData } from '@/hooks/useFrequencyData';

function SpotifyWidget() {
  // Let's say you get these from Spotify API
  const currentTrackId = "0QICKhP44TRnb4EurQ3tN9"; // BILLIONAIRE track ID
  const currentProgressMs = 2500; // 2.5 seconds into the song

  // Use the hook to get frequency data for this track
  const { frequencyData, loading, error } = useFrequencyData(currentTrackId);

  // Show loading state
  if (loading) return <div>Loading visualizer...</div>;

  // If error, visualizer will use fallback animation
  return (
    <AudioVisualizer
      barCount={12}
      frequencyData={frequencyData} // This is the array of frames
      currentProgressMs={currentProgressMs}
      barColor="#1DB954"
      pulsePattern="wave"
    />
  );
}