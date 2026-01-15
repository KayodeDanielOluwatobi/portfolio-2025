import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/404', '/api/'], // Pages you don't want in Google
    },
    sitemap: 'https://everdann.vercel.app/sitemap.xml',
  }
}