import type { Metadata } from 'next';
import AboutClient from './AboutClient';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  const params = await searchParams;
  const isShared = params?.card === 'presentschool';

  if (isShared) {
    return {
      title: 'Daniel studying @ FUTA | Everdann Designs',
      description: 'Currently studying Electrical & Electronics Engineering at FUTA (94% complete).',
      openGraph: {
        title: 'Daniel studying @ FUTA | Everdann Designs',
        description: 'Currently studying Electrical & Electronics Engineering at FUTA (94% complete).',
        url: 'https://everdann.vercel.app/about?card=presentschool',
        siteName: 'everdann designs',
        images: [
          {
            url: 'https://everdann.vercel.app/api/og/presentschool',
            width: 1200,
            height: 630,
            alt: 'Daniel Kayode - Electrical & Electronics Engineering at FUTA',
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Daniel studying @ FUTA | Everdann Designs',
        description: 'Currently studying Electrical & Electronics Engineering at FUTA (94% complete).',
        images: ['https://everdann.vercel.app/api/og/presentschool'],
      },
    };
  }

  return {
    title: 'About | Everdann Designs',
    description: 'Learn more about Daniel Kayode, visual designer and engineer.',
  };
}

export default function AboutPage() {
  return <AboutClient />;
}