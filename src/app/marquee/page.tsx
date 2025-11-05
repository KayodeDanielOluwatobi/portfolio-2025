'use client';

import { useState, useEffect, useRef } from 'react';

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

interface SmoothWatchfaceProps {
  city: string;
  country: string;
  countryCode: string;
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

function SmoothWatchface({
  city,
  country,
  countryCode,
  size = 320,
  className = '',
}: SmoothWatchfaceProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  const [loading, setLoading] = useState(true);
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

  // Update time in real-time with timezone adjustment and smooth animation
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
        milliseconds: localTime.getMilliseconds(),
      });
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 16);
    return () => clearInterval(timeInterval);
  }, [weather]);

  // Responsive size based on container width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerSize(Math.min(width - 64, 400));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  const displaySize = containerSize || size;
  const radius = displaySize / 2;
  const centerX = radius;
  const centerY = radius;

  // Calculate angles with smooth animation
  const totalSeconds = time.seconds + (time.milliseconds / 1000);
  const secondsAngle = (totalSeconds / 60) * 360;
  const minutesAngle = (time.minutes * 6) + (time.seconds * 0.1);
  const hoursAngle = ((time.hours % 12) * 30) + (time.minutes * 0.5);

  // Hour hand: half radius, rounded caps, no counterweight
  const hourHandLength = radius * 0.42;
  const hourX2 = centerX + Math.sin((hoursAngle) * (Math.PI / 180)) * hourHandLength;
  const hourY2 = centerY - Math.cos((hoursAngle) * (Math.PI / 180)) * hourHandLength;

  // Minute hand: positioned at 3/4 radius, looks like a tick
  const minuteHandRadius = radius * 0.68;
  const minuteHandLength = radius * 0.14;
  const minuteX1 = centerX + Math.sin((minutesAngle) * (Math.PI / 180)) * (minuteHandRadius - minuteHandLength);
  const minuteY1 = centerY - Math.cos((minutesAngle) * (Math.PI / 180)) * (minuteHandRadius - minuteHandLength);
  const minuteX2 = centerX + Math.sin((minutesAngle) * (Math.PI / 180)) * minuteHandRadius;
  const minuteY2 = centerY - Math.cos((minutesAngle) * (Math.PI / 180)) * minuteHandRadius;

  // Seconds hand: circle at 4/5 radius
  const secondsCircleRadius = radius * 0.77;
  const secondsX = centerX + Math.sin((secondsAngle) * (Math.PI / 180)) * secondsCircleRadius;
  const secondsY = centerY - Math.cos((secondsAngle) * (Math.PI / 180)) * secondsCircleRadius;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden ${className}`}
      style={{
        width: '100%',
        height: `${displaySize}px`,
      }}
    >
      {/* SVG for watch hands */}
      <svg
        width={displaySize}
        height={displaySize}
        viewBox={`0 0 ${displaySize} ${displaySize}`}
        style={{ position: 'absolute', inset: 0, zIndex: 5 }}
      >
        {/* Hour hand - half radius, rounded caps */}
        <line
          x1={centerX}
          y1={centerY}
          x2={hourX2}
          y2={hourY2}
          stroke="#ffffff"
          strokeWidth={displaySize * 0.06}
          strokeLinecap="round"
          opacity="1"
        />

        {/* Minute hand - tick-like appearance at 3/4 radius */}
        <line
          x1={minuteX1}
          y1={minuteY1}
          x2={minuteX2}
          y2={minuteY2}
          stroke="#ffffff"
          strokeWidth={displaySize * 0.027}
          strokeLinecap="round"
          opacity="1"
        />

        {/* Seconds hand - circle at 4/5 radius with smooth animation */}
        <circle
          cx={secondsX}
          cy={secondsY}
          r={displaySize * 0.023}
          fill="#ffffff"
          opacity="1"
        />

        {/* Circumference stroke */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - 2}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity="0.4"
        />


      </svg>
    </div>
  );
}

export default function Page() {
  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center gap-8 p-4">
      <SmoothWatchface 
        city="Lagos" 
        country="Nigeria" 
        countryCode="NG" 
        size={320}
      />
      <SmoothWatchface 
        city="Seoul" 
        country="South Korea" 
        countryCode="KR" 
        size={320}
      />
    </div>
  );
}