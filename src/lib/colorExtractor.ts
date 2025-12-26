// src/lib/colorExtractor.ts
import { Vibrant } from 'node-vibrant/node';

/**
 * Convert RGB to HSL
 * Returns hue (0-360), saturation (0-100), lightness (0-100)
 */
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Convert HSL to Hex
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * "Pastel Mode" Visibility Logic
 * Forces colors to be soft (Lower Saturation) and bright (High Lightness)
 */
function ensureVisibility(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const hsl = rgbToHsl(r, g, b);

  // 1. Force Lightness HIGH (Pastels are bright)
  // Push lightness to be between 75% and 85%
  if (hsl.l < 75) {
    hsl.l = 75 + (hsl.l % 10); 
  } else if (hsl.l > 90) {
    // If it's pure white, darken it slightly so it's visible on white backgrounds
    hsl.l = 85;
  }

  // 2. Force Saturation MEDIUM-LOW (Pastels are soft, not neon)
  // Cap saturation at 60%.
  if (hsl.s > 60) {
    hsl.s = 60;
  }
  // If it's too grey (<30%), bump it up so it actually has color
  if (hsl.s < 30) {
    hsl.s = 40;
  }

  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Main Extraction Function
 */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    
    // Preference: LightVibrant or Muted work best for pastels.
    // We try to grab the softest colors first.
    let selectedSwatch = palette.LightVibrant || palette.Muted || palette.Vibrant || palette.DarkVibrant;

    // Fallback if Vibrant fails completely
    if (!selectedSwatch) return '#ffffff';

    // Apply the Pastel filter
    return ensureVisibility(selectedSwatch.hex);
  } catch (error) {
    console.error('Extraction failed:', error);
    return '#ffffff'; // Safe fallback
  }
}