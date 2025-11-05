// src/components/widgets/WeatherWidget.tsx

'use client';

import { useState, useEffect } from 'react';
import { Squircle } from '@squircle-js/react';
import { getWeatherIcon, isDayTime } from '@/utils/weatherIconMap';
import CircularWaveProgress from '@/components/ui/CircularWaveProgress';
import {MarqueeText} from '@/components/ui/MarqueeText';

// ... (Interfaces and helper functions are identical) ...
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
  countryCode: string;
  showCelsius?: boolean;
  size?: 'small' | 'medium' | 'large' | number;
  width?: number;
  height?: number;
  cornerRadius?: number;
  cornerSmoothing?: number;
  className?: string;
}

const getHourColor = (hour: number): string => {
  const hue = (hour * 59) % 360;
  return `hsl(${hue}, 100%, 50%)`;
};

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

const getSizeWidth = (size: 'small' | 'medium' | 'large' | number): number => {
  if (typeof size === 'number') return size;
  
  const sizes = {
    small: 280,
    medium: 380,
    large: 480,
  };
  return sizes[size];
};


export default function WeatherWidget({ 
  city, 
  country, 
  countryCode,
  showCelsius = true,
  size = 'medium',
  width,
  height,
  cornerRadius = 30,
  cornerSmoothing = 0.7,
  className = ''
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentTime, setCurrentTime] = useState<{ hour: string; minute: string }>({ hour: '00', minute: '00' });
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);

  const finalWidth = width || getSizeWidth(size);
  const finalHeight = height || finalWidth;

  // ... (All your useEffect hooks are identical) ...
  useEffect(() => {
    if (loading && !fadeOut) {
      const interval = setInterval(() => {
        setLoaderProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [loading, fadeOut]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`/api/weather?city=${city}&country=${countryCode}`);
        if (!response.ok) throw new Error('Failed to fetch weather');
        const data = await response.json();
        setWeather(data);
        
        setFadeOut(true);
        setTimeout(() => {
          setLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Weather fetch error:', error);
        setLoading(false);
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 600000);

    return () => clearInterval(weatherInterval);
  }, [city, countryCode]);

  useEffect(() => {
    const updateTime = () => {
      if (!weather) return;

      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const localTime = new Date(utc + (weather.timezone * 1000));

      const hours = String(localTime.getHours()).padStart(2, '0');
      const minutes = String(localTime.getMinutes()).padStart(2, '0');
      
      setCurrentTime({ hour: hours, minute: minutes });
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => clearInterval(timeInterval);
  }, [weather]);


  const hourColor = currentTime.hour ? getHourColor(parseInt(currentTime.hour)) : 'hsl(0, 75%, 60%)';

  const isDay = weather ? isDayTime(weather.icon) : true;
  const weatherIcon = weather ? getWeatherIcon(weather.weatherId, isDay, { size: 29, color: '#ffffff' }) : null;

  return (
    <Squircle
      cornerRadius={cornerRadius}
      cornerSmoothing={cornerSmoothing}
      // ... (Squircle props are identical) ...
      className={`relative overflow-hidden shadow-xl shadow-black/50 border-white/0 -mb-0 ${className}`}
      style={{
        width: `${finalWidth}px`,
        height: `${finalHeight}px`,
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0f 100%)',
      }}
    >
      
      {/* ... (Loading animation is identical) ... */}
      {loading && (
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            fadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <CircularWaveProgress 
            progress={loaderProgress}
            size={45}
            trackWidth={4}
            waveWidth={4}
            trackColor="#6b7280"
            waveColor="#e5e7eb"
            waveAmplitude={2}
            maxWaveFrequency={6}
            undulationSpeed={2}
            rotationSpeed={7}
            edgeGap={20}
            relaxationDuration={0}
            className='opacity-30'
          />
        </div>
      )}

      <div 
        className={`h-full px-6 py-3 transition-opacity duration-500 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="grid grid-cols-2 gap-3 h-full">
          
          {/* LEFT COLUMN: Time & Timezone */}
          <div className="flex flex-col justify-center items-start">
            
            {/* --- THIS IS THE FIX ---
              This wrapper div ensures the *entire* time block
              (including the negative margin) is centered vertically.
            */}
            <div style={{
              transform: `translateY(${finalWidth * 0.01}px)`
              }}
            >

              {/* Hour div (Your code is preserved) */}
              <div 
                className="font-array-regular tabular-nums tracking-tighter leading-none whitespace-nowrap relative"
                style={{ 
                  color: hourColor,
                  fontSize: `${finalWidth * 0.26}px`,
                  //transform: `translateY(${finalWidth * -0.01}px)`
                }}
              >
                <div className="flex">
                  <span style={{ 
                    width: `${finalWidth * 0.14}px`, 
                    textAlign: 'center' 
                  }}>
                    {currentTime.hour[0]}
                  </span>
                  <span style={{ 
                    width: `${finalWidth * 0.14}px`, 
                    textAlign: 'center'
                  }}>
                    {currentTime.hour[1]}
                  </span>
                </div>

                {/* Your original (invisible) timezone code, preserved perfectly */}
                {finalWidth <= 300 && (
                  <div 
                    className="absolute font-space tracking-wide"
                    style={{ 
                      color: hourColor,
                      fontSize: `${finalWidth * 0.05}px`,
                      top: `${finalWidth * 0.05}px`,
                      right: `${finalWidth * -0.107}px`
                    }}
                  >
                    {getTimezoneAbbr(city)}
                  </div>
                )}
              </div>

              {/* Minute div (Your code is preserved) */}
              <div 
                className="font-array-regular -tracking-[0.001em] tabular-nums leading-none text-white/100 whitespace-nowrap"
                style={{ 
                  fontSize: `${finalWidth * 0.26}px`,
                  //marginTop: `${finalWidth * -0.045}px`,
                  transform: `translateY(${finalWidth * -0.04}px)`
                }}
              >
                <div className="text-white/90 flex">
                  <span style={{ 
                    width: `${finalWidth * 0.14}px`, 
                    textAlign: 'center'
                  }}>
                    {currentTime.minute[0]}
                  </span>
                  <span style={{ 
                    width: `${finalWidth * 0.15}px`, 
                    textAlign: 'center'
                  }}>
                    {currentTime.minute[1]}
                  </span>
                </div>
              </div>

            </div> {/* --- END OF THE WRAPPER DIV --- */}
          </div>

          <div className="flex flex-col overflow-hidden justify-center items-end" style={{ gap: `${finalWidth * 0.02}px` }}>
            
            {/* Group 1: Icon + Description */}
            <div className="flex items-center gap-0.5 flex-shrink-0 w-full justify-end" style={{ fontSize: `${finalWidth * 0.032}px` }}>
              <div className="text-white opacity-70 flex-shrink-0">
                {weatherIcon}
              </div>
              <div className="max-w-[calc(100%-28px)] overflow-hidden">
                <MarqueeText 
                  text={weather?.description || 'Loading...'}
                  className="font-space text-white/70 uppercase tracking-wider"
                  style={{ fontSize: `${finalWidth * 0.032}px` }}
                  speed={10}
                  gap={18}
                />
              </div>
            </div>

            {/* Group 2: Temperature */}
            <div 
              className="font-sans font-bold text-white/80 leading-none whitespace-nowrap"
              style={{ fontSize: `${finalWidth * 0.16}px` }}
            >
              {weather?.temperature}°{showCelsius ? 'C' : ''}
            </div>

            {/* Group 3: H/L and City/Country */}
            <div className="flex flex-col items-end" style={{ width: '100%' }}>
              <div 
                className="font-space text-white/70 uppercase tracking-wider whitespace-nowrap"
                style={{ fontSize: `${finalWidth * 0.038}px` }}
              >
                H:{weather?.high}° L:{weather?.low}°
              </div>
              <div 
                className="font-space text-white/50 uppercase tracking-wider overflow-hidden"
                style={{ 
                  fontSize: `${finalWidth * 0.032}px`,
                  maxWidth: '100%',
                  minWidth: 0,
                }}
              >
                <MarqueeText 
                  text={`${city}, ${country}`}
                  speed={10}
                  gap={18}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Squircle>
  );
}