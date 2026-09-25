//src/utils/textFormatter.tsx

import React from 'react';

/**
 * Parses markdown-like inline formatting:
 * - `**bold**` -> <strong className="font-semibold text-white">
 * - `*italic*` or `_italic_` -> <em className="italic text-zinc-300">
 * - `` `title mono` `` or `^title mono^` -> <span className="font-space uppercase tracking-[0.08em] text-white/70 text-[0.88em] inline-block">
 */
export function renderFormattedText(text: string): React.ReactNode {
  if (!text) return null;

  // Regex pattern matching:
  // 1. **bold**
  // 2. *italic* or _italic_
  // 3. `mono/title` or ^mono/title^
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`|\^[^^]+\^)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-white">
          {inner}
        </strong>
      );
    }

    // Title / Monospace Tag Style: `text` or ^text^
    if (
      (part.startsWith('`') && part.endsWith('`') && part.length > 2) ||
      (part.startsWith('^') && part.endsWith('^') && part.length > 2)
    ) {
      const inner = part.slice(1, -1);
      return (
        <span
          key={index}
          className="font-space uppercase tracking-[0.08em] text-white/70 text-[0.88em] inline-block font-normal select-text"
        >
          {inner}
        </span>
      );
    }

    // Italic: *text* or _text_
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length > 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length > 2)
    ) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic text-zinc-300">
          {inner}
        </em>
      );
    }

    return part;
  });
}

/**
 * Checks if a line or paragraph starts with a bullet marker:
 * - `• ` (bullet point)
 * - `- ` (dash)
 * - `* ` (asterisk)
 */
export function isBulletLine(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return (
    trimmed.startsWith('•') ||
    trimmed.startsWith('- ') ||
    trimmed.startsWith('* ')
  );
}

/**
 * Removes the bullet prefix from a line
 */
export function cleanBulletLine(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.startsWith('•')) {
    return trimmed.slice(1).trim();
  }
  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    return trimmed.slice(2).trim();
  }
  return trimmed;
}
