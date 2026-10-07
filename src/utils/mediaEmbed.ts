/**
 * Media Embed Utilities
 * Detects and normalizes embeddable media URLs (Lottie, Vimeo, YouTube, etc.)
 * and allows direct iframe snippets to be parsed automatically.
 */

export function extractMediaUrl(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (trimmed.includes('<iframe')) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return trimmed;
}

export function isEmbedMediaUrl(raw?: string): boolean {
  if (!raw) return false;
  const clean = extractMediaUrl(raw).toLowerCase();
  return (
    raw.trim().includes('<iframe') ||
    clean.includes('lottie.host') ||
    clean.includes('.lottie') ||
    clean.includes('vimeo.com') ||
    clean.includes('player.vimeo') ||
    clean.includes('youtube.com') ||
    clean.includes('youtu.be') ||
    clean.includes('/embed/')
  );
}

export function formatEmbedUrl(raw?: string): string {
  const url = extractMediaUrl(raw);
  if (!url) return '';

  // YouTube standard watch URL
  if (url.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(url);
      const v = parsed.searchParams.get('v');
      if (v) {
        return `https://www.youtube.com/embed/${v}?autoplay=1&mute=1&loop=1&playlist=${v}&controls=0`;
      }
    } catch {}
  }

  // YouTube short URL
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    if (id) {
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0`;
    }
  }

  // Vimeo standard URL
  if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0];
    if (id && /^\d+$/.test(id)) {
      return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1`;
    }
  }

  return url;
}
