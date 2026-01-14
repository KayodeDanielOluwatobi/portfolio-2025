import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getProjectBySlug } from '@/utils/projectFetcher';

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

  // 2. Await the headers to get the current host (everdann.vercel.app or preview URL)
  const headerList = await headers();
  const host = headerList.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const currentUrl = `${protocol}://${host}/works/${slug}`;

  // Use the first image from your media array
  const ogImage = Array.isArray(project.media) ? project.media[0] : project.media;

  return {
    title: `${project.title} — Case Study`,
    description: project.tagline,
    openGraph: {
      title: project.title,
      description: project.tagline,
      url: currentUrl,
      siteName: 'Everdann Portfolio',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.tagline,
      images: [ogImage],
    },
  };
}

export default function CaseStudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}