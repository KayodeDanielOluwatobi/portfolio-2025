import { ImageResponse } from 'next/og';
import { getProjectBySlug } from '@/utils/projectFetcher';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const alt = 'Case Study';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

function loadFont(): Buffer {
  try {
    const fontPath = path.join(process.cwd(), 'src/app/fonts/SpaceMono-Regular.ttf');
    return fs.readFileSync(fontPath);
  } catch (err) {
    console.error('[OG Image] Failed to load SpaceMono-Regular.ttf:', err);
    return Buffer.alloc(0);
  }
}

/**
 * Satori (next/og) ONLY supports PNG, JPEG, and SVG.
 * Modern uploads (WebP/AVIF) crash Satori with `TypeError: u2 is not iterable`.
 * This helper converts any image format into a clean PNG data URI using Sharp.
 */
async function getPngDataUri(
  url: string | null | undefined,
  maxDimension: { width?: number; height?: number } = { width: 1200, height: 630 }
): Promise<string | null> {
  if (!url || typeof url !== 'string' || url.trim() === '') return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[OG Image] Failed to fetch image at ${url}: status ${res.status}`);
      return null;
    }

    const contentType = res.headers.get('content-type') || '';
    const arrayBuffer = await res.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // SVG is supported natively by Satori
    if (contentType.includes('svg') || url.toLowerCase().includes('.svg')) {
      return `data:image/svg+xml;base64,${inputBuffer.toString('base64')}`;
    }

    // Convert WebP, JPEG, AVIF, TIFF to PNG via Sharp
    const pngBuffer = await sharp(inputBuffer)
      .resize({
        width: maxDimension.width,
        height: maxDimension.height,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ quality: 90 })
      .toBuffer();

    return `data:image/png;base64,${pngBuffer.toString('base64')}`;
  } catch (err) {
    console.warn(`[OG Image] Error converting image at ${url}:`, err);
    return null;
  }
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const fontData = loadFont();

  const fontConfig =
    fontData.length > 0
      ? [
          {
            name: 'SpaceMono',
            data: fontData,
            style: 'normal' as const,
          },
        ]
      : undefined;

  try {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);

    if (!project) {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#070707',
              color: '#ffffff',
              fontFamily: 'SpaceMono, monospace',
            }}
          >
            <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Everdann Portfolio
            </span>
            <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginTop: 14 }}>
              Case Study Not Found
            </span>
          </div>
        ),
        {
          ...size,
          fonts: fontConfig,
        }
      );
    }

    const brandName = project.title || project.name || 'Brand';
    const heroImage =
      project.case_study_data?.hero_image ||
      project.case_study_data?.heroImage ||
      (Array.isArray(project.media) ? project.media[0] : project.media) ||
      project.background_image ||
      '';
    const brandLogo =
      project.case_study_data?.brand_logo ||
      project.case_study_data?.logo ||
      project.logo_variant ||
      project.logo ||
      '';
    const brandLogoSize = Number(project.case_study_data?.brand_logo_size) || 100;
    const backgroundColor = project.background_color || '#070707';

    // Fetch and convert both images in parallel to verified PNG data URIs
    const [heroImageSrc, logoSrc] = await Promise.all([
      getPngDataUri(heroImage, { width: 1200, height: 630 }),
      getPngDataUri(brandLogo, { width: 800, height: 400 }),
    ]);

    // Scaled dimensions on standard 1200x630 social frame
    const scale = Math.max(0.3, Math.min(2.5, brandLogoSize / 100));
    const maxLogoWidth = Math.round(520 * scale);
    const maxLogoHeight = Math.round(240 * scale);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor,
            overflow: 'hidden',
            fontFamily: 'SpaceMono, monospace',
          }}
        >
          {/* Layer 1: Background Hero Image (converted to PNG) */}
          {heroImageSrc ? (
            <img
              src={heroImageSrc}
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : null}

          {/* Layer 2: Cinematic Dark Gradient Overlay (identical to live web) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.45) 50%, rgba(0, 0, 0, 0.25) 100%)',
            }}
          />

          {/* Layer 3: Centered Brand Logo (converted to PNG / SVG) */}
          {logoSrc ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: maxLogoWidth,
                height: maxLogoHeight,
                maxWidth: '85%',
                maxHeight: '75%',
                padding: 16,
              }}
            >
              <img
                src={logoSrc}
                alt={brandName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          ) : (
            /* Fallback when no brand logo is provided: stylish centered typography */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 48,
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 60,
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                {brandName}
              </span>
              {project.tagline ? (
                <span
                  style={{
                    fontSize: 22,
                    color: 'rgba(255, 255, 255, 0.85)',
                    marginTop: 14,
                    maxWidth: 820,
                  }}
                >
                  {project.tagline}
                </span>
              ) : null}
            </div>
          )}
        </div>
      ),
      {
        ...size,
        fonts: fontConfig,
      }
    );
  } catch (err: any) {
    console.error('[OG Image] Top-level handler error:', err);
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#070707',
            color: '#ffffff',
            fontFamily: 'SpaceMono, monospace',
          }}
        >
          <span style={{ fontSize: 52, fontWeight: 700 }}>Everdann</span>
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
            Case Study
          </span>
        </div>
      ),
      {
        ...size,
        fonts: fontConfig,
      }
    );
  }
}
