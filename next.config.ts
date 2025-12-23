import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
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