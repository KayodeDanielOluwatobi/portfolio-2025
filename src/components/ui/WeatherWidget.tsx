import { useState, useEffect } from 'react';
// import {Skeleton} from "@heroui/skeleton"; // <-- Removed HeroUI
import Skeleton from '@mui/material/Skeleton'; // <-- Added MUI Skeleton
import { getWeatherIcon, isDayTime } from '@/utils/weatherIconMap';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  weatherId: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  timezone: number;
  high: number;
  low: number;
}

interface WeatherWidgetProps {
  city: string;
  country: string;
  countryCode: string; // e.g., "NG", "KR"
  showCelsius?: boolean;
  className?: string;
}

// Get timezone abbreviation
const getTimezoneAbbr = (city: string): string => {
  const timezones: { [key: string]: string } = {
    'Lagos': 'WAT',
    'Seoul': 'KST',
    'Abuja': 'WAT',
    'Tokyo': 'JST',
    'London': 'GMT',
    'New York': 'EST',
  };
  return timezones[city] || 'UTC';
};

export default function WeatherWidget({ 
  city, 
  country, 
  countryCode,
  showCelsius = true,
  className = ''
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`/api/weather?city=${city}&country=${countryCode}`);
        if (!response.ok) throw new Error('Failed to fetch weather');
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        // We'll keep this false, but you can use the setTimeout trick for testing
        //setLoading(false);
        setTimeout(() => {
          setLoading(false);
        }, 200000); // 2000ms = 2 seconds
      }
    };

    fetchWeather();
    // Refresh weather every 10 minutes
    const weatherInterval = setInterval(fetchWeather, 600000);

    return () => clearInterval(weatherInterval);
  }, [city, countryCode]);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      if (!weather) return;

      // Calculate time with timezone offset
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const localTime = new Date(utc + (weather.timezone * 1000));

      // Format as 24hr time
      const hours = String(localTime.getHours()).padStart(2, '0');
      const minutes = String(localTime.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => clearInterval(timeInterval);
  }, [weather]);

// Skeleton loader
  if (loading) {
    // This `sxBase` object is now configured for DARK MODE.
    const sxBase = {
      // 1. The base color is now a very dark, transparent gray
      bgcolor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '8px',

      // 2. We override the shimmer wave (the ::after pseudo-element)
      '&::after': {
        // 3. We change the default dark gradient to a LIGHT one
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      }
    };

    return (
      <div className={`bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 shadow-xl shadow-black/50 border border-white/5 ${className}`}>
        
        {/* Time + Timezone skeleton */}
        {/* No changes needed to the components themselves */}
        <div className="flex items-baseline gap-6 mb-6">
          <Skeleton 
            variant="rectangular" 
            animation="wave" 
            sx={{ ...sxBase, width: 128, height: 48 }} 
          />
          <Skeleton 
            variant="rectangular" 
            animation="wave" 
            sx={{ ...sxBase, width: 80, height: 48 }} 
          />
        </div>

        {/* Temperature + Icon/Condition skeleton */}
        <div className="flex justify-between items-start mb-4">
          <Skeleton 
            variant="rectangular" 
            animation="wave" 
            sx={{ ...sxBase, width: 96, height: 64 }} 
          />
          <div className="flex items-center gap-3">
            <Skeleton 
              variant="circular" 
              animation="wave" 
              sx={{ ...sxBase, width: 40, height: 40 }} 
            />
            <Skeleton 
              variant="rectangular" 
              animation="wave" 
              sx={{ ...sxBase, width: 96, height: 24 }} 
            />
          </div>
        </div>

        {/* H/L + Location skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton 
            variant="rectangular" 
            animation="wave" 
            sx={{ ...sxBase, width: 80, height: 20 }} 
          />
          <Skeleton 
            variant="rectangular" 
            animation="wave" 
            sx={{ ...sxBase, width: 128, height: 20 }} 
          />
        </div>

      </div>
    );
  }

  if (!weather) {
    return (
      <div className={`bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 shadow-xl shadow-black/50 border border-white/5 ${className}`}>
        <div className="text-white/50 text-center">Error loading weather</div>
      </div>
    );
  }

  const isDay = isDayTime(weather.icon);
  const weatherIcon = getWeatherIcon(weather.weatherId, isDay, { size: 40, color: '#ffffff' });

  return (
    <div className={`bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 shadow-xl shadow-black/50 border border-white/5 ${className}`}>
      {/* Time and timezone - Spans full width */}
      <div className="flex items-baseline gap-6 mb-6 border-b border-white/10 pb-4">
        <span className="font-dotted text-5xl text-white tracking-[0.3em]">
          {currentTime}
        </span>
        <span className="font-dotted text-5xl text-white/70 tracking-[0.3em]">
          {getTimezoneAbbr(city)}
        </span>
      </div>

      {/* Middle row: Temperature (left) + Icon/Condition (right) */}
      <div className="flex justify-between items-start mb-4">
        {/* Temperature - Bold, large */}
        <div className="font-sans text-5xl font-bold text-white">
          {weather.temperature}°{showCelsius ? 'C' : ''}
        </div>

        {/* Icon + Weather condition */}
        <div className="flex items-center gap-3">
          <div className="text-white">
            {weatherIcon}
          </div>
          <span className="font-mono text-sm text-white uppercase">
            {weather.description}
          </span>
        </div>
      </div>

      {/* Bottom row: H/L (left) + Location (right) */}
      <div className="flex justify-between items-center">
        {/* High/Low temps */}
        <div className="font-mono text-sm text-white/70 uppercase">
          H:{weather.high}  L:{weather.low}
        </div>

        {/* City, Country */}
        <div className="font-mono text-xs text-white/60 uppercase">
          {city}, {country}
        </div>
      </div>
    </div>
  );
}