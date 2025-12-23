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
  title: 'everdann designs - Visual Designer',
  description: 'Graphic design portfolio by Daniel Kayode',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceMono.variable} ${din.variable} ${dm_sans.variable} ${crux.variable} ${dotted.variable} ${monoblock.variable} ${outfit.variable} ${poppins.variable} ${array.variable} ${departureMono.variable} ${sohnemono1.variable} ${sohnemono2.variable}  antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global SmoothCursor - available on all pages */}
          {/* <SmoothCursor cursorColor="#FFFFFF" cursorStrokeColor="#000000" /> //this line causes double cursor effect */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}