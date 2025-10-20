import { useState, useEffect } from 'react';

export default function ViewportIndicator() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial dimensions
    updateDimensions();

    // Update on resize
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getBreakpoint = () => {
    if (dimensions.width < 640) return 'XS';
    if (dimensions.width < 768) return 'SM';
    if (dimensions.width < 1024) return 'MD';
    if (dimensions.width < 1280) return 'LG';
    if (dimensions.width < 1536) return 'XL';
    return '2XL';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white px-3 py-2 text-xs font-mono rounded z-50 shadow-lg">
      <div className="font-bold mb-1">{getBreakpoint()}</div>
      <div>{dimensions.width} × {dimensions.height}px</div>
    </div>
  );
}