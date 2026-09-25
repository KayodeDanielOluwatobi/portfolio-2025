//src/components/works/BentoRenderer.tsx

'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import FadeUp from '@/components/animations/FadeUp';
import { renderFormattedText, isBulletLine, cleanBulletLine } from '@/utils/textFormatter';

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
    <div className="flex flex-col gap-5 sm:gap-7 md:gap-9 w-full">
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
      <div className={`w-full ${isText ? 'pt-4 sm:pt-6 md:pt-8' : ''}`}>
        <MediaCard
          asset={assets[0]}
          className={
            assets[0]?.height
              ? 'w-full'
              : isText
              ? 'w-full'
              : 'aspect-video w-full'
          }
        />
      </div>
    );
  }

  if (layout === 'twin') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 items-start">
        <div className="w-full aspect-[4/5]">
          <MediaCard asset={assets[0]} className="w-full h-full" />
        </div>
        <div className="w-full aspect-[4/5] grid grid-rows-2 gap-3 sm:gap-4 md:gap-5">
          <MediaCard asset={assets[1]} className="w-full h-full" />
          <MediaCard asset={assets[2]} className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (layout === 'big-right') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 items-start">
        <div className="w-full aspect-[4/5] grid grid-rows-2 gap-3 sm:gap-4 md:gap-5">
          <MediaCard asset={assets[0]} className="w-full h-full" />
          <MediaCard asset={assets[1]} className="w-full h-full" />
        </div>
        <div className="w-full aspect-[4/5]">
          <MediaCard asset={assets[2]} className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (layout === 'triple') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        <MediaCard
          asset={assets[0]}
          className={assets[0]?.height ? 'w-full' : 'aspect-[4/5] sm:aspect-[3/4] w-full'}
        />
        <MediaCard
          asset={assets[1]}
          className={assets[1]?.height ? 'w-full' : 'aspect-[4/5] sm:aspect-[3/4] w-full'}
        />
        <MediaCard
          asset={assets[2]}
          className={assets[2]?.height ? 'w-full' : 'aspect-[4/5] sm:aspect-[3/4] w-full'}
        />
      </div>
    );
  }

  return null;
}

function AutoFitText({
  title,
  content,
  customFontSize,
  customHeight: _customHeight,
}: {
  title?: string;
  content?: string;
  customFontSize?: number;
  customHeight?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [computedSize, setComputedSize] = useState<number>(customFontSize || 20);

  // Split on single newlines to preserve the exact number of times Enter is pressed
  const rawLines = content ? content.split(/\r?\n/) : [];

  useEffect(() => {
    if (customFontSize) {
      setComputedSize(customFontSize);
      return;
    }

    const el = containerRef.current;
    if (!el || rawLines.length === 0) return;

    const calculateSize = () => {
      const containerHeight = el.clientHeight;
      const containerWidth = el.clientWidth;
      if (containerHeight <= 0 || containerWidth <= 0) return;

      let min = 12;
      let max = 48;
      let best = min;

      for (let i = 0; i < 8; i++) {
        const mid = (min + max) / 2;
        el.style.fontSize = `${mid}px`;

        const isOverflowing =
          el.scrollHeight > el.clientHeight ||
          el.scrollWidth > el.clientWidth;

        if (isOverflowing) {
          max = mid - 0.5;
        } else {
          best = mid;
          min = mid + 0.5;
        }
      }

      setComputedSize(Math.max(13, Math.floor(best)));
    };

    calculateSize();

    const ro = new ResizeObserver(() => {
      calculateSize();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [content, title, customFontSize, rawLines.length]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full px-0 sm:px-2 md:px-4 py-0 justify-start overflow-visible"
    >
      {title && (
        <h4 className="font-space text-sm sm:text-base md:text-lg uppercase tracking-[0.08em] font-medium text-white/50 mb-3.5 flex-shrink-0 flex items-center flex-wrap">
          {title.split(/([•·])/g).map((part, index) => {
            if (part === '•' || part === '·') {
              return (
                <span
                  key={index}
                  className="inline-flex items-center justify-center mx-2 sm:mx-2.5 select-none opacity-60 self-center -translate-y-[1px]"
                  aria-hidden="true"
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current" />
                </span>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </h4>
      )}
      <div className="w-full overflow-visible flex flex-col gap-1.5 sm:gap-2">
        {rawLines.length > 0 ? (
          rawLines.map((line, pIdx) => {
            // Empty line from Enter keypress -> preserve exact vertical spacing
            if (line.trim() === '') {
              return <div key={pIdx} className="h-3.5 sm:h-4.5 w-full" aria-hidden="true" />;
            }

            const isBullet = isBulletLine(line);
            const contentText = isBullet ? cleanBulletLine(line) : line;

            if (isBullet) {
              return (
                <div
                  key={pIdx}
                  className="flex items-start gap-2.5 sm:gap-3.5 pl-1 sm:pl-2 w-full font-light tracking-normal text-zinc-200 m-0 leading-relaxed sm:leading-[1.7]"
                  style={{
                    fontSize: customFontSize
                      ? `clamp(13px, calc(${Math.max(11, Math.round(customFontSize * 0.4))}px + 1.1vw), ${customFontSize}px)`
                      : `${computedSize}px`,
                    lineHeight: customFontSize ? '1.65' : `${computedSize * 1.5}px`,
                    wordBreak: 'normal',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/70 flex-shrink-0 self-start mt-[0.55em] sm:mt-[0.6em] transition-all"
                    aria-hidden="true"
                  />
                  <div
                    className="flex-1 text-left sm:text-justify"
                    style={{
                      textJustify: 'inter-word',
                      hyphens: 'none',
                      WebkitHyphens: 'none',
                      wordBreak: 'normal',
                    }}
                  >
                    {renderFormattedText(contentText)}
                  </div>
                </div>
              );
            }

            return (
              <p
                key={pIdx}
                className="font-light tracking-normal text-zinc-200 w-full m-0 text-left sm:text-justify leading-relaxed sm:leading-[1.7]"
                style={{
                  fontSize: customFontSize
                    ? `clamp(13px, calc(${Math.max(11, Math.round(customFontSize * 0.4))}px + 1.1vw), ${customFontSize}px)`
                    : `${computedSize}px`,
                  lineHeight: customFontSize ? '1.65' : `${computedSize * 1.5}px`,
                  textJustify: 'inter-word',
                  hyphens: 'none',
                  WebkitHyphens: 'none',
                  wordBreak: 'normal',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {renderFormattedText(contentText)}
              </p>
            );
          })
        ) : null}
      </div>
    </div>
  );
}

function MediaCard({ asset, className }: { asset: BentoAsset; className?: string }) {
  const isText = asset.type === 'text';
  const customHeightStyle = !isText && asset.height
    ? ({ '--card-h': `${asset.height}px` } as React.CSSProperties)
    : undefined;

  return (
    <FadeUp className={isText ? 'w-full h-auto' : 'h-full'}>
      <div 
        style={customHeightStyle}
        className={`group relative overflow-hidden transition-all duration-500 ${className} ${
          !isText && asset.height ? 'md:[height:var(--card-h)] md:[min-height:var(--card-h)]' : ''
        } ${
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