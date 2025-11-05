'use client';

import { useState, useEffect, useRef } from 'react';
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

interface WatchfaceWidgetProps {
  city: string;
  country: string;
  countryCode: string;
  showCelsius?: boolean;
  size?: number;
  className?: string;
}

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

export default function WatchfaceWidget({
  city,
  country,
  countryCode,
  showCelsius = true,
  size = 320,
  className = '',
}: WatchfaceWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState(0);
  const [containerSize, setContainerSize] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch weather from API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`/api/weather?city=${city}&country=${countryCode}`);
        if (!response.ok) throw new Error('Failed to fetch weather');
        const data = await response.json();
        setWeather(data);
        setLoading(false);
      } catch (error) {
        console.error('Weather fetch error:', error);
        setLoading(false);
      }
    };
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 600000);
    return () => clearInterval(weatherInterval);
  }, [city, countryCode]);

  // Update time in real-time with timezone adjustment
  useEffect(() => {
    const updateTime = () => {
      if (!weather) return;
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const localTime = new Date(utc + (weather.timezone * 1000));
      setTime({
        hours: localTime.getHours(),
        minutes: localTime.getMinutes(),
        seconds: localTime.getSeconds(),
      });
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 50);
    return () => clearInterval(timeInterval);
  }, [weather]);

  // Responsive size based on container width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerSize(Math.min(width - 32, 400));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  // Use responsive size if available, otherwise use prop size
  const displaySize = containerSize || size;

  // Calculate angles
  const secondsAngle = (time.seconds * 6) + ((time.seconds % 1) * 6);
  const minutesAngle = (time.minutes * 6) + (time.seconds * 0.1);
  const hoursAngle = ((time.hours % 12) * 30) + (time.minutes * 0.5);

  // Get date adjusted for the city's timezone
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const localDate = weather ? new Date(utc + (weather.timezone * 1000)) : now;
  const date = String(localDate.getDate()).padStart(2, '0');
  const dayName = localDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

  const radius = displaySize / 2;
  const centerX = radius;
  const centerY = radius;

  // Tick marks positions
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 6) * (Math.PI / 180);
    const x = centerX + Math.sin(angle) * (radius - 20);
    const y = centerY - Math.cos(angle) * (radius - 20);
    return { x, y, angle: i * 6 };
  });

  // Timezone circle position (at 180 degrees, halfway between center and circumference)
  const tzCircleRadius = radius * 0.5;
  const tzCircleSize = displaySize * 0.22;

  // Get dynamic weather icon
  const isDay = weather ? isDayTime(weather.icon) : true;
  const weatherIcon = weather ? getWeatherIcon(weather.weatherId, isDay, { size: displaySize * 0.09, color: '#ffffff' }) : null;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden ${className}`}
      style={{
        width: `100%`,
        height: `${displaySize}px`,
      }}
    >
      {/* SVG for clock face and hands */}
      <svg
        width={displaySize}
        height={displaySize}
        viewBox={`0 0 ${displaySize} ${displaySize}`}
        style={{ position: 'absolute', inset: 0, zIndex: 5 }}
      >
        {/* 60 Tick marks */}
        {ticks.map((tick, i) => {
          const isMainTick = i % 5 === 0;
          const angle = (i * 6) * (Math.PI / 180);
          const innerRadius = radius - (isMainTick ? 12 : 16);
          return (
            <line
              key={`tick-${i}`}
              x1={centerX + Math.sin(angle) * (radius - 20)}
              y1={centerY - Math.cos(angle) * (radius - 20)}
              x2={centerX + Math.sin(angle) * innerRadius}
              y2={centerY - Math.cos(angle) * innerRadius}
              stroke="#ffffff"
              strokeWidth={isMainTick ? 2 : 1}
              opacity={isMainTick ? 0.4 : 0.4}
            />
          );
        })}
        {/* Hour hand */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.sin((hoursAngle) * (Math.PI / 180)) * (radius * 0.40)}
          y2={centerY - Math.cos((hoursAngle) * (Math.PI / 180)) * (radius * 0.40)}
          stroke="#ffffff"
          strokeWidth={displaySize * 0.035}
          strokeLinecap="butt"
          opacity="0.9"
          filter="url(#blur)"
        />
        {/* Hour hand counterweight */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.sin((hoursAngle + 180) * (Math.PI / 180)) * (radius * 0.14)}
          y2={centerY - Math.cos((hoursAngle + 180) * (Math.PI / 180)) * (radius * 0.14)}
          stroke="#ffffff"
          strokeWidth={displaySize * 0.035}
          strokeLinecap="butt"
          opacity="0.9"
          filter="url(#blur)"
        />
        {/* Minute hand */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.sin((minutesAngle) * (Math.PI / 180)) * (radius * 0.70)}
          y2={centerY - Math.cos((minutesAngle) * (Math.PI / 180)) * (radius * 0.70)}
          stroke="#ffffff"
          strokeWidth={displaySize * 0.025}
          strokeLinecap="butt"
          opacity="0.85"
        />
        {/* Minute hand - short counterweight on other side */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.sin((minutesAngle + 180) * (Math.PI / 180)) * (radius * 0.12)}
          y2={centerY - Math.cos((minutesAngle + 180) * (Math.PI / 180)) * (radius * 0.12)}
          stroke="#ffffff"
          strokeWidth={displaySize * 0.025}
          strokeLinecap="butt"
          opacity="0.85"
        />
        {/* Seconds hand - long thin hand */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.sin((secondsAngle) * (Math.PI / 180)) * (radius * 0.80)}
          y2={centerY - Math.cos((secondsAngle) * (Math.PI / 180)) * (radius * 0.80)}
          stroke="#ff6b35"
          strokeWidth={displaySize * 0.008}
          strokeLinecap="round"
          opacity="1"
        />
        {/* Seconds hand - short counterweight on other side */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.sin((secondsAngle + 180) * (Math.PI / 180)) * (radius * 0.12)}
          y2={centerY - Math.cos((secondsAngle + 180) * (Math.PI / 180)) * (radius * 0.12)}
          stroke="#ff6b35"
          strokeWidth={displaySize * 0.008}
          strokeLinecap="round"
          opacity="1"
        />
        {/* Circle at seconds hand rotating point */}
        <circle cx={centerX} cy={centerY} r={displaySize * 0.015} fill="#ff6b35" opacity="1" />
      </svg>

      {/* Timezone Circle at 180 degrees (6 o'clock position) */}
      <div className='invisible'
        style={{
          position: 'absolute',
          top: `${radius + tzCircleRadius - tzCircleSize / 2}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${tzCircleSize}px`,
          height: `${tzCircleSize}px`,
          borderRadius: '50%',
          background: 'transparent',
          border: `1px solid rgba(255, 255, 255, 0.15)`,
          zIndex: 1,
        }}
      />

      {/* Timezone Text Inside Circle */}
      <div
        className="invisible font-space opacity-30 tracking-tighter"
        style={{
          position: 'absolute',
          top: `${radius + tzCircleRadius - tzCircleSize / 2}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${tzCircleSize}px`,
          height: `${tzCircleSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${displaySize * 0.06}px`,
          color: '#ffffff',
          zIndex: 1,
        }}
      >
        {getTimezoneAbbr(city)}
      </div>

      {/* Digital Time Display (Top Center - 12 o'clock axis) */}
      <div
        className="invisible font-space scale-90"
        style={{
          position: 'absolute',
          top: `${radius - tzCircleRadius - tzCircleSize / 2}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${tzCircleSize}px`,
          height: `${tzCircleSize}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: `${displaySize * 0.08}px`,
            color: '#ffffff',
            letterSpacing: '1px',
          }}
        >
          {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}
        </div>
        <div
          style={{
            fontSize: `${displaySize * 0.035}px`,
            color: '#ffffff',
            opacity: 0.6,
            marginTop: `${displaySize * 0.004}px`,
            transform: 'translateY(-2px)',
            letterSpacing: '1px',
          }}
        >
          {city.toUpperCase()}
        </div>
      </div>

      {/* Weather Circle (9 o'clock axis) */}
      <div
        className="invisible font-space"
        style={{
          position: 'absolute',
          top: '50%',
          left: `${radius - tzCircleRadius - tzCircleSize / 2}px`,
          transform: 'translateY(-50%)',
          width: `${displaySize * 0.22}px`,
          height: `${displaySize * 0.22}px`,
          borderRadius: '50%',
          background: 'transparent',
          border: `1px solid rgba(255, 255, 255, 0.15)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${displaySize * 0.01}px`,
          zIndex: 1,
        }}
      >
        <div
          style={{
            color: '#ffffff',
            opacity: 0.8,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {weatherIcon}
        </div>
        <div
          className=' -mt-1.5'
          style={{
            fontSize: `${displaySize * 0.040}px`,
            color: '#ffffff',
          }}
        >
          {weather?.temperature}°C
        </div>
      </div>

      {/* Date Circle (3 o'clock axis) */}
      <div
        className="invisible font-space"
        style={{
          position: 'absolute',
          top: '50%',
          right: `${radius - tzCircleRadius - tzCircleSize / 2}px`,
          transform: 'translateY(-50%)',
          width: `${displaySize * 0.22}px`,
          height: `${displaySize * 0.22}px`,
          borderRadius: '50%',
          background: 'transparent',
          border: `1px solid rgba(255, 255, 255, 0.15)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${displaySize * 0.00001}px`,
          zIndex: 1,
        }}
      >
        <div className='-mb-1.5'
          style={{
            fontSize: `${displaySize * 0.045}px`,
            color: '#ffffff',
            opacity: 0.7,
          }}
        >
          {dayName}
        </div>
        <div
          style={{
            fontSize: `${displaySize * 0.055}px`,
            color: '#ffffff',
          }}
        >
          {date}
        </div>
      </div>
    </div>
  );
}