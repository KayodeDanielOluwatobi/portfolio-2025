import { ImageResponse } from 'next/og';
import { getProjectBySlug } from '@/utils/projectFetcher';

export const runtime = 'nodejs';
export const alt = 'Case Study';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function getBase64Image(url: string | null | undefined): Promise<string | null> {
  if (!url || typeof url !== 'string' || url.trim() === '') return null;
  if (url.startsWith('data:')) return url;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`[OG Image] Failed to fetch image at ${url} (status ${res.status})`);
      return url;
    }

    const contentType = res.headers.get('content-type') || 'image/png';
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.warn(`[OG Image] Network error fetching ${url}:`, err);
    return url;
  }
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
            fontFamily: 'sans-serif',
          }}
        >
          <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Everdann Portfolio
          </span>
          <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
            Case Study Not Found
          </span>
        </div>
      ),
      { ...size }
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

  // Fetch images in parallel for reliable zero-latency Satori compositing
  const [heroImageSrc, logoSrc] = await Promise.all([
    getBase64Image(heroImage),
    getBase64Image(brandLogo),
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
          fontFamily: 'sans-serif',
        }}
      >
        {/* ── Layer 1: Background Hero Image ── */}
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

        {/* ── Layer 2: Cinematic Dark Gradient Overlay (identical to live hero) ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.50) 50%, rgba(0, 0, 0, 0.28) 100%)',
          }}
        />

        {/* Subtle radial depth behind center to make logo pop crisply */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(circle at center, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0) 70%)',
          }}
        />

        {/* ── Layer 3: Centered Brand Logo (scaled proportionately) ── */}
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
                fontSize: 68,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                textShadow: '0 8px 32px rgba(0,0,0,0.9)',
              }}
            >
              {brandName}
            </span>
            {project.tagline ? (
              <span
                style={{
                  fontSize: 26,
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginTop: 16,
                  maxWidth: 820,
                  textShadow: '0 4px 16px rgba(0,0,0,0.8)',
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
    }
  );
}
