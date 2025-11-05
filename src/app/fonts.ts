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

export const nothing = localFont({
  src: [
    {
      path: './fonts/nothing.woff2',
    },
  ],
  variable: '--font-nothing',
  display: 'swap',
});

export const crux = localFont({
  src: [
    {
      path: './fonts/crux.woff2',
    },
  ],
  variable: '--font-crux',
  display: 'swap',
});

export const array = localFont({
  src: [
    {
      path: './fonts/array/Array-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/array/Array-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/array/Array-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/array/Array-Wide.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/array/Array-SemiboldWide.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/array/Array-BoldWide.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-array',
  display: 'swap',
});