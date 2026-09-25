'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { renderFormattedText, isBulletLine, cleanBulletLine } from '@/utils/textFormatter';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LayoutType = 'full' | 'twin' | 'triple' | 'big-left' | 'big-right';
type AssetType = 'image' | 'video' | 'text';
type TableName = 'works_brands' | 'works_socials' | 'works_church' | 'works_publishing';
type CategoryFilter = 'all' | TableName;
type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

interface BentoAsset {
  type: AssetType;
  src?: string;
  content?: string;
  title?: string;
  titleColor?: string;
  fontSize?: number;
  height?: number;
}

interface BentoRow {
  id: string; // client-side DnD key only — stripped before saving
  layout: LayoutType;
  assets: BentoAsset[];
}

interface ProjectEntry {
  id: number;
  slug: string;
  title: string;
  table: TableName;
  hasCaseStudy: boolean;
  rowCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SLOT_COUNTS: Record<LayoutType, number> = {
  full: 1,
  twin: 2,
  triple: 3,
  'big-left': 3,
  'big-right': 3,
};

const SLOT_LABELS: Record<LayoutType, string[]> = {
  full: ['Main'],
  twin: ['Left', 'Right'],
  triple: ['Left (1/3)', 'Middle (1/3)', 'Right (1/3)'],
  'big-left': ['Big (Left)', 'Top Right', 'Bottom Right'],
  'big-right': ['Top Left', 'Bottom Left', 'Big (Right)'],
};

const TABLE_LABELS: Record<TableName, string> = {
  works_brands: 'Brands',
  works_socials: 'Socials',
  works_church: 'Church',
  works_publishing: 'Publishing',
};

const TABLE_BADGE: Record<TableName, string> = {
  works_brands: 'bg-violet-500/20 text-violet-300 border-violet-500/20',
  works_socials: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  works_church: 'bg-amber-500/20 text-amber-300 border-amber-500/20',
  works_publishing: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function createEmptyAsset(): BentoAsset {
  return { type: 'image' };
}

function createEmptyRow(layout: LayoutType): BentoRow {
  return {
    id: crypto.randomUUID(),
    layout,
    assets: Array.from({ length: SLOT_COUNTS[layout] }, createEmptyAsset),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout Picker Modal
// ─────────────────────────────────────────────────────────────────────────────

function LayoutPreviewBox({ layout }: { layout: LayoutType }) {
  const base = 'rounded bg-white/25';
  if (layout === 'full') {
    return <div className={`${base} w-full h-full`} />;
  }
  if (layout === 'twin') {
    return (
      <div className="w-full h-full grid grid-cols-2 gap-1">
        <div className={base} />
        <div className={base} />
      </div>
    );
  }
  if (layout === 'triple') {
    return (
      <div className="w-full h-full grid grid-cols-3 gap-1">
        <div className={base} />
        <div className={base} />
        <div className={base} />
      </div>
    );
  }
  if (layout === 'big-left') {
    return (
      <div className="w-full h-full grid grid-cols-2 gap-1">
        <div className={base} />
        <div className="grid grid-rows-2 gap-1">
          <div className={base} />
          <div className={base} />
        </div>
      </div>
    );
  }
  // big-right
  return (
    <div className="w-full h-full grid grid-cols-2 gap-1">
      <div className="grid grid-rows-2 gap-1">
        <div className={base} />
        <div className={base} />
      </div>
      <div className={base} />
    </div>
  );
}

function LayoutPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (l: LayoutType) => void;
  onClose: () => void;
}) {
  const layouts: { type: LayoutType; label: string }[] = [
    { type: 'full', label: 'Full Width' },
    { type: 'twin', label: 'Twin (2 Columns)' },
    { type: 'triple', label: 'Triple (3 Columns)' },
    { type: 'big-left', label: 'Big Left' },
    { type: 'big-right', label: 'Big Right' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-light text-base tracking-wide">
            Choose Row Layout
          </h3>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors w-7 h-7 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {layouts.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => {
                onSelect(type);
                onClose();
              }}
              className="group border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-all text-left"
            >
              <div className="h-16 mb-3 p-1">
                <LayoutPreviewBox layout={type} />
              </div>
              <p className="text-white/70 group-hover:text-white text-sm transition-colors">
                {label}
              </p>
              <p className="text-white/25 text-xs mt-0.5">
                {SLOT_COUNTS[type]} slot{SLOT_COUNTS[type] > 1 ? 's' : ''}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Text Studio & Asset Editor
// ─────────────────────────────────────────────────────────────────────────────

function TextAssetEditor({
  asset,
  slotLabel,
  onChange,
}: {
  asset: BentoAsset;
  slotLabel: string;
  onChange: (asset: BentoAsset) => void;
}) {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [studioPreviewMode, setStudioPreviewMode] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const studioTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Close Studio on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStudioOpen) {
        setIsStudioOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStudioOpen]);

  // Interactive Drag-to-Resize Handler (Bottom Edge & Corner Crosshair)
  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHeight(true);

    const startY = e.clientY;
    const initialHeight = asset.height || 300;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(140, Math.min(850, Math.round(initialHeight + deltaY)));
      onChange({ ...asset, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsDraggingHeight(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ── Format Selection Handler (Bold: **, Italic: *, Title Mono: `, Bullet: •) ──
  const applyFormat = (syntax: '**' | '*' | '`' | '•', isStudio: boolean = false) => {
    const textarea = isStudio ? studioTextareaRef.current : textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;
    const raw = asset.content || '';
    const selectedText = raw.substring(start, end);

    let newContent = '';
    let newStart = start;
    let newEnd = end;

    if (syntax === '•') {
      if (selectedText.length === 0) {
        const placeholder = '• List item';
        newContent = raw.slice(0, start) + placeholder + raw.slice(end);
        newStart = start + 2;
        newEnd = start + placeholder.length;
      } else {
        const lines = selectedText.split('\n');
        const allBullet = lines.every((l) => l.trim().startsWith('•'));
        const newLines = lines.map((l) => {
          if (allBullet) {
            return l.replace(/^\s*•\s*/, '');
          } else {
            return l.trim().length > 0 ? (l.startsWith('• ') ? l : `• ${l}`) : l;
          }
        });
        const replaced = newLines.join('\n');
        newContent = raw.slice(0, start) + replaced + raw.slice(end);
        newStart = start;
        newEnd = start + replaced.length;
      }
    } else {
      const len = syntax.length;

      if (selectedText.length === 0) {
        const placeholder = syntax === '**' ? 'bold text' : syntax === '*' ? 'italic text' : 'MONOSPACE TAG';
        newContent = raw.slice(0, start) + syntax + placeholder + syntax + raw.slice(end);
        newStart = start + len;
        newEnd = start + len + placeholder.length;
      } else {
        const isAlreadyWrapped =
          selectedText.startsWith(syntax) && selectedText.endsWith(syntax) && selectedText.length >= len * 2;
        const isOuterWrapped =
          start >= len &&
          end + len <= raw.length &&
          raw.slice(start - len, start) === syntax &&
          raw.slice(end, end + len) === syntax;

        if (isAlreadyWrapped) {
          const unwrapped = selectedText.slice(len, -len);
          newContent = raw.slice(0, start) + unwrapped + raw.slice(end);
          newStart = start;
          newEnd = start + unwrapped.length;
        } else if (isOuterWrapped) {
          newContent = raw.slice(0, start - len) + selectedText + raw.slice(end + len);
          newStart = start - len;
          newEnd = end - len;
        } else {
          newContent = raw.slice(0, start) + syntax + selectedText + syntax + raw.slice(end);
          newStart = start;
          newEnd = end + len * 2;
        }
      }
    }

    onChange({ ...asset, content: newContent });

    // Lock scroll position and restore exact selection without snapping to bottom
    requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(newStart, newEnd);
        textarea.scrollTop = scrollTop;
        textarea.scrollLeft = scrollLeft;
      }
    });
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    isStudio: boolean = false
  ) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        applyFormat('**', isStudio);
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        applyFormat('*', isStudio);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        applyFormat('`', isStudio);
      }
    }
  };

  return (
    <>
      {/* ── Inline Slot Card (Unified 2-in-1 WYSIWYG Canvas) ── */}
      <div className="flex flex-col gap-2.5">
        {/* Top Action & Focus Mode Bar */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsStudioOpen(true)}
            className="py-1.5 px-3 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 hover:text-cyan-200 text-xs font-space tracking-wider uppercase transition-all flex items-center gap-2 group shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Open Desktop Studio</span>
            <span className="text-[10px] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">↗</span>
          </button>

          {/* Quick Sliders Toggle */}
          <button
            type="button"
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-space flex items-center gap-1.5 transition-all"
          >
            <span className="text-[10px] font-mono text-cyan-400">◈</span>
            <span className="text-[11px]">{isControlsCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`w-3 h-3 transition-transform duration-200 ${
                isControlsCollapsed ? 'rotate-180 text-white/40' : 'text-cyan-400'
              }`}
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
        </div>

        {/* Collapsible Inspector Drawer */}
        {!isControlsCollapsed && (
          <div className="bg-black/60 border border-white/10 rounded-xl p-3 flex flex-col gap-3 animate-in fade-in duration-150">
            {/* Font Size Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 text-[11px]">Font Size</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-300 text-xs font-semibold">
                    {asset.fontSize ? `${asset.fontSize}px` : 'Auto-Fit'}
                  </span>
                  {asset.fontSize && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...asset, fontSize: undefined })}
                      className="text-[10px] text-white/30 hover:text-white/70 underline"
                    >
                      Reset Auto
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="12"
                max="64"
                step="1"
                value={asset.fontSize || 24}
                onChange={(e) =>
                  onChange({ ...asset, fontSize: parseInt(e.target.value, 10) })
                }
                className="w-full accent-cyan-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Height Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 text-[11px]">Box Height</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-300 text-xs font-semibold">
                    {asset.height ? `${asset.height}px` : 'Auto (Fluid)'}
                  </span>
                  {asset.height && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...asset, height: undefined })}
                      className="text-[10px] text-white/30 hover:text-white/70 underline"
                    >
                      Reset Fluid
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="140"
                max="700"
                step="10"
                value={asset.height || 300}
                onChange={(e) =>
                  onChange({ ...asset, height: parseInt(e.target.value, 10) })
                }
                className="w-full accent-cyan-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />

              {/* Quick Height Presets */}
              <div className="flex gap-1.5 pt-0.5 flex-wrap">
                {[
                  { label: 'Auto', val: undefined },
                  { label: '220px', val: 220 },
                  { label: '340px', val: 340 },
                  { label: '480px', val: 480 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onChange({ ...asset, height: preset.val })}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      asset.height === preset.val || (!asset.height && preset.val === undefined)
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-white/5 text-white/30 hover:text-white/60 border border-transparent'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 2-in-1 WYSIWYG Editable Text Box with Crosshairs & Drag Controls ── */}
        <div
          ref={canvasRef}
          className={`relative rounded-xl border bg-zinc-950 p-4 sm:p-5 flex flex-col justify-start overflow-hidden transition-all shadow-lg ${
            isDraggingHeight
              ? 'border-cyan-400 ring-1 ring-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
              : 'border-cyan-500/30 hover:border-cyan-400/60'
          }`}
          style={{
            height: asset.height ? `${Math.min(320, asset.height * 0.7)}px` : 'auto',
            minHeight: '160px',
          }}
        >
          {/* 4 Corner Crosshairs */}
          <span className="absolute top-1.5 left-1.5 font-mono text-[11px] text-cyan-400/60 leading-none pointer-events-none select-none">
            +
          </span>
          <span className="absolute top-1.5 right-1.5 font-mono text-[11px] text-cyan-400/60 leading-none pointer-events-none select-none">
            +
          </span>
          <span className="absolute bottom-2 left-1.5 font-mono text-[11px] text-cyan-400/60 leading-none pointer-events-none select-none">
            +
          </span>

          {/* Bottom-Right Interactive Crosshair Drag Handle */}
          <div
            onMouseDown={handleStartResize}
            title="Drag corner crosshair to resize box height"
            className="absolute bottom-1 right-1 px-1.5 py-1 cursor-ns-resize z-20 group flex items-center gap-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 rounded transition-all select-none"
          >
            <span className="font-mono text-xs font-bold text-cyan-300 group-hover:scale-125 transition-transform inline-block">
              +
            </span>
            <span className="text-[9px] font-mono text-cyan-300 font-semibold">
              {asset.height ? `${asset.height}px` : 'Auto'}
            </span>
          </div>

          {/* Formatting Quick-Toolbar & Dimension Badge */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/5 relative z-10">
            {/* Inline Formatting Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('**', false)}
                title="Bold (Ctrl+B) - Wraps selected text in **bold**"
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[11px] transition-colors"
              >
                B
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('*', false)}
                title="Italic (Ctrl+I) - Wraps selected text in *italic*"
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-300 italic font-serif text-[11px] transition-colors"
              >
                I
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('`', false)}
                title="Title Monospace Style (Ctrl+M) - Wraps selected text in `TITLE MONO` format"
                className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-space text-[9px] uppercase tracking-wider font-semibold transition-colors"
              >
                `TAG`
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('•', false)}
                title="Bullet List Item (• text)"
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[11px] flex items-center gap-1 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                <span className="font-mono text-[10px]">List</span>
              </button>
            </div>

            {/* Live Preview Toggle & Badges */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-2 py-0.5 rounded text-[10px] font-space tracking-wider uppercase transition-colors ${
                  previewMode
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-white/5 text-white/40 hover:text-white/70 border border-white/5'
                }`}
              >
                {previewMode ? '👁️ Previewing' : '✏️ Edit'}
              </button>
              <span className="font-mono text-[9px] text-cyan-400/80 select-none">
                {asset.height ? `${asset.height}px` : 'Auto H'}
              </span>
            </div>
          </div>

          {/* ── Direct In-Box Editable Title ── */}
          <div className="w-full flex-shrink-0 mb-2 relative z-10">
            <input
              type="text"
              placeholder="TITLE (OPTIONAL HEADER)"
              value={asset.title || ''}
              onChange={(e) => onChange({ ...asset, title: e.target.value })}
              className="w-full bg-transparent border-none p-0 text-white/50 focus:text-white/90 font-space text-sm sm:text-base font-medium uppercase tracking-[0.08em] placeholder:text-white/20 focus:outline-none transition-colors select-text"
            />
          </div>

          {/* ── Direct In-Box Editable or Live Preview Justified Body Text ── */}
          <div className="w-full flex-1 flex items-stretch relative z-10 overflow-hidden pb-3">
            {previewMode ? (
              <div
                onClick={() => setPreviewMode(false)}
                title="Click anywhere to return to editor"
                className="w-full h-full overflow-y-auto flex flex-col gap-2.5 cursor-text text-zinc-200"
                style={{
                  fontSize: asset.fontSize ? `${Math.max(12, asset.fontSize * 0.75)}px` : '13px',
                  lineHeight: asset.fontSize ? `${Math.max(16, asset.fontSize * 1.05)}px` : '18px',
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                }}
              >
                {asset.content ? (
                  (asset.content || '').split(/\r?\n/).map((line, i) => {
                    if (line.trim() === '') {
                      return <div key={i} className="h-2.5 w-full" aria-hidden="true" />;
                    }

                    const isBullet = isBulletLine(line);
                    const txt = isBullet ? cleanBulletLine(line) : line;

                    if (isBullet) {
                      return (
                        <div key={i} className="flex items-start gap-2 pl-1 w-full text-justify font-light text-zinc-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/70 mt-1.5 flex-shrink-0" />
                          <div className="flex-1 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
                            {renderFormattedText(txt)}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <p
                        key={i}
                        className="font-light tracking-normal text-zinc-200 leading-relaxed text-justify"
                        style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                      >
                        {renderFormattedText(txt)}
                      </p>
                    );
                  })
                ) : (
                  <span className="text-white/20 italic text-xs">No text written yet…</span>
                )}
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                placeholder="Click here to type… Highlight text and click B, I, `TAG`, or • List to format."
                value={asset.content || ''}
                onChange={(e) => onChange({ ...asset, content: e.target.value })}
                onKeyDown={(e) => handleTextareaKeyDown(e, false)}
                className="w-full h-full bg-transparent border-none p-0 text-zinc-200 font-light tracking-normal placeholder:text-white/20 focus:outline-none resize-none select-text leading-snug"
                style={{
                  fontSize: asset.fontSize ? `${Math.max(12, asset.fontSize * 0.75)}px` : '13px',
                  lineHeight: asset.fontSize ? `${Math.max(16, asset.fontSize * 1.05)}px` : '18px',
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                }}
              />
            )}
          </div>

          {/* Interactive Bottom Drag Bar */}
          <div
            onMouseDown={handleStartResize}
            className="absolute bottom-0 inset-x-0 h-3 bg-cyan-500/10 hover:bg-cyan-500/30 cursor-ns-resize flex items-center justify-center transition-colors group z-20"
            title="Drag up or down to adjust box height"
          >
            <div className="w-12 h-1 bg-cyan-400/50 group-hover:bg-cyan-300 group-hover:w-20 transition-all rounded-full" />
          </div>
        </div>
      </div>

      {/* ── 🌟 FOREGROUND FOCUS STUDIO (Blurred Background Mode) ── */}
      {isStudioOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex flex-col p-4 sm:p-8 overflow-y-auto animate-in fade-in duration-200">
          {/* Studio Top Control Bar */}
          <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4 pb-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <div>
                <h3 className="font-space uppercase tracking-widest text-sm text-white font-medium flex items-center gap-2">
                  <span>Text Studio</span>
                  <span className="text-white/20">/</span>
                  <span className="text-cyan-300 text-xs">{slotLabel}</span>
                </h3>
                <p className="text-[11px] text-white/40">
                  Select text & use <span className="text-white font-semibold">Ctrl+B</span> (Bold),{' '}
                  <span className="text-white font-semibold">Ctrl+I</span> (Italic),{' '}
                  <span className="text-cyan-300 font-semibold">Ctrl+M</span> (Title Tag)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Collapse / Expand Sliders Toggle */}
              <button
                type="button"
                onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-space flex items-center gap-2 transition-all"
              >
                <span>{isControlsCollapsed ? 'Show Sliders' : 'Collapse Sliders'}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isControlsCollapsed ? 'rotate-180' : ''
                  }`}
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </button>

              {/* Close / Return Button */}
              <button
                type="button"
                onClick={() => setIsStudioOpen(false)}
                className="px-4 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-space font-medium tracking-wider uppercase transition-all shadow-lg"
              >
                Done & Return (Esc)
              </button>
            </div>
          </div>

          {/* Collapsible Top Inspector in Studio */}
          {!isControlsCollapsed && (
            <div className="max-w-6xl w-full mx-auto mt-4 p-4 rounded-2xl bg-zinc-950/90 border border-cyan-500/20 shadow-2xl flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-2 duration-200 flex-shrink-0">
              {/* Font Size Slider */}
              <div className="flex-1 w-full flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70 text-xs font-space uppercase tracking-wider">
                    Font Size (Desktop)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-300 text-sm font-semibold">
                      {asset.fontSize ? `${asset.fontSize}px` : 'Auto-Fit'}
                    </span>
                    {asset.fontSize && (
                      <button
                        type="button"
                        onClick={() => onChange({ ...asset, fontSize: undefined })}
                        className="text-[10px] text-white/30 hover:text-white/70 underline"
                      >
                        Reset Auto
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="12"
                  max="72"
                  step="1"
                  value={asset.fontSize || 24}
                  onChange={(e) =>
                    onChange({ ...asset, fontSize: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-cyan-400 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Height Slider */}
              <div className="flex-1 w-full flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70 text-xs font-space uppercase tracking-wider">
                    Box Height (Desktop)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-300 text-sm font-semibold">
                      {asset.height ? `${asset.height}px` : 'Auto (Fluid)'}
                    </span>
                    {asset.height && (
                      <button
                        type="button"
                        onClick={() => onChange({ ...asset, height: undefined })}
                        className="text-[10px] text-white/30 hover:text-white/70 underline"
                      >
                        Reset Fluid
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="140"
                  max="850"
                  step="10"
                  value={asset.height || 340}
                  onChange={(e) =>
                    onChange({ ...asset, height: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-cyan-400 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-col gap-1.5 w-full md:w-auto flex-shrink-0">
                <span className="text-white/40 text-[10px] uppercase font-space tracking-wider">
                  Presets
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { label: 'Auto', val: undefined },
                    { label: '220px', val: 220 },
                    { label: '340px', val: 340 },
                    { label: '480px', val: 480 },
                    { label: '640px', val: 640 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => onChange({ ...asset, height: preset.val })}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                        asset.height === preset.val || (!asset.height && preset.val === undefined)
                          ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                          : 'bg-white/5 text-white/40 hover:text-white/70 border border-transparent'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Desktop Canvas Container (Exact Case Study Proportion) */}
          <div className="max-w-6xl w-full mx-auto my-auto py-8 flex flex-col items-center justify-center">
            {/* The True Desktop 2-in-1 WYSIWYG Text Box */}
            <div
              className={`relative w-full rounded-2xl border bg-black/90 p-8 sm:p-12 overflow-hidden transition-all shadow-2xl flex flex-col justify-start ${
                isDraggingHeight
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.25)]'
                  : 'border-cyan-500/40 hover:border-cyan-400/70'
              }`}
              style={{
                height: asset.height ? `${asset.height}px` : 'auto',
                minHeight: '240px',
              }}
            >
              {/* ── Corner Crosshairs ── */}
              <div className="absolute top-3 left-3 flex items-center gap-1 font-mono text-xs text-cyan-400/70 select-none pointer-events-none">
                <span className="text-base font-bold leading-none">+</span>
                <span className="text-[9px] text-cyan-400/40 uppercase font-space">TL</span>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1 font-mono text-xs text-cyan-400/70 select-none pointer-events-none">
                <span className="text-[9px] text-cyan-400/40 uppercase font-space">TR</span>
                <span className="text-base font-bold leading-none">+</span>
              </div>
              <div className="absolute bottom-4 left-3 flex items-center gap-1 font-mono text-xs text-cyan-400/70 select-none pointer-events-none">
                <span className="text-base font-bold leading-none">+</span>
                <span className="text-[9px] text-cyan-400/40 uppercase font-space">BL</span>
              </div>

              {/* Bottom-Right Interactive Crosshair Corner Drag Handle */}
              <div
                onMouseDown={handleStartResize}
                title="Drag corner crosshair to resize box height"
                className="absolute bottom-2 right-2 p-2 cursor-ns-resize z-30 group flex items-center gap-1 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 rounded-lg transition-all select-none"
              >
                <span className="font-mono text-sm font-bold text-cyan-300 group-hover:scale-125 transition-transform inline-block">
                  +
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-semibold pr-1">
                  {asset.height ? `${asset.height}px` : 'Auto'}
                </span>
              </div>

              {/* Top Studio Formatting Toolbar */}
              <div className="w-full flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10 relative z-20">
                {/* Selection Formatting Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyFormat('**', true)}
                    title="Bold Selection (Ctrl+B)"
                    className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>B</span>
                    <span className="text-[10px] text-white/50 font-normal">Bold</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyFormat('*', true)}
                    title="Italic Selection (Ctrl+I)"
                    className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-zinc-200 italic font-serif text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>I</span>
                    <span className="text-[10px] text-white/50 font-sans not-italic font-normal">Italic</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyFormat('`', true)}
                    title="Monospace Title Format Selection (Ctrl+M)"
                    className="px-3 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-space text-[10px] tracking-wider uppercase font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>`TAG`</span>
                    <span className="text-[9px] text-cyan-400/60 font-normal">Title Style</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyFormat('•', true)}
                    title="Bullet List Item (• text)"
                    className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                    <span className="font-mono text-[10px]">List</span>
                  </button>
                </div>

                {/* Studio Live Preview Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStudioPreviewMode(!studioPreviewMode)}
                    className={`px-3 py-1 rounded-full text-xs font-space uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                      studioPreviewMode
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>{studioPreviewMode ? '👁️ Live Render' : '✏️ Raw Markdown'}</span>
                  </button>
                  <div className="font-mono text-[10px] bg-cyan-950/90 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/40 select-none">
                    {asset.height ? `${asset.height}px H` : 'AUTO H'} · {asset.fontSize ? `${asset.fontSize}px FONT` : 'AUTO FONT'}
                  </div>
                </div>
              </div>

              {/* Direct In-Canvas Title Editor */}
              <div className="w-full flex-shrink-0 mb-3 relative z-10">
                <input
                  type="text"
                  placeholder="TITLE (OPTIONAL UPPERCASE HEADER - E.G. CHRISTIAN ORGANIZATION • 2025)"
                  value={asset.title || ''}
                  onChange={(e) => onChange({ ...asset, title: e.target.value })}
                  className="w-full bg-transparent border-none p-0 text-white/50 focus:text-white/90 font-space text-base md:text-lg font-medium uppercase tracking-[0.08em] placeholder:text-white/20 focus:outline-none transition-colors select-text"
                />
              </div>

              {/* Direct In-Canvas Body Content Editor (Full Real-time Justified Rendering or Live Preview) */}
              <div className="w-full flex-1 flex items-stretch relative z-10 overflow-hidden pb-4">
                {studioPreviewMode ? (
                  <div
                    onClick={() => setStudioPreviewMode(false)}
                    title="Click anywhere to return to editor"
                    className="w-full h-full overflow-y-auto flex flex-col gap-4 cursor-text text-zinc-200"
                    style={{
                      fontSize: asset.fontSize ? `${asset.fontSize}px` : '24px',
                      lineHeight: asset.fontSize ? `${asset.fontSize * 1.35}px` : '32px',
                      textAlign: 'justify',
                      textJustify: 'inter-word',
                    }}
                  >
                    {asset.content ? (
                      (asset.content || '').split(/\r?\n/).map((line, i) => {
                        if (line.trim() === '') {
                          return <div key={i} className="h-3.5 sm:h-4.5 w-full" aria-hidden="true" />;
                        }

                        const isBullet = isBulletLine(line);
                        const txt = isBullet ? cleanBulletLine(line) : line;

                        if (isBullet) {
                          return (
                            <div key={i} className="flex items-start gap-3 pl-2 w-full text-justify font-light text-zinc-200">
                              <span className="w-2 h-2 rounded-full bg-white/70 mt-2.5 flex-shrink-0" />
                              <div className="flex-1 text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
                                {renderFormattedText(txt)}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <p
                            key={i}
                            className="font-light tracking-normal text-zinc-200 leading-relaxed text-justify"
                            style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                          >
                            {renderFormattedText(txt)}
                          </p>
                        );
                      })
                    ) : (
                      <span className="text-white/20 italic text-sm">No text written yet…</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    ref={studioTextareaRef}
                    placeholder="Click here to type your story… Select text & press Ctrl+B (Bold), Ctrl+I (Italic), or Ctrl+M (Title Monospace Tag)."
                    value={asset.content || ''}
                    onChange={(e) => onChange({ ...asset, content: e.target.value })}
                    onKeyDown={(e) => handleTextareaKeyDown(e, true)}
                    className="w-full h-full bg-transparent border-none p-0 text-zinc-200 font-light tracking-normal placeholder:text-white/20 focus:outline-none resize-none select-text leading-relaxed"
                    style={{
                      fontSize: asset.fontSize ? `${asset.fontSize}px` : '24px',
                      lineHeight: asset.fontSize ? `${asset.fontSize * 1.35}px` : '32px',
                      textAlign: 'justify',
                      textJustify: 'inter-word',
                    }}
                  />
                )}
              </div>

              {/* Interactive Bottom Edge Drag Handle Bar */}
              <div
                onMouseDown={handleStartResize}
                className="absolute bottom-0 inset-x-0 h-4 bg-cyan-500/10 hover:bg-cyan-500/30 cursor-ns-resize flex items-center justify-center transition-all group border-t border-cyan-500/20 z-20"
                title="Click and drag up or down to adjust desktop box height"
              >
                <div className="w-20 h-1 bg-cyan-400/50 group-hover:bg-cyan-300 group-hover:w-28 transition-all rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Asset Slot Editor
// ─────────────────────────────────────────────────────────────────────────────

function AssetSlotEditor({
  asset,
  slotLabel,
  table,
  slug,
  onChange,
}: {
  asset: BentoAsset;
  slotLabel: string;
  table: TableName;
  slug: string;
  onChange: (asset: BentoAsset) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: 'image' | 'video') => {
    setUploading(true);
    setUploadMsg(type === 'image' ? 'Converting to AVIF…' : 'Uploading…');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    fd.append('table', table);
    fd.append('slug', slug);

    try {
      const res = await fetch('/api/admin/upload-asset', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      onChange({ ...asset, type, src: json.url });
      setUploadMsg('');
    } catch (err: any) {
      setUploadMsg(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    handleUpload(file, isVideo ? 'video' : 'image');
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col border border-white/8 rounded-xl overflow-hidden bg-zinc-900">
      {/* Slot header: label + type switcher */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/8 flex-shrink-0">
        <span className="text-white/35 text-[10px] uppercase tracking-widest">{slotLabel}</span>
        <div className="flex gap-0.5">
          {(['image', 'video', 'text'] as AssetType[]).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ type: t })}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${asset.type === t
                ? 'bg-white/20 text-white'
                : 'text-white/25 hover:text-white/50'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1">
        {/* ── Image / Video ───────────────────────────── */}
        {(asset.type === 'image' || asset.type === 'video') && (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => !asset.src && fileInputRef.current?.click()}
              className={`relative rounded-lg overflow-hidden border-2 transition-all ${dragOver
                ? 'border-white/40 bg-white/5'
                : asset.src
                  ? 'border-transparent'
                  : 'border-dashed border-white/15 hover:border-white/30 cursor-pointer'
                }`}
            >
              {asset.src ? (
                <div className="group relative aspect-video">
                  {asset.type === 'image' ? (
                    <img
                      src={asset.src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={asset.src}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-full transition-colors"
                    >
                      Replace
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onChange({ type: asset.type }); }}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs rounded-full transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center gap-2">
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                      <span className="text-white/40 text-xs">{uploadMsg}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-white/15 text-3xl">↑</span>
                      <span className="text-white/30 text-xs">Drop or click to upload</span>
                      {asset.type === 'image' && (
                        <span className="text-white/15 text-[10px]">Auto-converts to AVIF</span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Show error message */}
            {uploadMsg && uploadMsg.startsWith('Error') && (
              <p className="text-red-400 text-xs mt-1.5">{uploadMsg}</p>
            )}

            {/* Upload progress when has src */}
            {uploading && asset.src && (
              <p className="text-white/40 text-xs mt-1.5">{uploadMsg}</p>
            )}

            {/* Manual URL input fallback */}
            <div className="mt-2">
              <input
                type="url"
                placeholder="Or paste URL directly…"
                value={asset.src || ''}
                onChange={(e) => onChange({ ...asset, src: e.target.value })}
                className="w-full bg-white/5 border border-white/8 rounded-lg px-2.5 py-1.5 text-white text-xs placeholder:text-white/15 focus:outline-none focus:border-white/25"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={asset.type === 'image' ? 'image/*' : 'video/*'}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file, asset.type as 'image' | 'video');
                e.target.value = '';
              }}
            />
          </>
        )}

        {/* ── Text with Design Software Precision Controls ── */}
        {asset.type === 'text' && (
          <TextAssetEditor
            asset={asset}
            slotLabel={slotLabel}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sortable Row Card
// ─────────────────────────────────────────────────────────────────────────────

function SortableRowCard({
  row,
  rowIndex,
  table,
  slug,
  onDelete,
  onUpdateAsset,
}: {
  row: BentoRow;
  rowIndex: number;
  table: TableName;
  slug: string;
  onDelete: () => void;
  onUpdateAsset: (assetIndex: number, asset: BentoAsset) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 'auto',
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-white/10 rounded-2xl overflow-hidden bg-zinc-950"
    >
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.04] border-b border-white/8">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          title="Drag to reorder"
          className="text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing transition-colors select-none text-lg leading-none"
        >
          ⠿
        </button>

        <span className="text-white/30 text-xs tabular-nums">Row {rowIndex + 1}</span>
        <span className="px-2 py-0.5 bg-white/8 text-white/50 rounded text-xs border border-white/10">
          {row.layout}
        </span>
        <span className="text-white/20 text-xs">
          {SLOT_COUNTS[row.layout]} slot{SLOT_COUNTS[row.layout] > 1 ? 's' : ''}
        </span>

        <button
          onClick={onDelete}
          className="ml-auto px-3 py-1 text-xs text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          Delete row
        </button>
      </div>

      {/* Asset slots — horizontal layout */}
      <div className="p-4 flex gap-3 overflow-x-auto">
        {row.assets.map((asset, assetIndex) => (
          <AssetSlotEditor
            key={`${row.id}-slot-${assetIndex}`}
            asset={asset}
            slotLabel={SLOT_LABELS[row.layout]?.[assetIndex] ?? `Slot ${assetIndex + 1}`}
            table={table}
            slug={slug}
            onChange={(updated) => onUpdateAsset(assetIndex, updated)}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero Image & Centered Brand Logo Editor
// ─────────────────────────────────────────────────────────────────────────────

function HeroImageEditor({
  heroImage,
  brandLogo,
  table,
  slug,
  onHeroChange,
  onLogoChange,
}: {
  heroImage: string;
  brandLogo: string;
  table: TableName;
  slug: string;
  onHeroChange: (url: string) => void;
  onLogoChange: (url: string) => void;
}) {
  const [uploadingHero, setUploadingHero] = useState(false);
  const [heroMsg, setHeroMsg] = useState('');
  const [heroDragOver, setHeroDragOver] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoMsg, setLogoMsg] = useState('');
  const [logoDragOver, setLogoDragOver] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Upload Hero Banner
  const handleHeroUpload = async (file: File) => {
    setUploadingHero(true);
    setHeroMsg('Converting to AVIF…');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', 'image');
    fd.append('table', table);
    fd.append('slug', slug);

    try {
      const res = await fetch('/api/admin/upload-asset', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      onHeroChange(json.url);
      setHeroMsg('');
    } catch (err: any) {
      setHeroMsg(`Error: ${err.message}`);
    } finally {
      setUploadingHero(false);
    }
  };

  // Upload Centered Brand Logo
  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    setLogoMsg('Uploading Logo…');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', 'image');
    fd.append('table', table);
    fd.append('slug', `${slug}-logo`);

    try {
      const res = await fetch('/api/admin/upload-asset', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      onLogoChange(json.url);
      setLogoMsg('');
    } catch (err: any) {
      setLogoMsg(`Error: ${err.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-zinc-950 mb-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.04] border-b border-white/8">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-medium tracking-wide">Hero Showcase & Centered Brand Logo</span>
          <span className="text-white/30 text-[11px]">(65% viewport hero on case study)</span>
        </div>
        <div className="flex items-center gap-2">
          {brandLogo && (
            <button
              onClick={() => onLogoChange('')}
              className="text-xs text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10 px-2.5 py-1 rounded-lg transition-all"
            >
              Remove logo
            </button>
          )}
          {heroImage && (
            <button
              onClick={() => onHeroChange('')}
              className="text-xs text-red-400/50 hover:text-red-400 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-all"
            >
              Remove banner
            </button>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* ── Hero Banner Canvas ── */}
        <div
          onDrop={(e) => {
            e.preventDefault();
            setHeroDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleHeroUpload(file);
          }}
          onDragOver={(e) => { e.preventDefault(); setHeroDragOver(true); }}
          onDragLeave={() => setHeroDragOver(false)}
          onClick={() => !heroImage && heroInputRef.current?.click()}
          className={`relative rounded-xl overflow-hidden border-2 transition-all ${
            heroDragOver
              ? 'border-cyan-400 bg-white/5'
              : heroImage
              ? 'border-transparent'
              : 'border-dashed border-white/15 hover:border-white/30 cursor-pointer'
          }`}
        >
          {heroImage ? (
            <div className="group relative aspect-[21/9] md:aspect-[24/9] w-full max-h-[300px] bg-black/60 overflow-hidden flex items-center justify-center">
              {/* Hero Banner Background Image */}
              <img
                src={heroImage}
                alt="Case Study Hero"
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 pointer-events-none" />

              {/* ── Centered Brand Logo Slot on Top of Hero ── */}
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLogoDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleLogoUpload(file);
                }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setLogoDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setLogoDragOver(false); }}
                onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click(); }}
                className={`relative z-20 max-w-[280px] w-full p-4 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                  brandLogo
                    ? 'hover:bg-black/60 group/logo border border-white/20 hover:border-cyan-400/60 backdrop-blur-md'
                    : logoDragOver
                    ? 'border-2 border-cyan-400 bg-cyan-950/80'
                    : 'border-2 border-dashed border-cyan-400/50 hover:border-cyan-300 bg-black/60 hover:bg-black/80 backdrop-blur-md'
                }`}
              >
                {brandLogo ? (
                  <div className="relative flex flex-col items-center">
                    <img
                      src={brandLogo}
                      alt="Brand Logo"
                      className="max-h-20 max-w-[200px] object-contain filter drop-shadow-2xl mb-1"
                    />
                    <span className="text-[10px] text-cyan-300 font-space uppercase tracking-wider bg-black/70 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      Brand Logo (Centered)
                    </span>
                    <div className="opacity-0 group-hover/logo:opacity-100 transition-opacity absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center gap-2">
                      <span className="text-[11px] text-white px-2 py-1 bg-white/20 rounded-full">
                        Change Logo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-2">
                    {uploadingLogo ? (
                      <>
                        <div className="w-5 h-5 border border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
                        <span className="text-cyan-300 text-xs font-space">{logoMsg}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-cyan-400 text-xl font-bold">✦</span>
                        <span className="text-white text-xs font-medium font-space">
                          Drop or Click to Upload Brand Logo
                        </span>
                        <span className="text-white/40 text-[10px]">
                          (Will sit centered over the hero banner)
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Change Hero Banner Action Bar on Hover */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-30">
                <button
                  onClick={(e) => { e.stopPropagation(); heroInputRef.current?.click(); }}
                  className="px-3 py-1.5 bg-black/70 hover:bg-black border border-white/20 hover:border-white/40 text-white text-xs rounded-full transition-all"
                >
                  Change Hero Banner
                </button>
              </div>
            </div>
          ) : (
            <div className="aspect-[21/9] md:aspect-[24/9] max-h-[220px] flex flex-col items-center justify-center gap-2">
              {uploadingHero ? (
                <>
                  <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <span className="text-white/40 text-xs">{heroMsg}</span>
                </>
              ) : (
                <>
                  <span className="text-white/20 text-3xl">↑</span>
                  <span className="text-white/40 text-sm">Drop or click to upload Hero Banner first</span>
                  <span className="text-white/20 text-xs">Auto-converts to AVIF · Once uploaded, you can add the centered logo</span>
                </>
              )}
            </div>
          )}
        </div>

        {heroMsg && heroMsg.startsWith('Error') && (
          <p className="text-red-400 text-xs">{heroMsg}</p>
        )}
        {logoMsg && logoMsg.startsWith('Error') && (
          <p className="text-red-400 text-xs">{logoMsg}</p>
        )}

        {/* URLs input cluster */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-white/30 uppercase font-space tracking-wider mb-1 block">
              Hero Banner Image URL
            </label>
            <input
              type="url"
              placeholder="Paste Hero Banner URL…"
              value={heroImage}
              onChange={(e) => onHeroChange(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/15 focus:outline-none focus:border-white/25"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/30 uppercase font-space tracking-wider mb-1 block">
              Centered Brand Logo URL (Requires Hero)
            </label>
            <input
              type="url"
              disabled={!heroImage}
              placeholder={heroImage ? "Paste Brand Logo URL (SVG/PNG)…" : "Upload Hero image first to set logo"}
              value={brandLogo}
              onChange={(e) => onLogoChange(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/15 focus:outline-none focus:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={heroInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleHeroUpload(file);
            e.target.value = '';
          }}
        />

        <input
          ref={logoInputRef}
          type="file"
          accept="image/*,.svg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleLogoUpload(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const [selectedProject, setSelectedProject] = useState<ProjectEntry | null>(null);
  const [loadingRows, setLoadingRows] = useState(false);
  const [heroImage, setHeroImage] = useState<string>('');
  const [brandLogo, setBrandLogo] = useState<string>('');
  const [rows, setRows] = useState<BentoRow[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(288);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const sidebarWidthRef = useRef(288);

  const listScrollRef = useRef<HTMLDivElement>(null);

  const [isLayoutPickerOpen, setIsLayoutPickerOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState('');
  const [lastSaved, setLastSaved] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Load sidebar width from localStorage ──────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 180 && parsed <= 600) {
          setSidebarWidth(parsed);
          sidebarWidthRef.current = parsed;
        }
      }
    } catch {}
  }, []);

  // ── Drag handler to resize sidebar width ──────────────────────────────────
  const handleStartResizeSidebar = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
    const startX = e.clientX;
    const startW = sidebarWidthRef.current;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const nextWidth = Math.max(180, Math.min(600, Math.round(startW + delta)));
      setSidebarWidth(nextWidth);
      sidebarWidthRef.current = nextWidth;
    };

    const onMouseUp = () => {
      setIsResizingSidebar(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      try {
        localStorage.setItem('admin_sidebar_width', String(sidebarWidthRef.current));
      } catch {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  // ── Load all projects on mount ─────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/projects')
      .then((r) => r.json())
      .then((json) => {
        setProjects(json.projects || []);
        setLoadingProjects(false);
      })
      .catch(() => setLoadingProjects(false));
  }, []);

  // ── Reset scroll to top when filter or search changes ─────────────────────
  useEffect(() => {
    if (listScrollRef.current) {
      listScrollRef.current.scrollTop = 0;
    }
  }, [categoryFilter, searchQuery]);

  // ── Select project → load its fresh case study data ───────────────────────
  const handleSelectProject = useCallback(async (project: ProjectEntry) => {
    // If previous project had unsaved changes, save it before switching
    if (selectedProject && isDirty) {
      try {
        const cleanRows = rows.map(({ id: _id, ...rest }) => rest);
        await fetch('/api/admin/save-case-study', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: selectedProject.slug,
            table: selectedProject.table,
            rows: cleanRows,
            hero_image: heroImage,
            brand_logo: brandLogo,
          }),
        });
      } catch (err) {
        console.error('Auto-save on switch failed:', err);
      }
    }

    setSelectedProject(project);
    setLoadingRows(true);
    setHeroImage('');
    setBrandLogo('');
    setRows([]);
    setIsDirty(false);
    setSaveStatus('idle');
    setSaveError('');
    setLastSaved('');

    try {
      const res = await fetch(
        `/api/admin/projects?slug=${encodeURIComponent(project.slug)}&table=${project.table}`
      );
      const json = await res.json();
      setHeroImage(json.heroImage || '');
      setBrandLogo(json.brandLogo || '');
      const existingRows: BentoRow[] = (json.caseStudyData?.rows ?? []).map(
        (row: Omit<BentoRow, 'id'>) => ({ ...row, id: crypto.randomUUID() })
      );
      setRows(existingRows);
    } catch {
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  }, [selectedProject, isDirty, rows, heroImage, brandLogo]);

  // ── DnD reorder ───────────────────────────────────────────────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRows((prev) => {
        const oldIdx = prev.findIndex((r) => r.id === active.id);
        const newIdx = prev.findIndex((r) => r.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
      setIsDirty(true);
    }
  };

  // ── Add row ───────────────────────────────────────────────────────────────
  const handleAddRow = (layout: LayoutType) => {
    setRows((prev) => [...prev, createEmptyRow(layout)]);
    setIsDirty(true);
    setSaveStatus('idle');
  };

  // ── Delete row ────────────────────────────────────────────────────────────
  const handleDeleteRow = (rowId: string) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
    setIsDirty(true);
    setSaveStatus('idle');
  };

  // ── Update asset ─────────────────────────────────────────────────────────
  const handleUpdateAsset = (rowId: string, assetIndex: number, asset: BentoAsset) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const newAssets = [...row.assets];
        newAssets[assetIndex] = asset;
        return { ...row, assets: newAssets };
      })
    );
    setIsDirty(true);
    setSaveStatus('idle');
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!selectedProject) return;
    setSaveStatus('saving');
    setSaveError('');

    try {
      const cleanRows = rows.map(({ id: _id, ...rest }) => rest);
      const res = await fetch('/api/admin/save-case-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedProject.slug,
          table: selectedProject.table,
          rows: cleanRows,
          hero_image: heroImage,
          brand_logo: brandLogo,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');

      setSaveStatus('success');
      setIsDirty(false);
      setLastSaved(new Date().toLocaleTimeString());

      // Update the sidebar list to reflect new case study status
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id && p.table === selectedProject.table
            ? { ...p, hasCaseStudy: cleanRows.length > 0, rowCount: cleanRows.length }
            : p
        )
      );
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err.message);
    }
  }, [selectedProject, rows, heroImage, brandLogo]);

  // ── Auto-save (debounced 2s after changes) ──────────────────────────────────
  useEffect(() => {
    if (!isDirty || !selectedProject || loadingRows) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [rows, heroImage, brandLogo, isDirty, selectedProject, loadingRows, handleSave]);

  // ── Warn before accidental tab close with unsaved changes ─────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // ── Clear all rows ────────────────────────────────────────────────────────
  const handleClearAll = () => {
    if (!window.confirm('Clear all rows? This will remove everything when you save.')) return;
    setRows([]);
    setIsDirty(true);
    setSaveStatus('idle');
  };

  // ── Filter projects ────────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Category gate first — short-circuits before string operations
      if (categoryFilter !== 'all' && p.table !== categoryFilter) return false;
      // Search gate
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      }
      return true;
    });
  }, [projects, categoryFilter, searchQuery]);

  const totalWithStudies = projects.filter((p) => p.hasCaseStudy).length;

  const categoryFilters: { value: CategoryFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'works_brands', label: 'Brands' },
    { value: 'works_socials', label: 'Socials' },
    { value: 'works_church', label: 'Church' },
    { value: 'works_publishing', label: 'Publishing' },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white flex flex-col" style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-white/10 px-6 h-12 flex items-center gap-4 bg-zinc-950 z-20 select-none">
        <span
          className="text-xs uppercase tracking-[0.2em] text-white/35"
          style={{ fontFamily: 'var(--font-space-mono, monospace)' }}
        >
          Case Study Admin
        </span>
        <span className="text-white/15">·</span>
        <span className="text-white/25 text-xs">everdann designs</span>

        <div className="ml-auto flex items-center gap-4">
          {isDirty && (
            <span className="text-amber-400/70 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 inline-block" />
              Unsaved changes
            </span>
          )}
          {lastSaved && !isDirty && (
            <span className="text-white/25 text-xs">Saved at {lastSaved}</span>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('admin_auth');
              window.location.reload();
            }}
            className="text-white/20 hover:text-white/50 text-xs transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside
          style={{ width: `${sidebarWidth}px` }}
          className="flex-shrink-0 h-full border-r border-white/10 flex flex-col bg-zinc-950 overflow-hidden relative select-none"
        >
          {/* Draggable Vertical Resize Bar on Right Edge */}
          <div
            onMouseDown={handleStartResizeSidebar}
            className={`absolute top-0 right-0 bottom-0 w-2 cursor-col-resize z-30 transition-colors ${
              isResizingSidebar
                ? 'bg-cyan-400'
                : 'hover:bg-cyan-500/40 active:bg-cyan-400 bg-transparent'
            }`}
            title="Drag left or right to adjust sidebar width"
          />
          {/* Search */}
          <div className="p-3 border-b border-white/10 flex-shrink-0">
            <input
              type="text"
              placeholder="Search projects…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20"
            />
          </div>

          {/* Category filter */}
          <div className="px-3 py-2.5 border-b border-white/10 flex flex-wrap gap-1 flex-shrink-0">
            {categoryFilters.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCategoryFilter(value)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${categoryFilter === value
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/35 hover:text-white/60'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Project list — scrollable */}
          <div ref={listScrollRef} className="flex-1 overflow-y-auto">
            {loadingProjects ? (
              <div className="p-4 text-white/20 text-xs text-center mt-4">Loading…</div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-4 text-white/20 text-xs text-center mt-4">No projects found</div>
            ) : (
              <ul key={`${categoryFilter}--${searchQuery}`} className="p-2 space-y-0.5">
                {filteredProjects.map((project) => {
                  const isSelected =
                    selectedProject?.slug === project.slug &&
                    selectedProject?.table === project.table;
                  return (
                    <li key={`${project.table}-${project.slug}`}>
                      <button
                        onClick={() => handleSelectProject(project)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all border ${isSelected
                          ? 'bg-white/10 border-white/15'
                          : 'border-transparent hover:bg-white/[0.04]'
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {/* Green dot = has case study, dim dot = empty */}
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${project.hasCaseStudy ? 'bg-emerald-400' : 'bg-white/15'
                              }`}
                          />
                          <span className="text-white/80 text-sm truncate leading-none">
                            {project.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pl-3.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] border ${TABLE_BADGE[project.table]}`}
                          >
                            {TABLE_LABELS[project.table]}
                          </span>
                          <span className="text-white/20 text-[10px] truncate">{project.slug}</span>
                          {project.hasCaseStudy && (
                            <span className="ml-auto text-white/25 text-[10px] flex-shrink-0">
                              {project.rowCount}r
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Stats footer */}
          <div className="flex-shrink-0 px-4 py-3 border-t border-white/10 flex justify-between text-[10px] text-white/25">
            <span>
              <span className="text-emerald-400/70">{totalWithStudies}</span> with case studies
            </span>
            <span>{projects.length} total</span>
          </div>
        </aside>

        {/* ── Main panel ────────────────────────────────────────────────────── */}
        <main className="flex-1 h-full min-h-0 min-w-0 overflow-y-auto overscroll-contain bg-black">
          {!selectedProject ? (
            /* Empty state */
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4 text-white/5">◈</div>
                <p className="text-white/25 text-sm">Select a project from the sidebar</p>
                <p className="text-white/15 text-xs mt-1">
                  <span className="text-emerald-400/50">●</span> green dot = case study exists
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 max-w-5xl mx-auto">
              {/* ── Project header ─────────────────────────────────────────── */}
              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h1 className="text-xl font-light text-white tracking-wide">
                      {selectedProject.title}
                    </h1>
                    <span
                      className={`px-2 py-0.5 rounded text-xs border ${TABLE_BADGE[selectedProject.table]}`}
                    >
                      {TABLE_LABELS[selectedProject.table]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="text-white/25 text-xs">{selectedProject.slug}</code>
                    <a
                      href={`/works/${selectedProject.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/25 hover:text-white/60 text-xs transition-colors"
                    >
                      View live ↗
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {rows.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-2 text-xs text-red-400/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                    >
                      Clear all
                    </button>
                  )}

                  {saveStatus === 'error' && (
                    <p className="text-red-400 text-xs max-w-[200px] text-right">{saveError}</p>
                  )}

                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving' || !isDirty}
                    className={`px-5 py-2 rounded-xl text-sm uppercase tracking-wider transition-all ${saveStatus === 'saving'
                      ? 'bg-white/10 text-white/40 cursor-wait'
                      : saveStatus === 'success' && !isDirty
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isDirty
                          ? 'bg-white text-black hover:bg-white/90 cursor-pointer'
                          : 'bg-white/8 text-white/25 cursor-not-allowed border border-white/5'
                      }`}
                    style={{ fontFamily: 'var(--font-space-mono, monospace)' }}
                  >
                    {saveStatus === 'saving'
                      ? 'Saving…'
                      : saveStatus === 'success' && !isDirty
                        ? '✓ Saved'
                        : 'Save'}
                  </button>
                </div>
              </div>

              {/* ── Builder Content ─────────────────────────────────────────── */}
              {loadingRows ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Hero Image Section Editor */}
                  <HeroImageEditor
                    heroImage={heroImage}
                    brandLogo={brandLogo}
                    table={selectedProject.table}
                    slug={selectedProject.slug}
                    onHeroChange={(url) => {
                      setHeroImage(url);
                      setIsDirty(true);
                      setSaveStatus('idle');
                    }}
                    onLogoChange={(url) => {
                      setBrandLogo(url);
                      setIsDirty(true);
                      setSaveStatus('idle');
                    }}
                  />

                  {/* Bento Rows */}
                  <div className="flex flex-col gap-3">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                    <SortableContext
                      items={rows.map((r) => r.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {rows.map((row, rowIndex) => (
                        <SortableRowCard
                          key={row.id}
                          row={row}
                          rowIndex={rowIndex}
                          table={selectedProject.table}
                          slug={selectedProject.slug}
                          onDelete={() => handleDeleteRow(row.id)}
                          onUpdateAsset={(assetIndex, asset) =>
                            handleUpdateAsset(row.id, assetIndex, asset)
                          }
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  {/* Empty state within builder */}
                  {rows.length === 0 && (
                    <div className="border-2 border-dashed border-white/8 rounded-2xl py-16 flex flex-col items-center justify-center gap-2">
                      <span className="text-white/15 text-4xl">☰</span>
                      <p className="text-white/25 text-sm">No rows yet</p>
                      <p className="text-white/15 text-xs">Click "Add Row" below to start</p>
                    </div>
                  )}

                  {/* Add row button */}
                  <button
                    onClick={() => setIsLayoutPickerOpen(true)}
                    className="border border-dashed border-white/15 hover:border-white/35 rounded-2xl py-4 text-white/35 hover:text-white/60 text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-lg leading-none">+</span>
                    <span>Add Row</span>
                  </button>

                  {/* Row count indicator */}
                  {rows.length > 0 && (
                    <p className="text-white/20 text-xs text-center">
                      {rows.length} row{rows.length !== 1 ? 's' : ''} · Drag ⠿ to reorder
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        </main>
      </div>

      {/* Layout picker modal */}
      {isLayoutPickerOpen && (
        <LayoutPickerModal
          onSelect={handleAddRow}
          onClose={() => setIsLayoutPickerOpen(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Password Gate
// ─────────────────────────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        localStorage.setItem('admin_auth', 'true');
        onAuth();
      } else {
        setError('Wrong password');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-10">
          <span
            className="text-xs uppercase tracking-[0.3em] text-white/25"
            style={{ fontFamily: 'var(--font-space-mono, monospace)' }}
          >
            Case Study Admin
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Password input with eye toggle */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-center tracking-widest placeholder:text-white/20 placeholder:tracking-normal focus:outline-none focus:border-white/30 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                /* Eye-off icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                /* Eye icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-white text-black rounded-xl text-sm uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-space-mono, monospace)' }}
          >
            {loading ? '…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Export
// ─────────────────────────────────────────────────────────────────────────────

export default function CaseStudyAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // localStorage only available on client
    const stored = localStorage.getItem('admin_auth');
    if (stored === 'true') setIsAuthenticated(true);
    setMounted(true);
  }, []);

  // Avoid flash of wrong state during SSR hydration
  if (!mounted) return <div className="min-h-screen bg-black" />;

  if (!isAuthenticated) {
    return <PasswordGate onAuth={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}
