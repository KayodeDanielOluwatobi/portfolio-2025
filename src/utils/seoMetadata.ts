/**
 * Dynamic SEO & Open Graph Metadata Generator
 * Crafts category-tailored, varied, and SERP-optimized titles (50–60 chars)
 * and descriptions (120–155 chars) across portfolio projects.
 */

interface ProjectMetaInput {
  slug: string;
  title: string;
  tagline?: string;
  description?: string;
  about_brand?: string;
  originTable?: string;
}

function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function trimToOptimalLength(text: string, maxLength = 155): string {
  if (text.length <= maxLength) return text;
  const sliced = text.slice(0, maxLength);
  const lastPeriod = sliced.lastIndexOf('.');
  if (lastPeriod > 115) return sliced.slice(0, lastPeriod + 1);
  const lastSpace = sliced.lastIndexOf(' ');
  return lastSpace > 110 ? sliced.slice(0, lastSpace) + '…' : sliced + '…';
}

export function buildProjectSEO(project: ProjectMetaInput): {
  title: string;
  description: string;
} {
  const { slug, title, tagline, description, about_brand, originTable } = project;
  const hash = getDeterministicHash(slug || 'project');

  // ── 1. TITLE VARIATIONS (Target: 50–58 chars for SERP / OG) ───────────────
  const brandTitles = [
    `${title} — Visual Identity & Brand System | Everdann`,
    `${title} — Brand Identity & Design Case Study | Everdann`,
    `${title} — Creative Direction & Brand Design | Everdann`,
  ];

  const socialTitles = [
    `${title} — Social Media Design & Visual Campaign | Everdann`,
    `${title} — Digital Content & Visual Identity | Everdann`,
    `${title} — Social Creative Direction & Campaign | Everdann`,
  ];

  const churchTitles = [
    `${title} — Ministry Media & Visual Identity | Everdann`,
    `${title} — Church Creative Direction & Design | Everdann`,
    `${title} — Faith-Based Brand & Visual Media | Everdann`,
  ];

  const publishingTitles = [
    `${title} — Editorial Design & Book Layout | Everdann`,
    `${title} — Publication Design & Typography | Everdann`,
    `${title} — Book Cover & Editorial Case Study | Everdann`,
  ];

  const defaultTitles = [
    `${title} — Visual Identity & Design Case Study | Everdann`,
    `${title} — Creative Direction & Design Portfolio | Everdann`,
    `${title} — Brand Identity & Creative Direction | Everdann`,
  ];

  let titleOptions = defaultTitles;
  if (originTable === 'works_brands') titleOptions = brandTitles;
  else if (originTable === 'works_socials') titleOptions = socialTitles;
  else if (originTable === 'works_church') titleOptions = churchTitles;
  else if (originTable === 'works_publishing') titleOptions = publishingTitles;

  const pageTitle = titleOptions[hash % titleOptions.length];

  // ── 2. DESCRIPTION VARIATIONS (Target: 120–155 chars for Google / OG) ─────
  const existingDetailedDesc = (description || about_brand || '').trim();

  // If a full custom description is already provided (> 80 chars), use it with clean trimming
  if (existingDetailedDesc.length >= 80) {
    return {
      title: pageTitle,
      description: trimToOptimalLength(existingDetailedDesc, 155),
    };
  }

  const cleanTagline = (tagline || '').trim().replace(/[.,;:]+$/, '');
  const prefix = cleanTagline ? `${cleanTagline}. ` : '';

  const brandDescriptions = [
    `${prefix}Discover the visual identity system, typography, and creative process crafted for ${title} by Everdann.`,
    `${prefix}A deep dive into brand strategy, art direction, and visual execution designed for ${title} by Everdann.`,
    `${prefix}An in-depth brand identity and design case study exploring the creative evolution of ${title} by Everdann.`,
  ];

  const socialDescriptions = [
    `${prefix}Exploring visual storytelling, high-impact campaign graphics, and digital presence for ${title} by Everdann.`,
    `${prefix}A curated showcase of social media assets, art direction, and digital engagement designed for ${title} by Everdann.`,
    `${prefix}Digital content strategy and bespoke campaign visuals engineered for ${title} by Everdann.`,
  ];

  const churchDescriptions = [
    `${prefix}Creative direction, sermon series branding, and ministry media design crafted for ${title} by Everdann.`,
    `${prefix}An inspiring showcase of church media, stage visuals, and faith-centered visual systems by Everdann.`,
    `${prefix}Purpose-driven visual identity and multimedia creative design crafted for ${title} by Everdann.`,
  ];

  const publishingDescriptions = [
    `${prefix}In-depth editorial layout, typography curation, and bespoke cover design crafted for ${title} by Everdann.`,
    `${prefix}Exploring publication aesthetics, editorial pacing, and print design systems for ${title} by Everdann.`,
    `${prefix}A detailed exploration of cover design, interior layout, and book typography by Everdann.`,
  ];

  const defaultDescriptions = [
    `${prefix}Explore the comprehensive visual identity, creative direction, and design case study for ${title} by Everdann.`,
    `${prefix}A detailed case study exploring the creative process, visual systems, and brand direction for ${title} by Everdann.`,
    `${prefix}Discover the design systems, bespoke creative assets, and visual identity crafted for ${title} by Everdann.`,
  ];

  let descOptions = defaultDescriptions;
  if (originTable === 'works_brands') descOptions = brandDescriptions;
  else if (originTable === 'works_socials') descOptions = socialDescriptions;
  else if (originTable === 'works_church') descOptions = churchDescriptions;
  else if (originTable === 'works_publishing') descOptions = publishingDescriptions;

  const selectedDesc = descOptions[hash % descOptions.length];

  return {
    title: pageTitle,
    description: trimToOptimalLength(selectedDesc, 155),
  };
}
