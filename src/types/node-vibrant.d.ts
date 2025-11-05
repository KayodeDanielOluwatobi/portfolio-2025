declare module 'node-vibrant/node' {
  export class Vibrant {
    static from(src: string): {
      getPalette(): Promise<{
        Vibrant: { hex: string; rgb: [number, number, number] } | null;
        LightVibrant: { hex: string; rgb: [number, number, number] } | null;
        DarkVibrant: { hex: string; rgb: [number, number, number] } | null;
        Muted: { hex: string; rgb: [number, number, number] } | null;
        LightMuted: { hex: string; rgb: [number, number, number] } | null;
        DarkMuted: { hex: string; rgb: [number, number, number] } | null;
      }>;
    };
  }
}