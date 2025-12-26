'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type CursorContextType = {
  cursorColor: string;
  cursorStrokeColor: string;
  setCursorTheme: (fill: string, stroke: string) => void;
  resetCursorTheme: () => void;
};

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: ReactNode }) {
  // 1. Default Colors (Black Fill, White Stroke)
  const [cursorColor, setCursorColor] = useState('#000000');
  const [cursorStrokeColor, setCursorStrokeColor] = useState('#ffffff');

  // 2. Action to update colors (called on hover)
  const setCursorTheme = (fill: string, stroke: string) => {
    setCursorColor(fill);
    setCursorStrokeColor(stroke);
  };

  // 3. Action to reset (called on mouse leave)
  const resetCursorTheme = () => {
    setCursorColor('#000000');
    setCursorStrokeColor('#ffffff');
  };

  return (
    <CursorContext.Provider value={{ cursorColor, cursorStrokeColor, setCursorTheme, resetCursorTheme }}>
      {children}
    </CursorContext.Provider>
  );
}

// Hook to use it easily in components
export function useCursor() {
  const context = useContext(CursorContext);
  if (!context) throw new Error('useCursor must be used within a CursorProvider');
  return context;
}