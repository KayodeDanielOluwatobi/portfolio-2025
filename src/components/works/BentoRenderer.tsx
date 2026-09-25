//src/components/works/BentoRenderer.tsx

'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import FadeUp from '@/components/animations/FadeUp';

interface BentoAsset {
  type: 'image' | 'video' | 'text';
  src?: string;
  content?: string;
  title?: string;
  titleColor?: string;
  fontSize?: number;
  height?: number;
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
    const isText = assets[0]?.type === 'text';
    return (
      <div className="w-full">
        <MediaCard
          asset={assets[0]}
          className={
            assets[0]?.height
              ? 'w-full'
              : isText
              ? 'w-full py-1'
              : 'aspect-video w-full'
          }
        />
      </div>
    );
  }

  if (layout === 'twin') {
    return (
      <div className="grid grid-cols-2 gap-1 md:gap-2">
        <MediaCard
          asset={assets[0]}
          className={assets[0]?.height ? 'w-full' : 'aspect-[4/5] w-full'}
        />
        <MediaCard
          asset={assets[1]}
          className={assets[1]?.height ? 'w-full' : 'aspect-[4/5] w-full'}
        />
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

function AutoFitText({
  title,
  content,
  customFontSize,
  customHeight,
}: {
  title?: string;
  content?: string;
  customFontSize?: number;
  customHeight?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [computedSize, setComputedSize] = useState<number>(customFontSize || 20);

  useEffect(() => {
    if (customFontSize) {
      setComputedSize(customFontSize);
      return;
    }

    const el = containerRef.current;
    const textEl = textRef.current;
    if (!el || !textEl || !content) return;

    const calculateSize = () => {
      const containerHeight = el.clientHeight;
      const containerWidth = el.clientWidth;
      if (containerHeight <= 0 || containerWidth <= 0) return;

      let min = 11;
      let max = 64;
      let best = min;

      for (let i = 0; i < 8; i++) {
        const mid = (min + max) / 2;
        textEl.style.fontSize = `${mid}px`;
        textEl.style.lineHeight = `${mid * 1.3}px`;

        const isOverflowing =
          textEl.scrollHeight > el.clientHeight ||
          textEl.scrollWidth > el.clientWidth;

        if (isOverflowing) {
          max = mid - 0.5;
        } else {
          best = mid;
          min = mid + 0.5;
        }
      }

      setComputedSize(Math.max(12, Math.floor(best)));
    };

    calculateSize();

    const ro = new ResizeObserver(() => {
      calculateSize();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [content, title, customFontSize]);

  return (
    <div
      ref={containerRef}
      style={customHeight ? { minHeight: `${customHeight}px` } : undefined}
      className="flex flex-col w-full px-2 sm:px-4 md:px-6 py-2 md:py-3 justify-start overflow-visible md:overflow-hidden"
    >
      {title && (
        <h4 className="font-space text-[10px] md:text-xs uppercase tracking-[0.06em] text-white/50 mb-2 md:mb-3 flex-shrink-0 flex items-center flex-wrap">
          {title.split(/([•·])/g).map((part, index) => {
            if (part === '•' || part === '·') {
              return (
                <span
                  key={index}
                  className="inline-flex items-center justify-center mx-1.5 select-none opacity-60 self-center -translate-y-[2px]"
                  aria-hidden="true"
                >
                  <span className="w-1 h-1 rounded-full bg-current" />
                </span>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </h4>
      )}
      <div className="w-full overflow-visible md:overflow-hidden">
        <p
          ref={textRef}
          className="font-light tracking-normal text-white w-full m-0 text-left sm:text-justify"
          style={{
            fontSize: customFontSize
              ? `clamp(13px, calc(${Math.max(11, Math.round(customFontSize * 0.4))}px + 1.1vw), ${customFontSize}px)`
              : `${computedSize}px`,
            lineHeight: customFontSize ? '1.45' : `${computedSize * 1.3}px`,
            textJustify: 'inter-word',
            hyphens: 'none',
            WebkitHyphens: 'none',
            wordBreak: 'normal',
          }}
        >
          {content}
        </p>
      </div>
    </div>
  );
}

function MediaCard({ asset, className }: { asset: BentoAsset; className?: string }) {
  const isText = asset.type === 'text';
  const customHeightStyle = !isText && asset.height
    ? { height: `${asset.height}px`, minHeight: `${asset.height}px` }
    : undefined;

  return (
    <FadeUp className={isText ? 'w-full h-auto' : 'h-full'}>
      <div 
        style={customHeightStyle}
        className={`group relative overflow-hidden transition-all duration-500 ${className} ${
          isText 
            ? 'bg-transparent border-none w-full h-auto' 
            : 'bg-zinc-900/40 border border-white/5 rounded-lg md:rounded-2xl h-full'
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
          <AutoFitText
            title={asset.title}
            content={asset.content}
            customFontSize={asset.fontSize}
            customHeight={asset.height}
          />
        )}
      </div>
    </FadeUp>
  );
}