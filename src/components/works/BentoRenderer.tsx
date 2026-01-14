'use client';

import { motion } from 'framer-motion';
import FadeUp from '@/components/animations/FadeUp';

interface BentoAsset {
  type: 'image' | 'video' | 'text';
  src?: string;
  content?: string;
  title?: string;
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

  // Pattern 1: FULL (16:9 - Spans full width)
  if (layout === 'full') {
    return (
      <div className="w-full">
        <MediaCard asset={assets[0]} className="aspect-video w-full" />
      </div>
    );
  }

  // Pattern 2: TWIN (Always 2 columns)
  if (layout === 'twin') {
    return (
      <div className="grid grid-cols-2 gap-1 md:gap-2">
        <MediaCard asset={assets[0]} className="aspect-[4/5] w-full" />
        <MediaCard asset={assets[1]} className="aspect-[4/5] w-full" />
      </div>
    );
  }

  // Pattern 3: BIG-LEFT (Always 2 columns: Tall Left, Stacked Right)
  if (layout === 'big-left') {
    return (
      <div className="grid grid-cols-2 gap-1 md:gap-2 items-start">
        {/* Left: 4:5 aspect ratio card */}
        <div className="w-full aspect-[4/5]">
          <MediaCard asset={assets[0]} className="w-full h-full" />
        </div>
        
        {/* Right: Two cards that split the height equally */}
        <div className="w-full aspect-[4/5] grid grid-rows-2 gap-1 md:gap-2">
          <MediaCard asset={assets[1]} className="w-full h-full" />
          <MediaCard asset={assets[2]} className="w-full h-full" />
        </div>
      </div>
    );
  }

  // Pattern 4: BIG-RIGHT (Always 2 columns: Stacked Left, Tall Right)
  if (layout === 'big-right') {
    return (
      <div className="grid grid-cols-2 gap-1 md:gap-2 items-start">
        {/* Left: Two cards that split the height equally */}
        <div className="w-full aspect-[4/5] grid grid-rows-2 gap-1 md:gap-2">
          <MediaCard asset={assets[0]} className="w-full h-full" />
          <MediaCard asset={assets[1]} className="w-full h-full" />
        </div>
        
        {/* Right: 4:5 aspect ratio card */}
        <div className="w-full aspect-[4/5]">
          <MediaCard asset={assets[2]} className="w-full h-full" />
        </div>
      </div>
    );
  }

  return null;
}

function MediaCard({ asset, className }: { asset: BentoAsset; className?: string }) {
  return (
    <FadeUp className="h-full">
      <div className={`group relative overflow-hidden rounded-lg md:rounded-2xl bg-zinc-900/40 border border-white/5 h-full ${className}`}>
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
          <div className="p-4 md:p-12 flex flex-col justify-center h-full bg-zinc-900/10">
            {asset.title && (
              <h4 className="font-space text-[8px] md:text-xs uppercase tracking-[0.4em] text-zinc-600 mb-2 md:mb-6">
                {asset.title}
              </h4>
            )}
            <p className="text-[10px] sm:text-xs md:text-xl font-light text-zinc-300 leading-tight md:leading-relaxed">
              {asset.content}
            </p>
          </div>
        )}
      </div>
    </FadeUp>
  );
}