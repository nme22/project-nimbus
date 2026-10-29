import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Project Nimbus',
    short_name: 'Nimbus',
    description: "Household projects, tasks, and Home Depot / Lowe's shopping lists",
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF8F0',
    theme_color: '#F5A623',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
