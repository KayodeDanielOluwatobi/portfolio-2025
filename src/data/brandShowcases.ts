// Brand showcase data - centralized for the entire app

export interface BrandShowcase {
  id: string;
  brandName: string;
  tagline: string;
  chips: string[];
  textColor: string;
  everdannLogo: string;
  backgroundImage: string;
  backgroundColor: string;
  logoVariant: string;
  cursorColor: string;
}

export const brandShowcases: BrandShowcase[] = [

  {
    id: 'tripadvisor',
    brandName: 'Tripadvisor',
    tagline: 'Every type of traveler, every type of trip',
    chips: ['BRAND IDENTITY DESIGN', 'TRAVEL BRAND'],
    textColor: '#F4D9CA',
    everdannLogo: '/logos/logo-tripadvisor-full.svg',
    backgroundImage: '/backgrounds/tripadvisor-bg.webp',
    backgroundColor: '#4d2f1e', // Tripadvisor brown
    logoVariant: 'tripadvisor',
    cursorColor: '#F4D9CA',
  },

  {
    id: 'jael',
    brandName: 'Jael',
    tagline: 'Confidence tailored in every stitch',
    chips: ['BRAND IDENTITY DESIGN', 'FASHION BRAND'],
    textColor: '#EDCAF4',
    everdannLogo: '/logos/everdann-jael-full.svg',
    backgroundImage: '/backgrounds/jael-bg.webp',
    backgroundColor: '#451e4d', // Jael purple
    logoVariant: 'jael',
    cursorColor: '#EDCAF4',
  },

  {
    id: 'conces',
    brandName: 'CONCES',
    tagline: 'Christ at the core of every innovation',
    chips: ['BRAND IDENTITY DESIGN', 'ORGANIZATION'],
    textColor: '#B8FB3C',
    everdannLogo: '/logos/everdann-conces-full.svg',
    backgroundImage: '/backgrounds/conces-bg.webp',
    backgroundColor: '#1a2308', // Conces lime green
    logoVariant: 'conces',
    cursorColor: '#B8FB3C',
  },

  {
    id: 'tympanium',
    brandName: 'Tympanium',
    tagline: 'Engineering the sound of tomorrow',
    chips: ['BRAND IDENTITY DESIGN', 'ACOUSTICS'],
    textColor: '#8c4cf2',
    everdannLogo: '/logos/logo-bose.svg',
    backgroundImage: '/backgrounds/bose-bg.avif',
    backgroundColor: '#0e0333',
    logoVariant: 'bose',
    cursorColor: '#8c4cf2',
  },

  {
    id: 'sampasend',
    brandName: 'SampaSend',
    tagline: "Blink. It's done. ⚡ It's in \n our DNA",
    chips: ['BRAND IDENTITY DESIGN', 'FINTECH'],
    textColor: '#e9f3ff',
    everdannLogo: '/logos/logo-sampasend.svg',
    backgroundImage: '/backgrounds/sampasend-bg.avif',
    backgroundColor: '#e9f3ff',
    logoVariant: 'sampasend',
    cursorColor: '#e9f3ff',
  },

];

// Default brand colors
export const DEFAULT_CURSOR_COLOR = '#000000';
export const DEFAULT_CURSOR_STROKE = '#FFFFFF';