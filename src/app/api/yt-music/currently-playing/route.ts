// src/app/api/yt-music/currently-playing/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Vibrant } from 'node-vibrant/node';

// Public InnerTube API Key for YouTube Music
const API_KEY = 'AIzaSyAO_FJ2PI196E59xQla6Qzce37g6Gud1U0';

// Color extraction utilities (mirrors Spotify route)
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function ensureVisibility(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const hsl = rgbToHsl(r, g, b);

  if (hsl.l < 35) {
    hsl.l = 45;
  } else if (hsl.l > 85) {
    hsl.l = 75;
  }

  if (hsl.s < 20) {
    hsl.s = 30;
  }

  return hslToHex(hsl.h, hsl.s, hsl.l);
}

function createGlowColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const hsl = rgbToHsl(r, g, b);
  hsl.l = Math.min(100, hsl.l + 15);

  return hslToHex(hsl.h, hsl.s, hsl.l);
}

async function extractColors(imageUrl: string) {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();

    let selectedColor: string | null = null;
    let selectedLightness = 0;
    let selectedSaturation = 0;

    if (palette.Vibrant) {
      const [r, g, b] = palette.Vibrant.rgb;
      const hsl = rgbToHsl(r, g, b);
      if (hsl.l > 30) {
        selectedColor = palette.Vibrant.hex;
        selectedLightness = hsl.l;
        selectedSaturation = hsl.s;
      }
    }

    if (!selectedColor && palette.LightVibrant) {
      selectedColor = palette.LightVibrant.hex;
      const [r, g, b] = palette.LightVibrant.rgb;
      const hsl = rgbToHsl(r, g, b);
      selectedLightness = hsl.l;
      selectedSaturation = hsl.s;
    }

    if (!selectedColor && palette.DarkVibrant) {
      selectedColor = palette.DarkVibrant.hex;
      const [r, g, b] = palette.DarkVibrant.rgb;
      const hsl = rgbToHsl(r, g, b);
      selectedLightness = hsl.l;
      selectedSaturation = hsl.s;
    }

    if (!selectedColor && palette.Muted) {
      selectedColor = palette.Muted.hex;
      const [r, g, b] = palette.Muted.rgb;
      const hsl = rgbToHsl(r, g, b);
      selectedLightness = hsl.l;
      selectedSaturation = hsl.s;
    }

    if (!selectedColor) {
      selectedColor = '#FF0000'; // Default YouTube Red
      selectedLightness = 50;
      selectedSaturation = 100;
    }

    const barColor = ensureVisibility(selectedColor);
    const glowColor = createGlowColor(barColor);
    const mood = selectedLightness < 40 ? 'dark' : selectedLightness > 70 ? 'light' : selectedSaturation > 50 ? 'vibrant' : 'muted';

    return { barColor, glowColor, mood };
  } catch (error) {
    console.error('Color extraction failed:', error);
    return {
      barColor: '#FF0000',
      glowColor: '#FF3333',
      mood: 'vibrant',
    };
  }
}

// Resilient InnerTube parse helpers
function findFirstTrack(obj: any): any | null {
  if (!obj || typeof obj !== 'object') return null;
  if (obj.musicResponsiveListItemRenderer) {
    return obj.musicResponsiveListItemRenderer;
  }
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (Array.isArray(val)) {
      for (const item of val) {
        const found = findFirstTrack(item);
        if (found) return found;
      }
    } else {
      const found = findFirstTrack(val);
      if (found) return found;
    }
  }
  return null;
}

function parseDuration(durationStr: string): number {
  const parts = durationStr.split(':').map(Number);
  let ms = 0;
  if (parts.length === 2) {
    ms = (parts[0] * 60 + parts[1]) * 1000;
  } else if (parts.length === 3) {
    ms = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }
  return ms;
}

function findDurationString(item: any): string | null {
  const textPattern = /^\d+:\d+(:\d+)?$/;
  function search(obj: any): string | null {
    if (!obj || typeof obj !== 'object') return null;
    if (typeof obj === 'string' && textPattern.test(obj)) {
      return obj;
    }
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (Array.isArray(val)) {
        for (const element of val) {
          const found = search(element);
          if (found) return found;
        }
      } else {
        const found = search(val);
        if (found) return found;
      }
    }
    return null;
  }
  return search(item);
}

function getHighResThumbnail(url: string): string {
  if (!url) return '';
  return url.replace(/=w\d+-h\d+/, '=w500-h500');
}

export async function GET(request: NextRequest) {
  try {
    const cookie = process.env.YOUTUBE_MUSIC_COOKIE;

    if (!cookie) {
      return NextResponse.json(
        { error: 'YOUTUBE_MUSIC_COOKIE not set in environment variables.' },
        { status: 401 }
      );
    }

    const url = `https://music.youtube.com/youtubei/v1/browse?key=${API_KEY}&prettyPrint=false`;
    const payload = {
      context: {
        client: {
          clientName: 'WEB_REMIX',
          clientVersion: '1.20250620.01.00',
          hl: 'en',
          gl: 'US'
        }
      },
      browseId: 'FEmusic_history'
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://music.youtube.com',
        'Referer': 'https://music.youtube.com/history'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `YouTube Music API returned status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const trackRenderer = findFirstTrack(data);

    if (!trackRenderer) {
      return NextResponse.json(
        { error: 'No history tracks found' },
        { status: 404 }
      );
    }

    // Extract fields safely
    const flexColumns = trackRenderer.flexColumns || [];
    
    // Title
    const titleRun = flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0];
    const name = titleRun?.text || 'Unknown Title';

    // Artist/Album - join all runs in the second column that aren't dividers or views
    const artistRuns = flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
    const artistNames = artistRuns
      .filter((r: any) => r.text !== ' • ' && !r.text.includes('views') && !r.text.includes('likes'))
      .map((r: any) => r.text)
      .join(', ');
    const artist = artistNames || 'Unknown Artist';

    // Thumbnail
    const thumbnails = trackRenderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
    const rawThumb = thumbnails[thumbnails.length - 1]?.url || '';
    const albumArt = getHighResThumbnail(rawThumb);

    // Duration
    const durationStr = findDurationString(trackRenderer) || '3:00';
    const duration = parseDuration(durationStr);

    // Track ID
    const id = trackRenderer.playlistItemData?.videoId || trackRenderer.navigationEndpoint?.watchEndpoint?.videoId || 'unknown';

    // Extract dominant colors from album art
    const colors = albumArt ? await extractColors(albumArt) : {
      barColor: '#FF0000',
      glowColor: '#FF3333',
      mood: 'vibrant',
    };

    const response = {
      track: {
        id,
        name,
        artist,
        albumArt,
        duration,
      },
      isPlaying: true, // We will simulate playback in frontend, or fall back based on client timer
      isLastPlayed: false,
      progressMs: 0,
      colors,
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('YouTube Music route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
