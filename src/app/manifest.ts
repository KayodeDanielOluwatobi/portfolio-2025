import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'everdann designs', // The full name on the splash screen
    short_name: 'Everdann', // The name under the icon on the home screen
    description: 'Multidisciplinary design portfolio by Daniel Kayode', //
    start_url: '/',
    display: 'standalone', // Makes it look like a native app without a browser bar
    background_color: '#000000', // Matches your site background
    theme_color: '#000000', 
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