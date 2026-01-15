import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'everdann designs', //
    short_name: 'Everdann',
    description: 'Multidisciplinary design portfolio by Daniel Kayode', //
    start_url: '/',
    display: 'standalone',
    background_color: '#000000', // Matches your bg-black
    theme_color: '#39FF14', // Your brand green
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}