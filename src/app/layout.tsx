//layout.tsx

import type { Metadata } from 'next'
import { Inter, Outfit, Poppins, DM_Sans,} from 'next/font/google'
import { Space_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-provider'
import { SmoothCursor } from '@/components/layout/SmoothCursor'
import { array } from './fonts';
import { monoblock } from './fonts'
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })



export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const departureMono = localFont({
  src: './fonts/DepartureMono-Regular.woff2',
  variable: '--font-departure-mono'
})

const crux = localFont({
  src: './fonts/crux.woff2',
  variable: '--font-crux'
})


const dm_sans = DM_Sans({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-dm-sans',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: '400', // Space Mono only comes in 400 and 700
  variable: '--font-space-mono',
})


const sohnemono1 = localFont({
  src: './fonts/sohnemono1.woff2',
  variable: '--font-sohne-mono-1'
})

const sohnemono2 = localFont({
  src: './fonts/sohnemono2.woff2',
  variable: '--font-sohne-mono-2'
})

const dotted = localFont({
  src: './fonts/dotted.woff2',
  variable: '--font-dotted'
})

const din = localFont({
  src: './fonts/DIN Next Rounded LT W01 Regular.woff2',
  variable: '--font-din'
})

export const metadata: Metadata = {
  title: 'Everdann Designs - Visual Designer',
  description: 'Graphic design portfolio by Daniel Kayode',
  metadataBase: new URL('https://everdann.vercel.app'), //

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'everdann',
  },
  formatDetection: {
    telephone: false,
  },

  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-icon.png',
  },


  openGraph: {
    title: 'Everdann Designs - Visual Designer',
    description: 'Building brands that stand out, socials that engage and spirit-led church media that uplift.', //
    url: 'https://everdann.vercel.app', //
    siteName: 'everdann designs',
    images: [
      {
        url: 'https://wnkbjxsnjquryyojfxmx.supabase.co/storage/v1/object/public/hero-assets/og-x.png',
        width: 1200,
        height: 630,
        alt: 'everdann designs portfolio preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Everdann Designs - Visual Designer',
    description: 'Graphic design portfolio by Daniel Kayode',
    images: ['https://wnkbjxsnjquryyojfxmx.supabase.co/storage/v1/object/public/hero-assets/og-x.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className="bg-black min-h-screen" lang="en" suppressHydrationWarning>
    <Analytics />
    <SpeedInsights/>

      <body className={`${inter.variable} ${spaceMono.variable} ${din.variable} ${dm_sans.variable} ${crux.variable} ${dotted.variable} ${monoblock.variable} ${outfit.variable} ${poppins.variable} ${array.variable} ${departureMono.variable} ${sohnemono1.variable} ${sohnemono2.variable}  antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global SmoothCursor - available on all pages */}
          {/* <SmoothCursor cursorColor="#000000" cursorStrokeColor="#ffffff" /> */}
          
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}