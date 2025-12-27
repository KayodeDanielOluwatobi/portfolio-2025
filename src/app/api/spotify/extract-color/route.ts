import { NextRequest, NextResponse } from 'next/server';
import { Vibrant } from 'node-vibrant/node';
import sharp from 'sharp'; // 👈 Added Sharp

/**
 * Color Extraction Logic - The Claude Method™ (Refactored for Robustness)
 * * Philosophy:
 * - Respect the album's artistic mood
 * - Ensure visibility on dark backgrounds
 * - ROBUSTNESS UPGRADE: Now handles AVIF/WebP by converting to PNG on the fly.
 */

interface ExtractedColors {
  barColor: string;
  glowColor: string;
  mood: 'dark' | 'light' | 'vibrant' | 'muted';
}

/**
 * Convert RGB to HSL
 * Returns hue (0-360), saturation (0-100), lightness (0-100)
 */
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

/**
 * Convert HSL to Hex
 */
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

/**
 * Ensure color is visible on dark background
 * Adjusts lightness while preserving hue and saturation
 */
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

/**
 * Create a glow version of the color
 * Same hue, +15% lightness
 */
function createGlowColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const hsl = rgbToHsl(r, g, b);
  hsl.l = Math.min(100, hsl.l + 15);

  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Determine the mood of the color palette
 */
function determineMood(lightness: number, saturation: number): 'dark' | 'light' | 'vibrant' | 'muted' {
  if (lightness < 40) return 'dark';
  if (lightness > 70) return 'light';
  if (saturation > 50) return 'vibrant';
  return 'muted';
}

/**
 * Extract color from album art using The Claude Method™
 * NOW WITH SHARP SUPPORT FOR AVIF!
 */
async function extractColors(imageUrl: string): Promise<ExtractedColors> {
  try {
    // 1. Fetch image manually (Vibrant fails on AVIF URLs)
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // 2. Convert to PNG using Sharp (The Robust Fix)
    // We resize to 200px to make extraction faster
    try {
        buffer = await sharp(buffer)
            .resize(200, 200, { fit: 'inside' })
            .toFormat('png')
            .toBuffer();
    } catch (sharpError) {
        console.warn('Sharp conversion failed, attempting raw buffer...', sharpError);
    }

    // 3. Pass the clean PNG buffer to Vibrant
    const palette = await Vibrant.from(buffer).getPalette();

    // --- YOUR ORIGINAL LOGIC BELOW (UNTOUCHED) ---

    // Priority cascade for color selection
    let selectedColor: string | null = null;
    let selectedLightness = 0;
    let selectedSaturation = 0;

    // Priority 1: Vibrant (if it has good luminance)
    if (palette.Vibrant) {
      const [r, g, b] = palette.Vibrant.rgb;
      const hsl = rgbToHsl(r, g, b);
      if (hsl.l > 30) {
        selectedColor = palette.Vibrant.hex;
        selectedLightness = hsl.l;
        selectedSaturation = hsl.s;
      }
    }

    // Priority 2: LightVibrant (bright and colorful)
    if (!selectedColor && palette.LightVibrant) {
      selectedColor = palette.LightVibrant.hex;
      const [r, g, b] = palette.LightVibrant.rgb;
      const hsl = rgbToHsl(r, g, b);
      selectedLightness = hsl.l;
      selectedSaturation = hsl.s;
    }

    // Priority 3: DarkVibrant (deep, rich - will be lightened)
    if (!selectedColor && palette.DarkVibrant) {
      selectedColor = palette.DarkVibrant.hex;
      const [r, g, b] = palette.DarkVibrant.rgb;
      const hsl = rgbToHsl(r, g, b);
      selectedLightness = hsl.l;
      selectedSaturation = hsl.s;
    }

    // Priority 4: Muted (soft tones)
    if (!selectedColor && palette.Muted) {
      selectedColor = palette.Muted.hex;
      const [r, g, b] = palette.Muted.rgb;
      const hsl = rgbToHsl(r, g, b);
      selectedLightness = hsl.l;
      selectedSaturation = hsl.s;
    }

    // Priority 5: Fallback to Spotify green
    if (!selectedColor) {
      selectedColor = '#1DB954';
      selectedLightness = 60;
      selectedSaturation = 70;
    }

    // Ensure visibility on dark background
    const barColor = ensureVisibility(selectedColor);
    const glowColor = createGlowColor(barColor);
    const mood = determineMood(selectedLightness, selectedSaturation);

    return { barColor, glowColor, mood };
  } catch (error) {
    console.error('Color extraction failed:', error);
    // Fallback to Spotify green
    return {
      barColor: '#1DB954',
      glowColor: '#2EE86E',
      mood: 'vibrant',
    };
  }
}

// API Route Handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl parameter required' }, { status: 400 });
    }

    const colors = await extractColors(imageUrl);

    return NextResponse.json(colors);
  } catch (error) {
    console.error('Color extraction API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}