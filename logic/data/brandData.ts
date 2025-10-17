// src/data/brandData.ts

export interface BrandShowcase {
  id: string;
  brandName: string;
  tagline: string;
  chips: string[];
  textColor: string;
  everdannLogo: string;
  backgroundImage: string;
  logoVariant: string;
}

export const brandShowcases: BrandShowcase[] = [
  {
    id: 'tripadvisor',
    brandName: 'Tripadvisor',
    tagline: 'Every type of traveler, every type of trip',
    chips: ['BRAND IDENTITY DESIGN', 'TRAVEL BRAND'],
    textColor: '#F4D9CA',
    everdannLogo: '/logos/logo-tripadvisor-full.svg',
    backgroundImage: '/backgrounds/tripadvisor-bg.png',
    logoVariant: 'tripadvisor'
  },
  // Add more brands here as you develop them
  // {
  //   id: 'airbnb',
  //   brandName: 'Airbnb',
  //   tagline: 'Belong anywhere, experience everything',
  //   chips: ['BRAND IDENTITY DESIGN', 'HOSPITALITY BRAND'],
  //   textColor: '#FFFFFF',
  //   everdannLogo: '/logos/everdann-pink.svg',
  //   backgroundImage: '/backgrounds/airbnb-bg.jpg',
  //   logoVariant: 'airbnb'
  // },
];