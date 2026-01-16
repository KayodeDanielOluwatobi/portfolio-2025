//src/components/works/BentoRenderer.tsx

'use client';

import { motion } from 'framer-motion';
import FadeUp from '@/components/animations/FadeUp';

interface BentoAsset {
  type: 'image' | 'video' | 'text';
  src?: string;
  content?: string;
  title?: string;
  titleColor?: string; 
}

interface BentoRowProps {
  layout: 'twin' | 'full' | 'big-left' | 'big-right' | 'triple';
  assets: BentoAsset[];
}

export default function BentoRenderer({ rows }: { rows: BentoRowProps[] }) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 md:gap-2 w-full">
      {rows.map((row, index) => (
        <BentoRow key={index} row={row} />
      ))}
    </div>
  );
}

function BentoRow({ row }: { row: BentoRowProps }) {
  const { layout, assets } = row;

  if (layout === 'full') {
    return (
      <div className="w-full">
        <MediaCard asset={assets[0]} className="aspect-video w-full" />
      </div>
    );
  }

  if (layout === 'twin') {
    return (
      <div className="grid grid-cols-2 gap-1 md:gap-2">
        <MediaCard asset={assets[0]} className="aspect-[4/5] w-full" />
        <MediaCard asset={assets[1]} className="aspect-[4/5] w-full" />
      </div>
    );
  }

  if (layout === 'big-left') {
    return (
      <div className="grid grid-cols-2 gap-1 md:gap-2 items-start">
        <div className="w-full aspect-[4/5]">
          <MediaCard asset={assets[0]} className="w-full h-full" />
        </div>
        <div className="w-full aspect-[4/5] grid grid-rows-2 gap-1 md:gap-2">
          <MediaCard asset={assets[1]} className="w-full h-full" />
          <MediaCard asset={assets[2]} className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (layout === 'big-right') {
    return (
      <div className="grid grid-cols-2 gap-1 md:gap-2 items-start">
        <div className="w-full aspect-[4/5] grid grid-rows-2 gap-1 md:gap-2">
          <MediaCard asset={assets[0]} className="w-full h-full" />
          <MediaCard asset={assets[1]} className="w-full h-full" />
        </div>
        <div className="w-full aspect-[4/5]">
          <MediaCard asset={assets[2]} className="w-full h-full" />
        </div>
      </div>
    );
  }

  return null;
}

function MediaCard({ asset, className }: { asset: BentoAsset; className?: string }) {
  const isText = asset.type === 'text';

  return (
    <FadeUp className="h-full">
      <div 
        className={`group relative overflow-hidden h-full transition-all duration-500 ${className} ${
          isText 
            ? 'bg-transparent border-none' 
            : 'bg-zinc-900/40 border border-white/5 rounded-lg md:rounded-2xl'
        }`}
      >
        {asset.type === 'image' && (
          <img 
            src={asset.src} 
            alt="" 
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
          />
        )}
        
        {asset.type === 'video' && (
          <video 
            src={asset.src} 
            autoPlay muted loop playsInline 
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
          />
        )}

        {asset.type === 'text' && (
          <div className="flex flex-col justify-center items-start h-full py-4 md:py-8 px-2">
            {asset.title && (
              <h4 className="font-space text-[9px] md:text-sm uppercase tracking-[0.1em] md:tracking-[0.2em] text-white/50 mb-3 md:mb-8">
                {asset.title}
              </h4>
            )}
            <p className="text-sm md:text-4xl font-extralight md:font-thin tracking-wider md:tracking-wide text-white leading-snug md:leading-[1.1] max-w-[100%]">
              {asset.content}
            </p>
          </div>
        )}
      </div>
    </FadeUp>
  );
}