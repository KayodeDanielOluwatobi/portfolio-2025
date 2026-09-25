'use client';

import { useEffect } from 'react';

/**
 * Global client-side image and media protection.
 * - Prevents right-click / context menu on images and videos.
 * - Disables left-click drag-to-save on all media assets.
 * - Disables long-press callout on mobile devices.
 */
export default function ImageProtection() {
  useEffect(() => {
    // 1. Prevent right-click / long-press context menu on all images & videos
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isMedia =
        target.tagName === 'IMG' ||
        target.tagName === 'VIDEO' ||
        target.tagName === 'PICTURE' ||
        target.tagName === 'CANVAS' ||
        target.closest('img') ||
        target.closest('video') ||
        target.closest('[data-protected-media]') ||
        target.classList.contains('image-protected');

      if (isMedia) {
        e.preventDefault();
      }
    };

    // 2. Prevent left-click dragging of images & media
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isMedia =
        target.tagName === 'IMG' ||
        target.tagName === 'VIDEO' ||
        target.tagName === 'PICTURE' ||
        target.closest('img') ||
        target.closest('video') ||
        target.closest('[data-protected-media]');

      if (isMedia) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
    };
  }, []);

  return null;
}
