'use client';

import { useState, useEffect, useRef } from 'react';
import CircularWaveProgress from '@/components/ui/CircularWaveProgress';
import { Squircle } from '@squircle-js/react';
import TextPressure from '@/components/TextPressure';
import { motion } from 'framer-motion'; 

// --- Interfaces ---
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

// --- Data & Configuration ---
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
  'Photoshop':      { track: '#BFE4FF', wave: '#31A8FF' }, 
  'Illustrator':    { track: '#FFE4C2', wave: '#FF9A00' }, 
  'Premiere Pro':   { track: '#E3E3FF', wave: '#9999FF' }, 
  'After Effects':  { track: '#F2D9FF', wave: '#D999FF' }, 
  'InDesign':       { track: '#FFC2D1', wave: '#FF3366' }, 
  'Be':             { track: '#EAEAEA', wave: '#ffffff' }, 
  'Figma':          { track: '#C2F2E3', wave: '#0ACF83' }, 
  'Spline':         { track: '#EAD9FF', wave: '#B388FF' }, 
  'ChatGPT':        { track: '#D9EDE8', wave: '#74AA9C' }, 
  'Gemini':         { track: '#DFE9FC', wave: '#8AB4F8' }, 
  'Affinity':       { track: '#E4FFD1', wave: '#A8FF71' }, 
  'default':        { track: '#EEEEEE', wave: '#cccccc' }, 
};

const getKeycapColor = (tool: string): { track: string; wave: string } => {
  return keycapColors[tool] || keycapColors['default'];
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- Animation Wrapper Component ---
const AnimatedCircularProgress = ({ targetProgress, duration = 2000, ...props }: any) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      const ease = 1 - Math.pow(1 - progressRatio, 5);
      
      setProgress(ease * targetProgress);

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetProgress, duration]);

  return <CircularWaveProgress {...props} progress={progress} />;
};

// --- Main Component ---
export default function KeycapInteractive() {
  const [keycaps, setKeycaps] = useState<KeycapWithProficiency[]>([]);
  const [hoveredKeycap, setHoveredKeycap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  // Wireframe State
  const [isWireframe, setIsWireframe] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  const [pressureFontSize, setPressureFontSize] = useState(120);

  const OFFSET_X = -6;
  const OFFSET_Y = -15;

  const getTooltipSize = () => {
    if (imageScale < 0.6) {
      return { 
        progressSize: 30, padding: '8px', gap: '6px', minWidth: '120px',
        toolNameSize: '10px', proficiencyLabelSize: '9px', proficiencyTextSize: '11px',
        cornerRadius: 24, cornerSmoothing: 0.8, trackWidth: 3, waveWidth: 4
      };
    } else if (imageScale < 1) {
      return { 
        progressSize: 45, padding: '12px', gap: '8px', minWidth: '150px',
        toolNameSize: '11px', proficiencyLabelSize: '9px', proficiencyTextSize: '12px',
        cornerRadius: 32, cornerSmoothing: 0.9, trackWidth: 5, waveWidth: 6
      };
    }
    return { 
      progressSize: 60, padding: '20px', gap: '12px', minWidth: '180px',
      toolNameSize: '14px', proficiencyLabelSize: '11px', proficiencyTextSize: '14px',
      cornerRadius: 40, cornerSmoothing: 1, trackWidth: 6, waveWidth: 7
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
  const nonInteractiveKeycaps = ['Esc', 'Enter', 'Space'];

  const getTooltipPosition = (keycapY: number) => {
    if (imageScale < 1) {
      return (keycapY < 120 || (keycapY >= 120 && keycapY < 200)) ? 'above' : 'below';
    }
    return (keycapY < 120 || (keycapY >= 120 && keycapY < 200)) ? 'above' : 'above'; 
  };

  const shouldTooltipAppearBelow = (keycapY: number): boolean => getTooltipPosition(keycapY) === 'below';
  const shouldShowTooltip = (keycapName: string): boolean => !nonInteractiveKeycaps.includes(keycapName);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && !fadeOut) {
      interval = setInterval(() => {
        setLoaderProgress((prev) => (prev >= 95 ? prev : prev + Math.random() * 30));
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
    setIsMounted(true); 
    const handleResize = () => {
      setPressureFontSize(window.innerWidth < 521 ? 50 : 120);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const calculateScale = () => {
      if (imgRef.current) {
        setImageScale(imgRef.current.offsetWidth / 756);
      }
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const handleKeycapClick = (keycap: KeycapWithProficiency) => {
    if (keycap.name === 'Shift') {
      setIsWireframe(!isWireframe);
      return;
    }
    if (keycap.name === 'Esc') {
      scrollToTop();
      return;
    }
    if (keycap.name === 'Enter') {
      setTimeout(() => {
        const nextSection = document.querySelector('[data-section="after-keycaps"]');
        if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
      return;
    }
  };

  return (
    <section className="w-full py-20 bg-black">
      <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
        <div className="mb-12">
          <TextPressure className='ml-2 mb-8'
            text="MY DESIGN STACK"
            flex={false} alpha={false} stroke={false} width={true} weight={true} italic={true}
            textColor="#ffffff" strokeColor="#ff0000"
            minFontSize={36} fixedFontSize={pressureFontSize}
          />
          <p className="text-white/60 pl-2 md:pl-3 text-sm font-light sm:text-base">
            {imageScale < 0.5 ? 'Tap on the keycaps to explore my tools and proficiency levels' : 'Hover over keycaps to explore my tools. Click Shift to toggle Wireframe.'}
          </p>
        </div>

        <div className="relative w-full bg-black rounded-xl overflow-visible inline-block">
          {loading && (
            <div className={`absolute inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
              <CircularWaveProgress
                progress={loaderProgress} size={60} trackWidth={5} waveWidth={5}
                trackColor="#475569" waveColor="#cbd5e1"
                waveAmplitude={2} maxWaveFrequency={6} undulationSpeed={2} rotationSpeed={7}
                edgeGap={20} relaxationDuration={0} className="opacity-30"
              />
            </div>
          )}

          {/* 👇 IMAGE STACK: CLEAN CROSSFADE */}
          <div className="relative w-full">
            
            {/* 1. Raster Image */}
            <motion.img
              ref={imgRef}
              src="/keycaps2.png"
              alt="Design Tools Keyboard"
              className="w-full h-auto block relative z-10"
              initial={false}
              animate={{ opacity: isWireframe ? 0 : 1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              onLoad={() => {
                if (imgRef.current) setImageScale(imgRef.current.offsetWidth / 756);
              }}
            />

            {/* 2. Wireframe Image (Overlay) */}
            <motion.img 
              src="/keyboard-wireframe.png"
              alt="Keyboard Wireframe"
              className="absolute inset-0 w-full h-full object-cover z-0"
              initial={false}
              animate={{ opacity: isWireframe ? 1 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />

          </div>

          {/* Interactive Hotspots */}
          <div className="absolute inset-0 z-20">
            {keycaps.map((keycap, index) => (
              <div key={`${keycap.name}-${index}`}>
                <div
                  className="absolute cursor-pointer group transition-all duration-300"
                  style={{
                    left: `${keycap.x * imageScale + OFFSET_X * imageScale}px`,
                    top: `${keycap.y * imageScale + OFFSET_Y * imageScale}px`,
                    width: `${keycap.width * imageScale}px`,
                    height: `${keycap.height * imageScale}px`,
                  }}
                  onMouseEnter={() => {
                    if (shouldShowTooltip(keycap.name) && keycap.name !== 'Shift') {
                      setHoveredKeycap(keycap.name);
                    }
                  }}
                  onMouseLeave={() => setHoveredKeycap(null)}
                  onClick={() => handleKeycapClick(keycap)}
                >
                  {/* Transparent Hotspot */}
                </div>

                {hoveredKeycap === keycap.name && shouldShowTooltip(keycap.name) && keycap.name !== 'Shift' && (
                  <Squircle
                    cornerRadius={tooltipSize.cornerRadius}
                    cornerSmoothing={tooltipSize.cornerSmoothing}
                    className="absolute z-50 backdrop-blur-md pointer-events-none shadow-xl animate-fadeIn"
                    style={{
                      left: `${(keycap.x + keycap.width / 2) * imageScale + OFFSET_X * imageScale}px`,
                      ...(shouldTooltipAppearBelow(keycap.y)
                        ? { top: `${(keycap.y + keycap.height + 15) * imageScale + OFFSET_Y * imageScale}px` }
                        : { top: `${(keycap.y - getTooltipOffset()) * imageScale + OFFSET_Y * imageScale}px` }),
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: keycap.tool === 'Be' ? `calc(${tooltipSize.padding} + 10px)` : tooltipSize.padding,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tooltipSize.gap, minWidth: tooltipSize.minWidth,
                    }}
                  >
                    <h3 className="font-sans tracking-normal text-center font-bold text-white" style={{ fontSize: tooltipSize.toolNameSize }}>
                      {keycap.tool === 'Be' ? 'Adobe Portfolio' : keycap.tool}
                    </h3>

                    <div className="flex flex-col items-center gap-2">
                      <AnimatedCircularProgress
                        targetProgress={toolProgressOverrides[keycap.tool] ?? proficiencyProgress[keycap.proficiency]}
                        duration={2000} 
                        size={tooltipSize.progressSize} trackWidth={tooltipSize.trackWidth} waveWidth={tooltipSize.waveWidth}
                        trackColor={getKeycapColor(keycap.tool).track} waveColor={getKeycapColor(keycap.tool).wave}
                        waveAmplitude={0} maxWaveFrequency={0} undulationSpeed={0} edgeGap={20}
                      />
                      {keycap.tool !== 'Be' ? (
                        <div className="text-center">
                          <p className="text-white/40 font-regular mb-0" style={{ fontSize: tooltipSize.proficiencyLabelSize }}>Proficiency Level</p>
                          <p className="text-white/90 font-medium" style={{ fontSize: tooltipSize.proficiencyTextSize }}>{keycap.proficiency}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-white/50 font-mono" style={{ fontSize: tooltipSize.proficiencyLabelSize }}>My Behance Portfolio</p>
                        </div>
                      )}
                    </div>
                  </Squircle>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </section>
  );
}