import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layout/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        sm: '100%',
        md: '100%',
        lg: '100%',
        xl: '100%',
        '2xl': '100%',
      },
    },
    extend: {
      fontFamily: {
        
        'din': ['DIN Next LT Pro', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'outfit': ['var(--font-outfit)', 'sans-serif'],
        'poppins': ['var(--font-poppins)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
        'departure-mono': ['var(--font-departure-mono)', 'monospace'],
        'sohne-mono-1': ['var(--font-sohne-mono-1)', 'monospace'],
        'sohne-mono-2': ['var(--font-sohne-mono-2)', 'monospace'],
      },
    },
  },
  variants: {
    extend: {
      textColor: ['hover'],
      backgroundColor: ['hover'],
      borderColor: ['hover'],
      opacity: ['hover'],
    },
  },
  plugins: [],
};

export default config;