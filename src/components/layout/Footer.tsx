'use client'
import { useState, useEffect } from 'react'
import WeatherWidget from '@/components/ui/WeatherWidget'
import SpotifyWidget from '@/components/spotify/SpotifyWidget'
import { ArrowUpRight } from 'lucide-react'


const quirkyLines = [
    <>All rights reserved <i>(except the rights to sleep)</i>.</>,
    'All rights reserved. Hehe...What is sleep again??',
    'Caffeinated & Copyrighted.',
    'All rights. No wrongs. (I think).',
    'All rights reserved. Obviously.',
    'All rights reserved. Now, scroll back up.',
    'All rights reserved. All wrongs, my specialty.',
    'All rights reserved. (How delightfully quaint.)',
    <>All rights reserved. <i>Lefts</i> are available by appointment only.</>,
    'All rights reserved. (Whatever that actually means...)',
    <>All rights reserved. And some <i>lefts</i>, just for balance.</>,
    'All rights reserved, because my lawyer insisted.',
    'All rights reserved. Some wrongs reversed.',
    <>All rights reserved. <i>Lefts</i> are negotiable.</>,
    <>All rights reserved. Some <i>lefts</i> by request.</>,
    'All rights reserved (and a few wrongs for good measure).',
    "Rights reserved. Wrongs... well, that's a different story.",
    <>All rights reserved. <i>Lefts</i> are wild.</>,
    'All rights reserved. My mom said so.',
  ]

export default function Footer() {
  const socialLinks = [
    { label: 'Behance', href: 'https://behance.net/your-username' },
    { label: 'Instagram', href: 'https://instagram.com/your-username' },
    { label: 'Pinterest', href: 'https://pinterest.com/your-username' },
    { label: 'Threads', href: 'https://threads.net/your-username' },
    { label: 'WhatsApp', href: 'https://wa.me/yourphonenumber' },
  ]

  

  const [currentLine, setCurrentLine] = useState(quirkyLines[0])
  const [fade, setFade] = useState(true)

  // Rotate the quirky lines every 12 seconds with fade animation
useEffect(() => {
  console.log('Timer started')
  const interval = setInterval(() => {
    console.log('Interval fired - fading out')
    setFade(false)
    setTimeout(() => {
      console.log('Timeout fired - changing line')
      setCurrentLine((prev) => {
        let nextIndex = quirkyLines.indexOf(prev) + 1
        if (nextIndex >= quirkyLines.length) nextIndex = 0
        return quirkyLines[nextIndex]
      })
      setFade(true)
    }, 700)
  }, 20000)
  
  return () => {
    console.log('Cleaning up interval')
    clearInterval(interval)
  }
}, []) // Keep it empty - don't add quirkyLines

  

  return (
    <footer className="bg-black text-white border-t border-white/0">
      <div className="container mx-auto px-2 py-2 max-w-none">
        <div className="grid grid-cols-12 gap-3">

          {/* LEFT COLUMN */}
          <div className="col-span-12 md:col-span-4 flex flex-col justify-end gap-10 p-4">
            <div className="space-y-12">

              {/* Social Links */}
              <div className="flex flex-wrap gap-x-3 gap-y-2 font-space text-xs uppercase tracking-wider">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-white hover:text-opacity-100 transition-colors duration-200 inline-flex items-center"
                  >
                    {link.label}
                    <ArrowUpRight className="text-white/70 ml-1.5 h-4 w-4" />
                  </a>

                  
                ))}
                
              </div>

              {/* Copyright + Brewed Line */}
              <div className="uppercase font-space text-xs text-white/40 tracking-wider space-y-12">
                <p className="pt-1 uppercase">
                  Website Brewed From Bare Beans By <span> <a target='_blank' rel='noopener noreferrer' href='https://wa.me/message/JDKKXFLCFFYDB1' className='text-white/70'>Kayode Daniel </a> </span> — Ingredients: Nescafé, Midnight Inspiration And Kpop Instrumentals On Repeat...
                </p>
                
                <p className="whitespace-normal">
                  <span className="font-serif font-bold">©</span>EVERDANN. <span className={`text-white/70 transition-opacity duration-700 ${fade ? 'opacity-100' : 'opacity-0'}`}>{currentLine}</span>
                </p>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="col-span-12 md:col-span-4 h-full flex flex-col justify-between gap-0">
            <div className="w-full h-full">
              <SpotifyWidget pollInterval={10000} />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
            <div>
              <WeatherWidget city="Lagos" country="Nigeria" countryCode="NG" showCelsius={false} size="small" />
            </div>
            <div>
              <WeatherWidget city="Seoul" country="South Korea" countryCode="KR" showCelsius={false} size="small" />
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
