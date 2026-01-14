import { Metadata } from 'next';
import { getProjectBySlug } from '@/utils/projectFetcher';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: 'Project Not Found | Everdann',
    };
  }

  // Pick the first image from your media array for the preview
  const ogImage = Array.isArray(project.media) ? project.media[0] : project.media;

  return {
    title: `${project.title} — Case Study`,
    description: project.tagline,
    openGraph: {
      title: project.title,
      description: project.tagline,
      url: `https://everdann.vercel.app/works/${params.slug}`, //
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