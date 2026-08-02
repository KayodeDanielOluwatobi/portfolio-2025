import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // 1. Read Font and Assets
    const fontPath = path.join(process.cwd(), 'src/app/fonts/SpaceMono-Regular.ttf');
    const fontData = fs.readFileSync(fontPath);

    const futaLogoPath = path.join(process.cwd(), 'public/logos/futa.jpg');
    const futaLogoBase64 = fs.readFileSync(futaLogoPath).toString('base64');
    const futaLogoDataUrl = `data:image/jpeg;base64,${futaLogoBase64}`;

    const futaPicPath = path.join(process.cwd(), 'public/logos/futapic.webp');
    const futaPicBase64 = fs.readFileSync(futaPicPath).toString('base64');
    const futaPicDataUrl = `data:image/webp;base64,${futaPicBase64}`;

    // 2. Generate mathematically accurate wave path for 94% progress
    const width = 704;
    const height = 4;
    const waveHeight = 9;
    const waveAmplitude = 3;
    const maxWaveFrequency = 12;
    const edgeGap = 10;
    const radius = waveHeight / 2; // 4.5
    const clampedProgress = 94;

    const viewBoxHeight = height + (waveAmplitude * 4); // 16px
    const internalWidth = width - (radius * 2); // 695px
    const progressWidth = (clampedProgress / 100) * internalWidth; // 653.3px
    const segments = Math.max(10, Math.floor(progressWidth / 2));
    const centerY = viewBoxHeight / 2; // 8px

    const points = [];
    const phase = 0; // static phase for OG image

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = radius + (t * progressWidth);
      const relativeX = x / width;
      const waveOffset = Math.sin(relativeX * maxWaveFrequency * Math.PI * 2 + phase) * waveAmplitude;
      const y = centerY + waveOffset;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }

    const wavePath = `M ${points.join(' L ')}`;

    const trackStartX = radius + progressWidth + edgeGap; // ~667.8
    const trackWidth = Math.max(0, (width - radius) - trackStartX); // ~31.7

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b', // zinc-950
            backgroundImage: 'radial-gradient(circle at center, #18181b 0%, #09090b 100%)',
            padding: '40px',
          }}
        >
          {/* Card Container */}
          <div
            style={{
              width: '800px',
              height: '420px',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#18181b', // zinc-900
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#27272a', // zinc-800
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Background Image of FUTA */}
            <img
              src={futaPicDataUrl}
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '800px',
                height: '420px',
                objectFit: 'cover',
                opacity: 0.15,
              }}
            />

            {/* Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.75) 50%, rgba(0, 0, 0, 0.95) 100%)',
              }}
            />

            {/* Card Content wrapper */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                padding: '48px',
                color: '#e4e4e7', // zinc-200
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#fafafa', // zinc-50
                    opacity: 0.55,
                    letterSpacing: '0.1em',
                    fontWeight: 200,
                  }}
                >
                  Currently studying . . .
                </span>
              </div>

              {/* Institution Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <img
                    src={futaLogoDataUrl}
                    alt="FUTA Logo"
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '24px',
                      color: '#f4f4f5', // zinc-100
                      fontWeight: 300,
                      lineHeight: 1.2,
                    }}
                  >
                    Electrical & Electronics Engineering
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        fontFamily: 'SpaceMono',
                        fontSize: '18px',
                        color: '#ffffff',
                      }}
                    >
                      @FUTA
                    </span>
                    <span
                      style={{
                        fontFamily: 'SpaceMono',
                        backgroundColor: 'rgba(59, 162, 222, 0.1)',
                        color: '#3BA2DE',
                        fontSize: '14px',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'rgba(59, 162, 222, 0.2)',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                      }}
                    >
                      5th year
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ display: 'flex', width: '100%', height: '24px', position: 'relative' }}>
                  <svg
                    width="704"
                    height="24"
                    viewBox={`0 0 704 ${viewBoxHeight}`}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  >
                    {trackWidth > 0 && (
                      <rect
                        x={trackStartX}
                        y={(viewBoxHeight - waveHeight) / 2}
                        width={trackWidth}
                        height={waveHeight}
                        fill="#ffffff4D"
                        rx={radius}
                      />
                    )}
                    
                    <path
                      d={wavePath}
                      fill="none"
                      stroke="#3BA2DE"
                      strokeWidth={waveHeight}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'SpaceMono',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    );
  } catch (error: any) {
    console.error('OG generation failed:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
