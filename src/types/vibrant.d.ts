declare module 'vibrant' {
  export class Vibrant {
    static from(src: string): Vibrant;
    getPalette(): Promise<{
      Vibrant?: { hex: string };
      Muted?: { hex: string };
      DarkVibrant?: { hex: string };
      DarkMuted?: { hex: string };
      LightVibrant?: { hex: string };
      LightMuted?: { hex: string };
    }>;
  }
}