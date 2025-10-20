import localFont from 'next/font/local';

export const sohneMono = localFont({
  src: [
    {
      path: './fonts/sohnemono1.woff2',
    },
    {
      path: './fonts/sohnemono2.woff2',
    },
  ],
  variable: '--font-sohne-mono',
  display: 'swap',
});

export const dotted = localFont({
  src: [
    {
      path: './fonts/dotted.woff2',
    },
  ],
  variable: '--font-dotted',
  display: 'swap',
});