import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co', // Spotify Album Art CDN
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co', // Sometimes used for playlists
      },
      {
        protocol: 'https',
        hostname: 'books.googleusercontent.com',
      },
      // TMDB images
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      // Add this block for Supabase Storage
      {
        protocol: 'https',
        hostname: 'wnkbjxsnjquryyojfxmx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;