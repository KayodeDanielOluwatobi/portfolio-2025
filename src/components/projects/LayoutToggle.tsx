// components/projects/LayoutToggle.tsx

'use client';

import { Grid3X3, Columns3 } from 'lucide-react';

interface LayoutToggleProps {
  currentLayout: 'grid' | 'masonry';
  onLayoutChange: (layout: 'grid' | 'masonry') => void;
}

export default function LayoutToggle({
  currentLayout,
  onLayoutChange,
}: LayoutToggleProps) {
  return (
    <div className="flex gap-3 items-center justify-center mb-8">
      <span className="text-sm text-white/60 uppercase tracking-wider">View:</span>
      
      {/* Grid Button */}
      <button
        onClick={() => onLayoutChange('grid')}
        className={`p-2 rounded transition-all duration-200 ${
          currentLayout === 'grid'
            ? 'bg-white text-black'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        title="Grid Layout"
      >
        <Columns3 size={20} />
      </button>

      {/* Masonry Button */}
      <button
        onClick={() => onLayoutChange('masonry')}
        className={`p-2 rounded transition-all duration-200 ${
          currentLayout === 'masonry'
            ? 'bg-white text-black'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        title="Masonry Layout"
      >
        <Grid3X3 size={20} />
      </button>
    </div>
  );
}