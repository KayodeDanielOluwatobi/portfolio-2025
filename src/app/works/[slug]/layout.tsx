import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getProjectBySlug } from '@/utils/projectFetcher';
import { buildProjectSEO } from '@/utils/seoMetadata';

// Next.js 15 requires params to be a Promise
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  // 1. Await params to get the slug
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // Fallback if the project isn't found in Supabase
  if (!project) {
    console.error(`[Metadata Error] No project found for slug: ${slug}`);
    return {
      title: 'Project Not Found | Everdann',
    };
  }

  try {
    // 2. Await the headers to get the current host (everdann.vercel.app or preview URL)
    const headerList = await headers();
    const rawHost = headerList.get('host') || headerList.get('x-forwarded-host');
    const host = rawHost || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'everdann.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentUrl = `${protocol}://${host}/works/${slug}`;
    const ogImageUrl = `${currentUrl}/opengraph-image`;

    const { title: seoTitle, description: seoDescription } = buildProjectSEO({
      slug,
      title: project.title || 'Project',
      tagline: project.tagline,
      description: project.description,
      about_brand: project.about_brand,
      originTable: project.originTable,
    });

    return {
      title: seoTitle,
      description: seoDescription,
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: currentUrl,
        siteName: 'Everdann Portfolio',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: seoTitle,
            type: 'image/png',
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
        images: [ogImageUrl],
      },
    };
  } catch (err) {
    console.error(`[Metadata Error for slug ${slug}]:`, err);
    return {
      title: `${project.title} — Case Study`,
      description: project.tagline,
    };
  }
}

export default function CaseStudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}