'use client';

import { useState, useEffect, useRef } from 'react';
import CircularWaveProgress from '@/components/ui/CircularWaveProgress';
import { Squircle } from '@squircle-js/react';

interface Keycap {
  name: string;
  tool: string;
  link: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface KeycapWithProficiency extends Keycap {
  proficiency: 'Expert' | 'Advanced' | 'Intermediate';
}

const keycapProficiencies: Record<string, 'Expert' | 'Advanced' | 'Intermediate'> = {
  'Figma': 'Expert',
  'Premiere Pro': 'Advanced',
  'After Effects': 'Advanced',
  'Illustrator': 'Expert',
  'InDesign': 'Advanced',
  'Photoshop': 'Expert',
  'Spline': 'Intermediate',
  'ChatGPT': 'Expert',
  'Gemini': 'Advanced',
  'Be': 'Advanced',
};

const proficiencyProgress = {
  'Expert': 95,
  'Advanced': 90,
  'Intermediate': 60,
};

const toolProgressOverrides: Record<string, number> = {
  'Figma': 80,
  'ChatGPT': 85,
  'Gemini': 85,
  'Be': 85,
  'Illustrator': 85,
  'InDesign': 85,
  'Photoshop': 85,
  'Premiere Pro': 70,
  'After Effects': 70,
};

const keycapColors: Record<string, { track: string; wave: string }> = {
  'Photoshop':    { track: '#003366', wave: '#31A8FF' },
  'Illustrator':  { track: '#663D00', wave: '#FF9A00' },
  'Premiere Pro': { track: '#3C1F4C', wave: '#9999FF' },
  'After Effects':{ track: '#4D1F66', wave: '#D999FF' },
  'InDesign':     { track: '#8C194F', wave: '#FF3366' },
  'Be':           { track: '#aaaaaa', wave: '#ffffff' },
  'Figma':        { track: '#05553A', wave: '#0ACF83' },
  'Spline':       { track: '#4D2C99', wave: '#B388FF' },
  'ChatGPT':      { track: '#288C78', wave: '#74AA9C' },
  'Gemini':       { track: '#4A62A0', wave: '#8AB4F8' },
  'Affinity':     { track: '#5E8C3A', wave: '#A8FF71' },
  'default':      { track: '#555555', wave: '#cccccc' },
};

const getKeycapColor = (tool: string): { track: string; wave: string } => {
  return keycapColors[tool] || keycapColors['default'];
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export default function KeycapInteractive() {
  const [keycaps, setKeycaps] = useState<KeycapWithProficiency[]>([]);
  const [hoveredKeycap, setHoveredKeycap] = useState<string | null>(null);
  const [lastTappedKeycap, setLastTappedKeycap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const OFFSET_X = -6;
  const OFFSET_Y = -15;

  const getTooltipSize = () => {
    if (imageScale < 0.6) {
      return { 
        progressSize: 30, 
        padding: '8px', 
        gap: '6px', 
        minWidth: '120px',
        toolNameSize: '10px',
        proficiencyLabelSize: '9px',
        proficiencyTextSize: '11px',
        cornerRadius: 24,
        cornerSmoothing: 0.8,
        trackWidth: 3,
        waveWidth: 4
      };
    } else if (imageScale < 1) {
      return { 
        progressSize: 45, 
        padding: '12px', 
        gap: '8px', 
        minWidth: '150px',
        toolNameSize: '11px',
        proficiencyLabelSize: '9px',
        proficiencyTextSize: '12px',
        cornerRadius: 32,
        cornerSmoothing: 0.9,
        trackWidth: 5,
        waveWidth: 6
      };
    }
    return { 
      progressSize: 60, 
      padding: '20px', 
      gap: '12px', 
      minWidth: '180px',
      toolNameSize: '14px',
      proficiencyLabelSize: '11px',
      proficiencyTextSize: '14px',
      cornerRadius: 40,
      cornerSmoothing: 1,
      trackWidth: 6,
      waveWidth: 7
    };
  };

  const getTooltipOffset = () => {
    if (imageScale < 0.40) return 250;
    if (imageScale < 0.45) return 240;
    if (imageScale < 0.65) return 170;
    if (imageScale < 1) return 140;
    return 120;
  };

  const tooltipSize = getTooltipSize();

  const nonInteractiveKeycaps = ['Esc', 'Shift', 'Enter', 'Space'];

  const getTooltipPosition = (keycapY: number) => {
    if (imageScale < 1) {
      if (keycapY < 120) return 'above';
      else if (keycapY >= 120 && keycapY < 200) return 'above';
      else return 'below';
    }
    else {
      if (keycapY < 120) return 'below';
      else if (keycapY >= 120 && keycapY < 200) return 'above';
      else return 'above';
    }
  };

  const shouldTooltipAppearBelow = (keycapY: number): boolean => {
    return getTooltipPosition(keycapY) === 'below';
  };

  const shouldShowTooltip = (keycapName: string): boolean => {
    return !nonInteractiveKeycaps.includes(keycapName);
  };

  // Loader progress animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && !fadeOut) {
      interval = setInterval(() => {
        setLoaderProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 30;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [loading, fadeOut]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await fetch('/data/keycap-coordinates.json');
        const data = await response.json();
        const withProficiency = data.map((keycap: Keycap) => ({
          ...keycap,
          proficiency: keycapProficiencies[keycap.tool] || 'Intermediate',
        }));
        setKeycaps(withProficiency);
        
        // Trigger fade out before setting loading to false
        setFadeOut(true);
        setTimeout(() => {
          setLoading(false);
          setLoaderProgress(100);
        }, 400);
      } catch (error) {
        console.error('Error loading keycap coordinates:', error);
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, []);

  useEffect(() => {
    const calculateScale = () => {
      if (imgRef.current) {
        const originalWidth = 756;
        const displayWidth = imgRef.current.offsetWidth;
        setImageScale(displayWidth / originalWidth);
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const handleKeycapClick = (keycap: KeycapWithProficiency) => {
    if (keycap.name === 'Esc') {
      scrollToTop();
      return;
    }

    if (keycap.name === 'Enter') {
      setTimeout(() => {
        const nextSection = document.querySelector('[data-section="after-keycaps"]');
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          console.warn('Section with data-section="after-keycaps" not found');
        }
      }, 0);
      return;
    }

    return;
  };

  return (
    <section className="w-full py-20 bg-black">
      <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="pl-3 font-space text-xl sm:text-2xl md:text-3xl lg:text-4xl uppercase text-white/95 mb-4">
            My Design Stack
          </h2>
          <p className="text-white/60 pl-3 text-sm sm:text-base">
            {imageScale < 0.5 ? 'Tap on the keycaps to explore my tools and proficiency levels' : 'Hover over keycaps to explore my tools and proficiency levels'}
          </p>
        </div>

        {/* Image Container with Interactive Overlay */}
        <div className="relative w-full bg-black rounded-xl overflow-visible inline-block">
          {/* Loader - Fades out when data arrives */}
          {loading && (
            <div
              className={`absolute inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ${
                fadeOut ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <CircularWaveProgress
                progress={loaderProgress}
                size={60}
                trackWidth={5}
                waveWidth={5}
                trackColor="#475569"
                waveColor="#cbd5e1"
                waveAmplitude={2}
                maxWaveFrequency={6}
                undulationSpeed={2}
                rotationSpeed={7}
                edgeGap={20}
                relaxationDuration={0}
                className="opacity-30"
              />
            </div>
          )}

          {/* Base Image */}
          <img
            ref={imgRef}
            src="/keycaps2.png"
            alt="Design Tools Keyboard"
            className="w-full h-auto block"
            onLoad={() => {
              if (imgRef.current) {
                setImageScale(imgRef.current.offsetWidth / 756);
              }
            }}
          />

          {/* Interactive Hotspots */}
          {keycaps.map((keycap, index) => (
            <div key={`${keycap.name}-${index}`}>
              {/* Invisible Hotspot */}
              <div
                className="absolute cursor-pointer group transition-all duration-300"
                style={{
                  left: `${keycap.x * imageScale + OFFSET_X * imageScale}px`,
                  top: `${keycap.y * imageScale + OFFSET_Y * imageScale}px`,
                  width: `${keycap.width * imageScale}px`,
                  height: `${keycap.height * imageScale}px`,
                }}
                onMouseEnter={() => {
                  if (shouldShowTooltip(keycap.name)) {
                    setHoveredKeycap(keycap.name);
                  }
                }}
                onMouseLeave={() => setHoveredKeycap(null)}
                onClick={() => handleKeycapClick(keycap)}
              >
                {/* Hover Highlight */}
                {hoveredKeycap === keycap.name && shouldShowTooltip(keycap.name) && (
                  <div className="absolute opacity-0 inset-0 bg-cyan-400/90 border border-cyan-400/40 rounded-lg transition-all duration-300" />
                )}
              </div>

              {/* Tooltip - Smart positioning */}
              {hoveredKeycap === keycap.name && shouldShowTooltip(keycap.name) && (
                <Squircle
                  cornerRadius={tooltipSize.cornerRadius}
                  cornerSmoothing={tooltipSize.cornerSmoothing}
                  className="absolute z-50 backdrop-blur-md pointer-events-none shadow-xl animate-fadeIn"
                  style={{
                    left: `${(keycap.x + keycap.width / 2) * imageScale + OFFSET_X * imageScale}px`,
                    ...(shouldTooltipAppearBelow(keycap.y)
                      ? {
                          top: `${(keycap.y + keycap.height + 15) * imageScale + OFFSET_Y * imageScale}px`,
                        }
                      : {
                          top: `${(keycap.y - getTooltipOffset()) * imageScale + OFFSET_Y * imageScale}px`,
                        }),
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: keycap.tool === 'Be' ? `calc(${tooltipSize.padding} + 10px)` : tooltipSize.padding,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: tooltipSize.gap,
                    minWidth: tooltipSize.minWidth,
                  }}
                >
                  {/* Tool Name */}
                  <h3 className="font-sans tracking-normal text-center font-bold text-white" style={{ fontSize: tooltipSize.toolNameSize }}>
                    {keycap.tool === 'Be' ? 'Adobe Portfolio' : keycap.tool}
                  </h3>

                  {/* Circular Progress */}
                  <div className="flex flex-col items-center gap-2">
                    <CircularWaveProgress
                      progress={toolProgressOverrides[keycap.tool] ?? proficiencyProgress[keycap.proficiency]}
                      size={tooltipSize.progressSize}
                      trackWidth={tooltipSize.trackWidth}
                      waveWidth={tooltipSize.waveWidth}
                      trackColor={getKeycapColor(keycap.tool).track}
                      waveColor={getKeycapColor(keycap.tool).wave}
                      waveAmplitude={0}
                      maxWaveFrequency={0}
                      undulationSpeed={0}
                      edgeGap={20}
                    />
                    {/* Proficiency Label */}
                    {keycap.tool !== 'Be' ? (
                      <div className="text-center">
                        <p className="text-white/40 font-regular mb-0" style={{ fontSize: tooltipSize.proficiencyLabelSize }}>Proficiency Level</p>
                        <p className="text-white/90 font-medium" style={{ fontSize: tooltipSize.proficiencyTextSize }}>
                          {keycap.proficiency}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-white/50 font-mono" style={{ fontSize: tooltipSize.proficiencyLabelSize }}>
                          My Behance Portfolio
                        </p>
                      </div>
                    )}
                  </div>
                </Squircle>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}