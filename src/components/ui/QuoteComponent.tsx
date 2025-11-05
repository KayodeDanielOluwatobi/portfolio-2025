'use client';

import { useState, useEffect } from 'react';

interface Quote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
  length: number;
}

interface QuoteComponentProps {
  interval?: number; // Milliseconds between quote refreshes.
  tags?: string; // Quotable tags separated by pipe (|) for OR or comma (,) for AND.
  maxLength?: number; // Maximum quote length in characters
  className?: string; // Custom CSS classes for the container
}

export default function QuoteComponent({
  interval = 30000, 
  tags = 'motivational|inspirational',
  maxLength = 200,
  className = '',
}: QuoteComponentProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Validate interval
  if (interval < 20000) {
    console.warn(
      `[QuoteComponent] Interval ${interval}ms is too aggressive. Using 20000ms instead.`
    );
    interval = 20000;
  }

  const fetchQuote = async () => {
    try {
      setFadeOut(true);

      // --- THIS IS THE FIX ---
      // We now call our OWN API route instead of the external API.
      // This correctly uses your route.ts file and removes the
      // need for the 'cors-anywhere' proxy.
      const apiUrl = `/api/quote?tags=${encodeURIComponent(tags)}&maxLength=${maxLength}`;

      const response = await fetch(apiUrl);
      // --- END OF FIX ---

      if (!response.ok) throw new Error('Failed to fetch quote');
      const data = await response.json();

      console.log('[QuoteComponent] API Response:', data);

      // Handle both array and object responses
      const fetchedQuote = Array.isArray(data) ? data[0] : data;

      if (!fetchedQuote || !fetchedQuote.content) {
        console.error('[QuoteComponent] Invalid quote data:', fetchedQuote);
        throw new Error('Invalid quote data received');
      }

      setTimeout(() => {
        setQuote(fetchedQuote);
        setFadeOut(false);
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error('Quote fetch error:', error);
      setFadeOut(false);
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchQuote();
  }, []);

  // Interval for refreshing quotes
  useEffect(() => {
    const intervalId = setInterval(fetchQuote, interval);
    return () => clearInterval(intervalId);
  }, [interval]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Quote Text */}
      <div
        className={`transition-opacity duration-300 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {quote && (
          <div className="flex flex-col gap-3">
            <p className="font-regular text-sm leading-relaxed text-white/90 italic">
              "{quote.content}"
            </p>
            <p className="font-mono text-xs text-white/50 uppercase tracking-wider">
              — {quote.author}
            </p>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && !quote && (
        <div className="flex flex-col gap-3">
          <div className="h-12 bg-white/10 rounded animate-pulse" />
          <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
        </div>
      )}
    </div>
  );
}