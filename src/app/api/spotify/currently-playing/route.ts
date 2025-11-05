// src/app/api/spotify/currently-playing/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Vibrant } from 'node-vibrant/node';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
}

interface CurrentlyPlayingResponse {
  item: SpotifyTrack | null;
  is_playing: boolean;
  progress_ms: number;
}

// Color extraction utilities
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
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
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

    // Priority cascade
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
      selectedColor = '#1DB954';
      selectedLightness = 60;
      selectedSaturation = 70;
    }

    const barColor = ensureVisibility(selectedColor);
    const glowColor = createGlowColor(barColor);
    const mood = selectedLightness < 40 ? 'dark' : selectedLightness > 70 ? 'light' : selectedSaturation > 50 ? 'vibrant' : 'muted';

    return { barColor, glowColor, mood };
  } catch (error) {
    console.error('Color extraction failed:', error);
    return {
      barColor: '#1DB954',
      glowColor: '#2EE86E',
      mood: 'vibrant',
    };
  }
}

// Get new access token using refresh token
async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify credentials in environment variables');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Spotify token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Fetch currently playing track
async function getCurrentlyPlaying(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 204 No Content means nothing is playing
  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch currently playing: ${response.statusText}`);
  }

  return await response.json();
}

// Fetch recently played track (fallback if nothing currently playing)
async function getRecentlyPlayed(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recently played: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items[0]?.track || null;
}

export async function GET(request: NextRequest) {
  try {
    // Get fresh access token
    const accessToken = await getAccessToken();

    // Get currently playing
    let currentlyPlaying = await getCurrentlyPlaying(accessToken);

    // If nothing playing, get recently played
    let track = null;
    let isPlaying = false;
    let progressMs = 0;

    if (currentlyPlaying && currentlyPlaying.item) {
      track = currentlyPlaying.item;
      isPlaying = currentlyPlaying.is_playing;
      progressMs = currentlyPlaying.progress_ms || 0;
    } else {
      track = await getRecentlyPlayed(accessToken);
    }

    if (!track) {
      return NextResponse.json(
        { error: 'No track found' },
        { status: 404 }
      );
    }

    // Extract relevant data
    const albumArt = track.album.images[0]?.url;
    
    // Extract colors from album art
    const colors = albumArt ? await extractColors(albumArt) : {
      barColor: '#1DB954',
      glowColor: '#2EE86E',
      mood: 'vibrant',
    };

    const response = {
      track: {
        id: track.id,
        name: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        albumArt,
        duration: track.duration_ms,
      },
      isPlaying,
      progressMs,
      colors,
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Spotify API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}