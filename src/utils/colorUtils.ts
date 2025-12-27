// src/utils/colorUtils.ts

// Helper function to convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper function to convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
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
  
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Helper function to convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
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
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Updated darkenColor
 * @param color - The hex color
 * @param percent - (Optional) Percentage to darken by (0-100). 
 * If omitted, uses the old "contrast" logic (L=15%).
 */
export function darkenColor(color: string, percent?: number): string {
  let hex = color.replace('#', '').replace('0x', '');
  
  // Handle hex format
  if (hex.length === 6 || hex.length === 3) {
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    const rgb = hexToRgb('#' + hex);
    if (!rgb) return color;
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // 👇 LOGIC BRANCH
    if (percent !== undefined) {
      // NEW LOGIC: Relative darkening (Subtract percentage from Lightness)
      // e.g., if L is 50 and percent is 20, new L is 30.
      hsl.l = Math.max(0, hsl.l - percent);
    } else {
      // OLD LOGIC: Absolute darkening (High contrast for text)
      // Reduce lightness to 15% for darker color with better contrast
      hsl.l = 15;
      // Increase saturation for more vibrant dark color
      hsl.s = Math.min(100, hsl.s + 20);
    }
    
    const darkRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    const result = `#${[darkRgb.r, darkRgb.g, darkRgb.b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')}`;
    
    return result;
  }
  
  return color;
}