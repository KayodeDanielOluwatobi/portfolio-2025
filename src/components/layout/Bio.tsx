// src/components/Bio.tsx (or your file path)
'use client'

import AnimatedUnderlineLink from '@/components/ui/AnimatedUnderlineLink'; // Adjust this path if your component is elsewhere

export default function Bio() {
  return (
    <section className="w-full bg-black">
      <div className="container max-w-none mx-auto px-8 pb-8 pt-32">
        <div className="grid grid-cols-12 md:uppercase">
          <p className="col-span-12 md:col-span-12 text-xl sm:text-2xl md:text-3xl lg:text-4xl text-left md:text-justify font-light tracking-wide md:tracking-normal md:font-monoblock text-white" style={{ lineHeight: '1.30' }}>
            I’m Daniel..., a multidisciplinary designer and a frontend engineer passionate about building{' '}
            {/* 2. Replace Link with AnimatedUnderlineLink */}
            <AnimatedUnderlineLink
              href="/works?category=brands"
              // The default underline styles from the component will apply
            >
              brands
            </AnimatedUnderlineLink>{' '}
            that stand out,{' '}
            {/* 3. Replace Link with AnimatedUnderlineLink */}
            <AnimatedUnderlineLink
              href="/works?category=socials"
            >
              socials
            </AnimatedUnderlineLink>{' '}
            that engage and <span className="whitespace-nowrap">spirit-led</span>{' '}
            {/* 4. Replace Link with AnimatedUnderlineLink */}
            <AnimatedUnderlineLink
              href="/works?category=church"
            >
              church media
            </AnimatedUnderlineLink>{' '}
            that uplift. Let's team up!
          </p>
        </div>
      </div>
    </section>
  );
}