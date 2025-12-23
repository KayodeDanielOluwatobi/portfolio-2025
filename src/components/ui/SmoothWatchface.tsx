'use client';

import { useState, useEffect } from 'react';
import CircularWaveProgress from '@/components/ui/CircularWaveProgress';

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

export default function SmoothWatchface({
  city,
  country,
  countryCode,
  size = 320,
  className = '',
}: SmoothWatchfaceProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);

  // Fetch weather from API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`/api/weather?city=${city}&country=${countryCode}`);
        if (!response.ok) throw new Error('Failed to fetch weather');
        const data = await response.json();
        setWeather(data);
        setFadeOut(true);
        setTimeout(() => setIsLoading(false), 500);
      } catch (error) {
        console.error('Weather fetch error:', error);
        setFadeOut(true);
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 600000);
    return () => clearInterval(weatherInterval);
  }, [city, countryCode]);

  // Animate loader progress
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoaderProgress((prev) => {
        const next = prev + Math.random() * 30;
        return next > 90 ? 90 : next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);

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

  const radius = size / 2;
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
  const minuteHandLength = radius * 0.13;
  const minuteX1 = centerX + Math.sin((minutesAngle) * (Math.PI / 180)) * (minuteHandRadius - minuteHandLength);
  const minuteY1 = centerY - Math.cos((minutesAngle) * (Math.PI / 180)) * (minuteHandRadius - minuteHandLength);
  const minuteX2 = centerX + Math.sin((minutesAngle) * (Math.PI / 180)) * minuteHandRadius;
  const minuteY2 = centerY - Math.cos((minutesAngle) * (Math.PI / 180)) * minuteHandRadius;

  // Seconds hand: circle at 4/5 radius
  const secondsCircleRadius = radius * 0.8;
  const secondsX = centerX + Math.sin((secondsAngle) * (Math.PI / 180)) * secondsCircleRadius;
  const secondsY = centerY - Math.cos((secondsAngle) * (Math.PI / 180)) * secondsCircleRadius;

  return (
    <div
      className={`relative bg-black overflow-hidden ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* Loader - Fades out when data arrives */}
      {isLoading && (
        <div
          className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-500 ${
            fadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <CircularWaveProgress
            progress={loaderProgress}
            size={50}
            trackWidth={5}
            waveWidth={5}
            trackColor="#475569"
            waveColor="#cbd5e1"
            waveAmplitude={2}
            maxWaveFrequency={6}
            undulationSpeed={2}
            rotationSpeed={7}
            edgeGap={20}
            relaxationDuration={0}
            className="opacity-30"
          />
        </div>
      )}

      {/* Watch Content - Fades in when data arrives */}
      <div
        className={`relative z-5 transition-opacity duration-500 flex items-center justify-center h-full ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* SVG for watch hands */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'absolute', inset: 0, zIndex: 5 }}
        >
          {/* Hour hand - half radius, rounded caps */}
          <line
            x1={centerX}
            y1={centerY}
            x2={hourX2}
            y2={hourY2}
            stroke="#ffffff"
            strokeWidth={size * 0.06}
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
            strokeWidth={size * 0.027}
            strokeLinecap="round"
            opacity="1"
          />

          {/* Seconds hand - circle at 4/5 radius with smooth animation */}
          <circle
            cx={secondsX}
            cy={secondsY}
            r={size * 0.023}
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
            strokeWidth="0.6"
            opacity="0.2"
          />
        </svg>
      </div>
    </div>
  );
}