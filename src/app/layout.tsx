import type { Metadata } from 'next'
import { Inter, Outfit, Poppins, DM_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-provider'


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

const dm_sans = DM_Sans({
  subsets: ['latin'],
  weight: 'variable', // Choose the weights you need
  variable: '--font-dm-sans',
});

const sohnemono1 = localFont({
  src: './fonts/sohnemono1.woff2',
  variable: '--font-sohne-mono-1'
})

const sohnemono2 = localFont({
  src: './fonts/sohnemono2.woff2',
  variable: '--font-sohne-mono-2'
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
      <body className={`${inter.variable} ${dm_sans.variable} ${outfit.variable} ${poppins.variable} ${departureMono.variable} ${sohnemono1.variable} ${sohnemono2.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}