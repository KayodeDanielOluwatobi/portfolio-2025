'use client'
import { useState, useEffect } from 'react'
import { ArrowUpRight, Copyright } from 'lucide-react'

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

export default function Bottom() {
  const socialLinks = [
    { label: 'Behance', href: 'https://www.behance.net/everdann' },
    { label: 'Instagram', href: 'https://www.instagram.com/everdannbrands?igsh=cXIyNGI5a3R4azln' },
    { label: 'Pinterest', href: 'https://pin.it/42HM3Bbh9' },
    { label: 'Threads', href: 'https://threads.net/@everdannbrands' },
    { label: 'WhatsApp', href: 'https://wa.me/message/JDKKXFLCFFYDB1' },
  ]

  const [currentLine, setCurrentLine] = useState(quirkyLines[0])
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentLine((prev) => {
          let nextIndex = quirkyLines.indexOf(prev) + 1
          if (nextIndex >= quirkyLines.length) nextIndex = 0
          return quirkyLines[nextIndex]
        })
        setFade(true)
      }, 700)
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="bg-black text-white border-t border-white/0">
      <div className="container mx-auto px-2 pb-8 pt-24 max-w-none">
        <div className="flex flex-col gap-12">
          {/* Social Links - Horizontal on desktop, vertical stacked on mobile */}
          <div className="flex flex-col md:flex-row md:flex-wrap md:gap-x-32 gap-y-6 md:gap-y-2 font-space text-xs uppercase tracking-wider md:justify-center justify-center items-center">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white/80 transition-colors duration-200 inline-flex items-center"
              >
                {link.label}
                <ArrowUpRight className="text-white/70 ml-1.5 h-4 w-4" />
              </a>
            ))}
          </div>

          {/* Brewed Line */}
          <div className="uppercase font-space text-xs text-white/40 tracking-wider text-center">
            <p className="uppercase">
              Website Brewed From Bare Beans By <span> <a target='_blank' rel='noopener noreferrer' href='https://wa.me/message/JDKKXFLCFFYDB1' className='text-white/70'>Kayode Daniel </a> </span> — Ingredients: Nescafé, Midnight Inspiration And Kpop Instrumentals On Repeat...
            </p>
          </div>

          {/* Copyright + Quirky Line */}
          <div className="uppercase font-space text-xs text-white/40 tracking-wider text-center">
            <p className="whitespace-normal flex flex-wrap items-center justify-center gap-1">
              <Copyright className={`w-3 h-3 -translate-y-[0.5px] transition-opacity duration-700 ${fade ? 'opacity-100' : 'opacity-0'}`} /><span className={`font-space transition-opacity duration-700 ${fade ? 'opacity-100' : 'opacity-0'}`}>EVERDANN.</span> <span className={`text-white/70 transition-opacity duration-700 ${fade ? 'opacity-100' : 'opacity-0'}`}>{currentLine}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}