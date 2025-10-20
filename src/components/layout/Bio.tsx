'use client'

import Link from 'next/link';

export default function Bio() {
  return (
    <section className="w-full bg-black">
      <div className="container max-w-none mx-auto px-8 pt-32">
        <div className="grid grid-cols-12">
          <p className="col-span-12 md:col-span-11 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white" style={{ lineHeight: '1.29' }}>
            I’m Daniel, a multidisciplinary designer passionate about building{' '}
            <Link 
              href="/" 
              className="underline decoration-2 hover:opacity-70 transition-opacity underline-offset-4 sm:underline-offset-[6px] md:underline-offset-[7px]"
            >
              brands
            </Link>{' '}
            that stand out,{' '}
            <Link 
              href="/socials" 
              className="underline decoration-2 hover:opacity-70 transition-opacity underline-offset-4 sm:underline-offset-[6px] md:underline-offset-[7px]"
            >
              socials
            </Link>{' '}
            that engage and <span className="whitespace-nowrap">spirit-led</span>{' '}
            <Link 
              href="/church-media" 
              className="underline decoration-2 hover:opacity-70 transition-opacity underline-offset-4 sm:underline-offset-[6px] md:underline-offset-[7px]"
            >
              church media
            </Link>{' '}
            that uplift. Let's team up!
          </p>
        </div>
      </div>
    </section>
  );
}