'use client'

import Link from 'next/link';

export default function Bio() {
  return (
    <section className="w-full bg-black">
      <div className="container max-w-none mx-auto px-8 py-32">
        <div className="grid grid-cols-12">
          <p className="col-span-12 md:col-span-11 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white" style={{ lineHeight: '1.25' }}>
            Crafting timeless{' '}
            <Link 
              href="/brands" 
              className="underline underline-offset-7 decoration-2 hover:opacity-70 transition-opacity"
            >
              brands
            </Link>{' '}
            that stand out, designing captivating{' '}
            <Link 
              href="/socials" 
              className="underline underline-offset-7 decoration-2 hover:opacity-70 transition-opacity"
            >
              socials
            </Link>{' '}
            that engage and creating <span className="whitespace-nowrap">spirit-led</span>{' '}
            <Link 
              href="/church-media" 
              className="underline underline-offset-7 decoration-2 hover:opacity-70 transition-opacity"
            >
              church media
            </Link>{' '}
            that uplift.
          </p>
        </div>
      </div>
    </section>
  );
}