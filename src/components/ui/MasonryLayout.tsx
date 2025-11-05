'use client';

import { ReactNode, useEffect, useRef } from 'react';
import styles from './MasonryLayout.module.css';

interface MasonryLayoutProps {
  children: ReactNode;
  columns?: number;
  gap?: string;
  staggerMs?: number; // milliseconds between staggered items
}

export default function MasonryLayout({
  children,
  columns = 4,
  gap = '1.5rem',
  staggerMs = 90,
}: MasonryLayoutProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Get direct child nodes (these should be the masonry items)
    const items = Array.from(root.children) as HTMLElement[];

    // Set column styling inline (keeps it easy to control from props)
    root.style.columnCount = String(columns);
    root.style.columnGap = gap;

    // Helper to mark an item as "ready" (adds show class)
    const markShow = (el: HTMLElement, idx: number) => {
      // set staggered delay
      el.style.animationDelay = `${idx * staggerMs}ms`;
      el.classList.add(styles.show);
    };

    // For each item, find any images inside and wait for them to load
    items.forEach((item, idx) => {
      // If ProjectCard wraps the actual <img>, we query inside the item
      const imgs = Array.from(item.querySelectorAll('img')) as HTMLImageElement[];

      if (imgs.length === 0) {
        // No images; just show it with the stagger
        markShow(item, idx);
        return;
      }

      // Wait for all images inside this item to be loaded
      let remaining = imgs.length;

      const onLoaded = () => {
        remaining -= 1;
        if (remaining <= 0) {
          // small micro-delay to allow layout settle
          requestAnimationFrame(() => markShow(item, idx));
        }
      };

      imgs.forEach(img => {
        if (img.complete && img.naturalWidth !== 0) {
          // already loaded (from cache)
          onLoaded();
        } else {
          // attach listener
          img.addEventListener('load', onLoaded, { once: true });
          img.addEventListener('error', onLoaded, { once: true }); // treat errors as "loaded" so UI doesn't hang
        }
      });
    });

    // Cleanup not strictly necessary because we used { once: true }, but keep generic
    return () => {
      // remove any leftover listeners if necessary (we used once: true above)
    };
  }, [children, columns, gap, staggerMs]);

  return (
    <div ref={rootRef} className={styles.masonry}>
      {children}
    </div>
  );
}
